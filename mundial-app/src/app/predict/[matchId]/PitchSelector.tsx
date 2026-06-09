'use client'

import { useState } from 'react'

interface PitchPlayer {
  id: string
  name: string
  position: string | null
  shirt_number: number | null
}

interface TeamInfo {
  name: string
  code: string
}

interface Props {
  homeTeam: TeamInfo
  awayTeam: TeamInfo
  homePlayers: PitchPlayer[]
  awayPlayers: PitchPlayer[]
  scorers: Record<string, number>
  assisters: string[]
  totalGoals: number
  totalScorerGoals: number
  totalAssists: number
  onIncrementScorer: (id: string) => void
  onDecrementScorer: (id: string) => void
  onToggleAssister: (id: string) => void
  readonly: boolean
}

type Mode = 'goal' | 'assist'

// Orden de líneas en la cancha, de arriba (ataque) a abajo (arco)
const LINES: { key: string; label: string }[] = [
  { key: 'FWD', label: 'Delanteros' },
  { key: 'MID', label: 'Mediocampo' },
  { key: 'DEF', label: 'Defensa' },
  { key: 'GK',  label: 'Arquero' },
]

export default function PitchSelector({
  homeTeam,
  awayTeam,
  homePlayers,
  awayPlayers,
  scorers,
  assisters,
  totalGoals,
  totalScorerGoals,
  totalAssists,
  onIncrementScorer,
  onDecrementScorer,
  onToggleAssister,
  readonly,
}: Props) {
  const [mode, setMode] = useState<Mode>('goal')

  const goalsMaxed = totalScorerGoals >= totalGoals
  const assistsMaxed = totalAssists >= totalGoals

  return (
    <div className="bg-surface-container-low rounded-xl p-4 sm:p-6">
      {/* Header + toggle */}
      <h3 className="font-headline font-bold text-on-surface uppercase tracking-wide text-sm mb-1">
        Goleadores y asistencias
      </h3>
      <p className="font-body text-xs text-on-surface-variant/60 mb-3">
        Opcional — goleador +2 pts · asistente +1 pt por cada acierto
      </p>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          type="button"
          onClick={() => setMode('goal')}
          className={`py-2 px-2 rounded-xl text-xs font-label font-semibold tracking-wide transition-all border ${
            mode === 'goal'
              ? 'bg-primary/15 border-primary text-primary'
              : 'bg-surface-container border-outline-variant/20 text-on-surface-variant'
          }`}
        >
          ⚽ Goles{' '}
          <span className={goalsMaxed && totalGoals > 0 ? 'text-error' : ''}>
            {totalScorerGoals}/{totalGoals}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMode('assist')}
          className={`py-2 px-2 rounded-xl text-xs font-label font-semibold tracking-wide transition-all border ${
            mode === 'assist'
              ? 'bg-primary/15 border-primary text-primary'
              : 'bg-surface-container border-outline-variant/20 text-on-surface-variant'
          }`}
        >
          🎯 Asistencias{' '}
          <span className={assistsMaxed && totalGoals > 0 ? 'text-error' : ''}>
            {totalAssists}/{totalGoals}
          </span>
        </button>
      </div>

      <p className="font-label text-[10px] text-on-surface-variant/40 mb-4 uppercase tracking-wide">
        {totalGoals === 0
          ? 'Ingresá un resultado para poder seleccionar jugadores'
          : mode === 'goal'
            ? `Tocá un jugador para sumarle un gol · máximo ${totalGoals} en total`
            : `Tocá un jugador para marcarlo como asistente · máximo ${totalGoals} en total`}
      </p>

      <div className="space-y-4">
        <Pitch
          team={homeTeam}
          players={homePlayers}
          mode={mode}
          scorers={scorers}
          assisters={assisters}
          canAddGoal={!readonly && !goalsMaxed}
          canAddAssist={!readonly && !assistsMaxed}
          readonly={readonly}
          onIncrementScorer={onIncrementScorer}
          onDecrementScorer={onDecrementScorer}
          onToggleAssister={onToggleAssister}
        />
        <Pitch
          team={awayTeam}
          players={awayPlayers}
          mode={mode}
          scorers={scorers}
          assisters={assisters}
          canAddGoal={!readonly && !goalsMaxed}
          canAddAssist={!readonly && !assistsMaxed}
          readonly={readonly}
          onIncrementScorer={onIncrementScorer}
          onDecrementScorer={onDecrementScorer}
          onToggleAssister={onToggleAssister}
        />
      </div>
    </div>
  )
}

