-- ============================================================
-- SEED: Equipos del Mundial 2026
-- Pegar DESPUÉS del schema.sql
-- ============================================================

INSERT INTO teams (name, code, group_name) VALUES
-- Grupo A
('Estados Unidos',  'USA', 'A'),
('México',          'MEX', 'A'),
('Canadá',          'CAN', 'A'),
-- Grupo B
('Argentina',       'ARG', 'B'),
('Chile',           'CHI', 'B'),
('Perú',            'PER', 'B'),
-- Grupo C
('Brasil',          'BRA', 'C'),
('Colombia',        'COL', 'C'),
('Ecuador',         'ECU', 'C'),
-- Grupo D
('Francia',         'FRA', 'D'),
('Bélgica',         'BEL', 'D'),
('Italia',          'ITA', 'D'),
-- ... agregar los demás equipos acá
-- Grupo E
('Alemania',        'GER', 'E'),
('España',          'ESP', 'E'),
('Portugal',        'POR', 'E'),
-- Grupo F
('Inglaterra',      'ENG', 'F'),
('Holanda',         'NED', 'F'),
('Croacia',         'CRO', 'F');

-- ============================================================
-- EJEMPLO: Agregar jugadores de Argentina
-- ============================================================
-- Primero obtener el ID del equipo:
-- SELECT id FROM teams WHERE code = 'ARG';
-- Luego insertar jugadores con ese UUID:

-- INSERT INTO players (name, team_id, position, shirt_number) VALUES
-- ('Lionel Messi',     '<uuid-arg>', 'FWD', 10),
-- ('Julián Álvarez',   '<uuid-arg>', 'FWD', 9),
-- ('Enzo Fernández',   '<uuid-arg>', 'MID', 8),
-- ('Rodrigo de Paul',  '<uuid-arg>', 'MID', 7),
-- ('Emiliano Martínez','<uuid-arg>', 'GK',  23);

-- O de forma más práctica usando subquery:
-- INSERT INTO players (name, team_id, position, shirt_number)
-- SELECT 'Lionel Messi', id, 'FWD', 10 FROM teams WHERE code = 'ARG';
