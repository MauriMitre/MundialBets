'use client'

import { useEffect, useState } from 'react'

interface CountdownProps {
  targetDate: string
}

interface TimeLeft {
  hrs: string
  min: string
  seg: string
  expired: boolean
  invalid: boolean
}

function calculate(targetMs: number): TimeLeft {
  const diff = targetMs - Date.now()

  if (diff <= 0) {
    return { hrs: '00', min: '00', seg: '00', expired: true, invalid: false }
  }

  const totalSecs = Math.floor(diff / 1000)
  const hrs = Math.floor(totalSecs / 3600)
  const min = Math.floor((totalSecs % 3600) / 60)
  const seg = totalSecs % 60

  return {
    hrs: String(hrs).padStart(2, '0'),
    min: String(min).padStart(2, '0'),
    seg: String(seg).padStart(2, '0'),
    expired: false,
    invalid: false,
  }
}

export default function Countdown({ targetDate }: CountdownProps) {
  // Inicializar con null para evitar hydration mismatch (SSR no sabe la hora del cliente)
  const [time, setTime] = useState<TimeLeft | null>(null)

  useEffect(() => {
    const targetMs = new Date(targetDate).getTime()

    if (isNaN(targetMs)) {
      setTime({ hrs: '00', min: '00', seg: '00', expired: false, invalid: true })
      return
    }

    // Primera actualización inmediata
    setTime(calculate(targetMs))

    const id = setInterval(() => {
      const next = calculate(targetMs)
      setTime(next)
      if (next.expired) clearInterval(id)
    }, 1000)

    return () => clearInterval(id)
  }, [targetDate])

  // Skeleton mientras hidrata
  if (!time) {
    return (
      <div className="flex justify-center gap-6">
        {(['Hrs', 'Min', 'Seg'] as const).map(label => (
          <div key={label} className="text-center">
            <div className="font-headline text-3xl font-bold text-on-surface-variant/20">--</div>
            <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">{label}</div>
          </div>
        ))}
      </div>
    )
  }

  if (time.invalid) {
    return (
      <p className="text-center text-on-surface-variant text-xs uppercase tracking-widest font-label">
        Fecha no disponible
      </p>
    )
  }

  if (time.expired) {
    return (
      <p className="text-center text-on-surface-variant text-xs uppercase tracking-widest font-label">
        Partido en curso o finalizado
      </p>
    )
  }

  return (
    <div className="flex justify-center gap-6">
      {([['Hrs', time.hrs], ['Min', time.min], ['Seg', time.seg]] as const).map(([label, val]) => (
        <div key={label} className="text-center">
          <div className="font-headline text-3xl font-bold">{val}</div>
          <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">{label}</div>
        </div>
      ))}
    </div>
  )
}
