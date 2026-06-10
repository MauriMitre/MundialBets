-- ============================================================
-- MIGRACIÓN: Resultado exacto obligatorio en las predicciones
-- Ejecutar en: Supabase Dashboard > SQL Editor
--
-- El form permitía guardar solo el ganador, sin marcador. Como el
-- insert sale directo del browser (supabase-js), la validación del
-- cliente no alcanza: estas CHECK constraints garantizan a nivel BD
-- que toda predicción tenga marcador completo y un ganador coherente.
-- En empate se acepta 'draw' (grupos) o 'home'/'away' (eliminatorias,
-- define quién pasa); la distinción por fase la valida el cliente.
-- ============================================================

ALTER TABLE predictions
  ADD CONSTRAINT predictions_score_required CHECK (
    predicted_home_score IS NOT NULL
    AND predicted_away_score IS NOT NULL
    AND predicted_home_score BETWEEN 0 AND 20
    AND predicted_away_score BETWEEN 0 AND 20
  );

ALTER TABLE predictions
  ADD CONSTRAINT predictions_winner_matches_score CHECK (
    predicted_winner IS NOT NULL
    AND (
      (predicted_home_score > predicted_away_score AND predicted_winner = 'home')
      OR (predicted_away_score > predicted_home_score AND predicted_winner = 'away')
      OR (predicted_home_score = predicted_away_score)
    )
  );
