-- ============================================================
-- MIGRACIÓN: bonus +3 por acertar el EMPATE a los 90' en eliminatorias
-- Ejecutar en: Supabase Dashboard > SQL Editor (o vía scripts)
--
-- Regla que faltaba: en fases eliminatorias no hay opción "empate" (se
-- elige quién pasa de ronda), así que acertar que el partido termina
-- igualado a los 90' nunca sumaba, salvo que se clavara el marcador
-- exacto. Este bonus, PURAMENTE ADITIVO (nadie pierde puntos), premia
-- con +3 haber leído el empate de los 90', aunque el cruce se defina
-- luego en alargue o penales. Se apila con "quién pasa" y con el exacto.
-- ============================================================

-- 1. Nueva regla de puntos
INSERT INTO scoring_rules (rule_key, points, description)
VALUES ('correct_knockout_draw', 3, 'Acertar el empate a los 90'' de una eliminatoria (aunque se defina en alargue/penales)')
ON CONFLICT (rule_key) DO NOTHING;

-- 2. calculate_prediction_points con el bonus de empate en eliminatorias
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
  rule_ko_draw INT;
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
  SELECT points INTO rule_ko_draw FROM scoring_rules WHERE rule_key = 'correct_knockout_draw';

  -- Ganador real / quién pasa de ronda (penales si empate en 90')
  IF match.home_score > match.away_score THEN
    actual_winner := 'home';
  ELSIF match.away_score > match.home_score THEN
    actual_winner := 'away';
  ELSIF match.knockout_winner IS NOT NULL THEN
    actual_winner := match.knockout_winner;
  ELSE
    actual_winner := 'draw';
  END IF;

  -- Puntos por ganador / quién pasa
  IF pred.predicted_winner = actual_winner THEN
    pts := pts + rule_winner;
  END IF;

  -- Bonus eliminatoria: acertar que a los 90' fue EMPATE (aunque después
  -- se defina en alargue/penales). Solo aplica fuera de fase de grupos y
  -- si el usuario cargó un marcador empatado. Se suma aparte de "quién pasa".
  IF match.stage != 'group'
     AND match.home_score = match.away_score
     AND pred.predicted_home_score IS NOT NULL
     AND pred.predicted_home_score = pred.predicted_away_score THEN
    pts := pts + COALESCE(rule_ko_draw, 0);
  END IF;

  -- Puntos por resultado exacto (tiempo reglamentario)
  IF pred.predicted_home_score = match.home_score
     AND pred.predicted_away_score = match.away_score THEN
    pts := pts + rule_exact;
  END IF;

  -- Puntos por resultado exacto de penales (solo si el partido fue a penales)
  IF match.penalty_home_score IS NOT NULL AND match.penalty_away_score IS NOT NULL
     AND pred.predicted_penalty_home_score IS NOT NULL
     AND pred.predicted_penalty_away_score IS NOT NULL
     AND pred.predicted_penalty_home_score = match.penalty_home_score
     AND pred.predicted_penalty_away_score = match.penalty_away_score THEN
    pts := pts + rule_penalty;
  END IF;

  -- Puntos por goleadores predichos: LEAST por jugador (máx tantos como reales)
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
