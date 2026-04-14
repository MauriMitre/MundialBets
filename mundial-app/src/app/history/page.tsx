import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { flagUrl } from '@/lib/flags'
import { STAGE_LABELS } from '@/types'
import { formatMatchDate } from '@/lib/utils'

export const revalidate = 60

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Queries en paralelo
  const [{ data: predictions }, { data: missedMatches }] = await Promise.all([
    supabase
      .from('predictions')
      .select(`
        id,
        predicted_winner,
        predicted_home_score,
        predicted_away_score,
        points_earned,
        is_scored,
        match:match_id (
          id,
          match_date,
          stage,
          group_name,
          status,
          home_score,
          away_score,
          homeTeam:home_team_id ( id, name, code ),
          awayTeam:away_team_id ( id, name, code )
        ),
        predictionPlayers:prediction_players (
          event_type,
          player:player_id ( name, shirt_number )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),

    supabase
      .from('matches')
      .select(`
        id, match_date, stage, group_name, home_score, away_score,
        homeTeam:home_team_id ( id, name, code ),
        awayTeam:away_team_id ( id, name, code )
      `)
      .eq('status', 'finished'),
  ])

  const preds = predictions ?? []
  const predictedMatchIds = new Set(preds.map(p => (p.match as { id: string }).id))
  const missed = (missedMatches ?? []).filter(m => !predictedMatchIds.has(m.id))

  const finished = preds.filter(p => (p.match as { status: string }).status === 'finished')
  const pending  = preds.filter(p => (p.match as { status: string }).status !== 'finished')

  const totalPoints = finished.reduce((sum, p) => sum + (p.points_earned ?? 0), 0)
  const accuracy = finished.length > 0
    ? Math.round((finished.filter(p => (p.points_earned ?? 0) > 0).length / finished.length) * 100)
    : 0

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold tracking-tighter text-on-surface">
          Mis Predicciones
        </h1>
        <p className="font-label text-primary uppercase tracking-[0.3em] text-xs mt-2">
          Historial completo
        </p>
      </header>

      {/* Stats resumen */}
      {finished.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-8">
          <StatBox label="Predicciones" value={preds.length} />
          <StatBox label="Finalizadas" value={finished.length} />
          <StatBox label="Pts ganados" value={totalPoints} highlight />
          <StatBox label="Con puntos" value={`${accuracy}%`} />
        </div>
      )}

      {/* Predicciones pendientes */}
      {pending.length > 0 && (
        <section className="mb-10">
          <h2 className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4">
            Próximos / En curso
          </h2>
          <div className="space-y-3">
            {pending.map(p => {
              const match = p.match as Record<string, unknown>
              return (
                <PredictionRow
                  key={p.id}
                  match={match}
                  predictedHomeScore={p.predicted_home_score}
                  predictedAwayScore={p.predicted_away_score}
                  predictedWinner={p.predicted_winner}
                  pointsEarned={null}
                  isScored={false}
                  pending
                />
              )
            })}
          </div>
        </section>
      )}

      {/* Predicciones finalizadas */}
      {finished.length > 0 && (
        <section className="mb-10">
          <h2 className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4">
            Finalizados
          </h2>
          <div className="space-y-3">
            {finished.map(p => {
              const match = p.match as Record<string, unknown>
              return (
                <PredictionRow
                  key={p.id}
                  match={match}
                  predictedHomeScore={p.predicted_home_score}
                  predictedAwayScore={p.predicted_away_score}
                  predictedWinner={p.predicted_winner}
                  pointsEarned={p.points_earned}
                  isScored={p.is_scored}
                />
              )
            })}
          </div>
        </section>
      )}

      {/* Partidos sin predicción */}
      {missed.length > 0 && (
        <section className="mb-10">
          <h2 className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4">
            Sin predicción
          </h2>
          <div className="space-y-3">
            {missed.map(m => (
              <PredictionRow
                key={m.id}
                match={m as Record<string, unknown>}
                predictedHomeScore={null}
                predictedAwayScore={null}
                predictedWinner={null}
                pointsEarned={0}
                isScored={true}
                missed
              />
            ))}
          </div>
        </section>
      )}

      {preds.length === 0 && missed.length === 0 && (
        <div className="card p-12 text-center text-on-surface-variant">
          <p className="text-4xl mb-3">🎯</p>
          <p className="font-body">Aún no hiciste ninguna predicción</p>
        </div>
      )}

    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────── */

function StatBox({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="card p-4 text-center">
      <p className={`font-headline text-2xl font-black ${highlight ? 'text-primary' : 'text-on-surface'}`}>
        {value}
      </p>
      <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mt-1">
        {label}
      </p>
    </div>
  )
}

interface PredictionRowProps {
  match: Record<string, unknown>
  predictedHomeScore: number | null
  predictedAwayScore: number | null
  predictedWinner: string | null
  pointsEarned: number | null
  isScored: boolean
  pending?: boolean
  missed?: boolean
}

function PredictionRow({
  match,
  predictedHomeScore,
  predictedAwayScore,
  predictedWinner,
  pointsEarned,
  isScored,
  pending,
  missed,
}: PredictionRowProps) {
  const homeTeam = match.homeTeam as { name: string; code: string }
  const awayTeam = match.awayTeam as { name: string; code: string }
  const homeScore = match.home_score as number | null
  const awayScore = match.away_score as number | null
  const stage = match.stage as string
  const matchDate = match.match_date as string

  // Resultado exacto: ambos scores deben ser non-null y coincidir
  const gotExact =
    !missed &&
    !pending &&
    predictedHomeScore !== null &&
    predictedAwayScore !== null &&
    homeScore !== null &&
    awayScore !== null &&
    predictedHomeScore === homeScore &&
    predictedAwayScore === awayScore

  const gotWinner =
    !missed &&
    !pending &&
    !gotExact &&
    (pointsEarned ?? 0) > 0

  return (
    <div className={`card p-4 flex items-center gap-4 ${missed ? 'opacity-40' : ''}`}>

      {/* Banderas y equipos */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <TeamFlag code={homeTeam.code} />
        <span className="font-headline font-bold text-sm text-on-surface truncate hidden sm:block">
          {homeTeam.name}
        </span>
        <span className="font-headline font-bold text-xs text-on-surface-variant/30 mx-1">vs</span>
        <span className="font-headline font-bold text-sm text-on-surface truncate hidden sm:block">
          {awayTeam.name}
        </span>
        <TeamFlag code={awayTeam.code} />
      </div>

      {/* Resultado real */}
      <div className="text-center shrink-0 w-16">
        {homeScore !== null ? (
          <p className="font-headline font-bold text-base text-on-surface">
            {homeScore} - {awayScore}
          </p>
        ) : (
          <p className="text-on-surface-variant/30 text-xs">
            {formatMatchDate(matchDate)}
          </p>
        )}
        <p className="text-[9px] text-on-surface-variant/40 uppercase tracking-wider">
          {homeScore !== null ? 'Final' : STAGE_LABELS[stage as keyof typeof STAGE_LABELS]?.split(' ')[0]}
        </p>
      </div>

      {/* Predicción */}
      <div className="text-center shrink-0 w-16">
        {missed ? (
          <p className="text-on-surface-variant/40 text-xs">—</p>
        ) : predictedHomeScore !== null ? (
          <p className={`font-headline font-bold text-base ${
            gotExact ? 'text-primary' : gotWinner ? 'text-secondary-container' : 'text-on-surface-variant'
          }`}>
            {predictedHomeScore} - {predictedAwayScore}
          </p>
        ) : predictedWinner ? (
          <p className="text-on-surface-variant text-xs capitalize">{predictedWinner}</p>
        ) : (
          <p className="text-on-surface-variant/40 text-xs">—</p>
        )}
        <p className="text-[9px] text-on-surface-variant/40 uppercase tracking-wider">
          {missed ? 'sin apuesta' : 'tu apuesta'}
        </p>
      </div>

      {/* Puntos */}
      <div className="shrink-0 w-14 text-right">
        {pending ? (
          <span className="badge badge-gray">pendiente</span>
        ) : missed ? (
          <span className="font-headline font-bold text-on-surface-variant/30 text-base">0</span>
        ) : isScored ? (
          <span className={`font-headline font-bold text-xl ${
            (pointsEarned ?? 0) > 0 ? 'text-primary' : 'text-on-surface-variant/40'
          }`}>
            +{pointsEarned}
          </span>
        ) : (
          <span className="badge badge-gray">sin calcular</span>
        )}
      </div>

    </div>
  )
}

function TeamFlag({ code }: { code: string }) {
  const url = flagUrl(code, 32)
  return (
    <div className="w-7 h-7 rounded-full overflow-hidden bg-surface-container-high shrink-0">
      {url
        ? <img src={url} alt={code} className="w-full h-full object-cover" />
        : <span className="text-[10px] font-bold flex items-center justify-center h-full">{code}</span>
      }
    </div>
  )
}
