'use client'

import { useState } from 'react'
import { formatMatchDate } from '@/lib/utils'
import { STAGE_LABELS } from '@/types'

interface Profile { id: string; username: string; displayName: string | null; totalPoints: number }
interface PredPlayer { player_id: string; event_type: string; player: { name: string } | null }
export interface MatchEvent  { match_id: string; player_id: string; event_type: string; player: { name: string } | null }
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

function getBreakdown(pred: Prediction, events: MatchEvent[]) {
  const { home_score, away_score, knockout_winner, penalty_home_score, penalty_away_score } = pred.match
  const actualWinner =
    home_score > away_score ? 'home' :
    away_score > home_score ? 'away' :
    knockout_winner ?? 'draw'

  const correctWinner = pred.predicted_winner === actualWinner

  const correctPenalties =
    penalty_home_score !== null &&
    penalty_away_score !== null &&
    pred.predicted_penalty_home_score !== null &&
    pred.predicted_penalty_away_score !== null &&
    pred.predicted_penalty_home_score === penalty_home_score &&
    pred.predicted_penalty_away_score === penalty_away_score
  const exactScore =
    pred.predicted_home_score === home_score &&
    pred.predicted_away_score === away_score

  // Aciertos por jugador = min(veces predichas, eventos reales). Igual que
  // calculate_prediction_points (LEAST por jugador): predecir 2 goles de un
  // jugador que metió 1 cuenta como 1 acierto, no como 2.
  const forMatch = events.filter(e => e.match_id === pred.match_id)
  const goalCounts: Record<string, number> = {}
  const assistCounts: Record<string, number> = {}
  for (const e of forMatch) {
    if (e.event_type === 'goal')   goalCounts[e.player_id]   = (goalCounts[e.player_id] ?? 0) + 1
    if (e.event_type === 'assist') assistCounts[e.player_id] = (assistCounts[e.player_id] ?? 0) + 1
  }

  // Cuántas veces el usuario predijo cada jugador por tipo de evento
  const predGoals: Record<string, number> = {}
  const predAssists: Record<string, number> = {}
  for (const p of pred.predPlayers) {
    if (p.event_type === 'goal')   predGoals[p.player_id]   = (predGoals[p.player_id] ?? 0) + 1
    if (p.event_type === 'assist') predAssists[p.player_id] = (predAssists[p.player_id] ?? 0) + 1
  }

  const correctScorers = Object.entries(predGoals)
    .reduce((sum, [pid, count]) => sum + Math.min(count, goalCounts[pid] ?? 0), 0)
  const correctAssists = Object.entries(predAssists)
    .reduce((sum, [pid, count]) => sum + Math.min(count, assistCounts[pid] ?? 0), 0)

  return { correctWinner, exactScore, correctScorers, correctAssists, correctPenalties }
}

interface NamedCount { id: string; name: string; count: number; hitCount: number }

// Listas con nombres: lo que pasó en la cancha y lo que apostó el usuario.
// En los predichos, `hitCount` = cuántos de los apostados realmente ocurrieron
// (min entre apostados y reales): apostar doblete y meter 1 cuenta como 1/2.
function getPlayerLists(pred: Prediction, events: MatchEvent[]) {
  const forMatch = events.filter(e => e.match_id === pred.match_id)

  function tally(rows: { player_id: string; event_type: string; player: { name: string } | null }[], type: string) {
    const map: Record<string, NamedCount> = {}
    for (const r of rows) {
      if (r.event_type !== type) continue
      if (!map[r.player_id]) map[r.player_id] = { id: r.player_id, name: r.player?.name ?? 'Jugador', count: 0, hitCount: 0 }
      map[r.player_id].count++
    }
    return map
  }

  const realGoals   = tally(forMatch, 'goal')
  const realAssists = tally(forMatch, 'assist')
  const predGoals   = tally(pred.predPlayers, 'goal')
  const predAssists = tally(pred.predPlayers, 'assist')

  // Aciertos por jugador = min(apostados, reales)
  for (const g of Object.values(predGoals))   g.hitCount = Math.min(g.count, realGoals[g.id]?.count ?? 0)
  for (const a of Object.values(predAssists)) a.hitCount = Math.min(a.count, realAssists[a.id]?.count ?? 0)

  return {
    realGoals:   Object.values(realGoals),
    realAssists: Object.values(realAssists),
    predGoals:   Object.values(predGoals),
    predAssists: Object.values(predAssists),
  }
}

