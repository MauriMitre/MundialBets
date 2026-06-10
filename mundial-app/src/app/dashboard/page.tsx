import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { flagUrl } from '@/lib/flags'
import { argDateKey } from '@/lib/utils'
import Countdown from '@/components/ui/Countdown'
import PointsPanel, { type Prediction as ScoredPrediction, type ScoringValues } from './PointsPanel'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. User profile
  const { data: profileRaw, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, display_name, total_points')
    .eq('id', user.id)
    .maybeSingle()
  if (profileError) throw new Error(`Error cargando tu perfil: ${profileError.message}`)

  const profile = profileRaw
    ? {
        id: profileRaw.id as string,
        username: profileRaw.username as string,
        displayName: profileRaw.display_name as string | null,
        totalPoints: (profileRaw.total_points as number) ?? 0,
      }
    : null

  const userPoints = profile?.totalPoints ?? 0

  // 2. All profiles (leaderboard + panel de puntos)
  const { data: allProfilesRaw, error: allProfilesError } = await supabase
    .from('profiles')
    .select('id, username, display_name, total_points')
    .order('total_points', { ascending: false })
  if (allProfilesError) throw new Error(`Error cargando perfiles: ${allProfilesError.message}`)

  const allProfiles = (allProfilesRaw ?? []).map((p: Record<string, unknown>) => ({
    id: p.id as string,
    username: p.username as string,
    displayName: p.display_name as string | null,
    totalPoints: (p.total_points as number) ?? 0,
  }))

  const topProfiles = allProfiles.slice(0, 5)

  // 3. Prediction count + puntos por partido + reglas (paralelo)
  const allProfileIds = allProfiles.map(p => p.id)
  const [predCountsRes, scoredPredsRes, matchEventsRes, rulesRes] = await Promise.all([
    allProfileIds.length > 0
      ? supabase.from('predictions').select('user_id').in('user_id', allProfileIds)
      : Promise.resolve({ data: [], error: null }),
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
        predPlayers:prediction_players(player_id, event_type)
      `)
      .eq('is_scored', true)
      .gt('points_earned', 0),
    supabase
      .from('match_events')
      .select('match_id, player_id, event_type'),
    supabase
      .from('scoring_rules')
      .select('rule_key, points'),
  ])

  for (const res of [predCountsRes, scoredPredsRes, matchEventsRes, rulesRes]) {
    if (res.error) throw new Error(`Error cargando datos del dashboard: ${res.error.message}`)
  }
  const predCounts = predCountsRes.data
  const scoredPreds = scoredPredsRes.data
  const matchEvents = matchEventsRes.data

  const ruleMap: Record<string, number> = {}
  for (const r of rulesRes.data ?? []) ruleMap[r.rule_key] = r.points
  const scoring: ScoringValues = {
    winner:  ruleMap.correct_winner ?? 3,
    exact:   ruleMap.correct_exact_score ?? 5,
    scorer:  ruleMap.correct_scorer ?? 2,
    assist:  ruleMap.correct_assist ?? 1,
    penalty: ruleMap.correct_penalty_score ?? 5,
  }

  const predCountMap: Record<string, number> = {}
  for (const pred of predCounts ?? []) {
    const uid = pred.user_id as string
    predCountMap[uid] = (predCountMap[uid] ?? 0) + 1
  }

  // 4. User rank
  const { count: aboveCount } = await supabase
    .from('profiles')
    .select('id', { count: 'exact' })
    .gt('total_points', userPoints)

  const userRank = (aboveCount ?? 0) + 1

  // 5. Next upcoming match
  const { data: nextMatch } = await supabase
    .from('matches')
    .select('*, homeTeam:home_team_id(id,name,code), awayTeam:away_team_id(id,name,code)')
    .eq('status', 'upcoming')
    .order('match_date', { ascending: true })
    .limit(1)
    .maybeSingle()

  // 6. Banners: apuesta de torneo + apuestas pendientes de hoy
  const [firstMatchRes, tournamentPredRes, openMatchesRes, myPredsRes] = await Promise.all([
    supabase.from('matches').select('match_date').order('match_date', { ascending: true }).limit(1).maybeSingle(),
    supabase.from('tournament_predictions').select('id').eq('user_id', user.id).maybeSingle(),
    supabase.from('matches')
      .select('id, match_date')
      .eq('status', 'upcoming')
      .gt('betting_closes_at', new Date().toISOString()),
    supabase.from('predictions').select('match_id').eq('user_id', user.id),
  ])
  const tournamentDeadline = firstMatchRes.data?.match_date as string | undefined
  const tournamentOpen = !!tournamentDeadline && new Date(tournamentDeadline) > new Date()
  const hasTournamentPred = !!tournamentPredRes.data

  const myPredicted = new Set((myPredsRes.data ?? []).map(p => p.match_id as string))
  const todayKey = argDateKey(new Date().toISOString())
  const pendingToday = (openMatchesRes.data ?? []).filter(
    m => argDateKey(m.match_date) === todayKey && !myPredicted.has(m.id)
  ).length

  const greetingName = profile?.displayName ?? profile?.username ?? 'Campeón'

  const homeTeam = nextMatch?.homeTeam as { id: string; name: string; code: string } | null | undefined
  const awayTeam = nextMatch?.awayTeam as { id: string; name: string; code: string } | null | undefined

  return (
    <div className="max-w-7xl mx-auto">

      {/* Welcome Header */}
      <header className="mb-10">
        <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-on-surface">
          ¡Hola, {greetingName}!
        </h1>
        <p className="font-label text-primary uppercase tracking-[0.3em] text-sm mt-2">
          Bienvenido a la Arena Digital
        </p>
      </header>

      {/* Banner apuestas pendientes de hoy */}
      {pendingToday > 0 && (
        <Link
          href="/predict"
          className="rounded-xl border border-error/30 bg-error/10 p-4 sm:p-5 mb-6 flex items-center justify-between gap-4 hover:bg-error/15 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-3xl shrink-0">⏰</span>
            <div className="min-w-0">
              <p className="font-headline font-bold text-on-surface">
                {pendingToday === 1
                  ? 'Te falta 1 apuesta para hoy'
                  : `Te faltan ${pendingToday} apuestas para hoy`}
              </p>
              <p className="text-xs text-on-surface-variant truncate">
                Las apuestas cierran 30 minutos antes de cada partido
              </p>
            </div>
          </div>
          <span className="badge badge-red shrink-0">Apostar →</span>
        </Link>
      )}

      {/* Banner apuesta de torneo */}
      {(tournamentOpen || hasTournamentPred) && (
        <Link
          href="/tournament"
          className="card-gold p-4 sm:p-5 mb-6 flex items-center justify-between gap-4 hover:opacity-90 transition-opacity"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-3xl shrink-0">🏆</span>
            <div className="min-w-0">
              <p className="font-headline font-bold text-on-surface">Apuesta de Torneo</p>
              <p className="text-xs text-on-surface-variant truncate">
                {tournamentOpen
                  ? 'Campeón, subcampeón y Botín de Oro — cierra cuando arranca el Mundial'
                  : 'Mirá tu apuesta de campeón, subcampeón y goleador'}
              </p>
            </div>
          </div>
          <span className="badge badge-gold shrink-0">
            {tournamentOpen ? (hasTournamentPred ? 'Editar' : '¡Apostá ya!') : 'Ver'}
          </span>
        </Link>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Points Card */}
        <div className="md:col-span-5 bg-surface-container-low rounded-xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="absolute -top-10 -right-10 opacity-5 font-headline text-[180px] leading-none select-none pointer-events-none">
            {userPoints}
          </div>
          <div>
            <h3 className="font-label text-on-surface-variant uppercase tracking-widest text-xs mb-4">
              Puntos Totales
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-7xl sm:text-8xl font-black text-primary">
                {userPoints}
              </span>
              <span className="font-headline text-2xl text-on-surface-variant/50">PTS</span>
            </div>
          </div>
          <div className="mt-auto flex items-center gap-4">
            <div className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full font-headline font-bold text-lg">
              #{userRank} Rank
            </div>
            <p className="text-on-surface-variant text-sm font-label uppercase">
              Entre tus amigos
            </p>
          </div>
        </div>

        {/* Next Match Card */}
        <div className="md:col-span-7 bg-surface-container-high rounded-xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-center border border-outline-variant/5">
          <div className="absolute top-6 right-8">
            <div className="bg-error/20 text-error flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
              Próximo Partido
            </div>
          </div>

          {nextMatch && homeTeam && awayTeam ? (
            <>
              <div className="flex items-center justify-between gap-4 mt-8">
                <div className="flex flex-col items-center flex-1 text-center">
                  <div className="w-20 h-20 bg-surface-container-highest rounded-full overflow-hidden flex items-center justify-center mb-3">
                    {flagUrl(homeTeam.code)
                      ? <img src={flagUrl(homeTeam.code, 80)} alt={homeTeam.code} className="w-full h-full object-cover" />
                      : <span className="text-2xl font-bold">{homeTeam.code}</span>}
                  </div>
                  <span className="font-headline font-bold text-xl tracking-tight">
                    {homeTeam.name}
                  </span>
                </div>
                <div>
                  <span className="font-headline text-4xl text-on-surface-variant/20 font-black">VS</span>
                </div>
                <div className="flex flex-col items-center flex-1 text-center">
                  <div className="w-20 h-20 bg-surface-container-highest rounded-full overflow-hidden flex items-center justify-center mb-3">
                    {flagUrl(awayTeam.code)
                      ? <img src={flagUrl(awayTeam.code, 80)} alt={awayTeam.code} className="w-full h-full object-cover" />
                      : <span className="text-2xl font-bold">{awayTeam.code}</span>}
                  </div>
                  <span className="font-headline font-bold text-xl tracking-tight">
                    {awayTeam.name}
                  </span>
                </div>
              </div>
              <div className="mt-8">
                <Countdown targetDate={nextMatch.match_date} />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center min-h-[160px]">
              <p className="font-label text-on-surface-variant text-sm uppercase tracking-widest text-center">
                No hay partidos próximos
              </p>
            </div>
          )}
        </div>

        {/* Friends Leaderboard + Points Panel */}
        <div className="md:col-span-12 bg-surface-container-low rounded-xl p-4 sm:p-8">
          <div className="flex justify-between items-end mb-8 px-1 sm:px-4">
            <div>
              <h3 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
                Top 5 Amigos
              </h3>
              <p className="text-on-surface-variant text-xs uppercase tracking-widest font-label">
                Clasificación en tiempo real
              </p>
            </div>
            <Link
              href="/leaderboard"
              className="text-primary font-label text-xs uppercase tracking-widest hover:underline"
            >
              Ver todos
            </Link>
          </div>

          {topProfiles.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="text-on-surface-variant text-[10px] uppercase tracking-[0.2em] font-label">
                  <th className="pb-4 px-2 sm:px-4">Pos</th>
                  <th className="pb-4 px-2 sm:px-4">Usuario</th>
                  <th className="pb-4 px-2 sm:px-4 hidden sm:table-cell">Pronósticos</th>
                  <th className="pb-4 px-2 sm:px-4 text-right">Puntos</th>
                </tr>
              </thead>
              <tbody>
                {topProfiles.map((p, idx) => {
                  const isCurrentUser = p.id === user.id
                  const position = String(idx + 1).padStart(2, '0')
                  const predCount = predCountMap[p.id] ?? 0
                  const isTop3 = idx < 3
                  const displayName = p.displayName ?? p.username
                  const initial = displayName.charAt(0).toUpperCase()

                  return (
                    <tr
                      key={p.id}
                      className={[
                        'group transition-colors rounded-xl',
                        isCurrentUser
                          ? 'bg-primary/5 border-y border-primary/10'
                          : 'hover:bg-surface-container-highest',
                      ].join(' ')}
                    >
                      <td className="py-4 px-2 sm:px-4 relative">
                        {isTop3 && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-secondary-container rounded-r" />
                        )}
                        <span
                          className={[
                            'font-headline font-bold text-lg',
                            isTop3 ? 'text-secondary-container' : 'text-on-surface-variant/40',
                          ].join(' ')}
                        >
                          {position}
                        </span>
                      </td>
                      <td className="py-4 px-2 sm:px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">{initial}</span>
                          </div>
                          <span
                            className={[
                              'font-bold',
                              isCurrentUser ? 'text-primary' : 'text-on-surface',
                            ].join(' ')}
                          >
                            {displayName}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-2 sm:px-4 hidden sm:table-cell">
                        <span className="text-xs text-on-surface-variant">
                          {predCount} pronósticos
                        </span>
                      </td>
                      <td className="py-4 px-2 sm:px-4 text-right">
                        <span
                          className={[
                            'font-headline font-bold',
                            isCurrentUser ? 'text-primary' : 'text-primary',
                          ].join(' ')}
                        >
                          {p.totalPoints}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <p className="font-label text-sm text-center py-8 text-on-surface-variant">
              Aún no hay datos de clasificación
            </p>
          )}
        </div>

        {/* Points Panel */}
        <div className="md:col-span-12">
          <PointsPanel
            profiles={allProfiles}
            predictions={(scoredPreds ?? []) as unknown as ScoredPrediction[]}
            matchEvents={matchEvents ?? []}
            currentUserId={user.id}
            scoring={scoring}
          />
        </div>

      </div>
    </div>
  )
}
