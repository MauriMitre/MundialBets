'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function LeaderboardToggle() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') ?? 'global'

  function setTab(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex p-1 bg-surface-container-low rounded-full">
      <button
        onClick={() => setTab('global')}
        className={[
          'px-8 py-2.5 rounded-full text-sm font-bold transition-all',
          tab === 'global'
            ? 'bg-surface-container-highest text-primary'
            : 'text-on-surface-variant hover:text-on-surface',
        ].join(' ')}
      >
        Global
      </button>
      <button
        onClick={() => setTab('activos')}
        className={[
          'px-8 py-2.5 rounded-full text-sm font-bold transition-all',
          tab === 'activos'
            ? 'bg-surface-container-highest text-primary'
            : 'text-on-surface-variant hover:text-on-surface',
        ].join(' ')}
      >
        Activos
      </button>
    </div>
  )
}
