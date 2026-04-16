'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Player {
  id: string
  name: string
  position: string | null
  shirt_number: number | null
  team: { id: string; name: string; code: string } | null
}

interface Props {
  match: {
    id: string
    home_team_id: string
    away_team_id: string
    homeTeam: { id: string; name: string; code: string }
    awayTeam: { id: string; name: string; code: string }
  }
  players: Player[]
  existing: {
    id: string
    predicted_winner: string | null
    predicted_home_score: number | null
    predicted_away_score: number | null
    predicted_penalty_home_score: number | null
    predicted_penalty_away_score: number | null
    predictionPlayers?: { player_id: string; event_type: string }[]
  } | null
  readonly: boolean
  userId: string
  isKnockout: boolean
}

export default function PredictionForm({ match, players, existing, readonly, userId, isKnockout }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [winner, setWinner] = useState<'home' | 'away' | 'draw' | ''>(
    (existing?.predicted_winner as 'home' | 'away' | 'draw') ?? ''
  )
  const [homeScore, setHomeScore] = useState<string>(existing?.predicted_home_score?.toString() ?? '')
  const [awayScore, setAwayScore] = useState<string>(existing?.predicted_away_score?.toString() ?? '')
  const [scorers, setScorers] = useState<Record<string, number>>(() => {
    const goals = existing?.predictionPlayers?.filter(p => p.event_type === 'goal') ?? []
    return goals.reduce((acc, p) => {
      acc[p.player_id] = (acc[p.player_id] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  })
  const [assisters, setAssisters] = useState<string[]>(
    existing?.predictionPlayers?.filter(p => p.event_type === 'assist').map(p => p.player_id) ?? []
  )
  const [penaltyHome, setPenaltyHome] = useState<string>(
    existing?.predicted_penalty_home_score?.toString() ?? ''
  )
  const [penaltyAway, setPenaltyAway] = useState<string>(
    existing?.predicted_penalty_away_score?.toString() ?? ''
  )

  const totalGoals = (parseInt(homeScore) || 0) + (parseInt(awayScore) || 0)

  const totalScorerGoals = Object.values(scorers).reduce((a, b) => a + b, 0)
  const totalAssists = assisters.length
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const homePlayers = players.filter(p => p.team?.id === match.home_team_id)
  const awayPlayers = players.filter(p => p.team?.id === match.away_team_id)

  function togglePlayer(id: string, list: string[], setList: (v: string[]) => void) {
    setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id])
  }

  function incrementScorer(id: string) {
    if (totalScorerGoals >= totalGoals) return
    setScorers(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
  }

  function decrementScorer(id: string) {
    setScorers(prev => {
      const count = prev[id] || 0
      if (count <= 1) {
        const { [id]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [id]: count - 1 }
    })
  }

  function trimScorers(maxGoals: number) {
    setScorers(prev => {
      let remaining = maxGoals
      const trimmed: Record<string, number> = {}
      for (const [pid, count] of Object.entries(prev)) {
        if (remaining <= 0) break
        const take = Math.min(count, remaining)
        trimmed[pid] = take
        remaining -= take
      }
      return trimmed
    })
  }

  function trimAssisters(maxGoals: number) {
    setAssisters(prev => prev.slice(0, maxGoals))
  }

  function syncWinnerFromScore(home: string, away: string) {
    const h = parseInt(home)
    const a = parseInt(away)
    if (isNaN(h) || isNaN(a)) return
    if (h > a)        setWinner('home')
    else if (a > h)   setWinner('away')
    else if (!isKnockout) setWinner('draw')
    // En knockout, si empatan en tiempo reglamentario no forzamos 'draw':
    // el usuario elige quién gana (puede ir a penales)
  }

  function handleHomeScoreChange(val: string) {
    setHomeScore(val)
    const newTotal = (parseInt(val) || 0) + (parseInt(awayScore) || 0)
    trimScorers(newTotal)
    trimAssisters(newTotal)
    syncWinnerFromScore(val, awayScore)
  }

  function handleAwayScoreChange(val: string) {
    setAwayScore(val)
    const newTotal = (parseInt(homeScore) || 0) + (parseInt(val) || 0)
    trimScorers(newTotal)
    trimAssisters(newTotal)
    syncWinnerFromScore(homeScore, val)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!winner) { setError('Seleccioná un resultado'); return }
    setError('')

    startTransition(async () => {
      const supabase = createClient()

      // Penales: solo guardar si el usuario los completó ambos
      const penaltyHomeVal = penaltyHome !== '' ? parseInt(penaltyHome) : null
      const penaltyAwayVal = penaltyAway !== '' ? parseInt(penaltyAway) : null
      const bothPenalties = penaltyHomeVal !== null && penaltyAwayVal !== null

      const { data: pred, error: predErr } = await supabase
        .from('predictions')
        .upsert({
          ...(existing?.id ? { id: existing.id } : {}),
          user_id: userId,
          match_id: match.id,
          predicted_winner: winner,
          predicted_home_score: homeScore !== '' ? parseInt(homeScore) : null,
          predicted_away_score: awayScore !== '' ? parseInt(awayScore) : null,
          predicted_penalty_home_score: isKnockout && bothPenalties ? penaltyHomeVal : null,
          predicted_penalty_away_score: isKnockout && bothPenalties ? penaltyAwayVal : null,
        }, { onConflict: 'user_id,match_id' })
        .select()
        .single()

      if (predErr || !pred) { setError('Error al guardar. Intentá de nuevo.'); return }

      await supabase.from('prediction_players').delete().eq('prediction_id', pred.id)

      const playerRows = [
        ...Object.entries(scorers).flatMap(([pid, count]) =>
          Array.from({ length: count }, () => ({ prediction_id: pred.id, player_id: pid, event_type: 'goal' }))
        ),
        ...assisters.map(pid => ({ prediction_id: pred.id, player_id: pid, event_type: 'assist' })),
      ]
      if (playerRows.length > 0) {
        await supabase.from('prediction_players').insert(playerRows)
      }

      setSuccess(true)
      setTimeout(() => router.push('/predict'), 1200)
    })
  }

  if (success) {
    return (
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-8 text-center text-primary">
        <div className="text-5xl mb-3">✅</div>
        <p className="font-headline font-bold text-lg">
          ¡Apuesta guardada!
        </p>
        <p className="font-body text-sm mt-1 text-primary/70">
          Volviendo a predicciones...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Resultado */}
      {(() => {
        const scoreLocked = homeScore !== '' && awayScore !== '' && !isKnockout
        const winnerOptions = isKnockout
          ? [
              { value: 'home', label: match.homeTeam.name },
              { value: 'away', label: match.awayTeam.name },
            ]
          : [
              { value: 'home', label: match.homeTeam.name },
              { value: 'draw', label: 'Empate' },
              { value: 'away', label: match.awayTeam.name },
            ]
        return (
          <div className="bg-surface-container-low rounded-xl p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-headline font-bold text-on-surface uppercase tracking-wide text-sm">
                ¿Quién gana?
              </h3>
              {scoreLocked && (
                <span className="font-label text-[10px] text-on-surface-variant/40 uppercase tracking-wide">
                  Fijado por el resultado
                </span>
              )}
              {isKnockout && (
                <span className="font-label text-[10px] text-primary/60 uppercase tracking-wide">
                  Incluye penales
                </span>
              )}
            </div>
            <div className={`grid gap-2 mt-3 ${isKnockout ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {winnerOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={readonly || scoreLocked}
                  onClick={() => {
                    const val = opt.value as 'home' | 'away' | 'draw'
                    setWinner(val)
                    if (val === 'draw' && homeScore === '' && awayScore === '') {
                      setHomeScore('0')
                      setAwayScore('0')
                    }
                  }}
                  className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all font-label tracking-wide${
                    winner === opt.value
                      ? ' bg-primary/15 border-2 border-primary text-primary'
                      : ' bg-surface-container border border-outline-variant/20 text-on-surface-variant'
                  }${scoreLocked ? ' cursor-default' : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Resultado exacto */}
      <div className="bg-surface-container-low rounded-xl p-6">
        <h3 className="font-headline font-bold text-on-surface mb-1 uppercase tracking-wide text-sm">
          Resultado exacto
        </h3>
        <p className="font-body text-xs text-on-surface-variant/60 mb-3">
          Opcional — +5 pts si acertás
        </p>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="text-center">
            <p className="font-label text-xs text-on-surface-variant/60 mb-1">{match.homeTeam.name}</p>
            <input
              type="number"
              min={0}
              max={20}
              disabled={readonly}
              value={homeScore}
              onChange={e => handleHomeScoreChange(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg text-center font-headline text-3xl font-bold text-primary focus:ring-2 focus:ring-primary/30 outline-none py-2 disabled:opacity-50"
              placeholder="0"
            />
          </div>
          <span className="font-headline font-bold text-xl text-on-surface-variant/30">:</span>
          <div className="text-center">
            <p className="font-label text-xs text-on-surface-variant/60 mb-1">{match.awayTeam.name}</p>
            <input
              type="number"
              min={0}
              max={20}
              disabled={readonly}
              value={awayScore}
              onChange={e => handleAwayScoreChange(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg text-center font-headline text-3xl font-bold text-primary focus:ring-2 focus:ring-primary/30 outline-none py-2 disabled:opacity-50"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Goleadores */}
      {players.length > 0 && (
        <div className="bg-surface-container-low rounded-xl p-6">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-headline font-bold text-on-surface uppercase tracking-wide text-sm">
              Goleadores
            </h3>
            <span className={`font-label text-xs px-2 py-0.5 rounded-full ${
              totalScorerGoals >= totalGoals
                ? 'bg-error/15 text-error'
                : 'bg-primary/15 text-primary'
            }`}>
              {totalScorerGoals}/{totalGoals}
            </span>
          </div>
          <p className="font-body text-xs text-on-surface-variant/60 mb-1">
            Opcional — +2 pts por cada acierto · Un jugador puede meter más de un gol
          </p>
          <p className="font-label text-[10px] text-on-surface-variant/40 mb-3 uppercase tracking-wide">
            {totalGoals === 0
              ? 'Ingresá un resultado para poder seleccionar goleadores'
              : `Máximo ${totalGoals} gol${totalGoals !== 1 ? 'es' : ''} en total según tu resultado`}
          </p>
          <ScorerSelector
            label={match.homeTeam.name}
            players={homePlayers}
            scorers={scorers}
            onIncrement={incrementScorer}
            onDecrement={decrementScorer}
            disabled={readonly}
            maxReached={totalScorerGoals >= totalGoals}
          />
          <div className="mt-3">
            <ScorerSelector
              label={match.awayTeam.name}
              players={awayPlayers}
              scorers={scorers}
              onIncrement={incrementScorer}
              onDecrement={decrementScorer}
              disabled={readonly}
              maxReached={totalScorerGoals >= totalGoals}
            />
          </div>
        </div>
      )}

      {/* Asistentes */}
      {players.length > 0 && (
        <div className="bg-surface-container-low rounded-xl p-6">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-headline font-bold text-on-surface uppercase tracking-wide text-sm">
              Asistentes
            </h3>
            <span className={`font-label text-xs px-2 py-0.5 rounded-full ${
              totalAssists >= totalGoals
                ? 'bg-error/15 text-error'
                : 'bg-primary/15 text-primary'
            }`}>
              {totalAssists}/{totalGoals}
            </span>
          </div>
          <p className="font-body text-xs text-on-surface-variant/60 mb-1">
            Opcional — +1 pt por cada acierto
          </p>
          <p className="font-label text-[10px] text-on-surface-variant/40 mb-3 uppercase tracking-wide">
            {totalGoals === 0
              ? 'Ingresá un resultado para poder seleccionar asistentes'
              : `Máximo ${totalGoals} asistencia${totalGoals !== 1 ? 's' : ''} en total según tu resultado`}
          </p>
          <PlayerSelector
            label={match.homeTeam.name}
            players={homePlayers}
            selected={assisters}
            onToggle={id => togglePlayer(id, assisters, setAssisters)}
            disabled={readonly}
            maxReached={totalAssists >= totalGoals}
          />
          <div className="mt-3">
            <PlayerSelector
              label={match.awayTeam.name}
              players={awayPlayers}
              selected={assisters}
              onToggle={id => togglePlayer(id, assisters, setAssisters)}
              disabled={readonly}
              maxReached={totalAssists >= totalGoals}
            />
          </div>
        </div>
      )}

      {/* Penales — solo en fases eliminatorias */}
      {isKnockout && (
        <div className="bg-surface-container-low rounded-xl p-6">
          <h3 className="font-headline font-bold text-on-surface uppercase tracking-wide text-sm mb-1">
            Resultado de penales
          </h3>
          <p className="font-body text-xs text-on-surface-variant/60 mb-3">
            Opcional — +5 pts si acertás el marcador exacto de la serie
          </p>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="text-center">
              <p className="font-label text-xs text-on-surface-variant/60 mb-1">{match.homeTeam.name}</p>
              <input
                type="number"
                min={0}
                max={20}
                disabled={readonly}
                value={penaltyHome}
                onChange={e => setPenaltyHome(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg text-center font-headline text-3xl font-bold text-primary focus:ring-2 focus:ring-primary/30 outline-none py-2 disabled:opacity-50"
                placeholder="0"
              />
            </div>
            <span className="font-headline font-bold text-xl text-on-surface-variant/30">:</span>
            <div className="text-center">
              <p className="font-label text-xs text-on-surface-variant/60 mb-1">{match.awayTeam.name}</p>
              <input
                type="number"
                min={0}
                max={20}
                disabled={readonly}
                value={penaltyAway}
                onChange={e => setPenaltyAway(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg text-center font-headline text-3xl font-bold text-primary focus:ring-2 focus:ring-primary/30 outline-none py-2 disabled:opacity-50"
                placeholder="0"
              />
            </div>
          </div>
          {(penaltyHome !== '' || penaltyAway !== '') && (penaltyHome === '' || penaltyAway === '') && (
            <p className="font-label text-xs text-error/70 mt-2">
              Completá ambos valores o dejá los dos vacíos
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="bg-error-container/20 text-error rounded-lg px-3 py-2 text-sm font-label">
          {error}
        </p>
      )}

      {!readonly && (
        <button
          type="submit"
          disabled={pending}
          className="gradient-cta text-on-primary py-4 rounded-xl font-headline font-bold text-sm tracking-wider uppercase w-full disabled:opacity-60 transition-opacity"
        >
          {pending ? 'Guardando...' : existing ? 'Actualizar apuesta' : 'Confirmar apuesta'}
        </button>
      )}
    </form>
  )
}

function PlayerSelector({
  label,
  players,
  selected,
  onToggle,
  disabled,
  maxReached = false,
}: {
  label: string
  players: Player[]
  selected: string[]
  onToggle: (id: string) => void
  disabled: boolean
  maxReached?: boolean
}) {
  if (players.length === 0) return null
  return (
    <div>
      <p className="font-label font-semibold uppercase tracking-widest mb-2 text-[10px] text-on-surface-variant/50">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {players.map(p => {
          const isSelected = selected.includes(p.id)
          const isDisabled = disabled || (maxReached && !isSelected)
          return (
            <button
              key={p.id}
              type="button"
              disabled={isDisabled}
              onClick={() => onToggle(p.id)}
              className={`text-xs px-2.5 py-1 rounded-full transition-all font-label disabled:opacity-30${
                isSelected
                  ? ' bg-primary/15 border border-primary text-primary'
                  : ' bg-surface-container border border-outline-variant/10 text-on-surface-variant/70 hover:border-outline-variant/40'
              }`}
            >
              {p.shirt_number ? `#${p.shirt_number} ` : ''}{p.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ScorerSelector({
  label,
  players,
  scorers,
  onIncrement,
  onDecrement,
  disabled,
  maxReached,
}: {
  label: string
  players: Player[]
  scorers: Record<string, number>
  onIncrement: (id: string) => void
  onDecrement: (id: string) => void
  disabled: boolean
  maxReached: boolean
}) {
  if (players.length === 0) return null
  return (
    <div>
      <p className="font-label font-semibold uppercase tracking-widest mb-2 text-[10px] text-on-surface-variant/50">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {players.map(p => {
          const count = scorers[p.id] || 0
          const isSelected = count > 0
          const canAdd = !disabled && !maxReached
          return (
            <div
              key={p.id}
              className={`flex items-center gap-1 rounded-full transition-all font-label text-xs border ${
                isSelected
                  ? 'bg-primary/15 border-primary text-primary'
                  : 'bg-surface-container border-outline-variant/10 text-on-surface-variant/70'
              }`}
            >
              {isSelected && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onDecrement(p.id)}
                  className="w-6 h-7 flex items-center justify-center rounded-l-full hover:bg-black/20 transition-colors disabled:opacity-50 text-base leading-none"
                >
                  −
                </button>
              )}
              <span className={`${isSelected ? 'px-1' : 'px-2.5'} py-1 select-none`}>
                {p.shirt_number ? `#${p.shirt_number} ` : ''}{p.name}
                {count > 1 && <span className="ml-1 font-bold">×{count}</span>}
              </span>
              <button
                type="button"
                disabled={!canAdd}
                onClick={() => onIncrement(p.id)}
                title={maxReached && !isSelected ? 'Límite de goles alcanzado' : undefined}
                className={`w-6 h-7 flex items-center justify-center rounded-r-full transition-colors text-base leading-none ${
                  canAdd
                    ? 'hover:bg-black/20'
                    : 'opacity-30 cursor-not-allowed'
                } disabled:opacity-30`}
              >
                +
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
