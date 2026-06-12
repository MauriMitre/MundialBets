# Roadmap — Mejoras y features pendientes

Ideas anotadas el 2026-06-09 (dos días antes del arranque del Mundial).
Ordenadas por impacto.

## 1. Carga automática de resultados — solo falta el cron ⭐

Fuente: API no oficial de ESPN (gratis, sin key — API-Football y
football-data.org resultaron pagos para el Mundial 2026). Hecho:
migración aplicada, 48 equipos y 72 partidos de grupos mapeados,
parser validado contra MEX-RSA (goles + asistencias OK). Pendiente:

1. Pegar el bloque pg_cron de `migration_auto_results.sql` con la
   URL real (mundial-bets.vercel.app) y el SYNC_SECRET.
2. Re-ejecutar `node scripts/map-api-ids.mjs --apply` al definirse
   los cruces de eliminatorias (~28/06) para mapear esos 32 partidos.

## 2. Mejoras menores

- **El que más sumó en la jornada**: destacado diario en el dashboard
  con el ganador de la fecha. Da tema de conversación. Esfuerzo bajo.
- **Bracket visual de eliminatorias** cuando termine la fase de grupos
  (~27/06): llaves de 16avos a la final con los cruces y resultados.
  Esfuerzo medio. Hay tiempo hasta fin de mes.

## Hecho

- ~~Fix: el form de resultados y el admin de jugadores cargaban los
  1243 players en un select (cap de 1000 de Supabase) — faltaban ~243
  jugadores al cargar goleadores. Paginado con fetchAllRows()~~
  (2026-06-11)

- ~~Planteles sincronizados con los oficiales (Wikipedia, 26 por
  selección): scripts/sync-squads.mjs con dry-run/--apply. Altas con
  posición+dorsal, bajas con is_active=false (conservan apuestas),
  renombres por alias conservan el id~~ (2026-06-11)

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
