// Cuadro de 16avos de final tipo "árbol" (estilo 365scores): las 16 llaves
// con banderas en los bordes (8 por lado) y las rondas internas vacías
// convergen hacia el centro (trofeo / campeón). Refleja las posiciones
// actuales de los grupos; es provisional.
import { flagUrl } from '@/lib/flags'
import type { ResolvedMatch, ResolvedSlot } from '@/lib/knockout'
import styles from './bracket.module.css'

export default function KnockoutBracket({ matches }: { matches: ResolvedMatch[] }) {
  const left = matches.filter(m => m.side === 'left')
  const right = matches.filter(m => m.side === 'right')

  return (
    <div className="mt-10">
      <h2 className="font-headline font-black text-xl text-on-surface uppercase tracking-tight">
        Los 16avos hoy
      </h2>
      <p className="font-body text-sm text-on-surface-variant/60 mt-1 mb-4">
        Cómo quedarían los cruces según las posiciones actuales (provisional)
      </p>

      <div className={styles.wrap}>
        <div className={styles.bracket}>
          {/* ── Mitad izquierda ── */}
          <div className={`${styles.side} ${styles.left}`}>
            <div className={styles.round}>
              {left.map(m => <FlagMatch key={m.match} match={m} />)}
            </div>
            <EmptyRound count={4} />
            <EmptyRound count={2} />
            <EmptyRound count={1} />
          </div>

          {/* ── Centro ── */}
          <div className={styles.center}>
            <span className={styles.champ}>Campeón</span>
            <div className={styles.finalBox} />
            <span className={styles.trophy}>🏆</span>
            <span className={styles.runnerUp}>Subcampeón</span>
          </div>

          {/* ── Mitad derecha ── */}
          <div className={`${styles.side} ${styles.right}`}>
            <EmptyRound count={1} />
            <EmptyRound count={2} />
            <EmptyRound count={4} />
            <div className={styles.round}>
              {right.map(m => <FlagMatch key={m.match} match={m} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyRound({ count }: { count: number }) {
  return (
    <div className={styles.round}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={styles.match}>
          <div className={styles.box} />
        </div>
      ))}
    </div>
  )
}

function FlagMatch({ match }: { match: ResolvedMatch }) {
  return (
    <div className={styles.match}>
      <div className={styles.flagMatch}>
        <Team slot={match.home} />
        <Team slot={match.away} />
      </div>
    </div>
  )
}

function Team({ slot }: { slot: ResolvedSlot }) {
  const flag = slot.code ? flagUrl(slot.code, 40) : ''
  return (
    <div className={styles.team} title={slot.label}>
      {flag ? (
        <img src={flag} alt={slot.code ?? ''} className={styles.flag} />
      ) : (
        <span className={styles.flagBlank} />
      )}
      <span className={styles.code}>{slot.code ?? '—'}</span>
      <span className={styles.lbl}>{slot.label}</span>
    </div>
  )
}
