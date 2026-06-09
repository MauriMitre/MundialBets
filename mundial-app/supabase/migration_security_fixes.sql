-- ============================================================
-- MIGRACIÓN: Fixes de seguridad y de cálculo de puntos
-- Ejecutar en: Supabase Dashboard > SQL Editor
--
-- Corrige:
--   1. Escalada de privilegios vía create_user_profile (cualquier
--      usuario podía hacerse admin llamando la RPC).
--   2. close_match ejecutable por cualquier usuario y sin recálculo
--      al corregir un resultado ya cargado.
--   3. RLS de predictions que rompía dashboard/leaderboard (nadie
--      veía las predicciones ajenas, ni siquiera cerrada la apuesta).
--   4. RLS de prediction_players que bloqueaba la LECTURA de los
--      goleadores/asistentes propios una vez cerradas las apuestas.
--   5. Falta de validación server-side del contenido de la apuesta
--      (cantidad de goleadores/asistentes, rango de scores,
--      coherencia ganador/marcador, jugador de otro partido).
-- ============================================================

-- ============================================================
-- 1. Eliminar la RPC de escalada de privilegios
--    (solo la usaba el script one-time de creación de usuarios;
--    si se vuelve a necesitar, recrearla con el REVOKE incluido
--    en create_users_fn.sql)
-- ============================================================
DROP FUNCTION IF EXISTS create_user_profile(UUID, TEXT, TEXT, BOOLEAN);

-- ============================================================
-- 2. close_match: solo admin + recálculo idempotente
--    Ahora SIEMPRE recalcula todas las predicciones del partido,
--    ajustando total_points por la diferencia (viejo → nuevo).
--    Esto permite corregir un resultado mal cargado: basta volver
--    a guardar el resultado y los puntos se recalculan.
-- ============================================================
CREATE OR REPLACE FUNCTION close_match(match_id UUID)
RETURNS VOID AS $$
DECLARE
  pred predictions%ROWTYPE;
  pts INT;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Solo un administrador puede cerrar o recalcular partidos';
  END IF;

  FOR pred IN
    SELECT * FROM predictions
    WHERE predictions.match_id = close_match.match_id
  LOOP
    pts := calculate_prediction_points(pred.id);

    -- Ajustar el total por la diferencia (idempotente: re-ejecutar
    -- con el mismo resultado no cambia nada)
    UPDATE profiles
    SET total_points = total_points - COALESCE(pred.points_earned, 0) + pts
    WHERE id = pred.user_id;

    UPDATE predictions
    SET points_earned = pts, is_scored = true
    WHERE id = pred.id;
  END LOOP;

  UPDATE matches SET is_scored = true WHERE id = close_match.match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 3. RLS de predictions: lectura propia siempre; las ajenas solo
--    una vez cerradas las apuestas del partido (no se pueden
--    copiar picks antes del cierre, pero dashboard/leaderboard
--    sí pueden contar y mostrar puntos de todos)
-- ============================================================
DROP POLICY IF EXISTS "users read own predictions" ON predictions;

CREATE POLICY "users read predictions" ON predictions
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id
        AND (m.betting_closes_at <= NOW() OR m.status <> 'upcoming')
    )
  );

-- ============================================================
-- 4. RLS de prediction_players: separar lectura de escritura.
--    La policy FOR ALL anterior aplicaba la condición de "apuestas
--    abiertas" también al SELECT, así que nadie veía sus propios
--    goleadores predichos después del cierre (historial y panel
--    de admin mostraban vacío).
-- ============================================================
DROP POLICY IF EXISTS "users manage prediction_players" ON prediction_players;

-- Lectura: espeja la policy de predictions (propias siempre,
-- ajenas con apuestas cerradas)
CREATE POLICY "read prediction_players" ON prediction_players
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM predictions p
      WHERE p.id = prediction_id
        AND (
          p.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM matches m
            WHERE m.id = p.match_id
              AND (m.betting_closes_at <= NOW() OR m.status <> 'upcoming')
          )
        )
    )
  );

-- Escritura: solo el dueño y solo con apuestas abiertas
CREATE POLICY "users insert prediction_players" ON prediction_players
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM predictions p
      JOIN matches m ON m.id = p.match_id
      WHERE p.id = prediction_id
        AND p.user_id = auth.uid()
        AND m.betting_closes_at > NOW()
        AND m.status = 'upcoming'
    )
  );

CREATE POLICY "users update prediction_players" ON prediction_players
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM predictions p
      JOIN matches m ON m.id = p.match_id
      WHERE p.id = prediction_id
        AND p.user_id = auth.uid()
        AND m.betting_closes_at > NOW()
        AND m.status = 'upcoming'
    )
  );

CREATE POLICY "users delete prediction_players" ON prediction_players
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM predictions p
      JOIN matches m ON m.id = p.match_id
      WHERE p.id = prediction_id
        AND p.user_id = auth.uid()
        AND m.betting_closes_at > NOW()
        AND m.status = 'upcoming'
    )
  );

-- ============================================================
-- 5. Validación server-side del contenido de la apuesta.
--    Hasta ahora los límites (máx. goleadores = goles predichos,
--    scores 0-20, coherencia ganador/marcador) vivían solo en el
--    cliente: cualquier usuario podía insertar toda la plantilla
--    como goleadores vía API y garantizarse puntos.
-- ============================================================

