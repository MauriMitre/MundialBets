import { createClient } from '@/lib/supabase/server'
import ResultForm from './ResultForm'
import { formatMatchDate } from '@/lib/utils'

export default async function AdminResultsPage() {
  const supabase = await createClient()

  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      homeTeam:home_team_id ( id, name, code ),
      awayTeam:away_team_id ( id, name, code )
    `)
    .in('status', ['upcoming', 'live', 'finished'])
    .order('match_date', { ascending: false })

  const { data: allPlayers } = await supabase
    .from('players')
    .select('id, name, team_id, shirt_number')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">Cargar resultados</h1>
      <p className="text-white/40 text-sm -mt-2">
        Al guardar el resultado se calculan los puntos automáticamente para todos los usuarios.
      </p>

      {matches?.map(match => (
        <div key={match.id} className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white font-semibold">
                {match.homeTeam.name} vs {match.awayTeam.name}
              </p>
              <p className="text-white/40 text-xs">{formatMatchDate(match.match_date)}</p>
            </div>
            {match.status === 'finished' && match.home_score !== null && (
              <div className="text-center">
                <span className="text-white font-bold text-xl">
                  {match.home_score} - {match.away_score}
                </span>
                {match.is_scored && <p className="text-green-400 text-xs">Puntos calculados ✓</p>}
              </div>
            )}
          </div>

          <ResultForm
            match={match}
            homePlayers={(allPlayers ?? []).filter(p => p.team_id === match.home_team_id)}
            awayPlayers={(allPlayers ?? []).filter(p => p.team_id === match.away_team_id)}
          />
        </div>
      ))}

      {!matches?.length && (
        <p className="text-white/30 text-center py-8">No hay partidos</p>
      )}
    </div>
  )
}