function Pitch({
  team,
  players,
  mode,
  scorers,
  assisters,
  canAddGoal,
  canAddAssist,
  readonly,
  onIncrementScorer,
  onDecrementScorer,
  onToggleAssister,
}: {
  team: TeamInfo
  players: PitchPlayer[]
  mode: Mode
  scorers: Record<string, number>
  assisters: string[]
  canAddGoal: boolean
  canAddAssist: boolean
  readonly: boolean
  onIncrementScorer: (id: string) => void
  onDecrementScorer: (id: string) => void
  onToggleAssister: (id: string) => void
}) {
  if (players.length === 0) return null

  // Agrupar por línea; posiciones desconocidas van al mediocampo
  const byLine: Record<string, PitchPlayer[]> = { GK: [], DEF: [], MID: [], FWD: [] }
  for (const p of players) {
    const line = p.position && byLine[p.position] ? p.position : 'MID'
    byLine[line].push(p)
  }
  for (const line of Object.values(byLine)) {
    line.sort((a, b) => (a.shirt_number ?? 99) - (b.shirt_number ?? 99))
  }

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-white/10"
      style={{
        background:
          'repeating-linear-gradient(0deg, #0d2e16 0px, #0d2e16 44px, #11381c 44px, #11381c 88px)',
      }}
    >
      {/* Marcas de la cancha */}
      <div className="absolute inset-x-0 top-0 h-16 pointer-events-none">
        {/* semicírculo central (mitad de cancha arriba) */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-10 w-24 h-20 rounded-full border border-white/15" />
        <div className="absolute inset-x-0 top-0 border-t-2 border-white/15" />
      </div>
      {/* Área penal (abajo, lado del arquero) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-44 h-14 border border-b-0 border-white/15 rounded-t-sm pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-6 border border-b-0 border-white/15 pointer-events-none" />

      {/* Nombre del equipo */}
      <p className="relative font-headline font-bold text-xs uppercase tracking-widest text-white/60 text-center pt-3">
        {team.name}
      </p>

      {/* Líneas de jugadores */}
      <div className="relative px-2 pt-2 pb-5 space-y-3">
        {LINES.map(({ key }) => {
          const linePlayers = byLine[key]
          if (linePlayers.length === 0) return null
          return (
            <div key={key} className="flex flex-wrap justify-center gap-x-1.5 gap-y-2">
              {linePlayers.map(p => (
                <PlayerChip
                  key={p.id}
                  player={p}
                  goals={scorers[p.id] ?? 0}
                  assisted={assisters.includes(p.id)}
                  mode={mode}
                  canAddGoal={canAddGoal}
                  canAddAssist={canAddAssist}
                  readonly={readonly}
                  onIncrementScorer={onIncrementScorer}
                  onDecrementScorer={onDecrementScorer}
                  onToggleAssister={onToggleAssister}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PlayerChip({
  player,
  goals,
  assisted,
  mode,
  canAddGoal,
  canAddAssist,
  readonly,
  onIncrementScorer,
  onDecrementScorer,
  onToggleAssister,
}: {
  player: PitchPlayer
  goals: number
  assisted: boolean
  mode: Mode
  canAddGoal: boolean
  canAddAssist: boolean
  readonly: boolean
  onIncrementScorer: (id: string) => void
  onDecrementScorer: (id: string) => void
  onToggleAssister: (id: string) => void
}) {
  const selectedInMode = mode === 'goal' ? goals > 0 : assisted
  const canAdd = mode === 'goal' ? canAddGoal : canAddAssist
  // En modo asistencia el tap des-selecciona; en modo gol se resta con el botón −
  const tappable = !readonly && (canAdd || (mode === 'assist' && assisted))

  function handleTap() {
    if (!tappable) return
    if (mode === 'goal') onIncrementScorer(player.id)
    else onToggleAssister(player.id)
  }

  return (
    <div className="relative w-[52px]">
      <button
        type="button"
        disabled={!tappable}
        onClick={handleTap}
        className="flex flex-col items-center w-full group"
      >
        <span
          className={`w-9 h-9 rounded-full flex items-center justify-center font-headline font-bold text-xs border-2 transition-all ${
            selectedInMode
              ? 'bg-primary text-on-primary border-primary-fixed shadow-[0_0_12px_rgba(136,217,130,0.5)]'
              : goals > 0 || assisted
                ? 'bg-[#1c1c1c] text-primary border-primary/50'
                : `bg-[#1c1c1c] text-white/80 border-white/20${tappable ? ' group-hover:border-primary/60' : ''}`
          }${!tappable && !selectedInMode ? ' opacity-40' : ''}`}
        >
          {player.shirt_number ?? player.name.charAt(0)}
        </span>
        <span className="block w-full text-center text-[9px] leading-tight text-white/70 truncate mt-1 font-label">
          {player.name.split(' ').slice(-1)[0]}
        </span>
      </button>

      {/* Badges de estado (siempre visibles, en ambos modos) */}
      {goals > 0 && (
        <span className="absolute -top-1.5 -right-0.5 min-w-4 h-4 px-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-[9px] font-bold flex items-center justify-center pointer-events-none">
          ⚽{goals > 1 ? goals : ''}
        </span>
      )}
      {assisted && (
        <span className={`absolute -right-0.5 min-w-4 h-4 px-0.5 rounded-full bg-purple-400 text-black text-[9px] font-bold flex items-center justify-center pointer-events-none ${goals > 0 ? 'top-3' : '-top-1.5'}`}>
          🎯
        </span>
      )}

      {/* Botón restar gol (solo en modo gol) */}
      {!readonly && mode === 'goal' && goals > 0 && (
        <button
          type="button"
          onClick={() => onDecrementScorer(player.id)}
          aria-label={`Quitar gol a ${player.name}`}
          className="absolute -top-1.5 -left-0.5 w-4 h-4 rounded-full bg-error text-on-error text-[11px] font-bold flex items-center justify-center leading-none"
        >
          −
        </button>
      )}
    </div>
  )
}
