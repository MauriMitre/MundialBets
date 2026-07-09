// Cuadro de eliminatorias tipo "árbol" (estilo 365scores): las llaves con
// banderas en los bordes (16avos, 8 por lado) y las rondas internas
// (octavos, cuartos, semis) convergen hacia el centro (trofeo / campeón).
// Ya NO es proyección: muestra los partidos reales cargados en la BD, con
// marcadores y resaltando al equipo que avanzó. Las rondas todavía no
// jugadas se ven como cajas vacías.
import { flagUrl } from '@/lib/flags'
import type { BracketCell, BracketTeam, FullBracket } from '@/lib/knockout'
import styles from './bracket.module.css'

export default function KnockoutBracket({ bracket }: { bracket: FullBracket }) {
  const { left, right, final, champion } = bracket

  return (
    <div className="mt-10">
      <h2 className="font-headline font-black text-xl text-on-surface uppercase tracking-tight">
        El cuadro
      </h2>
      <p className="font-body text-sm text-on-surface-variant/60 mt-1 mb-4">
        Eliminatorias en vivo · los ganadores van avanzando hacia la final
      </p>

      <div className={styles.wrap}>
        <div className={styles.bracket}>
          {/* ── Mitad izquierda ── */}
          <div className={`${styles.side} ${styles.left}`}>
            <Round cells={left.r32} />
            <Round cells={left.r16} />
            <Round cells={left.qf} />
            <Round cells={left.sf} />
          </div>

          {/* ── Centro: final + campeón ── */}
          <div className={styles.center}>
            <span className={styles.champ}>{champion?.code ?? 'Campeón'}</span>
            <FinalBox cell={final} />
            <span className={styles.trophy}>🏆</span>
            <span className={styles.runnerUp}>Final</span>
          </div>

          {/* ── Mitad derecha ── */}
          <div className={`${styles.side} ${styles.right}`}>
            <Round cells={right.sf} />
            <Round cells={right.qf} />
            <Round cells={right.r16} />
            <Round cells={right.r32} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Round({ cells }: { cells: BracketCell[] }) {
  return (
    <div className={styles.round}>
      {cells.map((c, i) => <Cell key={i} cell={c} />)}
    </div>
  )
}

function Cell({ cell }: { cell: BracketCell }) {
  const empty = !cell.home.code && !cell.away.code
  if (empty) {
    return (
      <div className={styles.match}>
        <div className={styles.box} />
      </div>
    )
  }
  return (
    <div className={styles.match}>
      <div className={styles.flagMatch}>
        <Team team={cell.home} decided={cell.played} />
        <Team team={cell.away} decided={cell.played} />
      </div>
    </div>
  )
}

function FinalBox({ cell }: { cell: BracketCell }) {
  const empty = !cell.home.code && !cell.away.code
  if (empty) return <div className={styles.finalBox} />
  return (
    <div className={styles.finalMatch}>
      <Team team={cell.home} decided={cell.played} />
      <Team team={cell.away} decided={cell.played} />
    </div>
  )
}

function Team({ team, decided }: { team: BracketTeam; decided: boolean }) {
  const flag = team.code ? flagUrl(team.code, 40) : ''
  const lost = decided && !team.won
  const cls = `${styles.team} ${team.won ? styles.win : ''} ${lost ? styles.lose : ''}`
  return (
    <div className={cls} title={team.label ?? ''}>
      {flag ? (
        <img src={flag} alt={team.code ?? ''} className={styles.flag} />
      ) : (
        <span className={styles.flagBlank} />
      )}
      <span className={styles.code}>{team.code ?? '—'}</span>
      <span className={styles.lbl}>{team.label ?? ''}</span>
      {team.score != null && <span className={styles.score}>{team.score}</span>}
    </div>
  )
}
