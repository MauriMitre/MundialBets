'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Team {
  id: string
  name: string
  code: string
  group_name: string | null
  flag_url: string | null
}

export default function TeamsManager({ teams }: { teams: Team[] }) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  async function handleEdit(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault()
    setError('')
    const form = new FormData(e.currentTarget)

    startTransition(async () => {
      const supabase = createClient()
      const { error: err } = await supabase.from('teams').update({
        name: form.get('name') as string,
        code: (form.get('code') as string).toUpperCase(),
        group_name: (form.get('group_name') as string) || null,
        flag_url: (form.get('flag_url') as string) || null,
      }).eq('id', id)

      if (err) { setError(err.message); return }
      setEditingId(null)
      router.refresh()
    })
  }

  const grouped = teams.reduce<Record<string, Team[]>>((acc, t) => {
    const key = t.group_name ?? '__sin_grupo__'
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {})

  const sortedGroups = Object.entries(grouped).sort(([a], [b]) => {
    if (a === '__sin_grupo__') return 1
    if (b === '__sin_grupo__') return -1
    return a.localeCompare(b)
  })

  return (
    <div className="space-y-6">
      {sortedGroups.map(([group, groupTeams]) => (
        <div key={group}>
          <h2 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
            {group === '__sin_grupo__' ? 'Sin grupo asignado' : `Grupo ${group}`}
          </h2>
          <div className="space-y-2">
            {groupTeams.map(team => (
              <div key={team.id} className="card p-4">
                {editingId === team.id ? (
                  <form onSubmit={e => handleEdit(e, team.id)} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-white/50 mb-1">Nombre</label>
                        <input name="name" required defaultValue={team.name} className="input" />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">Código (3 letras)</label>
                        <input name="code" required maxLength={3} defaultValue={team.code} className="input uppercase" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-white/50 mb-1">Grupo</label>
                        <input
                          name="group_name" maxLength={1}
                          defaultValue={team.group_name ?? ''}
                          className="input uppercase" placeholder="A, B, C..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">URL bandera</label>
                        <input
                          name="flag_url"
                          defaultValue={team.flag_url ?? ''}
                          className="input" placeholder="https://..."
                        />
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
                    {team.flag_url ? (
                      <img src={team.flag_url} alt={team.code} className="w-8 h-5 object-cover rounded" />
                    ) : (
                      <div className="w-8 h-5 bg-white/10 rounded flex items-center justify-center text-white/20 text-xs">
                        {team.code}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{team.name}</p>
                      <p className="text-white/40 text-xs">{team.code}</p>
                    </div>
                    <button
                      onClick={() => setEditingId(team.id)}
                      className="btn-secondary text-xs py-1 px-2"
                    >
                      Editar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
