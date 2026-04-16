import { createClient } from '@/lib/supabase/server'
import PointsHistory from './PointsHistory'

export default async function AdminPointsPage() {
  const supabase = await createClient()

  const [
    { data: profiles },
    { data: predictions },
    { data: matchEvents },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, username, display_name')
      .order('total_points', { ascending: false }),

    supabase
      .from('predictions')
      .select(`
        id, user_id, match_id,
        predicted_winner, predicted_home_score, predicted_away_score,
        points_earned,
        match:matches(
          id, match_date, stage, group_name,
          home_score, away_score,
          homeTeam:home_team_id(name, code),
          awayTeam:away_team_id(name, code)
        ),
        predPlayers:prediction_players(player_id, event_type)
      `)
      .eq('is_scored', true)
      .gt('points_earned', 0),

    supabase
      .from('match_events')
      .select('match_id, player_id, event_type'),
  ])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-on-surface">Historial de puntos</h1>
        <p className="text-secondary/40 text-sm mt-1">
          Cuándo y cómo sumó puntos cada jugador.
        </p>
      </div>
      <PointsHistory
        profiles={profiles ?? []}
        predictions={(predictions ?? []) as any}
        matchEvents={matchEvents ?? []}
      />
    </div>
  )
}