function PlayerLine({ icon, items, empty, mark = false }: {
  icon: string
  items: NamedCount[]
  empty: string
  mark?: boolean
}) {
  return (
    <p className="flex gap-1.5 text-on-surface-variant/80 leading-relaxed">
      <span className="shrink-0">{icon}</span>
      {items.length === 0 ? (
        <span className="text-on-surface-variant/30">{empty}</span>
      ) : (
        <span className="flex flex-wrap gap-x-2 gap-y-0.5">
          {items.map(it => {
            if (!mark) {
              return <span key={it.id}>{it.name}{it.count > 1 ? ` ×${it.count}` : ''}</span>
            }
            // Verde = apostado completo; amarillo = parcial; gris = no acertó
            const cls = it.hitCount === 0 ? 'text-on-surface-variant/50'
              : it.hitCount >= it.count ? 'text-green-400' : 'text-yellow-400'
            const frac = it.count > 1 ? ` ${it.hitCount}/${it.count}` : ''
            return (
              <span key={it.id} className={cls}>
                {it.hitCount > 0 ? '✓ ' : '✗ '}{it.name}{frac}
              </span>
            )
          })}
        </span>
      )}
    </p>
  )
}

export interface ScoringValues {
  winner: number
  exact: number
  scorer: number
  assist: number
  penalty: number
}

