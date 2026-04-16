'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const POSITIONS = [
  { value: 'GK',  label: 'GK — Arquero' },
  { value: 'DEF', label: 'DEF — Defensor' },
  { value: 'MID', label: 'MID — Mediocampista' },
  { value: 'FWD', label: 'FWD — Delantero' },
]

interface Team { id: string; name: string; code: string }
interface Player {
  id: string
  name: string
  team_id: string
  position: string | null
  shirt_number: number | null
  is_active: boolean
}

export default function PlayersManager({ teams, players }: { teams: Team[]; players: Player[] }) {
  const router = useRouter()
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id ?? '')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const teamPlayers = players
    .filter(p => p.team_id === selectedTeamId)
    .sort((a, b) => (a.shirt_number ?? 99) - (b.shirt_number ?? 99))

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const form = new FormData(e.currentTarget)

    startTransition(async () => {
      const supabase = createClient()
      const { error: err } = await supabase.from('players').insert({
        name: form.get('name') as string,
        team_id: selectedTeamId,
        position: (form.get('position') as string) || null,
        shirt_number: (form.get('shirt_number') as string) ? parseInt(form.get('shirt_number') as string) : null,
        is_active: true,
      })

      if (err) { setError(err.message); return }
      ;(e.target as HTMLFormElement).reset()
      setShowAddForm(false)
      router.refresh()
    })
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault()
    setError('')
    const form = new FormData(e.currentTarget)

    startTransition(async () => {
      const supabase = createClient()
      const { error: err } = await supabase.from('players').update({
        name: form.get('name') as string,
        position: (form.get('position') as string) || null,
        shirt_number: (form.get('shirt_number') as string) ? parseInt(form.get('shirt_number') as string) : null,
        is_active: form.get('is_active') === 'true',
      }).eq('id', id)

      if (err) { setError(err.message); return }
      setEditingId(null)
      router.refresh()
    })
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar a ${name}? Si tiene predicciones asociadas, no se podrá eliminar.`)) return
    startTransition(async () => {
      const supabase = createClient()
      const { error: err } = await supabase.from('players').delete().eq('id', id)
      if (err) { setError(err.message); return }
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {/* Selector de equipo */}
      <div className="card p-4">
        <label className="block text-xs text-white/50 mb-2">Equipo</label>
        <select
          value={selectedTeamId}
          onChange={e => { setSelectedTeamId(e.target.value); setEditingId(null); setShowAddForm(false) }}
          className="input"
        >
          {teams.map(t => (
            <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
          ))}
        </select>
      </div>

      {/* Lista de jugadores */}
      <div className="space-y-2">
        {teamPlayers.map(player => (
          <div key={player.id} className="card p-4">
            {editingId === player.id ? (
              <form onSubmit={e => handleEdit(e, player.id)} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Nombre</label>
                    <input name="name" required defaultValue={player.name} className="input" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Dorsal</label>
                    <input
                      name="shirt_number" type="number" min={1} max={99}
                      defaultValue={player.shirt_number ?? ''}
                      className="input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Posición</label>
                    <select name="position" defaultValue={player.position ?? ''} className="input">
                      <option value="">— Sin especificar —</option>
                      {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Estado</label>
                    <select name="is_active" defaultValue={String(player.is_active)} className="input">
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>
                </div>
                {error && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
                )}
                <div className="flex gap-2">
                  <button type="submit" disabled={pending} className="btn-primary text-sm">
                    {pending ? 'Guardando...' : '💾 Guardar'}
                  </button>
                  <button type="button" onClick={() => { setEditingId(null); setError('') }} className="btn-secondary text-sm">
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-xs font-bold shrink-0">
                  {player.shirt_number ?? '—'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${player.is_active ? 'text-white' : 'text-white/30 line-through'}`}>
                    {player.name}
                  </p>
                  <p className="text-white/30 text-xs">{player.position ?? 'Sin posición'}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => setEditingId(player.id)}
                    className="btn-secondary text-xs py-1 px-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(player.id, player.name)}
                    className="text-red-400 hover:text-red-300 text-xs py-1 px-2 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {!teamPlayers.length && (
          <p className="text-white/30 text-sm text-center py-4">No hay jugadores para este equipo</p>
        )}
      </div>

      {/* Agregar jugador */}
      {showAddForm ? (
        <div className="card p-5">
          <h3 className="text-white font-semibold mb-4 text-sm">➕ Agregar jugador</h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/50 mb-1">Nombre</label>
                <input name="name" required className="input" placeholder="Ej: Lionel Messi" />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">Dorsal</label>
                <input name="shirt_number" type="number" min={1} max={99} className="input" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Posición</label>
              <select name="position" className="input">
                <option value="">— Sin especificar —</option>
                {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}
            <div className="flex gap-2">
              <button type="submit" disabled={pending} className="btn-primary text-sm">
                {pending ? 'Guardando...' : '➕ Agregar'}
              </button>
              <button type="button" onClick={() => { setShowAddForm(false); setError('') }} className="btn-secondary text-sm">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-secondary w-full text-sm"
        >
          ➕ Agregar jugador
        </button>
      )}
    </div>
  )
}
