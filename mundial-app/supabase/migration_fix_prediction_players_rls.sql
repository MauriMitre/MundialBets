-- ============================================================
-- MIGRACIÓN: Cerrar hueco de seguridad en prediction_players
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- La política anterior solo verificaba que la predicción
-- perteneciera al usuario, sin chequear si las apuestas
-- estaban abiertas. Esto permitía modificar goleadores y
-- asistentes directamente vía API después del cierre.

DROP POLICY IF EXISTS "users manage prediction_players" ON prediction_players;

CREATE POLICY "users manage prediction_players" ON prediction_players
  FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM predictions p
      JOIN matches m ON m.id = p.match_id
      WHERE p.id = prediction_id
        AND p.user_id = auth.uid()
        AND m.betting_closes_at > NOW()
        AND m.status = 'upcoming'
    )
  );
