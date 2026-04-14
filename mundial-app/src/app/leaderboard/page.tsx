import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import LeaderboardToggle from './LeaderboardToggle'

export const revalidate = 60

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab: rawTab = 'global' } = await searchParams
  const tab = rawTab === 'activos' ? 'activos' : 'global'
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, display_name, total_points')
    .order('total_points', { ascending: false })

  const { data: allPreds } = await supabase
    .from('predictions')
    .select('user_id')

  const predCountMap: Record<string, number> = {}
  for (const pred of allPreds ?? []) {
    predCountMap[pred.user_id] = (predCountMap[pred.user_id] ?? 0) + 1
  }

  const allProfiles = profiles ?? []

  // "Activos" = solo quienes hicieron al menos 1 predicción
  const list = tab === 'activos'
    ? allProfiles.filter(p => (predCountMap[p.id] ?? 0) > 0)
    : allProfiles

  const top3 = list.slice(0, 3)
  const rest = list.slice(3)

  const currentUserId = user?.id
  const currentUserIndex = list.findIndex(p => p.id === currentUserId)
  const userRank = currentUserIndex + 1
  const totalUsers = list.length
  const topPercent =
    totalUsers > 0 && currentUserIndex >= 0
      ? Math.round((userRank / totalUsers) * 100)
      : null
  const currentUserPoints =
    currentUserIndex >= 0 ? list[currentUserIndex].total_points : null

  const getName = (p: { display_name: string | null; username: string }) =>
    p.display_name || p.username

  const getInitial = (p: { display_name: string | null; username: string }) =>
    (p.display_name || p.username).charAt(0).toUpperCase()

  return (
    <div className="max-w-7xl mx-auto">

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="relative">
          <span className="absolute -top-10 -left-4 text-8xl font-headline font-black text-white/[0.03] select-none pointer-events-none">
            STATS
          </span>
          <h1 className="text-5xl font-headline font-bold text-secondary leading-none">
            The Standings
          </h1>
          <p className="text-on-surface-variant font-label text-sm mt-4 tracking-widest uppercase">
            {tab === 'activos' ? 'Jugadores con predicciones' : 'Clasificación Global'}
          </p>
        </div>

        <Suspense fallback={<div className="h-10 w-48 rounded-full bg-surface-container-low animate-pulse" />}>
          <LeaderboardToggle />
        </Suspense>
      </header>

      {/* ── Podium Top 3 ────────────────────────────────────── */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

          {/* 2nd place */}
          {(() => {
            const p = top3[1]
            const predCount = predCountMap[p.id] ?? 0
            return (
              <div className="order-2 md:order-1 glass-card p-8 rounded-xl border-l-4 border-primary/40 relative overflow-hidden flex flex-col items-center text-center">
                <div className="absolute top-0 right-0 p-4 font-headline text-4xl font-black text-white/5">
                  02
                </div>
                <div className="w-20 h-20 rounded-full border-2 border-primary/20 bg-surface-container-high flex items-center justify-center mb-4">
                  <span className="text-2xl font-headline font-bold text-primary">
                    {getInitial(p)}
                  </span>
                </div>
                <h3 className="text-xl font-headline font-bold text-secondary">
                  {getName(p)}
                </h3>
                <p className="text-primary font-bold text-2xl mt-1">
                  {p.total_points}{' '}
                  <span className="text-on-surface-variant text-sm font-normal">pts</span>
                </p>
                <div className="flex gap-2 mt-4">
                  <span className="px-3 py-1 bg-surface-container rounded-full text-[10px] font-label uppercase tracking-tighter text-on-surface-variant">
                    {predCount} Pred.
                  </span>
                </div>
              </div>
            )
          })()}

          {/* 1st place */}
          {(() => {
            const p = top3[0]
            const predCount = predCountMap[p.id] ?? 0
            return (
              <div className="order-1 md:order-2 glass-card p-10 rounded-xl border-l-4 border-secondary-container relative overflow-hidden flex flex-col items-center text-center transform md:scale-110 z-10 shadow-2xl shadow-secondary-container/10">
                <div className="absolute top-0 right-0 p-6 font-headline text-6xl font-black text-secondary-container/10">
                  01
                </div>
                <div className="w-24 h-24 rounded-full border-4 border-secondary-container bg-surface-container-high flex items-center justify-center mb-4 p-1">
                  <span className="text-3xl font-headline font-bold text-secondary-container">
                    {getInitial(p)}
                  </span>
                </div>
                <h3 className="text-2xl font-headline font-bold text-secondary">
                  {getName(p)}
                </h3>
                <p className="text-secondary-container font-bold text-4xl mt-1">
                  {p.total_points}{' '}
                  <span className="text-on-surface-variant text-base font-normal">pts</span>
                </p>
                <div className="flex gap-2 mt-6">
                  <span className="px-4 py-1.5 bg-secondary-container/20 border border-secondary-container/30 rounded-full text-xs font-label uppercase tracking-tighter text-secondary-container">
                    Líder
                  </span>
                  {predCount > 0 && (
                    <span className="px-3 py-1 bg-surface-container rounded-full text-[10px] font-label uppercase tracking-tighter text-on-surface-variant">
                      {predCount} Pred.
                    </span>
                  )}
                </div>
              </div>
            )
          })()}

          {/* 3rd place */}
          {(() => {
            const p = top3[2]
            const predCount = predCountMap[p.id] ?? 0
            return (
              <div className="order-3 md:order-3 glass-card p-8 rounded-xl border-l-4 border-primary/20 relative overflow-hidden flex flex-col items-center text-center">
                <div className="absolute top-0 right-0 p-4 font-headline text-4xl font-black text-white/5">
                  03
                </div>
                <div className="w-20 h-20 rounded-full border-2 border-primary/10 bg-surface-container-high flex items-center justify-center mb-4">
                  <span className="text-2xl font-headline font-bold text-primary/80">
                    {getInitial(p)}
                  </span>
                </div>
                <h3 className="text-xl font-headline font-bold text-secondary">
                  {getName(p)}
                </h3>
                <p className="text-primary/80 font-bold text-2xl mt-1">
                  {p.total_points}{' '}
                  <span className="text-on-surface-variant text-sm font-normal">pts</span>
                </p>
                {predCount > 0 && (
                  <div className="flex gap-2 mt-4">
                    <span className="px-3 py-1 bg-surface-container rounded-full text-[10px] font-label uppercase tracking-tighter text-on-surface-variant">
                      {predCount} Pred.
                    </span>
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}

      {/* ── Rankings table (position 4+) ─────────────────────── */}
      {rest.length > 0 && (
        <div className="bg-surface-container-low rounded-xl overflow-hidden mb-12">
          <table className="w-full">
            <thead>
              <tr className="text-on-surface-variant text-[10px] uppercase tracking-[0.2em] font-label border-b border-outline-variant/10">
                <th className="py-4 px-6 text-left">Pos</th>
                <th className="py-4 px-6 text-left">Jugador</th>
                <th className="py-4 px-6 text-right">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((profile, idx) => {
                const rank = idx + 4
                const isMe = profile.id === currentUserId
                const paddedRank = String(rank).padStart(2, '0')

                return (
                  <tr
                    key={profile.id}
                    className={
                      isMe
                        ? 'bg-primary/5 border-l-4 border-primary'
                        : 'hover:bg-surface-container-highest transition-colors border-l-4 border-transparent'
                    }
                  >
                    <td className="py-4 px-6">
                      <span className="font-headline font-bold text-on-surface-variant/40 text-lg">
                        {paddedRank}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-on-surface-variant">
                            {getInitial(profile)}
                          </span>
                        </div>
                        <span className="font-body font-semibold text-on-surface">
                          {getName(profile)}
                          {isMe && (
                            <span className="text-primary/50 text-xs ml-1">(vos)</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="font-headline font-bold text-on-surface">
                        {profile.total_points}
                      </span>
                      <span className="text-on-surface-variant text-xs ml-1">pts</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {list.length === 0 && (
        <div className="glass-card rounded-xl p-12 text-center mb-12">
          <p className="font-headline text-lg text-on-surface-variant">
            Aún no hay puntos registrados
          </p>
        </div>
      )}

      {/* ── Tu Rendimiento ──────────────────────────────────── */}
      {currentUserIndex >= 0 && (
        <div className="glass-card rounded-xl p-8">
          <h3 className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-6">
            Tu Rendimiento
          </h3>
          <div className="flex gap-8">
            {topPercent !== null && (
              <div>
                <div className="font-headline text-4xl font-bold text-primary">
                  Top {topPercent}%
                </div>
                <div className="font-label text-xs text-on-surface-variant uppercase tracking-wider mt-1">
                  Clasificación Global
                </div>
              </div>
            )}
            <div>
              <div className="font-headline text-4xl font-bold text-on-surface">
                {currentUserPoints ?? 0}
              </div>
              <div className="font-label text-xs text-on-surface-variant uppercase tracking-wider mt-1">
                Puntos Totales
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
