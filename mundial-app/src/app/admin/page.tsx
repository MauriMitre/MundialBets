import { createClient } from '@/lib/supabase/server'
import MatchForm from './MatchForm'
import { STAGE_LABELS } from '@/types'
import { formatMatchDate } from '@/lib/utils'

export default async function AdminMatchesPage() {
  const supabase = await createClient()

  const [{ data: matches }, { data: teams }] = await Promise.all([
    supabase
      .from('matches')
      .select(`
        *,
        homeTeam:home_team_id ( id, name, code ),
        awayTeam:away_team_id ( id, name, code )
      `)
      .order('match_date', { ascending: true }),
    supabase.from('teams').select('id, name, code').order('name'),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Gestión de partidos</h1>

      {/* Formulario nuevo partido */}
      <div className="card p-5">
        <h2 className="text-white font-semibold mb-4">➕ Agregar partido</h2>
        <MatchForm teams={teams ?? []} />
      </div>

      {/* Lista de partidos */}
      <div className="space-y-2">
        {matches?.map(match => (
          <div key={match.id} className="card p-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-white font-medium text-sm">
                {match.homeTeam.name} vs {match.awayTeam.name}
              </p>
              <p className="text-white/40 text-xs mt-0.5">
                {formatMatchDate(match.match_date)} — {STAGE_LABELS[match.stage as keyof typeof STAGE_LABELS]}
                {match.group_name && ` G${match.group_name}`}
              </p>
            </div>
            <StatusPill status={match.status} />
          </div>
        ))}
        {!matches?.length && (
          <p className="text-white/30 text-sm text-center py-6">No hay partidos aún</p>
        )}
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  if (status === 'upcoming') return <span className="badge badge-gray">Por jugar</span>
  if (status === 'live')     return <span className="badge badge-red">En vivo</span>
  return <span className="badge badge-green">Finalizado</span>
}
