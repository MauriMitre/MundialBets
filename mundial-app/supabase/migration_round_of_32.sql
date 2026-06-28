-- ============================================================
-- MIGRACIÓN: Agregar stage 'round_of_32' (Dieciseisavos de Final)
-- Ejecutar en: Supabase Dashboard > SQL Editor
--
-- El Mundial 2026 tiene 48 equipos => hay ronda de 32 (dieciseisavos)
-- antes de los octavos. El CHECK original de matches.stage no la
-- contemplaba. Esto recrea la constraint incluyendo 'round_of_32'.
-- Idempotente: DROP IF EXISTS + ADD.
-- ============================================================

ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_stage_check;

ALTER TABLE matches ADD CONSTRAINT matches_stage_check
  CHECK (stage IN ('group', 'round_of_32', 'round_of_16', 'quarter', 'semi', 'third_place', 'final'));
