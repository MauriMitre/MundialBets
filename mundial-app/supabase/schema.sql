-- ============================================================
-- MUNDIAL APP - Schema SQL para Supabase
-- Pegar en: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- EQUIPOS (países del mundial)
-- ============================================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code CHAR(3) NOT NULL UNIQUE,  -- ARG, BRA, FRA...
  group_name CHAR(1),             -- A, B, C... (NULL en fase eliminatoria)
  flag_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- JUGADORES
-- ============================================================
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  position TEXT CHECK (position IN ('GK', 'DEF', 'MID', 'FWD')),
  shirt_number INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PARTIDOS
-- ============================================================
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  home_team_id UUID NOT NULL REFERENCES teams(id),
  away_team_id UUID NOT NULL REFERENCES teams(id),
  match_date TIMESTAMPTZ NOT NULL,
  betting_closes_at TIMESTAMPTZ,  -- se calcula automáticamente: match_date - 30 min
  stage TEXT NOT NULL CHECK (stage IN ('group', 'round_of_16', 'quarter', 'semi', 'third_place', 'final')),
  group_name CHAR(1),  -- solo fase de grupos
  venue TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'finished')),
  -- Resultado final (admin lo carga)
  home_score INT,
  away_score INT,
  is_scored BOOLEAN DEFAULT false,  -- ya se calcularon puntos a todos
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EVENTOS DEL PARTIDO (admin carga después del partido)
-- ============================================================
CREATE TABLE match_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('goal', 'assist', 'yellow_card', 'red_card')),
  minute INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PERFILES DE USUARIO (extiende auth.users de Supabase)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(30) NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  total_points INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REGLAS DE PUNTOS
-- ============================================================
CREATE TABLE scoring_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_key TEXT NOT NULL UNIQUE,
  points INT NOT NULL,
  description TEXT NOT NULL
);

-- Insertar reglas por defecto
INSERT INTO scoring_rules (rule_key, points, description) VALUES
  ('correct_winner',     3,  'Acertar ganador del partido (o empate)'),
  ('correct_exact_score',5,  'Acertar resultado exacto'),
  ('correct_scorer',     2,  'Acertar un goleador del partido'),
  ('correct_assist',     1,  'Acertar un asistente del partido');

-- ============================================================
-- PREDICCIONES POR PARTIDO
-- ============================================================
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  -- Resultado predicho
  predicted_winner TEXT CHECK (predicted_winner IN ('home', 'away', 'draw')),
  predicted_home_score INT,
  predicted_away_score INT,
  -- Puntos ganados (se calcula cuando el admin cierra el partido)
  points_earned INT DEFAULT 0,
  is_scored BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

-- ============================================================
-- JUGADORES PREDICHOS (goleadores/asistentes que predice el user)
-- ============================================================
CREATE TABLE prediction_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('goal', 'assist')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES para performance
-- ============================================================
CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_predictions_match_id ON predictions(match_id);
CREATE INDEX idx_prediction_players_prediction_id ON prediction_players(prediction_id);
CREATE INDEX idx_match_events_match_id ON match_events(match_id);
CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_match_date ON matches(match_date);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_rules ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer equipos, jugadores, partidos, eventos y reglas
CREATE POLICY "public read teams"         ON teams         FOR SELECT USING (true);
CREATE POLICY "public read players"       ON players       FOR SELECT USING (true);
CREATE POLICY "public read matches"       ON matches       FOR SELECT USING (true);
CREATE POLICY "public read match_events"  ON match_events  FOR SELECT USING (true);
CREATE POLICY "public read scoring_rules" ON scoring_rules FOR SELECT USING (true);
CREATE POLICY "public read profiles"      ON profiles      FOR SELECT USING (true);

-- Solo admin puede escribir datos maestros
CREATE POLICY "admin write teams"        ON teams        FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "admin write players"      ON players      FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "admin write matches"      ON matches      FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "admin write match_events" ON match_events FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "admin write scoring_rules" ON scoring_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Usuarios solo ven y editan sus propias predicciones
CREATE POLICY "users read own predictions" ON predictions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users insert predictions" ON predictions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id
        AND m.betting_closes_at > NOW()
        AND m.status = 'upcoming'
    )
  );

CREATE POLICY "users update predictions" ON predictions
  FOR UPDATE USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id
        AND m.betting_closes_at > NOW()
        AND m.status = 'upcoming'
    )
  );

CREATE POLICY "users manage prediction_players" ON prediction_players
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM predictions p
      WHERE p.id = prediction_id AND p.user_id = auth.uid()
    )
  );

-- Perfil: cada usuario maneja el suyo
CREATE POLICY "users manage own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- ============================================================
-- TRIGGER: crear perfil automáticamente al registrarse
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- TRIGGER: calcular betting_closes_at al crear/actualizar partido
-- ============================================================
CREATE OR REPLACE FUNCTION set_betting_closes_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.betting_closes_at := NEW.match_date - INTERVAL '30 minutes';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_betting_closes_at
  BEFORE INSERT OR UPDATE OF match_date ON matches
  FOR EACH ROW EXECUTE FUNCTION set_betting_closes_at();

-- ============================================================
-- FUNCIÓN: calcular puntos de una predicción
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
  scorer_match INT;
  assist_match INT;
BEGIN
  SELECT * INTO pred FROM predictions WHERE id = prediction_id;
  SELECT * INTO match FROM matches WHERE id = pred.match_id;

  IF match.status != 'finished' OR match.home_score IS NULL THEN
    RETURN 0;
  END IF;

  -- Cargar reglas de puntos
  SELECT points INTO rule_winner FROM scoring_rules WHERE rule_key = 'correct_winner';
  SELECT points INTO rule_exact  FROM scoring_rules WHERE rule_key = 'correct_exact_score';
  SELECT points INTO rule_scorer FROM scoring_rules WHERE rule_key = 'correct_scorer';
  SELECT points INTO rule_assist FROM scoring_rules WHERE rule_key = 'correct_assist';

  -- Calcular ganador real
  IF match.home_score > match.away_score THEN actual_winner := 'home';
  ELSIF match.away_score > match.home_score THEN actual_winner := 'away';
  ELSE actual_winner := 'draw';
  END IF;

  -- Puntos por ganador
  IF pred.predicted_winner = actual_winner THEN
    pts := pts + rule_winner;
  END IF;

  -- Puntos por resultado exacto
  IF pred.predicted_home_score = match.home_score
     AND pred.predicted_away_score = match.away_score THEN
    pts := pts + rule_exact;
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

-- ============================================================
-- FUNCIÓN: cerrar partido y calcular puntos de todos los users
-- ============================================================
CREATE OR REPLACE FUNCTION close_match(match_id UUID)
RETURNS VOID AS $$
DECLARE
  pred predictions%ROWTYPE;
  pts INT;
BEGIN
  FOR pred IN SELECT * FROM predictions WHERE predictions.match_id = close_match.match_id AND is_scored = false
  LOOP
    pts := calculate_prediction_points(pred.id);

    UPDATE predictions
    SET points_earned = pts, is_scored = true
    WHERE id = pred.id;

    UPDATE profiles
    SET total_points = total_points + pts
    WHERE id = pred.user_id;
  END LOOP;

  UPDATE matches SET is_scored = true WHERE id = close_match.match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
