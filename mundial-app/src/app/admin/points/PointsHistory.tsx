'use client'

import { useState } from 'react'
import { formatMatchDate } from '@/lib/utils'
import { STAGE_LABELS } from '@/types'

interface Profile { id: string; username: string; display_name: string | null }
interface PredPlayer { player_id: string; event_type: string }
interface MatchEvent  { match_id: string; player_id: string; event_type: string }
export interface Prediction {
  id: string
  user_id: string
  match_id: string
  predicted_winner: string | null
  predicted_home_score: number | null
  predicted_away_score: number | null
  predicted_penalty_home_score: number | null
  predicted_penalty_away_score: number | null
  points_earned: number
  match: {
    id: string
    match_date: string
    stage: string
    group_name: string | null
    home_score: number
    away_score: number
    knockout_winner: string | null
    penalty_home_score: number | null
    penalty_away_score: number | null
    homeTeam: { name: string; code: string }
    awayTeam: { name: string; code: string }
  }
  predPlayers: PredPlayer[]
}

interface ScoringValues {
  winner: number
  exact: number
  scorer: number
  assist: number
  penalty: number
}

function getBreakdown(pred: Prediction, events: MatchEvent[]) {
  const { home_score, away_score, knockout_winner, penalty_home_score, penalty_away_score } = pred.match
  // En eliminatorias definidas por penales el ganador real es knockout_winner
  const actualWinner =
    home_score > away_score ? 'home' :
    away_score > home_score ? 'away' :
    knockout_winner ?? 'draw'

  const correctWinner = pred.predicted_winner === actualWinner
  const exactScore =
    pred.predicted_home_score === home_score &&
    pred.predicted_away_score === away_score

  const correctPenalties =
    penalty_home_score !== null &&
    penalty_away_score !== null &&
    pred.predicted_penalty_home_score !== null &&
    pred.predicted_penalty_away_score !== null &&
    pred.predicted_penalty_home_score === penalty_home_score &&
    pred.predicted_penalty_away_score === penalty_away_score

  // Igual que calculate_prediction_points: cada fila predicha suma una vez
  // POR CADA evento real que matchea (multiplicidad, no jugadores únicos)
  const eventsForMatch = events.filter(e => e.match_id === pred.match_id)
  const goalCounts: Record<string, number> = {}
  const assistCounts: Record<string, number> = {}
  for (const e of eventsForMatch) {
    if (e.event_type === 'goal')   goalCounts[e.player_id]   = (goalCounts[e.player_id] ?? 0) + 1
    if (e.event_type === 'assist') assistCounts[e.player_id] = (assistCounts[e.player_id] ?? 0) + 1
  }

  const correctScorers = pred.predPlayers
    .filter(p => p.event_type === 'goal')
    .reduce((sum, p) => sum + (goalCounts[p.player_id] ?? 0), 0)
  const correctAssists = pred.predPlayers
    .filter(p => p.event_type === 'assist')
    .reduce((sum, p) => sum + (assistCounts[p.player_id] ?? 0), 0)

  return { correctWinner, exactScore, correctScorers, correctAssists, correctPenalties }
}

export default function PointsHistory({
  predictions,
  matchEvents,
  profiles,
  scoring,
}: {
  predictions: Prediction[]
  matchEvents: MatchEvent[]
  profiles: Profile[]
  scoring: ScoringValues
}) {
  const [selectedId, setSelectedId] = useState(profiles[0]?.id ?? '')

  const userPreds = predictions
    .filter(p => p.user_id === selectedId)
    .sort((a, b) => new Date(b.match.match_date).getTime() - new Date(a.match.match_date).getTime())

  const totalPoints = userPreds.reduce((sum, p) => sum + p.points_earned, 0)
  const selectedProfile = profiles.find(p => p.id === selectedId)

  return (
    <div className="space-y-4">
      {/* Selector jugador */}
      <div className="card p-4">
        <label className="block text-xs text-white/50 mb-2">Jugador</label>
        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          className="input"
        >
          {profiles.map(p => (
            <option key={p.id} value={p.id}>
              {p.display_name ?? p.username}
            </option>
          ))}
        </select>
      </div>

      {/* Resumen */}
      {selectedProfile && (
        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="font-bold text-primary text-sm">
              {(selectedProfile.display_name ?? selectedProfile.username).charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-on-surface font-semibold">
              {selectedProfile.display_name ?? selectedProfile.username}
            </p>
            <p className="text-secondary/40 text-xs">{userPreds.length} partido{userPreds.length !== 1 ? 's' : ''} con puntos</p>
          </div>
          <div className="text-right">
            <p className="text-primary font-bold text-2xl font-headline">{totalPoints}</p>
            <p className="text-secondary/40 text-xs uppercase tracking-wide">pts totales</p>
          </div>
        </div>
      )}

      {/* Timeline de predicciones */}
      {userPreds.length === 0 ? (
        <p className="text-secondary/30 text-center py-8">Este jugador no tiene puntos aún</p>
      ) : (
        <div className="space-y-3">
          {userPreds.map(pred => {
            const { correctWinner, exactScore, correctScorers, correctAssists, correctPenalties } = getBreakdown(pred, matchEvents)
            const stageLabel = STAGE_LABELS[pred.match.stage as keyof typeof STAGE_LABELS] ?? pred.match.stage

            return (
              <div key={pred.id} className="card p-4">
                {/* Partido */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-on-surface font-semibold text-sm">
                      {pred.match.homeTeam.name} {pred.match.home_score} – {pred.match.away_score} {pred.match.awayTeam.name}
                    </p>
                    <p className="text-secondary/40 text-xs mt-0.5">
                      {formatMatchDate(pred.match.match_date)} · {stageLabel}
                      {pred.match.group_name && ` G${pred.match.group_name}`}
                    </p>
                    <p className="text-secondary/30 text-xs mt-0.5">
                      Predijo: {pred.predicted_home_score ?? '?'} – {pred.predicted_away_score ?? '?'}
                      {' '}({pred.predicted_winner === 'home' ? pred.match.homeTeam.name : pred.predicted_winner === 'away' ? pred.match.awayTeam.name : 'Empate'})
                    </p>
                  </div>
                  <div className="shrink-0 ml-4 text-right">
                    <span className="text-primary font-bold text-xl font-headline">+{pred.points_earned}</span>
                    <p className="text-secondary/40 text-xs">pts</p>
                  </div>
                </div>

                {/* Desglose */}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5">
                  {correctWinner && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                      ✓ Ganador +{scoring.winner}
                    </span>
                  )}
                  {exactScore && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      ✓ Resultado exacto +{scoring.exact}
                    </span>
                  )}
                  {correctPenalties && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      ✓ Penales exactos +{scoring.penalty}
                    </span>
                  )}
                  {correctScorers > 0 && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      ✓ {correctScorers} goleador{correctScorers > 1 ? 'es' : ''} +{correctScorers * scoring.scorer}
                    </span>
                  )}
                  {correctAssists > 0 && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      ✓ {correctAssists} asistente{correctAssists > 1 ? 's' : ''} +{correctAssists * scoring.assist}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
