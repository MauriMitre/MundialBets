-- ============================================================
-- Fix: puntos por goleadores/asistentes predichos más de una vez.
--
-- El JOIN directo entre prediction_players y match_events multiplica
-- filas: predecir 2 goles de un jugador que metió 2 daba 4 aciertos
-- (8 pts) en vez de 2. Ahora se agrupa por jugador y se acredita
-- LEAST(predichos, reales): cada gol/asistencia real acertada vale
-- una sola vez.
--
-- Ejecutar en el SQL Editor de Supabase. Si hay partidos ya cerrados
-- con predicciones duplicadas, re-ejecutar close_match(match_id)
-- sobre esos partidos para recalcular (es idempotente).
-- ============================================================

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

  -- Puntos por goleadores predichos: por jugador, se acreditan
  -- como máximo tantos goles como realmente hizo
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

  -- Puntos por asistentes predichos: misma lógica
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
