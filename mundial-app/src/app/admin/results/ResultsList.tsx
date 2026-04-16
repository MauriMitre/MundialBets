'use client'

import { useState } from 'react'
import ResultForm from './ResultForm'
import { formatMatchDate } from '@/lib/utils'

interface Player { id: string; name: string; team_id: string; shirt_number: number | null }
interface Match {
  id: string
  status: string
  stage: string
  home_score: number | null
  away_score: number | null
  knockout_winner: string | null
  penalty_home_score: number | null
  penalty_away_score: number | null
  is_scored: boolean
  home_team_id: string
  away_team_id: string
  match_date: string
  homeTeam: { id: string; name: string }
  awayTeam: { id: string; name: string }
}
interface MatchEvent {
  match_id: string
  player_id: string
  event_type: string
  minute: number | null
}

export default function ResultsList({ matches, allPlayers, allEvents }: {
  matches: Match[]
  allPlayers: Player[]
  allEvents: MatchEvent[]
}) {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? matches.filter(m => {
        const q = search.trim().toLowerCase()
        return (
          m.homeTeam.name.toLowerCase().includes(q) ||
          m.awayTeam.name.toLowerCase().includes(q)
        )
      })
    : matches

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40 pointer-events-none">
          🔍
        </span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por equipo..."
          className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl pl-9 pr-4 py-2.5 text-sm text-on-surface placeholder:text-secondary/40 focus:outline-none focus:border-primary/50 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/40 hover:text-secondary transition-colors text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      {/* Lista filtrada */}
      {filtered.map(match => (
        <div key={match.id} className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-on-surface font-semibold">
                {match.homeTeam.name} vs {match.awayTeam.name}
              </p>
              <p className="text-secondary/40 text-xs">{formatMatchDate(match.match_date)}</p>
            </div>
            {match.status === 'finished' && match.home_score !== null && (
              <div className="text-center">
                <span className="text-on-surface font-bold text-xl">
                  {match.home_score} - {match.away_score}
                </span>
                {match.is_scored && <p className="text-green-400 text-xs">Puntos calculados ✓</p>}
              </div>
            )}
          </div>

          <ResultForm
            match={match}
            homePlayers={allPlayers.filter(p => p.team_id === match.home_team_id)}
            awayPlayers={allPlayers.filter(p => p.team_id === match.away_team_id)}
            initialEvents={allEvents.filter(e => e.match_id === match.id)}
            isKnockout={match.stage !== 'group'}
            initialKnockoutWinner={(match.knockout_winner as 'home' | 'away') ?? null}
            initialPenaltyHomeScore={match.penalty_home_score}
            initialPenaltyAwayScore={match.penalty_away_score}
          />
        </div>
      ))}

      {!filtered.length && (
        <p className="text-secondary/30 text-center py-8">
          {search ? `Sin resultados para "${search}"` : 'No hay partidos'}
        </p>
      )}
    </div>
  )
}
