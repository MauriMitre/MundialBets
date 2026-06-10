# Roadmap — Mejoras y features pendientes

Ideas anotadas el 2026-06-09 (dos días antes del arranque del Mundial).
Ordenadas por impacto.

## 1. Ver las apuestas de los demás al cerrar las apuestas ⭐

Hoy cada usuario solo ve sus propias predicciones. Cuando cierran las
apuestas de un partido (30 min antes del inicio), la página del partido
debería mostrar la predicción de **todos**: tabla con cada jugador, su
marcador y sus goleadores/asistentes apostados.

- Sin riesgo de copia: solo se revela con apuestas cerradas
  (`betting_closes_at` ya existe en `matches`).
- **Esfuerzo:** bajo. **Impacto:** el más alto en lo social — es el
  momento "¿vos pusiste 3-0??" de toda liga de amigos.

## 2. Carga automática de resultados ⭐

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

## 3. Predicciones de torneo (¡vence el 11/06!)

Antes del primer partido, cada uno apuesta una única vez:

- **Campeón** (ej. +25 pts), **subcampeón** (+15), **goleador del
  torneo / Botín de Oro** (+20).
- Se cierra cuando arranca el Mundial; los puntos se acreditan al final.
- Mantiene el interés de todos hasta la final, incluso de los últimos
  de la tabla.
- **Esfuerzo:** medio (tabla nueva + form + scoring al final).
  **Urgencia:** solo tiene gracia si se lanza antes del primer partido.

## 4. Mejoras menores

- **Banner "te faltan N apuestas que cierran hoy"** en el dashboard —
  la gente se olvida de apostar y se enoja después. Esfuerzo muy bajo.
- **PWA**: `manifest.json` + íconos para instalarla como app en el
  celular (el 100% del uso es mobile). Esfuerzo muy bajo.
- **El que más sumó en la jornada**: destacado diario en el dashboard
  con el ganador de la fecha. Da tema de conversación. Esfuerzo bajo.
- **Bracket visual de eliminatorias** cuando termine la fase de grupos
  (~27/06): llaves de 16avos a la final con los cruces y resultados.
  Esfuerzo medio. Hay tiempo hasta fin de mes.

## Hecho

- ~~Responsive mobile + navegación inferior~~ (2026-06-09)
- ~~Cancha con 11 titular + banco para elegir goleadores/asistentes~~
  (2026-06-09)
- ~~Dorsales reales desde Wikipedia~~ (2026-06-09)
- ~~Resultado exacto obligatorio (form + constraints en BD)~~
  (2026-06-09)
