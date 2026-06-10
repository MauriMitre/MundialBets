'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PitchSelector from './PitchSelector'

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
        const rest = { ...prev }
        delete rest[id]
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
    if (homeScore === '' || awayScore === '') {
      setError('Cargá el resultado exacto del partido antes de guardar')
      return
    }
    const h = parseInt(homeScore)
    const a = parseInt(awayScore)
    if (isNaN(h) || isNaN(a) || h < 0 || h > 20 || a < 0 || a > 20) {
      setError('El resultado debe estar entre 0 y 20 goles')
      return
    }
    if (!winner) {
      setError(isKnockout
        ? 'Empate en los 90\': seleccioná quién pasa de ronda'
        : 'Seleccioná quién gana')
      return
    }
    setError('')

    startTransition(async () => {
      const supabase = createClient()

      // Penales: solo guardar si el usuario los completó ambos
      const penaltyHomeVal = penaltyHome !== '' ? parseInt(penaltyHome) : null
      const penaltyAwayVal = penaltyAway !== '' ? parseInt(penaltyAway) : null
      const bothPenalties = penaltyHomeVal !== null && penaltyAwayVal !== null

      // Borrar goleadores/asistentes previos ANTES del upsert: la validación
      // server-side rechaza predicciones con más goleadores que goles
      if (existing?.id) {
        const { error: delErr } = await supabase
          .from('prediction_players')
          .delete()
          .eq('prediction_id', existing.id)
        if (delErr) { setError('Error al guardar. ¿Cerraron las apuestas? Intentá de nuevo.'); return }
      }

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

      const playerRows = [
        ...Object.entries(scorers).flatMap(([pid, count]) =>
          Array.from({ length: count }, () => ({ prediction_id: pred.id, player_id: pid, event_type: 'goal' }))
        ),
        ...assisters.map(pid => ({ prediction_id: pred.id, player_id: pid, event_type: 'assist' })),
      ]
      if (playerRows.length > 0) {
        const { error: insErr } = await supabase.from('prediction_players').insert(playerRows)
        if (insErr) {
          setError('El resultado se guardó pero los goleadores/asistentes no. Intentá de nuevo.')
          return
        }
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
          <div className="bg-surface-container-low rounded-xl p-4 sm:p-6">
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
      <div className="bg-surface-container-low rounded-xl p-4 sm:p-6">
        <h3 className="font-headline font-bold text-on-surface mb-1 uppercase tracking-wide text-sm">
          Resultado exacto
        </h3>
        <p className="font-body text-xs text-on-surface-variant/60 mb-3">
          Obligatorio — +5 pts si acertás el marcador
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

      {/* Goleadores y asistencias — plantel sobre la cancha */}
      {players.length > 0 && (
        <PitchSelector
          homeTeam={match.homeTeam}
          awayTeam={match.awayTeam}
          homePlayers={homePlayers}
          awayPlayers={awayPlayers}
          scorers={scorers}
          assisters={assisters}
          totalGoals={totalGoals}
          totalScorerGoals={totalScorerGoals}
          totalAssists={totalAssists}
          onIncrementScorer={incrementScorer}
          onDecrementScorer={decrementScorer}
          onToggleAssister={id => togglePlayer(id, assisters, setAssisters)}
          readonly={readonly}
        />
      )}

      {/* Penales — solo en fases eliminatorias */}
      {isKnockout && (
        <div className="bg-surface-container-low rounded-xl p-4 sm:p-6">
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

