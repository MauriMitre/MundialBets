'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { argentinaInputToUTC } from '@/lib/utils'

const STAGES = [
  { value: 'group',       label: 'Fase de grupos' },
  { value: 'round_of_16', label: 'Octavos de final' },
  { value: 'quarter',     label: 'Cuartos de final' },
  { value: 'semi',        label: 'Semifinal' },
  { value: 'third_place', label: 'Tercer puesto' },
  { value: 'final',       label: 'Final' },
]

interface Team { id: string; name: string; code: string }

export default function MatchForm({ teams }: { teams: Team[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
      const { error } = await supabase.from('matches').insert({
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        match_date: argentinaInputToUTC(form.get('match_date') as string),
        stage: form.get('stage') as string,
        group_name: (form.get('group_name') as string) || null,
        venue: (form.get('venue') as string) || null,
        status: 'upcoming',
      })

      if (error) { setError(error.message); return }

      ;(e.target as HTMLFormElement).reset()
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-white/50 mb-1">Local</label>
          <select name="home_team_id" required className="input">
            <option value="">— Seleccionar —</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name} ({t.code})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Visitante</label>
          <select name="away_team_id" required className="input">
            <option value="">— Seleccionar —</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name} ({t.code})</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-white/50 mb-1">Fecha y hora</label>
          <input name="match_date" type="datetime-local" required className="input" />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Fase</label>
          <select name="stage" required className="input">
            {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-white/50 mb-1">Grupo (solo fase de grupos)</label>
          <input name="group_name" type="text" maxLength={1} placeholder="A, B, C..." className="input uppercase" />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Estadio (opcional)</label>
          <input name="venue" type="text" placeholder="Estadio Monumental" className="input" />
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
      )}

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? 'Guardando...' : '➕ Agregar partido'}
      </button>
    </form>
  )
}
