import Link from 'next/link'

export default function RulesPage() {
  return (
    <div className="max-w-6xl mx-auto">

      {/* Hero */}
      <section className="mb-16 relative">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
        <h1 className="font-headline text-6xl md:text-8xl font-bold tracking-tighter text-on-surface mb-4">
          EL <span className="text-primary text-glow">SISTEMA</span><br />
          DE PUNTOS
        </h1>
        <p className="font-body text-xl text-on-surface-variant max-w-2xl leading-relaxed">
          Domina la arena. Cada predicción te acerca al podio. Entender el peso de cada evento es el primer paso hacia el campeonato.
        </p>
      </section>

      {/* Scoring Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">

        {/* Resultado Exacto — spans 2 cols */}
        <div className="md:col-span-2 glass-card rounded-xl p-8 border-l-4 border-primary relative overflow-hidden group">
          <div className="flex justify-between items-start mb-12">
            <span className="text-4xl">🎯</span>
            <div className="bg-primary/20 text-primary font-headline text-4xl font-bold px-4 py-2 rounded-lg">+10 PTS</div>
          </div>
          <h3 className="font-headline text-3xl font-bold mb-4 text-on-surface">Resultado Exacto</h3>
          <p className="text-on-surface-variant font-body">Predecí el marcador exacto del partido tal como termina a los 90 minutos más tiempo adicional.</p>
        </div>

        {/* Ganador */}
        <div className="glass-card rounded-xl p-8 border-l-4 border-secondary-container relative overflow-hidden group">
          <div className="flex justify-between items-start mb-12">
            <span className="text-4xl">🏆</span>
            <div className="bg-secondary-container/20 text-secondary-container font-headline text-2xl font-bold px-3 py-1 rounded-lg">+5 PTS</div>
          </div>
          <h3 className="font-headline text-2xl font-bold mb-2 text-on-surface">Ganador</h3>
          <p className="text-on-surface-variant font-body text-sm">Predecí correctamente al equipo ganador o el empate.</p>
        </div>

        {/* Goleador */}
        <div className="glass-card rounded-xl p-8 border-l-4 border-primary-fixed relative overflow-hidden group">
          <div className="flex justify-between items-start mb-12">
            <span className="text-4xl">⚽</span>
            <div className="bg-primary/20 text-primary font-headline text-2xl font-bold px-3 py-1 rounded-lg">+3 PTS</div>
          </div>
          <h3 className="font-headline text-2xl font-bold mb-2 text-on-surface">Goleador</h3>
          <p className="text-on-surface-variant font-body text-sm">Identificá al jugador que anota durante tiempo reglamentario.</p>
        </div>

        {/* Asistencia — spans 2 cols */}
        <div className="md:col-span-2 glass-card rounded-xl p-8 border-l-4 border-outline relative overflow-hidden group">
          <div className="flex justify-between items-start mb-12">
            <span className="text-4xl">🤝</span>
            <div className="bg-outline/20 text-on-surface-variant font-headline text-2xl font-bold px-3 py-1 rounded-lg">+2 PTS</div>
          </div>
          <h3 className="font-headline text-2xl font-bold mb-2 text-on-surface">Asistencia</h3>
          <p className="text-on-surface-variant font-body text-sm">Identificá al jugador que da el pase final para el gol.</p>
        </div>

        {/* Pro Tip — spans 2 cols */}
        <div className="md:col-span-2 glass-card rounded-xl p-8 border border-primary/20 relative overflow-hidden" style={{ background: 'rgba(136,217,130,0.04)' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-primary/20 text-primary text-[10px] font-label font-bold uppercase tracking-widest px-2 py-1 rounded-full">Pro Tip</span>
          </div>
          <h3 className="font-headline text-xl font-bold mb-3 text-on-surface">Bono de Acumulación</h3>
          <p className="text-on-surface-variant font-body text-sm leading-relaxed">Combinar un Resultado Exacto con una predicción de Goleador te catapulta al tope del marcador en una jornada.</p>
          <Link href="/predict" className="inline-flex items-center gap-2 mt-6 text-primary font-label text-xs uppercase tracking-wider font-bold hover:underline">
            Ver Predicciones →
          </Link>
        </div>

      </section>

      {/* FAQ */}
      <section>
        <h2 className="font-headline text-3xl font-bold text-on-surface mb-8">Preguntas Frecuentes</h2>
        <div className="space-y-4">

          <div className="bg-surface-container-low rounded-xl p-6">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-3">¿Hasta cuándo puedo apostar?</h3>
            <p className="text-on-surface-variant font-body leading-relaxed">Las predicciones cierran exactamente 5 minutos antes del inicio de cada encuentro. Una vez iniciado el partido no se permiten modificaciones.</p>
          </div>

          <div className="bg-surface-container-low rounded-xl p-6">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-3">Desempates</h3>
            <p className="text-on-surface-variant font-body leading-relaxed">En caso de empate en puntos totales, el primer criterio es el número de Resultados Exactos acertados. El segundo criterio es la fecha de registro de la última predicción correcta.</p>
          </div>

          <div className="bg-surface-container-low rounded-xl p-6">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-3">¿Se incluyen tiempos extra?</h3>
            <p className="text-on-surface-variant font-body leading-relaxed">Los goles se calculan basándose en el resultado final de los 90 minutos reglamentarios más el tiempo de compensación. Los goles en prórroga o tandas de penales no cuentan.</p>
          </div>

        </div>
      </section>

    </div>
  )
}
