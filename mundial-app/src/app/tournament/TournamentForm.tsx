'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { flagUrl } from '@/lib/flags'

interface Team {
  id: string
  name: string
  code: string
}

interface ScorerPlayer {
  id: string
  name: string
  shirt_number: number | null
  team_id: string
}

interface Existing {
  id: string
  champion_team_id: string
  runner_up_team_id: string
  top_scorer_player_id: string
  points_earned: number
  is_scored: boolean
  topScorer: ScorerPlayer | null
}

interface Props {
  teams: Team[]
  existing: Existing | null
  open: boolean
  userId: string
  points: { champion: number; runnerUp: number; topScorer: number }
}

export default function TournamentForm({ teams, existing, open, userId, points }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [championId, setChampionId] = useState(existing?.champion_team_id ?? '')
  const [runnerUpId, setRunnerUpId] = useState(existing?.runner_up_team_id ?? '')
  const [scorerTeamId, setScorerTeamId] = useState(existing?.topScorer?.team_id ?? '')
  const [scorerPlayerId, setScorerPlayerId] = useState(existing?.top_scorer_player_id ?? '')
  const [players, setPlayers] = useState<ScorerPlayer[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Cargar jugadores del equipo elegido para el Botín de Oro
  useEffect(() => {
    if (!scorerTeamId) { setPlayers([]); return }
    let cancelled = false
    const supabase = createClient()
    supabase
      .from('players')
      .select('id, name, shirt_number, team_id')
      .eq('team_id', scorerTeamId)
      .eq('is_active', true)
      .order('shirt_number', { ascending: true, nullsFirst: false })
      .then(({ data }) => {
        if (!cancelled) setPlayers((data as ScorerPlayer[]) ?? [])
      })
    return () => { cancelled = true }
  }, [scorerTeamId])

  const teamById = (id: string) => teams.find(t => t.id === id)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!championId) { setError('Elegí un campeón'); return }
    if (!runnerUpId) { setError('Elegí un subcampeón'); return }
    if (championId === runnerUpId) { setError('El campeón y el subcampeón no pueden ser el mismo equipo'); return }
    if (!scorerPlayerId) { setError('Elegí el goleador del torneo'); return }
    setError('')

    startTransition(async () => {
      const supabase = createClient()
      const { error: err } = await supabase
        .from('tournament_predictions')
        .upsert({
          ...(existing?.id ? { id: existing.id } : {}),
          user_id: userId,
          champion_team_id: championId,
          runner_up_team_id: runnerUpId,
          top_scorer_player_id: scorerPlayerId,
        }, { onConflict: 'user_id' })

      if (err) {
        setError('No se pudo guardar. ¿Ya arrancó el torneo? Intentá de nuevo.')
        return
      }
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 1500)
    })
  }

  if (success) {
    return (
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-8 text-center text-primary">
        <div className="text-5xl mb-3">🏆</div>
        <p className="font-headline font-bold text-lg">¡Apuesta de torneo guardada!</p>
        <p className="font-body text-sm mt-1 text-primary/70">Suerte en el Mundial...</p>
      </div>
    )
  }

  // Cerrado y sin apuesta: no hay nada que mostrar
  if (!open && !existing) {
    return (
      <div className="card p-10 text-center text-on-surface-variant">
        <p className="text-4xl mb-3">🔒</p>
        <p className="font-body">No llegaste a hacer tu apuesta de torneo</p>
      </div>
    )
  }

  // Cerrado con apuesta: vista de solo lectura
  if (!open && existing) {
    const champion = teamById(existing.champion_team_id)
    const runnerUp = teamById(existing.runner_up_team_id)
    return (
      <div className="space-y-4">
        <ReadonlyPick label={`Campeón · +${points.champion} pts`} emoji="🏆">
          <TeamBadge team={champion} />
        </ReadonlyPick>
        <ReadonlyPick label={`Subcampeón · +${points.runnerUp} pts`} emoji="🥈">
          <TeamBadge team={runnerUp} />
        </ReadonlyPick>
        <ReadonlyPick label={`Goleador del torneo · +${points.topScorer} pts`} emoji="⚽">
          <span className="font-headline font-bold text-on-surface">
            {existing.topScorer?.shirt_number ? `#${existing.topScorer.shirt_number} ` : ''}
            {existing.topScorer?.name}
            <span className="text-on-surface-variant font-body font-normal text-sm ml-2">
              ({teamById(existing.topScorer?.team_id ?? '')?.name})
            </span>
          </span>
        </ReadonlyPick>
        {existing.is_scored && (
          <div className="card-gold p-4 text-center">
            <span className="font-headline text-2xl font-bold text-secondary-container">
              +{existing.points_earned} pts
            </span>
            <p className="font-label text-[10px] uppercase tracking-widest text-white/40 mt-1">
              Resultado del torneo
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Campeón */}
      <div className="bg-surface-container-low rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-headline font-bold text-on-surface uppercase tracking-wide text-sm">
            🏆 Campeón
          </h3>
          <span className="font-label text-xs px-2 py-0.5 rounded-full bg-secondary-container/15 text-secondary-container">
            +{points.champion} pts
          </span>
        </div>
        <p className="font-body text-xs text-on-surface-variant/60 mb-3">
          ¿Quién levanta la copa el 19 de julio?
        </p>
        <select
          className="input"
          value={championId}
          onChange={e => setChampionId(e.target.value)}
        >
          <option value="">Elegí un equipo...</option>
          {teams.map(t => (
            <option key={t.id} value={t.id} disabled={t.id === runnerUpId}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Subcampeón */}
      <div className="bg-surface-container-low rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-headline font-bold text-on-surface uppercase tracking-wide text-sm">
            🥈 Subcampeón
          </h3>
          <span className="font-label text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary">
            +{points.runnerUp} pts
          </span>
        </div>
        <p className="font-body text-xs text-on-surface-variant/60 mb-3">
          El que pierde la final
        </p>
        <select
          className="input"
          value={runnerUpId}
          onChange={e => setRunnerUpId(e.target.value)}
        >
          <option value="">Elegí un equipo...</option>
          {teams.map(t => (
            <option key={t.id} value={t.id} disabled={t.id === championId}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Goleador del torneo */}
      <div className="bg-surface-container-low rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-headline font-bold text-on-surface uppercase tracking-wide text-sm">
            ⚽ Goleador del torneo
          </h3>
          <span className="font-label text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">
            +{points.topScorer} pts
          </span>
        </div>
        <p className="font-body text-xs text-on-surface-variant/60 mb-3">
          El Botín de Oro: el que más goles mete en todo el Mundial
        </p>
        <div className="space-y-2">
          <select
            className="input"
            value={scorerTeamId}
            onChange={e => { setScorerTeamId(e.target.value); setScorerPlayerId('') }}
          >
            <option value="">Primero elegí el equipo...</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          {scorerTeamId && (
            <select
              className="input"
              value={scorerPlayerId}
              onChange={e => setScorerPlayerId(e.target.value)}
            >
              <option value="">
                {players.length === 0 ? 'Cargando jugadores...' : 'Elegí el jugador...'}
              </option>
              {players.map(p => (
                <option key={p.id} value={p.id}>
                  {p.shirt_number ? `#${p.shirt_number} ` : ''}{p.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {error && (
        <p className="bg-error-container/20 text-error rounded-lg px-3 py-2 text-sm font-label">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="gradient-cta text-on-primary py-4 rounded-xl font-headline font-bold text-sm tracking-wider uppercase w-full disabled:opacity-60 transition-opacity"
      >
        {pending ? 'Guardando...' : existing ? 'Actualizar apuesta de torneo' : 'Confirmar apuesta de torneo'}
      </button>
    </form>
  )
}

function ReadonlyPick({ label, emoji, children }: { label: string; emoji: string; children: React.ReactNode }) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <span className="text-3xl">{emoji}</span>
      <div className="min-w-0">
        <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/50 mb-1">
          {label}
        </p>
        {children}
      </div>
    </div>
  )
}

function TeamBadge({ team }: { team?: Team }) {
  if (!team) return null
  return (
    <span className="flex items-center gap-2">
      <span className="w-6 h-6 rounded-full overflow-hidden bg-surface-container-high shrink-0">
        {flagUrl(team.code) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={flagUrl(team.code, 40)} alt={team.code} className="w-full h-full object-cover" />
        )}
      </span>
      <span className="font-headline font-bold text-on-surface">{team.name}</span>
    </span>
  )
}
