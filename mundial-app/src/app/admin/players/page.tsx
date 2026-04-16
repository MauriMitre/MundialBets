import { createClient } from '@/lib/supabase/server'
import PlayersManager from './PlayersManager'

export default async function AdminPlayersPage() {
  const supabase = await createClient()

  const [{ data: teams }, { data: players }] = await Promise.all([
    supabase.from('teams').select('id, name, code').order('name'),
    supabase.from('players').select('id, name, team_id, position, shirt_number, is_active').order('name'),
  ])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">Jugadores</h1>
      <p className="text-white/40 text-sm -mt-2">
        Seleccioná un equipo para ver y gestionar sus jugadores.
      </p>
      <PlayersManager teams={teams ?? []} players={players ?? []} />
    </div>
  )
}
