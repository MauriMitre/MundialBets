-- ============================================================
-- MIGRACIÓN: Carga automática de resultados (API-Football)
-- Ejecutar en: Supabase Dashboard > SQL Editor
--
-- Orden de puesta en marcha:
--   1. Pegar esta migración (hasta la sección pg_cron exclusive).
--   2. Conseguir API key gratis en https://dashboard.api-football.com
--      y ponerla en .env (API_FOOTBALL_KEY=...) y en Vercel.
--   3. node scripts/map-api-ids.mjs --apply  (mapea equipos,
--      jugadores y partidos contra los IDs de la API; re-ejecutar
--      cuando se definan los cruces de eliminatorias).
--   4. Configurar SYNC_SECRET en Vercel y .env.
--   5. Pegar la sección pg_cron de abajo con URL y secret reales.
-- ============================================================

-- 1. IDs de API-Football para mapear sin adivinar nombres
ALTER TABLE teams   ADD COLUMN IF NOT EXISTS api_football_id INT UNIQUE;
ALTER TABLE players ADD COLUMN IF NOT EXISTS api_football_id INT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS api_fixture_id  INT UNIQUE;

-- 2. close_match ejecutable por el cron (service role: auth.uid() es
--    NULL, igual que en el SQL Editor). Misma lógica idempotente de
--    migration_security_fixes.sql, solo cambia el chequeo de permisos.
CREATE OR REPLACE FUNCTION close_match(match_id UUID)
RETURNS VOID AS $$
DECLARE
  pred predictions%ROWTYPE;
  pts INT;
BEGIN
  -- Admin logueado o ejecución sin sesión (SQL Editor / service role)
  IF auth.uid() IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Solo un administrador puede cerrar o recalcular partidos';
  END IF;

  FOR pred IN
    SELECT * FROM predictions
    WHERE predictions.match_id = close_match.match_id
  LOOP
    pts := calculate_prediction_points(pred.id);

    UPDATE profiles
    SET total_points = total_points - COALESCE(pred.points_earned, 0) + pts
    WHERE id = pred.user_id;

    UPDATE predictions
    SET points_earned = pts, is_scored = true
    WHERE id = pred.id;
  END LOOP;

  UPDATE matches SET is_scored = true WHERE id = close_match.match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 3. CRON: pegar recién cuando la app esté deployada con
--    API_FOOTBALL_KEY y SYNC_SECRET configurados en Vercel.
--    Reemplazar TU-APP y TU_SECRET. Corre cada 10 minutos; la ruta
--    sale sin llamar a la API si no hay partidos en juego.
-- ============================================================
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- CREATE EXTENSION IF NOT EXISTS pg_net;
--
-- SELECT cron.schedule(
--   'sync-results',
--   '*/10 * * * *',
--   $$ SELECT net.http_get('https://TU-APP.vercel.app/api/sync-results?secret=TU_SECRET') $$
-- );
--
-- Para verlo / borrarlo:
--   SELECT * FROM cron.job;
--   SELECT cron.unschedule('sync-results');
