-- ============================================================
-- MIGRACIÓN: Dorsales duplicados dentro del mismo equipo
-- Ejecutar en: Supabase Dashboard > SQL Editor
--
-- El seed traía varios jugadores con el mismo dorsal en un mismo
-- equipo (España con dos #24, dos #7, etc.). Como las plantillas son
-- tentativas, se conserva el dorsal en el jugador alfabéticamente
-- primero y el resto queda sin dorsal (la UI muestra solo el nombre).
-- ============================================================

-- 1. Anular dorsales duplicados (conserva el primero por orden alfabético)
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY team_id, shirt_number
           ORDER BY name
         ) AS rn
  FROM players
  WHERE shirt_number IS NOT NULL
)
UPDATE players p
SET shirt_number = NULL
FROM ranked r
WHERE p.id = r.id AND r.rn > 1;

-- 2. Impedir duplicados futuros (carga manual del admin incluida)
CREATE UNIQUE INDEX IF NOT EXISTS players_team_shirt_number_unique
  ON players (team_id, shirt_number)
  WHERE shirt_number IS NOT NULL;

-- 3. Verificación: debe devolver 0 filas
SELECT t.name AS equipo, p.shirt_number, COUNT(*) AS cantidad
FROM players p
JOIN teams t ON t.id = p.team_id
WHERE p.shirt_number IS NOT NULL
GROUP BY t.name, p.shirt_number
HAVING COUNT(*) > 1;
