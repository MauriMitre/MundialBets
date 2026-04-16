-- ============================================================
-- MIGRACIÓN: Predicción y resultado de penales
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Resultado de penales en el partido (solo si hubo)
ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS penalty_home_score INT,
  ADD COLUMN IF NOT EXISTS penalty_away_score INT;

-- 2. Predicción de penales del usuario
ALTER TABLE predictions
  ADD COLUMN IF NOT EXISTS predicted_penalty_home_score INT,
  ADD COLUMN IF NOT EXISTS predicted_penalty_away_score INT;

-- 3. Nueva regla de puntos
INSERT INTO scoring_rules (rule_key, points, description)
VALUES ('correct_penalty_score', 5, 'Acertar el resultado exacto de la serie de penales')
ON CONFLICT (rule_key) DO NOTHING;

-- 4. Actualizar calculate_prediction_points con penales
CREATE OR REPLACE FUNCTION calculate_prediction_points(prediction_id UUID)
RETURNS INT AS $$
DECLARE
  pred predictions%ROWTYPE;
  match matches%ROWTYPE;
  pts INT := 0;
  actual_winner TEXT;
  rule_winner INT;
  rule_exact INT;
  rule_scorer INT;
  rule_assist INT;
  rule_penalty INT;
  scorer_match INT;
  assist_match INT;
BEGIN
  SELECT * INTO pred FROM predictions WHERE id = prediction_id;
  SELECT * INTO match FROM matches WHERE id = pred.match_id;

  IF match.status != 'finished' OR match.home_score IS NULL THEN
    RETURN 0;
  END IF;

  SELECT points INTO rule_winner  FROM scoring_rules WHERE rule_key = 'correct_winner';
  SELECT points INTO rule_exact   FROM scoring_rules WHERE rule_key = 'correct_exact_score';
  SELECT points INTO rule_scorer  FROM scoring_rules WHERE rule_key = 'correct_scorer';
  SELECT points INTO rule_assist  FROM scoring_rules WHERE rule_key = 'correct_assist';
  SELECT points INTO rule_penalty FROM scoring_rules WHERE rule_key = 'correct_penalty_score';

  -- Ganador real (penales si empate en 90')
  IF match.home_score > match.away_score THEN
    actual_winner := 'home';
  ELSIF match.away_score > match.home_score THEN
    actual_winner := 'away';
  ELSIF match.knockout_winner IS NOT NULL THEN
    actual_winner := match.knockout_winner;
  ELSE
    actual_winner := 'draw';
  END IF;

  -- Puntos por ganador
  IF pred.predicted_winner = actual_winner THEN
    pts := pts + rule_winner;
  END IF;

  -- Puntos por resultado exacto (tiempo reglamentario)
  IF pred.predicted_home_score = match.home_score
     AND pred.predicted_away_score = match.away_score THEN
    pts := pts + rule_exact;
  END IF;

  -- Puntos por resultado exacto de penales
  -- Solo aplica si el partido realmente fue a penales
  IF match.penalty_home_score IS NOT NULL AND match.penalty_away_score IS NOT NULL
     AND pred.predicted_penalty_home_score IS NOT NULL
     AND pred.predicted_penalty_away_score IS NOT NULL
     AND pred.predicted_penalty_home_score = match.penalty_home_score
     AND pred.predicted_penalty_away_score = match.penalty_away_score THEN
    pts := pts + rule_penalty;
  END IF;

  -- Puntos por goleadores predichos
  SELECT COUNT(*) INTO scorer_match
  FROM prediction_players pp
  JOIN match_events me ON me.player_id = pp.player_id
    AND me.match_id = match.id
    AND me.event_type = 'goal'
  WHERE pp.prediction_id = pred.id AND pp.event_type = 'goal';

  pts := pts + (scorer_match * rule_scorer);

  -- Puntos por asistentes predichos
  SELECT COUNT(*) INTO assist_match
  FROM prediction_players pp
  JOIN match_events me ON me.player_id = pp.player_id
    AND me.match_id = match.id
    AND me.event_type = 'assist'
  WHERE pp.prediction_id = pred.id AND pp.event_type = 'assist';

  pts := pts + (assist_match * rule_assist);

  RETURN pts;
END;
$$ LANGUAGE plpgsql;
