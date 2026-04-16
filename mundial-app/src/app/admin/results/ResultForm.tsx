'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Player { id: string; name: string; shirt_number: number | null }
interface Match {
  id: string
  status: string
  home_score: number | null
  away_score: number | null
  is_scored: boolean
  homeTeam: { name: string; id?: string }
  awayTeam: { name: string; id?: string }
}

interface MatchEvent {
  player_id: string
  event_type: string
  minute: number | null
}

interface Props {
  match: Match
  homePlayers: Player[]
  awayPlayers: Player[]
  initialEvents?: MatchEvent[]
  isKnockout?: boolean
  initialKnockoutWinner?: 'home' | 'away' | null
  initialPenaltyHomeScore?: number | null
  initialPenaltyAwayScore?: number | null
}

interface EventEntry { playerId: string; type: 'goal' | 'assist'; minute: string }

export default function ResultForm({ match, homePlayers, awayPlayers, initialEvents = [], isKnockout = false, initialKnockoutWinner = null, initialPenaltyHomeScore = null, initialPenaltyAwayScore = null }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [status, setStatus] = useState(match.status)
  const [homeScore, setHomeScore] = useState(match.home_score?.toString() ?? '')
  const [awayScore, setAwayScore] = useState(match.away_score?.toString() ?? '')
  const [knockoutWinner, setKnockoutWinner] = useState<'home' | 'away' | ''>(initialKnockoutWinner ?? '')
  const [penaltyHomeScore, setPenaltyHomeScore] = useState(initialPenaltyHomeScore?.toString() ?? '')
  const [penaltyAwayScore, setPenaltyAwayScore] = useState(initialPenaltyAwayScore?.toString() ?? '')
  const [events, setEvents] = useState<EventEntry[]>(
    initialEvents.map(e => ({
      playerId: e.player_id,
      type: e.event_type as 'goal' | 'assist',
      minute: e.minute?.toString() ?? '',
    }))
  )
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const allPlayers = [...homePlayers, ...awayPlayers]

  function addEvent() {
    setEvents(prev => [...prev, { playerId: '', type: 'goal', minute: '' }])
  }

  function removeEvent(idx: number) {
    setEvents(prev => prev.filter((_, i) => i !== idx))
  }

  function updateEvent(idx: number, field: keyof EventEntry, value: string) {
    setEvents(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e))
  }

  function syncEventsToScore(home: string, away: string) {
    const total = (parseInt(home) || 0) + (parseInt(away) || 0)

    setEvents(prev => {
      const goals   = prev.filter(e => e.type === 'goal')
      const assists = prev.filter(e => e.type === 'assist')

      const adjustTo = (list: EventEntry[], type: 'goal' | 'assist', target: number): EventEntry[] => {
        if (list.length >= target) return list.slice(0, target)
        const extra = Array.from({ length: target - list.length }, () => ({ playerId: '', type, minute: '' }))
        return [...list, ...extra]
      }

      return [
        ...adjustTo(goals,   'goal',   total),
        ...adjustTo(assists, 'assist', total),
      ]
    })
  }

  function handleHomeScoreChange(val: string) {
    setHomeScore(val)
    syncEventsToScore(val, awayScore)
  }

  function handleAwayScoreChange(val: string) {
    setAwayScore(val)
    syncEventsToScore(homeScore, val)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (status === 'finished' && (homeScore === '' || awayScore === '')) {
      setError('Ingresá el marcador final')
      return
    }

    const scoresEqual = homeScore !== '' && awayScore !== '' && parseInt(homeScore) === parseInt(awayScore)
    if (isKnockout && status === 'finished' && scoresEqual && !knockoutWinner) {
      setError('El marcador está empatado — indicá quién ganó por penales')
      return
    }

    startTransition(async () => {
      const supabase = createClient()

      // Knockout winner: solo se guarda si aplica
      const knockoutWinnerValue = isKnockout
        ? (scoresEqual ? (knockoutWinner || null) : null)
        : null

      // Penales: solo guardar si el partido fue a penales (knockoutWinner seteado y empate en 90')
      const wentToPenalties = isKnockout && scoresEqual && !!knockoutWinner
      const penaltyHomeValue = wentToPenalties && penaltyHomeScore !== '' ? parseInt(penaltyHomeScore) : null
      const penaltyAwayValue = wentToPenalties && penaltyAwayScore !== '' ? parseInt(penaltyAwayScore) : null

      // 1. Actualizar estado y resultado del partido
      const { error: matchErr } = await supabase
        .from('matches')
        .update({
          status,
          home_score: homeScore !== '' ? parseInt(homeScore) : null,
          away_score: awayScore !== '' ? parseInt(awayScore) : null,
          knockout_winner: knockoutWinnerValue,
          penalty_home_score: penaltyHomeValue,
          penalty_away_score: penaltyAwayValue,
        })
        .eq('id', match.id)

      if (matchErr) { setError(matchErr.message); return }

      // 2. Reemplazar siempre los eventos
      await supabase.from('match_events').delete().eq('match_id', match.id)

      const validEvents = events.filter(ev => ev.playerId)
      if (validEvents.length > 0) {
        await supabase.from('match_events').insert(
          validEvents.map(ev => ({
            match_id: match.id,
            player_id: ev.playerId,
            event_type: ev.type,
            minute: ev.minute ? parseInt(ev.minute) : null,
          }))
        )
      }

      // 3. Si está finalizado y no se calcularon puntos aún, llamar a la función SQL
      if (status === 'finished' && !match.is_scored) {
        await supabase.rpc('close_match', { match_id: match.id })
      }

      setDone(true)
      router.refresh()
    })
  }

  if (done) {
    return <p className="text-green-400 text-sm font-medium">✓ Guardado correctamente</p>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Estado del partido */}
      <div>
        <label className="block text-xs text-white/50 mb-1">Estado del partido</label>
        <div className="flex gap-2">
          {['upcoming', 'live', 'finished'].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
              style={{
                background: status === s ? 'rgba(245,197,24,0.18)' : 'rgba(255,255,255,0.04)',
                borderColor: status === s ? '#f5c518' : 'rgba(255,255,255,0.1)',
                color: status === s ? '#f5c518' : 'rgba(255,255,255,0.5)',
              }}
            >
              {s === 'upcoming' ? 'Por jugar' : s === 'live' ? '🔴 En vivo' : '✓ Finalizado'}
            </button>
          ))}
        </div>
      </div>

      {/* Marcador */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
        <div>
          <label className="block text-xs text-white/50 mb-1">{match.homeTeam.name}</label>
          <input
            type="number" min={0} max={20}
            value={homeScore}
            onChange={e => handleHomeScoreChange(e.target.value)}
            className="input text-center text-xl font-bold"
            placeholder="0"
          />
        </div>
        <span className="text-white/30 font-bold text-xl pb-2">-</span>
        <div>
          <label className="block text-xs text-white/50 mb-1">{match.awayTeam.name}</label>
          <input
            type="number" min={0} max={20}
            value={awayScore}
            onChange={e => handleAwayScoreChange(e.target.value)}
            className="input text-center text-xl font-bold"
            placeholder="0"
          />
        </div>
      </div>

      {/* Ganador por penales (solo fases eliminatorias con empate) */}
      {isKnockout && homeScore !== '' && awayScore !== '' && parseInt(homeScore) === parseInt(awayScore) && (
        <div>
          <label className="block text-xs text-white/50 mb-2">
            ⚠️ Empate en tiempo reglamentario — ¿Quién ganó el partido? (penales)
          </label>
          <div className="flex gap-2">
            {[
              { value: 'home', label: match.homeTeam.name },
              { value: 'away', label: match.awayTeam.name },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setKnockoutWinner(opt.value as 'home' | 'away')}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-all"
                style={{
                  background: knockoutWinner === opt.value ? 'rgba(136,217,130,0.18)' : 'rgba(255,255,255,0.04)',
                  borderColor: knockoutWinner === opt.value ? '#88d982' : 'rgba(255,255,255,0.1)',
                  color: knockoutWinner === opt.value ? '#88d982' : 'rgba(255,255,255,0.5)',
                }}
              >
                {opt.label} gana
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Resultado de penales (solo si el partido fue a penales) */}
      {isKnockout && homeScore !== '' && awayScore !== '' && parseInt(homeScore) === parseInt(awayScore) && knockoutWinner && (
        <div>
          <label className="block text-xs text-white/50 mb-2">
            Resultado de la serie de penales (opcional — +5 pts si lo aciertan)
          </label>
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
            <div>
              <label className="block text-xs text-white/40 mb-1">{match.homeTeam.name}</label>
              <input
                type="number" min={0} max={20}
                value={penaltyHomeScore}
                onChange={e => setPenaltyHomeScore(e.target.value)}
                className="input text-center text-xl font-bold"
                placeholder="0"
              />
            </div>
            <span className="text-white/30 font-bold text-xl pb-2">-</span>
            <div>
              <label className="block text-xs text-white/40 mb-1">{match.awayTeam.name}</label>
              <input
                type="number" min={0} max={20}
                value={penaltyAwayScore}
                onChange={e => setPenaltyAwayScore(e.target.value)}
                className="input text-center text-xl font-bold"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Eventos (goles/asistencias) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-white/50">Eventos del partido</label>
          <button type="button" onClick={addEvent} className="text-yellow-400 text-xs hover:text-yellow-300">
            + Agregar
          </button>
        </div>

        <div className="space-y-2">
          {events.map((ev, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_auto_60px_auto] gap-2 items-center">
              <select
                value={ev.playerId}
                onChange={e => updateEvent(idx, 'playerId', e.target.value)}
                className="input text-sm"
              >
                <option value="">— Jugador —</option>
                <optgroup label={match.homeTeam.name}>
                  {homePlayers.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.shirt_number ? `#${p.shirt_number} ` : ''}{p.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={match.awayTeam.name}>
                  {awayPlayers.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.shirt_number ? `#${p.shirt_number} ` : ''}{p.name}
                    </option>
                  ))}
                </optgroup>
              </select>

              <select
                value={ev.type}
                onChange={e => updateEvent(idx, 'type', e.target.value)}
                className="input text-sm"
              >
                <option value="goal">⚽ Gol</option>
                <option value="assist">🎯 Asistencia</option>
                <option value="yellow_card">🟨 Amarilla</option>
                <option value="red_card">🟥 Roja</option>
              </select>

              <input
                type="number" min={1} max={120}
                value={ev.minute}
                onChange={e => updateEvent(idx, 'minute', e.target.value)}
                className="input text-sm text-center"
                placeholder="min"
              />

              <button
                type="button"
                onClick={() => removeEvent(idx)}
                className="text-red-400 hover:text-red-300 text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
      )}

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? 'Guardando...' : '💾 Guardar resultado'}
      </button>

      {match.is_scored && (
        <p className="text-white/30 text-xs">Los puntos ya fueron calculados para este partido.</p>
      )}
    </form>
  )
}
