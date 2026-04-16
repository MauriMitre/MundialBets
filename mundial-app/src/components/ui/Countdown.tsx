'use client'

import { useEffect, useState } from 'react'

interface CountdownProps {
  targetDate: string
}

interface TimeLeft {
  days: string
  hrs: string
  min: string
  seg: string
  expired: boolean
  invalid: boolean
}

function calculate(targetMs: number): TimeLeft {
  const diff = targetMs - Date.now()

  if (diff <= 0) {
    return { days: '00', hrs: '00', min: '00', seg: '00', expired: true, invalid: false }
  }

  const totalSecs = Math.floor(diff / 1000)
  const days = Math.floor(totalSecs / 86400)
  const hrs  = Math.floor((totalSecs % 86400) / 3600)
  const min  = Math.floor((totalSecs % 3600) / 60)
  const seg  = totalSecs % 60

  return {
    days: String(days).padStart(2, '0'),
    hrs:  String(hrs).padStart(2, '0'),
    min:  String(min).padStart(2, '0'),
    seg:  String(seg).padStart(2, '0'),
    expired: false,
    invalid: false,
  }
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [time, setTime] = useState<TimeLeft | null>(null)

  useEffect(() => {
    const targetMs = new Date(targetDate).getTime()

    if (isNaN(targetMs)) {
      setTime({ days: '00', hrs: '00', min: '00', seg: '00', expired: false, invalid: true })
      return
    }

    setTime(calculate(targetMs))

    const id = setInterval(() => {
      const next = calculate(targetMs)
      setTime(next)
      if (next.expired) clearInterval(id)
    }, 1000)

    return () => clearInterval(id)
  }, [targetDate])

  if (!time) {
    return (
      <div className="flex justify-center gap-4">
        {(['Días', 'Hrs', 'Min', 'Seg'] as const).map(label => (
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
    <div className="flex justify-center gap-4">
      {([['Días', time.days], ['Hrs', time.hrs], ['Min', time.min], ['Seg', time.seg]] as const).map(([label, val]) => (
        <div key={label} className="text-center">
          <div className="font-headline text-3xl font-bold">{val}</div>
          <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">{label}</div>
        </div>
      ))}
    </div>
  )
}
