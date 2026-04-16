import Link from 'next/link'

export default function RulesPage() {
  return (
    <div className="max-w-6xl mx-auto">

      {/* Hero */}
      <section className="mb-16 relative">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <h1 className="font-headline text-6xl md:text-8xl font-bold tracking-tighter text-on-surface mb-4">
          EL <span className="text-primary text-glow">SISTEMA</span><br />
          DE PUNTOS
        </h1>
        <p className="font-body text-xl text-on-surface-variant max-w-2xl leading-relaxed">
          Cada partido es una oportunidad. Cuanto más acertás, más sumás. Conocé exactamente cómo se calculan los puntos.
        </p>
      </section>

      {/* Scoring Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">

        {/* Ganador */}
        <div className="glass-card rounded-xl p-8 border-l-4 border-secondary-container relative overflow-hidden">
          <div className="flex justify-between items-start mb-8">
            <span className="text-4xl">🏆</span>
            <div className="bg-secondary-container/20 text-secondary-container font-headline text-3xl font-bold px-4 py-2 rounded-lg">
              +3 PTS
            </div>
          </div>
          <h3 className="font-headline text-2xl font-bold mb-3 text-on-surface">Ganador</h3>
          <p className="text-on-surface-variant font-body text-sm leading-relaxed">
            Predecí correctamente qué equipo gana, o si el partido termina en empate. El resultado más básico y siempre disponible.
          </p>
        </div>

        {/* Resultado Exacto */}
        <div className="glass-card rounded-xl p-8 border-l-4 border-primary relative overflow-hidden">
          <div className="flex justify-between items-start mb-8">
            <span className="text-4xl">🎯</span>
            <div className="bg-primary/20 text-primary font-headline text-3xl font-bold px-4 py-2 rounded-lg">
              +5 PTS
            </div>
          </div>
          <h3 className="font-headline text-2xl font-bold mb-3 text-on-surface">Resultado Exacto</h3>
          <p className="text-on-surface-variant font-body text-sm leading-relaxed">
            Acertás el marcador exacto, por ejemplo 2-1. Si lo lográs, <span className="text-primary font-semibold">también sumás los +3 del ganador</span>, haciendo un total de <span className="text-primary font-semibold">8 pts</span> solo por el resultado.
          </p>
        </div>

        {/* Goleador */}
        <div className="glass-card rounded-xl p-8 border-l-4 border-yellow-500/60 relative overflow-hidden">
          <div className="flex justify-between items-start mb-8">
            <span className="text-4xl">⚽</span>
            <div className="bg-yellow-500/10 text-yellow-400 font-headline text-3xl font-bold px-4 py-2 rounded-lg">
              +2 PTS
            </div>
          </div>
          <h3 className="font-headline text-2xl font-bold mb-3 text-on-surface">Goleador</h3>
          <p className="text-on-surface-variant font-body text-sm leading-relaxed">
            Por cada jugador que apostaste como goleador y efectivamente marcó un gol. Podés apostar varios — <span className="text-yellow-400 font-semibold">cada acierto suma 2 pts por separado</span>.
          </p>
        </div>

        {/* Asistente */}
        <div className="glass-card rounded-xl p-8 border-l-4 border-purple-400/60 relative overflow-hidden">
          <div className="flex justify-between items-start mb-8">
            <span className="text-4xl">🎯</span>
            <div className="bg-purple-400/10 text-purple-400 font-headline text-3xl font-bold px-4 py-2 rounded-lg">
              +1 PT
            </div>
          </div>
          <h3 className="font-headline text-2xl font-bold mb-3 text-on-surface">Asistente</h3>
          <p className="text-on-surface-variant font-body text-sm leading-relaxed">
            Por cada jugador que apostaste como asistente y efectivamente dio la asistencia. Al igual que los goleadores, <span className="text-purple-400 font-semibold">cada acierto suma por separado</span>.
          </p>
        </div>

        {/* Penales */}
        <div className="glass-card rounded-xl p-8 border-l-4 border-orange-400/60 relative overflow-hidden md:col-span-2">
          <div className="flex justify-between items-start mb-8">
            <span className="text-4xl">🥅</span>
            <div className="bg-orange-400/10 text-orange-400 font-headline text-3xl font-bold px-4 py-2 rounded-lg">
              +5 PTS
            </div>
          </div>
          <h3 className="font-headline text-2xl font-bold mb-3 text-on-surface">Penales Exactos</h3>
          <p className="text-on-surface-variant font-body text-sm leading-relaxed">
            Solo en <span className="text-orange-400 font-semibold">fases eliminatorias</span>. Si el partido va a penales, podés predecir el resultado exacto de la serie (por ejemplo 4-3). Si acertás, sumás <span className="text-orange-400 font-semibold">+5 pts</span> adicionales. Este bonus es independiente del resultado del partido.
          </p>
        </div>

      </section>

      {/* Ejemplo práctico */}
      <section className="mb-12">
        <div className="glass-card rounded-xl p-8 border border-primary/20" style={{ background: 'rgba(136,217,130,0.04)' }}>
          <div className="flex items-center gap-2 mb-6">
            <span className="bg-primary/20 text-primary text-[10px] font-label font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Ejemplo
            </span>
          </div>
          <h3 className="font-headline text-xl font-bold mb-6 text-on-surface">
            Argentina 2–1 Francia
          </h3>
          <div className="space-y-3">
            {[
              { check: true,  label: 'Apostaste que Argentina gana',               pts: '+3', color: 'text-green-400' },
              { check: true,  label: 'Apostaste resultado exacto 2–1',             pts: '+5', color: 'text-primary' },
              { check: true,  label: 'Apostaste a Messi como goleador (acertó)',   pts: '+2', color: 'text-yellow-400' },
              { check: false, label: 'Apostaste a Di María como goleador (no marcó)', pts: '+0', color: 'text-on-surface-variant/30' },
              { check: true,  label: 'Apostaste a De Paul como asistente (acertó)', pts: '+1', color: 'text-purple-400' },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-outline-variant/10 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`text-sm ${row.check ? 'text-green-400' : 'text-on-surface-variant/30'}`}>
                    {row.check ? '✓' : '✗'}
                  </span>
                  <span className={`font-body text-sm ${row.check ? 'text-on-surface' : 'text-on-surface-variant/40'}`}>
                    {row.label}
                  </span>
                </div>
                <span className={`font-headline font-bold ${row.color}`}>{row.pts}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-4">
              <span className="font-label text-sm uppercase tracking-widest text-on-surface-variant">Total del partido</span>
              <span className="font-headline text-3xl font-bold text-primary">+11 PTS</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="font-headline text-3xl font-bold text-on-surface mb-8">Preguntas Frecuentes</h2>
        <div className="space-y-4">

          <div className="bg-surface-container-low rounded-xl p-6">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-3">¿Hasta cuándo puedo apostar?</h3>
            <p className="text-on-surface-variant font-body leading-relaxed">
              Las predicciones cierran <span className="text-on-surface font-semibold">30 minutos antes</span> del inicio de cada partido. Una vez cerrado no se pueden modificar.
            </p>
          </div>

          <div className="bg-surface-container-low rounded-xl p-6">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-3">¿El resultado exacto incluye los puntos del ganador?</h3>
            <p className="text-on-surface-variant font-body leading-relaxed">
              Sí. Si acertás el resultado exacto también se te acreditan los puntos del ganador. Acertar 2-1 te da <span className="text-on-surface font-semibold">+5 (exacto) + +3 (ganador) = 8 pts</span>.
            </p>
          </div>

          <div className="bg-surface-container-low rounded-xl p-6">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-3">¿Cuántos goleadores y asistentes puedo apostar?</h3>
            <p className="text-on-surface-variant font-body leading-relaxed">
              Podés apostar tantos como el resultado que predijiste permite. Si apostás 2-1, podés apostar hasta 3 goleadores y 3 asistentes en total. Cada acierto suma por separado.
            </p>
          </div>

          <div className="bg-surface-container-low rounded-xl p-6">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-3">¿Cuándo se calculan los puntos?</h3>
            <p className="text-on-surface-variant font-body leading-relaxed">
              Los puntos se calculan cuando el admin carga el resultado final del partido. Hasta ese momento aparecen como "sin calcular".
            </p>
          </div>

          <div className="bg-surface-container-low rounded-xl p-6">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-3">¿Se cuentan los goles en tiempo extra o penales?</h3>
            <p className="text-on-surface-variant font-body leading-relaxed">
              No para goleadores y asistentes — solo se cuentan los goles y asistencias de los 90 minutos reglamentarios. Sin embargo, en fases eliminatorias podés predecir el resultado de la <span className="text-on-surface font-semibold">serie de penales por separado</span> para ganar +5 pts adicionales.
            </p>
          </div>

          <div className="bg-surface-container-low rounded-xl p-6">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-3">¿Cómo funcionan los puntos por penales?</h3>
            <p className="text-on-surface-variant font-body leading-relaxed">
              En fases eliminatorias aparece un campo extra para predecir el resultado de los penales (ej. 4-3). Si el partido efectivamente va a penales <span className="text-on-surface font-semibold">y acertás el marcador exacto de la serie</span>, sumás +5 pts. Si el partido no va a penales, este campo no se evalúa.
            </p>
          </div>

        </div>
      </section>

      <div className="mt-12 text-center">
        <Link
          href="/predict"
          className="inline-flex items-center gap-2 gradient-cta text-on-primary font-headline font-bold px-8 py-4 rounded-xl text-sm uppercase tracking-wider"
        >
          Ir a Predicciones →
        </Link>
      </div>

    </div>
  )
}
