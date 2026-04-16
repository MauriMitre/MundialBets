'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { STAGE_LABELS } from '@/types'
import { formatMatchDate, argentinaInputToUTC, toDatetimeLocalArg } from '@/lib/utils'

const STAGES = [
  { value: 'group',       label: 'Fase de grupos' },
  { value: 'round_of_16', label: 'Octavos de final' },
  { value: 'quarter',     label: 'Cuartos de final' },
  { value: 'semi',        label: 'Semifinal' },
  { value: 'third_place', label: 'Tercer puesto' },
  { value: 'final',       label: 'Final' },
]

interface Team { id: string; name: string; code: string }
interface Match {
  id: string
  home_team_id: string
  away_team_id: string
  match_date: string
  stage: string
  group_name: string | null
  venue: string | null
  status: string
  is_scored: boolean
  homeTeam: Team
  awayTeam: Team
}

export default function MatchList({ matches, teams }: { matches: Match[]; teams: Team[] }) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')


  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este partido? Se eliminarán también sus predicciones.')) return
    startTransition(async () => {
      const supabase = createClient()
      await supabase.from('matches').delete().eq('id', id)
      router.refresh()
    })
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault()
    setError('')
    const form = new FormData(e.currentTarget)
    const homeTeamId = form.get('home_team_id') as string
    const awayTeamId = form.get('away_team_id') as string

    if (homeTeamId === awayTeamId) {
      setError('El local y visitante no pueden ser el mismo equipo')
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const { error: err } = await supabase.from('matches').update({
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        match_date: argentinaInputToUTC(form.get('match_date') as string),
        stage: form.get('stage') as string,
        group_name: (form.get('group_name') as string) || null,
        venue: (form.get('venue') as string) || null,
      }).eq('id', id)

      if (err) { setError(err.message); return }
      setEditingId(null)
      router.refresh()
    })
  }

  return (
    <div className="space-y-2">
      {matches.map(match => (
        <div key={match.id} className="card p-4">
          {editingId === match.id ? (
            <form onSubmit={e => handleEdit(e, match.id)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/50 mb-1">Local</label>
                  <select name="home_team_id" defaultValue={match.home_team_id} required className="input">
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name} ({t.code})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Visitante</label>
                  <select name="away_team_id" defaultValue={match.away_team_id} required className="input">
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name} ({t.code})</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/50 mb-1">Fecha y hora</label>
                  <input
                    name="match_date" type="datetime-local" required className="input"
                    defaultValue={toDatetimeLocalArg(match.match_date)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Fase</label>
                  <select name="stage" defaultValue={match.stage} required className="input">
                    {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/50 mb-1">Grupo</label>
                  <input
                    name="group_name" type="text" maxLength={1}
                    defaultValue={match.group_name ?? ''} className="input uppercase"
                    placeholder="A, B, C..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Estadio</label>
                  <input name="venue" type="text" defaultValue={match.venue ?? ''} className="input" />
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="flex gap-2">
                <button type="submit" disabled={pending} className="btn-primary text-sm">
                  {pending ? 'Guardando...' : '💾 Guardar cambios'}
                </button>
                <button type="button" onClick={() => { setEditingId(null); setError('') }} className="btn-secondary text-sm">
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">
                  {match.homeTeam.name} vs {match.awayTeam.name}
                </p>
                <p className="text-white/40 text-xs mt-0.5 truncate">
                  {formatMatchDate(match.match_date)} · {STAGE_LABELS[match.stage as keyof typeof STAGE_LABELS]}
                  {match.group_name && ` G${match.group_name}`}
                  {match.venue && ` · ${match.venue}`}
                </p>
              </div>
              <StatusPill status={match.status} />
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => setEditingId(match.id)}
                  className="btn-secondary text-xs py-1 px-2"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(match.id)}
                  className="text-red-400 hover:text-red-300 text-xs py-1 px-2 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      {!matches.length && (
        <p className="text-white/30 text-sm text-center py-6">No hay partidos aún</p>
      )}
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  if (status === 'upcoming') return <span className="badge badge-gray">Por jugar</span>
  if (status === 'live')     return <span className="badge badge-red">En vivo</span>
  return <span className="badge badge-green">Finalizado</span>
}
