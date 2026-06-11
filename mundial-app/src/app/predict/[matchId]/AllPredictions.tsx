// Apuestas de todos los jugadores, visibles solo con apuestas cerradas
// (la RLS de predictions/prediction_players impone lo mismo a nivel BD)

interface PredPlayer {
  event_type: string
  player: { name: string; shirt_number: number | null } | null
}

interface RevealedPrediction {
  id: string
  user_id: string
  predicted_winner: string | null
  predicted_home_score: number | null
  predicted_away_score: number | null
  predicted_penalty_home_score: number | null
  predicted_penalty_away_score: number | null
  points_earned: number | null
  is_scored: boolean
  user: { id: string; username: string; display_name: string | null } | null
  predictionPlayers: PredPlayer[]
}

interface ProfileLite {
  id: string
  username: string
  display_name: string | null
}

interface Props {
  match: {
    status: string
    home_score: number | null
    away_score: number | null
    knockout_winner: string | null
    penalty_home_score: number | null
    penalty_away_score: number | null
    homeTeam: { name: string; code: string }
    awayTeam: { name: string; code: string }
  }
  predictions: RevealedPrediction[]
  profiles: ProfileLite[]
  currentUserId: string
}

const getName = (p: { display_name: string | null; username: string }) =>
  p.display_name || p.username

const getInitial = (p: { display_name: string | null; username: string }) =>
  (p.display_name || p.username).charAt(0).toUpperCase()

