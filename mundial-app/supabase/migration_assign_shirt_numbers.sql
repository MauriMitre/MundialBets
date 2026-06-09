-- ============================================================
-- MIGRACIÓN: Asignar dorsales convencionales a jugadores sin número
-- Ejecutar en: Supabase Dashboard > SQL Editor
--
-- El seed real 2026 cargó todos los dorsales en NULL (la fuente no
-- los publica). Esta migración asigna números CONVENCIONALES según
-- la posición (1/12/23 arqueros, 2-6 defensas, 9/11/7 delanteros...),
-- ordenando alfabéticamente dentro de cada línea. NO son los dorsales
-- oficiales: se pueden corregir uno a uno desde el panel de admin.
--
-- Solo toca jugadores con shirt_number NULL, así que no pisa números
-- cargados a mano. Los pools por posición no se solapan entre sí, lo
-- que garantiza unicidad dentro del equipo (índice
-- players_team_shirt_number_unique).
-- ============================================================

WITH ranked AS (
  SELECT id,
         position,
         ROW_NUMBER() OVER (PARTITION BY team_id, position ORDER BY name) AS rn,
         ROW_NUMBER() OVER (PARTITION BY team_id ORDER BY name) AS overall
  FROM players
  WHERE shirt_number IS NULL
)
UPDATE players p
SET shirt_number = COALESCE(
  CASE r.position
    WHEN 'GK'  THEN (ARRAY[1,12,23,30])[r.rn]
    WHEN 'DEF' THEN (ARRAY[2,3,4,5,6,13,14,15,16,17,24])[r.rn]
    WHEN 'MID' THEN (ARRAY[8,10,18,20,21,22,26,28,31,33,35,37])[r.rn]
    WHEN 'FWD' THEN (ARRAY[7,9,11,19,25,27,29,32,34])[r.rn]
  END,
  -- fallback: posición desconocida o línea más larga que el pool
  50 + r.overall
)
FROM ranked r
WHERE p.id = r.id;

-- Verificación 1: no deben quedar jugadores sin dorsal (0 filas)
SELECT count(*) AS sin_dorsal FROM players WHERE shirt_number IS NULL;

-- Verificación 2: sin duplicados por equipo (0 filas)
SELECT t.name AS equipo, p.shirt_number, COUNT(*) AS cantidad
FROM players p
JOIN teams t ON t.id = p.team_id
GROUP BY t.name, p.shirt_number
HAVING COUNT(*) > 1;
