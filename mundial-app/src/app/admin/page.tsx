import { createClient } from '@/lib/supabase/server'
import MatchForm from './MatchForm'
import MatchList from './MatchList'

export default async function AdminMatchesPage() {
  const supabase = await createClient()

  const [{ data: matches }, { data: teams }] = await Promise.all([
    supabase
      .from('matches')
      .select(`*, homeTeam:home_team_id(id,name,code), awayTeam:away_team_id(id,name,code)`)
      .order('match_date', { ascending: true }),
    supabase.from('teams').select('id, name, code').order('name'),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Gestión de partidos</h1>

      <div className="card p-5">
        <h2 className="text-white font-semibold mb-4">➕ Agregar partido</h2>
        <MatchForm teams={teams ?? []} />
      </div>

      <MatchList matches={matches ?? []} teams={teams ?? []} />
    </div>
  )
}
