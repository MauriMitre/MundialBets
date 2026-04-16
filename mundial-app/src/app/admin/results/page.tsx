import { createClient } from '@/lib/supabase/server'
import ResultsList from './ResultsList'

export default async function AdminResultsPage() {
  const supabase = await createClient()

  const [{ data: matches }, { data: allPlayers }, { data: allEvents }] = await Promise.all([
    supabase
      .from('matches')
      .select(`*, homeTeam:home_team_id(id,name), awayTeam:away_team_id(id,name)`)
      .in('status', ['upcoming', 'live', 'finished'])
      .order('match_date', { ascending: false }),
    supabase
      .from('players')
      .select('id, name, team_id, shirt_number')
      .eq('is_active', true)
      .order('name'),
    supabase
      .from('match_events')
      .select('match_id, player_id, event_type, minute')
      .order('minute', { ascending: true }),
  ])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-on-surface">Cargar resultados</h1>
        <p className="text-secondary/40 text-sm mt-1">
          Al guardar el resultado se calculan los puntos automáticamente para todos los usuarios.
        </p>
      </div>
      <ResultsList matches={matches ?? []} allPlayers={allPlayers ?? []} allEvents={allEvents ?? []} />
    </div>
  )
}
