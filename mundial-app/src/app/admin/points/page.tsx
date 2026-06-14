import { createClient } from '@/lib/supabase/server'
import PointsHistory, { type Prediction, type MatchEvent } from './PointsHistory'

export default async function AdminPointsPage() {
  const supabase = await createClient()

  const [
    { data: profiles },
    { data: predictions },
    { data: matchEvents },
    { data: rules },
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
        predicted_penalty_home_score, predicted_penalty_away_score,
        points_earned,
        match:matches(
          id, match_date, stage, group_name,
          home_score, away_score, knockout_winner,
          penalty_home_score, penalty_away_score,
          homeTeam:home_team_id(name, code),
          awayTeam:away_team_id(name, code)
        ),
        predPlayers:prediction_players(player_id, event_type, player:players(name))
      `)
      .eq('is_scored', true)
      .gt('points_earned', 0),

    supabase
      .from('match_events')
      .select('match_id, player_id, event_type, player:players(name)'),

    supabase
      .from('scoring_rules')
      .select('rule_key, points'),
  ])

  const ruleMap: Record<string, number> = {}
  for (const r of rules ?? []) ruleMap[r.rule_key] = r.points
  const scoring = {
    winner:  ruleMap.correct_winner ?? 3,
    exact:   ruleMap.correct_exact_score ?? 5,
    scorer:  ruleMap.correct_scorer ?? 2,
    assist:  ruleMap.correct_assist ?? 1,
    penalty: ruleMap.correct_penalty_score ?? 5,
  }

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
        predictions={(predictions ?? []) as unknown as Prediction[]}
        matchEvents={(matchEvents ?? []) as unknown as MatchEvent[]}
        scoring={scoring}
      />
    </div>
  )
}
