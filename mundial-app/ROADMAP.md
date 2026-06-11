# Roadmap — Mejoras y features pendientes

Ideas anotadas el 2026-06-09 (dos días antes del arranque del Mundial).
Ordenadas por impacto.

## 1. Carga automática de resultados ⭐

Son 104 partidos y hoy el admin carga a mano resultado + goleadores +
asistencias de cada uno. Integrar una API de fútbol (football-data.org
o API-Football, ambas con plan gratuito) más un cron (Vercel cron o
Supabase pg_cron):

- Al terminar cada partido se cargan marcador y eventos automáticamente
  y se disparan los cálculos de puntos existentes.
- Dejar un paso de revisión manual opcional en el admin por si la API
  trae datos raros.
- **Esfuerzo:** medio. **Impacto:** la mayor mejora operativa — ahorra
  un mes de carga manual y los puntos salen la misma noche.

## 2. Mejoras menores

- **El que más sumó en la jornada**: destacado diario en el dashboard
  con el ganador de la fecha. Da tema de conversación. Esfuerzo bajo.
- **Bracket visual de eliminatorias** cuando termine la fase de grupos
  (~27/06): llaves de 16avos a la final con los cruces y resultados.
  Esfuerzo medio. Hay tiempo hasta fin de mes.

## Hecho

- ~~Ver las apuestas de los demás al cerrar las apuestas: sección
  "Las apuestas de todos" en la página del partido, con marcador,
  goleadores/asistentes, puntos y quiénes no apostaron. La RLS ya
  revelaba las filas tras el cierre (migration_security_fixes.sql);
  solo hizo falta UI. Test: scripts/test-reveal.mjs~~ (2026-06-11)

- ~~PWA: manifest + íconos + meta iOS para instalar como app~~
  (2026-06-09)

- ~~Banner "te faltan N apuestas para hoy" en el dashboard~~
  (2026-06-09)

- ~~Predicciones de torneo: campeón +25, subcampeón +15, Botín de Oro
  +20. Página /tournament, cierre por RLS al primer partido, función
  `close_tournament()` para acreditar puntos al final~~ (2026-06-09)

- ~~Responsive mobile + navegación inferior~~ (2026-06-09)
- ~~Cancha con 11 titular + banco para elegir goleadores/asistentes~~
  (2026-06-09)
- ~~Dorsales reales desde Wikipedia~~ (2026-06-09)
- ~~Resultado exacto obligatorio (form + constraints en BD)~~
  (2026-06-09)