export default function AllPredictions({ match, predictions, profiles, currentUserId }: Props) {
  const isFinished = match.status === 'finished'
  const anyScored = predictions.some(p => p.is_scored)

  // Ganador real (penales en eliminatorias si empate en 90')
  const actualWinner =
    match.home_score === null || match.away_score === null ? null :
    match.home_score > match.away_score ? 'home' :
    match.away_score > match.home_score ? 'away' :
    match.knockout_winner ?? 'draw'

  const sorted = [...predictions].sort((a, b) => {
    if (anyScored) {
      const diff = (b.points_earned ?? 0) - (a.points_earned ?? 0)
      if (diff !== 0) return diff
    }
    const nameA = a.user ? getName(a.user) : ''
    const nameB = b.user ? getName(b.user) : ''
    return nameA.localeCompare(nameB)
  })

  const betUserIds = new Set(predictions.map(p => p.user_id))
  const didNotBet = profiles
    .filter(p => !betUserIds.has(p.id))
    .sort((a, b) => getName(a).localeCompare(getName(b)))

  return (
    <section className="card overflow-hidden">
      <div className="px-4 sm:px-5 py-4 border-b border-outline-variant/10 flex items-center justify-between">
        <div>
          <h2 className="font-headline font-bold text-on-surface uppercase tracking-wide text-sm">
            Las apuestas de todos
          </h2>
          <p className="font-body text-xs text-on-surface-variant/60 mt-0.5">
            Se revelan al cerrar las apuestas
          </p>
        </div>
        <span className="badge badge-gold">{predictions.length}</span>
      </div>

      {sorted.length === 0 && (
        <p className="p-6 text-center text-on-surface-variant/50 font-body text-sm">
          Nadie apostó en este partido
        </p>
      )}

      <div className="divide-y divide-outline-variant/10">
        {sorted.map(pred => {
          const isMe = pred.user_id === currentUserId

          const gotExact =
            isFinished &&
            pred.predicted_home_score !== null &&
            match.home_score !== null &&
            pred.predicted_home_score === match.home_score &&
            pred.predicted_away_score === match.away_score

          const gotWinner =
            isFinished &&
            !gotExact &&
            actualWinner !== null &&
            pred.predicted_winner === actualWinner

          const hasPenaltyPrediction =
            pred.predicted_penalty_home_score !== null &&
            pred.predicted_penalty_away_score !== null

          const gotPenalties =
            hasPenaltyPrediction &&
            match.penalty_home_score !== null &&
            pred.predicted_penalty_home_score === match.penalty_home_score &&
            pred.predicted_penalty_away_score === match.penalty_away_score

          // En eliminatorias con marcador empatado, quién pasa de ronda
          const predictedTie =
            pred.predicted_home_score !== null &&
            pred.predicted_home_score === pred.predicted_away_score
          const advancingCode =
            predictedTie && pred.predicted_winner === 'home' ? match.homeTeam.code :
            predictedTie && pred.predicted_winner === 'away' ? match.awayTeam.code :
            null

          const scorers   = pred.predictionPlayers.filter(p => p.event_type === 'goal'   && p.player)
          const assisters = pred.predictionPlayers.filter(p => p.event_type === 'assist' && p.player)

          return (
            <div
              key={pred.id}
              className={`px-4 sm:px-5 py-3 ${isMe ? 'bg-primary/5 border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
            >
              <div className="flex items-center gap-3">

                {/* Usuario */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-on-surface-variant">
                      {pred.user ? getInitial(pred.user) : '?'}
                    </span>
                  </div>
                  <span className="font-body font-semibold text-sm text-on-surface truncate">
                    {pred.user ? getName(pred.user) : 'Desconocido'}
                    {isMe && <span className="text-primary text-xs font-label ml-1.5">(vos)</span>}
                  </span>
                </div>

                {/* Marcador apostado */}
                <div className="text-center shrink-0">
                  <p className={`font-headline font-bold text-base ${
                    gotExact ? 'text-primary' : gotWinner ? 'text-secondary-container' : 'text-on-surface-variant'
                  }`}>
                    {pred.predicted_home_score} - {pred.predicted_away_score}
                  </p>
                  {advancingCode && (
                    <p className="text-[9px] text-on-surface-variant/50 uppercase tracking-wider">
                      pasa {advancingCode}
                    </p>
                  )}
                  {hasPenaltyPrediction && (
                    <p className={`text-[9px] ${gotPenalties ? 'text-primary' : 'text-on-surface-variant/50'}`}>
                      pen {pred.predicted_penalty_home_score}-{pred.predicted_penalty_away_score}
                    </p>
                  )}
                </div>

                {/* Puntos */}
                <div className="shrink-0 w-12 text-right">
                  {pred.is_scored ? (
                    <span className={`font-headline font-bold text-lg ${
                      (pred.points_earned ?? 0) > 0 ? 'text-primary' : 'text-on-surface-variant/40'
                    }`}>
                      +{pred.points_earned}
                    </span>
                  ) : (
                    <span className="text-[9px] text-on-surface-variant/40 uppercase tracking-wider">
                      {isFinished ? 'sin calcular' : '—'}
                    </span>
                  )}
                </div>

              </div>

              {/* Goleadores y asistentes apostados */}
              {(scorers.length > 0 || assisters.length > 0) && (
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 pl-10.5">
                  {scorers.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-on-surface-variant/40 uppercase tracking-wider font-label">⚽</span>
                      {scorers.map((p, i) => (
                        <span key={i} className="text-xs text-on-surface-variant/70 font-label">
                          {p.player!.shirt_number ? `#${p.player!.shirt_number} ` : ''}{p.player!.name}
                          {i < scorers.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                  {assisters.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-on-surface-variant/40 uppercase tracking-wider font-label">🎯</span>
                      {assisters.map((p, i) => (
                        <span key={i} className="text-xs text-on-surface-variant/70 font-label">
                          {p.player!.shirt_number ? `#${p.player!.shirt_number} ` : ''}{p.player!.name}
                          {i < assisters.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Los que no apostaron */}
        {didNotBet.map(p => (
          <div key={p.id} className="px-4 sm:px-5 py-3 border-l-4 border-transparent opacity-40 flex items-center gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-on-surface-variant">{getInitial(p)}</span>
              </div>
              <span className="font-body font-semibold text-sm text-on-surface truncate">
                {getName(p)}
                {p.id === currentUserId && <span className="text-primary text-xs font-label ml-1.5">(vos)</span>}
              </span>
            </div>
            <span className="text-[9px] text-on-surface-variant/40 uppercase tracking-wider">no apostó</span>
          </div>
        ))}
      </div>
    </section>
  )
}
