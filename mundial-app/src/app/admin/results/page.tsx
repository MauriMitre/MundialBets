import { createClient } from '@/lib/supabase/server'
import { fetchAllRows } from '@/lib/supabase/fetchAll'
import ResultsList from './ResultsList'

export default async function AdminResultsPage() {
  const supabase = await createClient()

  // players (1243) y match_events superan el límite de 1000 filas
  // por select de Supabase: paginar
  const [{ data: matches }, allPlayers, allEvents] = await Promise.all([
    supabase
      .from('matches')
      .select(`*, homeTeam:home_team_id(id,name), awayTeam:away_team_id(id,name)`)
      .in('status', ['upcoming', 'live', 'finished'])
      .order('match_date', { ascending: false }),
    fetchAllRows((from, to) =>
      supabase
        .from('players')
        .select('id, name, team_id, shirt_number')
        .eq('is_active', true)
        .order('name')
        .order('id')
        .range(from, to)
    ),
    fetchAllRows((from, to) =>
      supabase
        .from('match_events')
        .select('match_id, player_id, event_type, minute')
        .order('minute', { ascending: true, nullsFirst: false })
        .order('id')
        .range(from, to)
    ),
  ])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-on-surface">Cargar resultados</h1>
        <p className="text-secondary/40 text-sm mt-1">
          Al guardar el resultado se calculan los puntos automáticamente para todos los usuarios.
        </p>
      </div>
      <ResultsList matches={matches ?? []} allPlayers={allPlayers} allEvents={allEvents} />
    </div>
  )
}