export default function PointsPanel({
  profiles,
  predictions,
  matchEvents,
  currentUserId,
  scoring,
}: {
  profiles: Profile[]
  predictions: Prediction[]
  matchEvents: MatchEvent[]
  currentUserId: string
  scoring: ScoringValues
}) {
  const [selectedId, setSelectedId] = useState(currentUserId)

  const userPreds = predictions
    .filter(p => p.user_id === selectedId)
    .sort((a, b) => new Date(b.match.match_date).getTime() - new Date(a.match.match_date).getTime())

  const selectedProfile = profiles.find(p => p.id === selectedId)

  return (
    <div className="bg-surface-container-low rounded-xl p-4 sm:p-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-8 px-1 sm:px-4">
        <div>
          <h3 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
            Historial de Puntos
          </h3>
          <p className="text-on-surface-variant text-xs uppercase tracking-widest font-label mt-1">
            Cómo y cuándo sumó cada uno
          </p>
        </div>
      </div>

      {/* Tabs / selector de jugador */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 px-1 sm:px-4">
        {profiles.map(p => {
          const name = p.displayName ?? p.username
          const initial = name.charAt(0).toUpperCase()
          const isSelected = p.id === selectedId
          const isMe = p.id === currentUserId
          return (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-label font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-primary/15 border-primary/40 text-primary'
                  : 'border-outline-variant/10 text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isSelected ? 'bg-primary/20 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                {initial}
              </span>
              {name}
              {isMe && <span className="opacity-50">(vos)</span>}
            </button>
          )
        })}
      </div>

      {/* Resumen del jugador seleccionado */}
      {selectedProfile && userPreds.length > 0 && (
        <div className="flex items-center gap-4 px-1 sm:px-4 mb-6 pb-6 border-b border-outline-variant/10">
          <div className="flex-1">
            <p className="text-on-surface-variant text-xs font-label uppercase tracking-widest">
              {userPreds.length} partido{userPreds.length !== 1 ? 's' : ''} con puntos
            </p>
          </div>
          <div className="text-right">
            <span className="font-headline text-3xl font-bold text-primary">{selectedProfile.totalPoints}</span>
            <span className="text-on-surface-variant text-sm font-label ml-1">pts totales</span>
          </div>
        </div>
      )}

      {/* Lista de predicciones con puntos */}
      <div className="space-y-3 px-1 sm:px-4">
        {userPreds.length === 0 ? (
          <p className="text-on-surface-variant/30 text-sm text-center py-8 font-label">
            {selectedProfile?.displayName ?? selectedProfile?.username} aún no sumó puntos
          </p>
        ) : (
          userPreds.map(pred => {
            const { correctWinner, exactScore, correctScorers, correctAssists, correctPenalties } = getBreakdown(pred, matchEvents)
            const { realGoals, realAssists, predGoals, predAssists } = getPlayerLists(pred, matchEvents)
            const stage = STAGE_LABELS[pred.match.stage as keyof typeof STAGE_LABELS] ?? pred.match.stage

            return (
              <div
                key={pred.id}
                className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/5"
              >
                {/* Match header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-on-surface font-semibold text-sm">
                      {pred.match.homeTeam.name}
                      <span className="text-primary font-bold mx-2">
                        {pred.match.home_score} – {pred.match.away_score}
                      </span>
                      {pred.match.awayTeam.name}
                    </p>
                    <p className="text-on-surface-variant/50 text-xs mt-0.5 font-label">
                      {formatMatchDate(pred.match.match_date)} · {stage}
                      {pred.match.group_name && ` G${pred.match.group_name}`}
                    </p>
                  </div>
                  <div className="shrink-0 ml-4 text-right">
                    <span className="font-headline text-2xl font-bold text-primary">+{pred.points_earned}</span>
                    <p className="text-on-surface-variant/40 text-[10px] font-label uppercase">pts</p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-outline-variant/10">
                  {correctWinner && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-label">
                      ✓ Ganador +{scoring.winner}
                    </span>
                  )}
                  {exactScore && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-label">
                      ✓ Resultado exacto +{scoring.exact}
                    </span>
                  )}
                  {correctPenalties && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-label">
                      ✓ Penales exactos +{scoring.penalty}
                    </span>
                  )}
                  {correctScorers > 0 && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-label">
                      ✓ {correctScorers} goleador{correctScorers > 1 ? 'es' : ''} +{correctScorers * scoring.scorer}
                    </span>
                  )}
                  {correctAssists > 0 && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-label">
                      ✓ {correctAssists} asistente{correctAssists > 1 ? 's' : ''} +{correctAssists * scoring.assist}
                    </span>
                  )}
                </div>

                {/* Detalle: lo que pasó en la cancha vs lo que se apostó */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-outline-variant/10 text-[11px] font-label">
                  <div className="space-y-1">
                    <p className="uppercase tracking-wider text-on-surface-variant/40">En la cancha</p>
                    <PlayerLine icon="⚽" items={realGoals} empty="Sin goles" />
                    <PlayerLine icon="🎯" items={realAssists} empty="Sin asistencias" />
                  </div>
                  <div className="space-y-1 sm:border-l border-outline-variant/10 sm:pl-3">
                    <p className="uppercase tracking-wider text-on-surface-variant/40">Apostó</p>
                    <p className="text-on-surface-variant/80">
                      📋 {pred.predicted_home_score ?? '?'} – {pred.predicted_away_score ?? '?'}
                      {pred.predicted_penalty_home_score !== null && (
                        <span className="text-on-surface-variant/50"> · pen {pred.predicted_penalty_home_score}-{pred.predicted_penalty_away_score}</span>
                      )}
                    </p>
                    <PlayerLine icon="⚽" items={predGoals} empty="Sin goleadores" mark />
                    <PlayerLine icon="🎯" items={predAssists} empty="Sin asistentes" mark />
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
