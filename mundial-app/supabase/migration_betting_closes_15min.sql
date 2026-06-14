-- ============================================================
-- MIGRACIÓN: Cierre de apuestas a 15 min (antes 30 min)
-- Ejecutar en: Supabase Dashboard > SQL Editor
--
-- 1) Redefine el trigger para que los partidos nuevos/editados
--    cierren 15 min antes del inicio.
-- 2) Recalcula betting_closes_at de los partidos YA cargados: el
--    trigger solo dispara en INSERT o UPDATE OF match_date, así que
--    sin este UPDATE las filas existentes seguirían cerrando a -30 min.
-- ============================================================

CREATE OR REPLACE FUNCTION set_betting_closes_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.betting_closes_at := NEW.match_date - INTERVAL '15 minutes';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recalcular partidos existentes
UPDATE matches
  SET betting_closes_at = match_date - INTERVAL '15 minutes';
