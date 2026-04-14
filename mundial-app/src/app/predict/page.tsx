import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format, parseISO, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { STAGE_LABELS } from '@/types'
import { formatMatchDate, isBettingOpen } from '@/lib/utils'
import { flagUrl } from '@/lib/flags'

export const revalidate = 60

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawMatch = any

function groupMatchesByDate(matches: RawMatch[]): { label: string; date: Date; matches: RawMatch[] }[] {
  const groups: { label: string; date: Date; matches: Match[] }[] = []
  for (const match of matches) {
    const matchDate = parseISO(match.match_date)
    const existing = groups.find(g => isSameDay(g.date, matchDate))
    if (existing) {
      existing.matches.push(match)
    } else {
      groups.push({
        label: format(matchDate, "EEEE, d 'de' MMMM", { locale: es }),
        date: matchDate,
        matches: [match],
      })
    }
  }
  return groups
}

export default async function PredictPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      homeTeam:home_team_id ( id, name, code, flag_url ),
      awayTeam:away_team_id ( id, name, code, flag_url )
    `)
    .order('match_date', { ascending: true })

  const { data: userPredictions } = await supabase
    .from('predictions')
    .select('match_id')
    .eq('user_id', user!.id)

  const predictedMatchIds = new Set(userPredictions?.map(p => p.match_id) ?? [])

  const upcoming = matches?.filter(m => m.status === 'upcoming') ?? []
  const live     = matches?.filter(m => m.status === 'live')     ?? []
  const finished = matches?.filter(m => m.status === 'finished') ?? []

  const upcomingGroups = groupMatchesByDate(upcoming)
  const liveGroups     = groupMatchesByDate(live)

  const allGroups = groupMatchesByDate([...(matches ?? [])].sort((a, b) =>
    new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
  ))
  const dateToJornada = new Map<string, number>()
  allGroups.forEach((g, i) => {
    dateToJornada.set(format(g.date, 'yyyy-MM-dd'), i + 1)
  })

  return (
    <div className="space-y-12">

      {/* Header */}
      <div className="mb-12 relative">
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter text-on-surface mb-4 uppercase">
          Predecí &amp; <span className="text-primary">Conquistá</span>
        </h1>
        <p className="font-body text-on-surface-variant max-w-2xl text-lg">
          Hacé tus predicciones antes de cada partido. La precisión da puntos. Cada gol y asistencia cuenta para tu posición en el podio.
        </p>
      </div>

      {/* En vivo */}
      {live.length > 0 && (
        <section className="mb-16">
          {liveGroups.map(group => {
            const jornada = dateToJornada.get(format(group.date, 'yyyy-MM-dd'))
            return (
              <div key={group.date.toISOString()}>
                <div className="flex items-baseline gap-4 mb-8">
                  <h2 className="font-headline text-3xl font-bold text-error flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-error animate-pulse inline-block" />
                    {group.label.charAt(0).toUpperCase() + group.label.slice(1)}
                  </h2>
                  {jornada && (
                    <span className="font-label text-xs tracking-widest text-on-surface-variant/40 uppercase">
                      Jornada {String(jornada).padStart(2, '0')}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {group.matches.map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      predicted={predictedMatchIds.has(match.id)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </section>
      )}

      {/* Próximos agrupados por fecha */}
      {upcoming.length > 0 && (
        <section className="space-y-16">
          {upcomingGroups.map(group => {
            const jornada = dateToJornada.get(format(group.date, 'yyyy-MM-dd'))
            return (
              <div key={group.date.toISOString()} className="mb-16">
                <div className="flex items-baseline gap-4 mb-8">
                  <h2 className="font-headline text-3xl font-bold text-secondary-container capitalize">
                    {group.label}
                  </h2>
                  {jornada && (
                    <span className="font-label text-xs tracking-widest text-on-surface-variant/40 uppercase">
                      Jornada {String(jornada).padStart(2, '0')}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {group.matches.map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      predicted={predictedMatchIds.has(match.id)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </section>
      )}

      {/* Finalizados */}
      {finished.length > 0 && (
        <section className="mb-16">
          <div className="flex items-baseline gap-4 mb-8">
            <h2 className="font-headline text-2xl font-bold text-on-surface-variant/60 uppercase tracking-widest">
              Finalizados
            </h2>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {finished.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                predicted={predictedMatchIds.has(match.id)}
              />
            ))}
          </div>
        </section>
      )}

      {!matches?.length && (
        <div className="bg-surface-container-low rounded-2xl p-10 text-center text-on-surface-variant">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-body">Aún no hay partidos cargados</p>
        </div>
      )}
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MatchCard({ match, predicted }: { match: any; predicted: boolean }) {
  const open = isBettingOpen(match.betting_closes_at)
  const canPredict = match.status === 'upcoming' && open
  const isLive = match.status === 'live'
  const isFinished = match.status === 'finished'
  const isClosed = match.status === 'upcoming' && !open

  return (
    <div
      className={`group relative bg-surface-container-low rounded-2xl p-8 transition-all duration-300 hover:bg-surface-container overflow-hidden${isFinished ? ' opacity-60' : ''}`}
    >
      {/* Status badge top-right */}
      {isLive && (
        <div className="absolute top-0 right-0 px-6 py-2 bg-error/20 text-error font-label text-[10px] tracking-[0.2em] rounded-bl-xl uppercase font-bold flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
          En Vivo
        </div>
      )}
      {!isLive && predicted && !isFinished && (
        <div className="absolute top-0 right-0 px-6 py-2 bg-primary/20 text-primary font-label text-[10px] tracking-[0.2em] rounded-bl-xl uppercase font-bold flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Predicho
        </div>
      )}
      {!isLive && predicted && isFinished && (
        <div className="absolute top-0 right-0 px-6 py-2 bg-primary/20 text-primary font-label text-[10px] tracking-[0.2em] rounded-bl-xl uppercase font-bold flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Predicho
        </div>
      )}
      {!isLive && !predicted && !isFinished && canPredict && (
        <div className="absolute top-0 right-0 px-6 py-2 bg-surface-container-high text-on-surface-variant font-label text-[10px] tracking-[0.2em] rounded-bl-xl uppercase font-bold">
          Pendiente
        </div>
      )}
      {isClosed && !predicted && (
        <div className="absolute top-0 right-0 px-6 py-2 bg-error/20 text-error font-label text-[10px] tracking-[0.2em] rounded-bl-xl uppercase font-bold">
          Cerrado
        </div>
      )}
      {isFinished && !predicted && (
        <div className="absolute top-0 right-0 px-6 py-2 bg-surface-container-high text-on-surface-variant font-label text-[10px] tracking-[0.2em] rounded-bl-xl uppercase font-bold">
          Sin apuesta
        </div>
      )}

      {/* Stage label */}
      <p className="font-label text-[10px] tracking-[0.15em] text-on-surface-variant/40 uppercase mb-4">
        {STAGE_LABELS[match.stage]}
        {match.group_name ? ` · Grupo ${match.group_name}` : ''}
      </p>

      {/* Teams */}
      <div className="flex justify-between items-center px-4 mt-4">
        {/* Home Team */}
        <div className="flex flex-col items-center gap-4 w-28 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-container-highest overflow-hidden flex items-center justify-center shadow-2xl">
            {flagUrl(match.homeTeam.code)
              ? <img src={flagUrl(match.homeTeam.code, 80)} alt={match.homeTeam.code} className="w-full h-full object-cover" />
              : <span className="text-3xl">{match.homeTeam.code}</span>}
          </div>
          <span className="font-headline text-base font-bold tracking-tight uppercase text-on-surface">
            {match.homeTeam.name}
          </span>
        </div>

        {/* Score / VS */}
        <div className="flex flex-col items-center gap-2">
          {(isFinished || isLive) && match.home_score !== null ? (
            <span className={`font-headline text-3xl font-bold${isLive ? ' text-error' : ' text-on-surface'}`}>
              {match.home_score} - {match.away_score}
            </span>
          ) : (
            <span className="text-on-surface-variant/30 font-headline text-3xl font-black">VS</span>
          )}
          <p className="font-label text-xs text-on-surface-variant/50">
            {formatMatchDate(match.match_date)}
          </p>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center gap-4 w-28 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-container-highest overflow-hidden flex items-center justify-center shadow-2xl">
            {flagUrl(match.awayTeam.code)
              ? <img src={flagUrl(match.awayTeam.code, 80)} alt={match.awayTeam.code} className="w-full h-full object-cover" />
              : <span className="text-3xl">{match.awayTeam.code}</span>}
          </div>
          <span className="font-headline text-base font-bold tracking-tight uppercase text-on-surface">
            {match.awayTeam.name}
          </span>
        </div>
      </div>

      {/* Action row */}
      <div className="mt-6 flex justify-end">
        {canPredict && !predicted && (
          <Link
            href={`/predict/${match.id}`}
            className="gradient-cta text-on-primary px-4 py-2 rounded-full font-label text-xs uppercase tracking-wider font-bold"
          >
            Apostar →
          </Link>
        )}
        {canPredict && predicted && (
          <Link
            href={`/predict/${match.id}`}
            className="text-primary font-label text-xs uppercase tracking-wider font-bold hover:underline"
          >
            Editar predicción →
          </Link>
        )}
        {isLive && predicted && (
          <Link
            href={`/predict/${match.id}`}
            className="text-primary font-label text-xs uppercase tracking-wider font-bold hover:underline"
          >
            Ver predicción →
          </Link>
        )}
        {isClosed && !predicted && (
          <span className="font-label text-xs text-on-surface-variant/40 uppercase tracking-wider">
            Apuestas cerradas
          </span>
        )}
      </div>
    </div>
  )
}
