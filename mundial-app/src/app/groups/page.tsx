// Página /groups: tabla de posiciones de cada grupo del Mundial, con sus
// resultados ya jugados. Todo sale de nuestra DB (los marca el cron de
// sync-results). Se recalcula al vuelo con el helper compartido.
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { computeStandings } from '@/lib/standings'
import { flagUrl } from '@/lib/flags'

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function GroupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: matches, error } = await supabase
    .from('matches')
    .select(`
      id, group_name, home_team_id, away_team_id, home_score, away_score, status, match_date,
      homeTeam:home_team_id ( id, name, code ),
      awayTeam:away_team_id ( id, name, code )
    `)
    .eq('stage', 'group')
    .not('group_name', 'is', null)
    .order('match_date')
  if (error) throw new Error(`Error cargando los grupos: ${error.message}`)

  // Agrupar por group_name
  const byGroup = new Map<string, any[]>()
  for (const m of (matches ?? []) as any[]) {
    const arr = byGroup.get(m.group_name) ?? []
    arr.push(m)
    byGroup.set(m.group_name, arr)
  }
  const groups = [...byGroup.keys()].sort()

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-headline font-black text-2xl text-on-surface uppercase tracking-tight">
          Grupos
        </h1>
        <p className="font-body text-sm text-on-surface-variant/60 mt-1">
          Posiciones y resultados de la fase de grupos
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="card p-6 text-center text-white/40">Todavía no hay grupos cargados</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map(g => (
            <GroupCard key={g} groupName={g} matches={byGroup.get(g)!} />
          ))}
        </div>
      )}
    </div>
  )
}

function GroupCard({ groupName, matches }: { groupName: string; matches: any[] }) {
  const rows = computeStandings(matches)
  const played = matches.filter(
    m => m.status === 'finished' && m.home_score !== null && m.away_score !== null
  )

  return (
    <div className="bg-surface-container-low rounded-xl p-4 sm:p-5">
      <h2 className="font-headline font-bold text-on-surface uppercase tracking-wide text-sm mb-3">
        🏆 Grupo {groupName}
      </h2>

      {/* Tabla de posiciones */}
      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-[20rem] text-xs">
          <thead>
            <tr className="text-on-surface-variant/40 font-label uppercase tracking-wider text-[9px]">
              <th className="text-left font-medium py-1 pl-1 w-4">#</th>
              <th className="text-left font-medium py-1">Equipo</th>
              <th className="text-center font-medium py-1 w-7">PJ</th>
              <th className="text-center font-medium py-1 w-7">G</th>
              <th className="text-center font-medium py-1 w-7">E</th>
              <th className="text-center font-medium py-1 w-7">P</th>
              <th className="text-center font-medium py-1 w-9">DG</th>
              <th className="text-center font-medium py-1 pr-1 w-8">Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const dg = r.gf - r.gc
              return (
                <tr key={r.teamId} className="border-t border-white/5">
                  <td className={`py-1.5 pl-1 ${i < 2 ? 'text-primary font-bold' : 'text-on-surface-variant/40'}`}>
                    {i + 1}
                  </td>
                  <td className="py-1.5">
                    <span className="flex items-center gap-1.5 min-w-0">
                      {flagUrl(r.code) && (
                        <img src={flagUrl(r.code, 40)} alt={r.code} className="w-4 h-4 rounded-full object-cover shrink-0" />
                      )}
                      <span className="truncate text-on-surface-variant/80">{r.code}</span>
                    </span>
                  </td>
                  <td className="text-center text-on-surface-variant/60 py-1.5">{r.pj}</td>
                  <td className="text-center text-on-surface-variant/60 py-1.5">{r.g}</td>
                  <td className="text-center text-on-surface-variant/60 py-1.5">{r.e}</td>
                  <td className="text-center text-on-surface-variant/60 py-1.5">{r.p}</td>
                  <td className="text-center text-on-surface-variant/60 py-1.5">{dg > 0 ? `+${dg}` : dg}</td>
                  <td className="text-center font-bold text-on-surface py-1.5 pr-1">{r.pts}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Resultados jugados */}
      {played.length > 0 && (
        <div className="mt-4">
          <p className="font-label text-[9px] uppercase tracking-wider text-on-surface-variant/40 mb-2">
            Resultados
          </p>
          <div className="space-y-1">
            {played.map(m => (
              <div key={m.id} className="flex items-center justify-center gap-2 text-xs text-on-surface-variant/60">
                <span className="w-20 text-right truncate">{m.homeTeam?.code}</span>
                <span className="font-bold tabular-nums text-on-surface">{m.home_score} - {m.away_score}</span>
                <span className="w-20 text-left truncate">{m.awayTeam?.code}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
