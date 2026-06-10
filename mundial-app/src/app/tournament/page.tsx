import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Countdown from '@/components/ui/Countdown'
import TournamentForm from './TournamentForm'

export default async function TournamentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [teamsRes, predRes, firstMatchRes, rulesRes] = await Promise.all([
    supabase.from('teams').select('id, name, code').order('name'),
    supabase
      .from('tournament_predictions')
      .select(`
        id, champion_team_id, runner_up_team_id, top_scorer_player_id,
        points_earned, is_scored,
        topScorer:top_scorer_player_id ( id, name, shirt_number, team_id )
      `)
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase.from('matches').select('match_date').order('match_date', { ascending: true }).limit(1).maybeSingle(),
    supabase.from('scoring_rules').select('rule_key, points').in('rule_key', ['tournament_champion', 'tournament_runner_up', 'tournament_top_scorer']),
  ])

  if (teamsRes.error) throw new Error(`Error cargando equipos: ${teamsRes.error.message}`)
  if (predRes.error) throw new Error(`Error cargando tu apuesta: ${predRes.error.message}`)

  const ruleMap: Record<string, number> = {}
  for (const r of rulesRes.data ?? []) ruleMap[r.rule_key] = r.points
  const points = {
    champion: ruleMap.tournament_champion ?? 25,
    runnerUp: ruleMap.tournament_runner_up ?? 15,
    topScorer: ruleMap.tournament_top_scorer ?? 20,
  }

  const deadline = firstMatchRes.data?.match_date as string | undefined
  const open = !!deadline && new Date(deadline) > new Date()

  return (
    <div className="max-w-lg mx-auto">

      {/* Header */}
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold tracking-tighter text-on-surface">
          Apuesta de <span className="text-secondary-container">Torneo</span>
        </h1>
        <p className="font-label text-primary uppercase tracking-[0.3em] text-xs mt-2">
          Una sola vez, antes del primer partido
        </p>
      </header>

      {/* Countdown / estado */}
      {open && deadline && (
        <div className="card-gold p-5 mb-6 text-center">
          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-white/50 mb-3">
            Cierra cuando arranca el Mundial
          </p>
          <Countdown targetDate={deadline} />
        </div>
      )}
      {!open && (
        <div className="card p-4 mb-6 text-center">
          <span className="badge badge-red">⏰ El torneo ya arrancó — apuestas de torneo cerradas</span>
        </div>
      )}

      <TournamentForm
        teams={teamsRes.data ?? []}
        existing={predRes.data as never}
        open={open}
        userId={user.id}
        points={points}
      />
    </div>
  )
}
