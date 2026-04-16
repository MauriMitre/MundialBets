import { createClient } from '@/lib/supabase/server'
import TeamsManager from './TeamsManager'

export default async function AdminTeamsPage() {
  const supabase = await createClient()

  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, code, group_name, flag_url')
    .order('group_name', { ascending: true })

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">Equipos</h1>
      <p className="text-white/40 text-sm -mt-2">
        Editá nombre, código, grupo y bandera de cada equipo.
      </p>
      <TeamsManager teams={teams ?? []} />
    </div>
  )
}
