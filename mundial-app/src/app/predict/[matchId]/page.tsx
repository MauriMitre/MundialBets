import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import PredictionForm from './PredictionForm'
import { isBettingOpen } from '@/lib/utils'
import { STAGE_LABELS, isKnockout } from '@/types'
import { flagUrl } from '@/lib/flags'

interface Props {
  params: Promise<{ matchId: string }>
}

export default async function PredictPage({ params }: Props) {
  const { matchId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: match } = await supabase
    .from('matches')
    .select(`
      *,
      homeTeam:home_team_id ( id, name, code, flag_url ),
      awayTeam:away_team_id ( id, name, code, flag_url )
    `)
    .eq('id', matchId)
    .single()

  if (!match) notFound()

  // Jugadores de ambos equipos
  const { data: players } = await supabase
    .from('players')
    .select('*, team:team_id ( id, name, code )')
    .in('team_id', [match.home_team_id, match.away_team_id])
    .eq('is_active', true)
    .order('position')
    .order('shirt_number')

  // Predicción existente
  const { data: prediction } = await supabase
    .from('predictions')
    .select('*, predictionPlayers:prediction_players ( * )')
    .eq('user_id', user.id)
    .eq('match_id', matchId)
    .single()

  const canPredict = match.status === 'upcoming' && isBettingOpen(match.betting_closes_at)
  const isFinished = match.status === 'finished'

  return (
    <div className="max-w-lg mx-auto space-y-5">

      {/* Header del partido */}
      <div className="card-gold p-5 text-center">
        <p className="text-xs text-white/40 uppercase tracking-wider mb-3">
          {STAGE_LABELS[match.stage as keyof typeof STAGE_LABELS]}
          {match.group_name && ` — Grupo ${match.group_name}`}
        </p>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <TeamDisplay name={match.homeTeam.name} code={match.homeTeam.code} />

          <div className="text-center">
            {isFinished && match.home_score !== null ? (
              <div>
                <span className="text-white font-bold text-3xl">
                  {match.home_score} - {match.away_score}
                </span>
                <p className="text-white/40 text-xs mt-1">Final</p>
              </div>
            ) : (
              <span className="text-white/30 text-2xl font-bold">VS</span>
            )}
          </div>

          <TeamDisplay name={match.awayTeam.name} code={match.awayTeam.code} align="left" />
        </div>

        {/* Estado */}
        <div className="mt-3">
          {!canPredict && !isFinished && (
            <span className="badge badge-red">⏰ Apuestas cerradas</span>
          )}
          {canPredict && !prediction && (
            <span className="badge badge-gold">Apostá antes del partido</span>
          )}
          {canPredict && prediction && (
            <span className="badge badge-green">✓ Ya apostaste — podés editar</span>
          )}
          {isFinished && prediction && (
            <span className="badge badge-gold">
              Ganaste {prediction.points_earned} pts
            </span>
          )}
          {isFinished && !prediction && (
            <span className="badge badge-gray">No apostaste en este partido</span>
          )}
        </div>
      </div>

      {/* Formulario de predicción */}
      {(canPredict || (isFinished && prediction)) && (
        <PredictionForm
          match={match}
          players={players ?? []}
          existing={prediction}
          readonly={isFinished}
          userId={user.id}
          isKnockout={isKnockout(match.stage)}
        />
      )}

      {!canPredict && !isFinished && !prediction && (
        <div className="card p-6 text-center text-white/40">
          <p className="text-3xl mb-2">⏰</p>
          <p>Las apuestas cerraron 30 minutos antes del partido</p>
        </div>
      )}
    </div>
  )
}

function TeamDisplay({ name, code, align = 'right' }: { name: string; code: string; align?: 'left' | 'right' }) {
  return (
    <div className={`flex flex-col items-${align === 'right' ? 'end' : 'start'}`}>
      <div className="w-14 h-14 rounded-full overflow-hidden bg-surface-container-highest flex items-center justify-center">
        {flagUrl(code)
          ? <img src={flagUrl(code, 80)} alt={code} className="w-full h-full object-cover" />
          : <span className="text-lg font-bold">{code}</span>}
      </div>
      <span className="text-white font-semibold text-sm mt-2 leading-tight">{name}</span>
      <span className="text-white/30 text-xs">{code}</span>
    </div>
  )
}