-- 5a. Rango de scores predichos
ALTER TABLE predictions
  ADD CONSTRAINT predictions_scores_range CHECK (
    (predicted_home_score IS NULL OR predicted_home_score BETWEEN 0 AND 20) AND
    (predicted_away_score IS NULL OR predicted_away_score BETWEEN 0 AND 20) AND
    (predicted_penalty_home_score IS NULL OR predicted_penalty_home_score BETWEEN 0 AND 20) AND
    (predicted_penalty_away_score IS NULL OR predicted_penalty_away_score BETWEEN 0 AND 20)
  );

-- 5b. Coherencia ganador/marcador y tope de goleadores al bajar el score
CREATE OR REPLACE FUNCTION validate_prediction()
RETURNS TRIGGER AS $$
DECLARE
  m matches%ROWTYPE;
  total_goals INT;
  goal_rows INT;
  assist_rows INT;
BEGIN
  SELECT * INTO m FROM matches WHERE id = NEW.match_id;

  -- Coherencia ganador vs marcador (si se cargó marcador)
  IF NEW.predicted_home_score IS NOT NULL AND NEW.predicted_away_score IS NOT NULL THEN
    IF NEW.predicted_home_score > NEW.predicted_away_score AND NEW.predicted_winner <> 'home' THEN
      RAISE EXCEPTION 'El ganador predicho no coincide con el marcador';
    ELSIF NEW.predicted_away_score > NEW.predicted_home_score AND NEW.predicted_winner <> 'away' THEN
      RAISE EXCEPTION 'El ganador predicho no coincide con el marcador';
    ELSIF NEW.predicted_home_score = NEW.predicted_away_score THEN
      -- Empate: en grupos debe ser 'draw'; en eliminatorias debe ser home/away (penales)
      IF m.stage = 'group' AND NEW.predicted_winner <> 'draw' THEN
        RAISE EXCEPTION 'Con marcador empatado en fase de grupos el ganador debe ser empate';
      ELSIF m.stage <> 'group' AND NEW.predicted_winner = 'draw' THEN
        RAISE EXCEPTION 'En fase eliminatoria no se puede predecir empate';
      END IF;
    END IF;
  END IF;

  -- Penales solo tienen sentido en eliminatorias
  IF m.stage = 'group'
     AND (NEW.predicted_penalty_home_score IS NOT NULL OR NEW.predicted_penalty_away_score IS NOT NULL) THEN
    RAISE EXCEPTION 'No se pueden predecir penales en fase de grupos';
  END IF;

  -- Si bajan el marcador después de cargar goleadores, no pueden quedar de más
  total_goals := COALESCE(NEW.predicted_home_score, 0) + COALESCE(NEW.predicted_away_score, 0);

  SELECT
    COUNT(*) FILTER (WHERE event_type = 'goal'),
    COUNT(*) FILTER (WHERE event_type = 'assist')
  INTO goal_rows, assist_rows
  FROM prediction_players
  WHERE prediction_id = NEW.id;

  IF goal_rows > total_goals OR assist_rows > total_goals THEN
    RAISE EXCEPTION 'Los goleadores/asistentes predichos exceden los goles del marcador';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Solo al cambiar la predicción en sí: las actualizaciones de
-- points_earned/is_scored que hace close_match no disparan el trigger
-- (si lo hicieran, datos viejos incoherentes harían fallar el recálculo)
DROP TRIGGER IF EXISTS trg_validate_prediction ON predictions;
CREATE TRIGGER trg_validate_prediction
  BEFORE INSERT OR UPDATE OF
    predicted_winner, predicted_home_score, predicted_away_score,
    predicted_penalty_home_score, predicted_penalty_away_score
  ON predictions
  FOR EACH ROW EXECUTE FUNCTION validate_prediction();

-- 5c. prediction_players: el jugador debe ser de uno de los dos equipos
--     y la cantidad no puede exceder los goles predichos
CREATE OR REPLACE FUNCTION validate_prediction_player()
RETURNS TRIGGER AS $$
DECLARE
  pred predictions%ROWTYPE;
  m matches%ROWTYPE;
  total_goals INT;
  goal_rows INT;
  assist_rows INT;
BEGIN
  SELECT * INTO pred FROM predictions WHERE id = NEW.prediction_id;
  SELECT * INTO m FROM matches WHERE id = pred.match_id;

  IF NOT EXISTS (
    SELECT 1 FROM players p
    WHERE p.id = NEW.player_id
      AND p.team_id IN (m.home_team_id, m.away_team_id)
  ) THEN
    RAISE EXCEPTION 'El jugador no pertenece a los equipos de este partido';
  END IF;

  total_goals := COALESCE(pred.predicted_home_score, 0) + COALESCE(pred.predicted_away_score, 0);

  SELECT
    COUNT(*) FILTER (WHERE event_type = 'goal'),
    COUNT(*) FILTER (WHERE event_type = 'assist')
  INTO goal_rows, assist_rows
  FROM prediction_players
  WHERE prediction_id = NEW.prediction_id;

  IF goal_rows > total_goals THEN
    RAISE EXCEPTION 'No se pueden predecir más goleadores que goles del marcador';
  END IF;
  IF assist_rows > total_goals THEN
    RAISE EXCEPTION 'No se pueden predecir más asistentes que goles del marcador';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_prediction_player ON prediction_players;
CREATE TRIGGER trg_validate_prediction_player
  AFTER INSERT OR UPDATE ON prediction_players
  FOR EACH ROW EXECUTE FUNCTION validate_prediction_player();

-- ============================================================
-- 6. handle_new_user sin tragar excepciones.
--    La variante con EXCEPTION WHEN OTHERS THEN RETURN NEW (de
--    create_users.sql) deja usuarios en auth.users SIN perfil si el
--    insert falla (p. ej. username duplicado): mejor que el signup
--    falle entero y no queden cuentas en estado inconsistente.
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
