-- ============================================================
-- MIGRACIÓN: Soporte para fase eliminatoria con penales
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Columna para el ganador en fases eliminatorias (null en fase de grupos)
ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS knockout_winner TEXT
  CHECK (knockout_winner IN ('home', 'away'));

-- 2. Actualizar calculate_prediction_points para usar knockout_winner
--    cuando el marcador en tiempo reglamentario queda igualado
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
  scorer_match INT;
  assist_match INT;
BEGIN
  SELECT * INTO pred FROM predictions WHERE id = prediction_id;
  SELECT * INTO match FROM matches WHERE id = pred.match_id;

  IF match.status != 'finished' OR match.home_score IS NULL THEN
    RETURN 0;
  END IF;

  SELECT points INTO rule_winner FROM scoring_rules WHERE rule_key = 'correct_winner';
  SELECT points INTO rule_exact  FROM scoring_rules WHERE rule_key = 'correct_exact_score';
  SELECT points INTO rule_scorer FROM scoring_rules WHERE rule_key = 'correct_scorer';
  SELECT points INTO rule_assist FROM scoring_rules WHERE rule_key = 'correct_assist';

  -- Ganador real:
  --   Si el marcador es desigual, el ganador es obvio.
  --   Si empatan en tiempo reglamentario y hay knockout_winner (penales), usarlo.
  --   Si empatan en fase de grupos, es 'draw'.
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

  -- Puntos por resultado exacto (solo tiempo reglamentario, sin penales)
  IF pred.predicted_home_score = match.home_score
     AND pred.predicted_away_score = match.away_score THEN
    pts := pts + rule_exact;
  END IF;

  -- Puntos por goleadores predichos: por jugador, se acreditan como máximo
  -- tantos goles como realmente hizo (LEAST), nunca el producto predicho×real
  SELECT COALESCE(SUM(LEAST(pp.cnt, me.cnt)), 0) INTO scorer_match
  FROM (
    SELECT p.player_id, COUNT(*) AS cnt FROM prediction_players p
    WHERE p.prediction_id = pred.id AND p.event_type = 'goal'
    GROUP BY p.player_id
  ) pp
  JOIN (
    SELECT player_id, COUNT(*) AS cnt FROM match_events
    WHERE match_id = match.id AND event_type = 'goal'
    GROUP BY player_id
  ) me ON me.player_id = pp.player_id;

  pts := pts + (scorer_match * rule_scorer);

  -- Puntos por asistentes predichos: misma lógica (LEAST por jugador)
  SELECT COALESCE(SUM(LEAST(pp.cnt, me.cnt)), 0) INTO assist_match
  FROM (
    SELECT p.player_id, COUNT(*) AS cnt FROM prediction_players p
    WHERE p.prediction_id = pred.id AND p.event_type = 'assist'
    GROUP BY p.player_id
  ) pp
  JOIN (
    SELECT player_id, COUNT(*) AS cnt FROM match_events
    WHERE match_id = match.id AND event_type = 'assist'
    GROUP BY player_id
  ) me ON me.player_id = pp.player_id;

  pts := pts + (assist_match * rule_assist);

  RETURN pts;
END;
$$ LANGUAGE plpgsql;
