-- ============================================================
-- MIGRACIÓN: Apuestas de torneo (campeón, subcampeón, goleador)
-- Ejecutar en: Supabase Dashboard > SQL Editor
--
-- Cada usuario hace UNA apuesta de torneo antes del primer partido:
-- campeón (+25), subcampeón (+15) y goleador del torneo (+20).
-- El cierre lo impone la RLS: solo se inserta/edita mientras
-- NOW() < MIN(match_date). Al final del torneo el admin ejecuta
-- close_tournament(...) para acreditar los puntos.
-- ============================================================

CREATE TABLE tournament_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  champion_team_id UUID NOT NULL REFERENCES teams(id),
  runner_up_team_id UUID NOT NULL REFERENCES teams(id),
  top_scorer_player_id UUID NOT NULL REFERENCES players(id),
  points_earned INT DEFAULT 0,
  is_scored BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT tournament_distinct_teams CHECK (champion_team_id <> runner_up_team_id)
);

ALTER TABLE tournament_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own tournament prediction" ON tournament_predictions
  FOR SELECT USING (auth.uid() = user_id);

-- El torneo "arranca" con el primer partido del fixture
CREATE POLICY "users insert tournament prediction before start" ON tournament_predictions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND NOW() < (SELECT MIN(match_date) FROM matches)
  );

CREATE POLICY "users update tournament prediction before start" ON tournament_predictions
  FOR UPDATE USING (
    auth.uid() = user_id
    AND NOW() < (SELECT MIN(match_date) FROM matches)
  );

-- Reglas de puntos
INSERT INTO scoring_rules (rule_key, points, description) VALUES
  ('tournament_champion',   25, 'Acertar el campeón del Mundial'),
  ('tournament_runner_up',  15, 'Acertar el subcampeón del Mundial'),
  ('tournament_top_scorer', 20, 'Acertar el goleador del torneo (Botín de Oro)')
ON CONFLICT (rule_key) DO NOTHING;

-- ============================================================
-- FUNCIÓN: cerrar el torneo y acreditar puntos
-- Acepta varios goleadores por si el Botín de Oro se comparte.
-- Uso (SQL Editor):
--   SELECT close_tournament(
--     '<uuid campeón>', '<uuid subcampeón>', ARRAY['<uuid goleador>']::uuid[]
--   );
-- ============================================================
CREATE OR REPLACE FUNCTION close_tournament(
  actual_champion_id UUID,
  actual_runner_up_id UUID,
  actual_top_scorer_ids UUID[]
)
RETURNS VOID AS $$
DECLARE
  tp tournament_predictions%ROWTYPE;
  pts INT;
  rule_champion INT;
  rule_runner_up INT;
  rule_top_scorer INT;
BEGIN
  -- Solo admin (o ejecución directa en el SQL Editor, donde auth.uid() es NULL)
  IF auth.uid() IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'solo el admin puede cerrar el torneo';
  END IF;

  SELECT points INTO rule_champion   FROM scoring_rules WHERE rule_key = 'tournament_champion';
  SELECT points INTO rule_runner_up  FROM scoring_rules WHERE rule_key = 'tournament_runner_up';
  SELECT points INTO rule_top_scorer FROM scoring_rules WHERE rule_key = 'tournament_top_scorer';

  FOR tp IN SELECT * FROM tournament_predictions WHERE is_scored = false
  LOOP
    pts := 0;
    IF tp.champion_team_id = actual_champion_id THEN
      pts := pts + rule_champion;
    END IF;
    IF tp.runner_up_team_id = actual_runner_up_id THEN
      pts := pts + rule_runner_up;
    END IF;
    IF tp.top_scorer_player_id = ANY(actual_top_scorer_ids) THEN
      pts := pts + rule_top_scorer;
    END IF;

    UPDATE tournament_predictions
    SET points_earned = pts, is_scored = true, updated_at = NOW()
    WHERE id = tp.id;

    UPDATE profiles
    SET total_points = total_points + pts
    WHERE id = tp.user_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
