-- ============================================================
-- PARTIDOS - MUNDIAL 2026 (48 equipos, 12 grupos)
-- ⚠️  VERIFICAR fechas y grupos contra el programa oficial FIFA
-- Pegar en: Supabase Dashboard > SQL Editor > New Query > Run
-- ============================================================

-- Limpiar partidos anteriores (no toca predicciones reales)
DELETE FROM match_events;
DELETE FROM matches;

-- ============================================================
-- Actualizar grupos de los equipos existentes
-- ============================================================
UPDATE teams SET group_name = 'A' WHERE code = 'USA';
UPDATE teams SET group_name = 'B' WHERE code = 'MEX';
UPDATE teams SET group_name = 'C' WHERE code = 'CAN';
UPDATE teams SET group_name = 'D' WHERE code = 'ARG';
UPDATE teams SET group_name = 'D' WHERE code = 'CHI';
UPDATE teams SET group_name = 'L' WHERE code = 'PER';
UPDATE teams SET group_name = 'E' WHERE code = 'BRA';
UPDATE teams SET group_name = 'E' WHERE code = 'COL';
UPDATE teams SET group_name = 'B' WHERE code = 'ECU';
UPDATE teams SET group_name = 'F' WHERE code = 'FRA';
UPDATE teams SET group_name = 'F' WHERE code = 'BEL';
UPDATE teams SET group_name = 'J' WHERE code = 'ITA';
UPDATE teams SET group_name = 'H' WHERE code = 'GER';
UPDATE teams SET group_name = 'G' WHERE code = 'ESP';
UPDATE teams SET group_name = 'C' WHERE code = 'POR';
UPDATE teams SET group_name = 'I' WHERE code = 'ENG';
UPDATE teams SET group_name = 'I' WHERE code = 'NED';
UPDATE teams SET group_name = 'G' WHERE code = 'CRO';

-- ============================================================
-- Agregar los 30 equipos restantes
-- ============================================================
INSERT INTO teams (name, code, group_name) VALUES
  ('Uruguay',          'URU', 'C'),
  ('Venezuela',        'VEN', 'K'),
  ('Panamá',           'PAN', 'A'),
  ('Costa Rica',       'CRC', 'L'),
  ('Honduras',         'HON', 'L'),
  ('Marruecos',        'MAR', 'C'),
  ('Senegal',          'SEN', 'G'),
  ('Nigeria',          'NGA', 'H'),
  ('Camerún',          'CMR', 'E'),
  ('Costa de Marfil',  'CIV', 'J'),
  ('Egipto',           'EGY', 'I'),
  ('Sudáfrica',        'RSA', 'K'),
  ('Mali',             'MLI', 'L'),
  ('Argelia',          'ALG', 'D'),
  ('Japón',            'JPN', 'G'),
  ('Corea del Sur',    'KOR', 'I'),
  ('Australia',        'AUS', 'F'),
  ('Irán',             'IRN', 'H'),
  ('Arabia Saudita',   'SAU', 'E'),
  ('Qatar',            'QAT', 'J'),
  ('Jordania',         'JOR', 'F'),
  ('Irak',             'IRQ', 'B'),
  ('Nueva Zelanda',    'NZL', 'B'),
  ('Polonia',          'POL', 'D'),
  ('Serbia',           'SRB', 'H'),
  ('Turquía',          'TUR', 'J'),
  ('Albania',          'ALB', 'A'),
  ('Ucrania',          'UKR', 'A'),
  ('Suiza',            'SUI', 'K'),
  ('Dinamarca',        'DEN', 'K')
ON CONFLICT (code) DO UPDATE SET group_name = EXCLUDED.group_name;

-- ============================================================
-- FASE DE GRUPOS — 72 partidos
-- Formato por grupo: MD1 (1v2, 3v4) | MD2 (1v3, 2v4) | MD3 (1v4, 2v3)
-- ============================================================

-- ---------------------------
-- GRUPO A: USA, PAN, ALB, UKR  (sede: ciudades de USA)
-- ---------------------------
-- Jornada 1 — Jun 12
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-12 17:00:00+00', 'group', 'A', 'upcoming' FROM teams h, teams a WHERE h.code='USA' AND a.code='PAN';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-12 21:00:00+00', 'group', 'A', 'upcoming' FROM teams h, teams a WHERE h.code='ALB' AND a.code='UKR';
-- Jornada 2 — Jun 18
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-18 17:00:00+00', 'group', 'A', 'upcoming' FROM teams h, teams a WHERE h.code='USA' AND a.code='ALB';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-18 21:00:00+00', 'group', 'A', 'upcoming' FROM teams h, teams a WHERE h.code='PAN' AND a.code='UKR';
-- Jornada 3 — Jun 26 (simultáneos)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-26 21:00:00+00', 'group', 'A', 'upcoming' FROM teams h, teams a WHERE h.code='USA' AND a.code='UKR';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-26 21:00:00+00', 'group', 'A', 'upcoming' FROM teams h, teams a WHERE h.code='PAN' AND a.code='ALB';

-- ---------------------------
-- GRUPO B: MEX, ECU, IRQ, NZL  (sede: ciudades de México)
-- ---------------------------
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-11 21:00:00+00', 'group', 'B', 'upcoming' FROM teams h, teams a WHERE h.code='MEX' AND a.code='ECU';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-12 01:00:00+00', 'group', 'B', 'upcoming' FROM teams h, teams a WHERE h.code='IRQ' AND a.code='NZL';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-16 17:00:00+00', 'group', 'B', 'upcoming' FROM teams h, teams a WHERE h.code='MEX' AND a.code='IRQ';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-16 21:00:00+00', 'group', 'B', 'upcoming' FROM teams h, teams a WHERE h.code='ECU' AND a.code='NZL';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-25 21:00:00+00', 'group', 'B', 'upcoming' FROM teams h, teams a WHERE h.code='MEX' AND a.code='NZL';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-25 21:00:00+00', 'group', 'B', 'upcoming' FROM teams h, teams a WHERE h.code='ECU' AND a.code='IRQ';

-- ---------------------------
-- GRUPO C: CAN, MAR, POR, URU  (sede: ciudades de Canadá)
-- ---------------------------
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-13 17:00:00+00', 'group', 'C', 'upcoming' FROM teams h, teams a WHERE h.code='CAN' AND a.code='MAR';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-13 21:00:00+00', 'group', 'C', 'upcoming' FROM teams h, teams a WHERE h.code='POR' AND a.code='URU';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-19 17:00:00+00', 'group', 'C', 'upcoming' FROM teams h, teams a WHERE h.code='CAN' AND a.code='POR';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-19 21:00:00+00', 'group', 'C', 'upcoming' FROM teams h, teams a WHERE h.code='MAR' AND a.code='URU';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-27 21:00:00+00', 'group', 'C', 'upcoming' FROM teams h, teams a WHERE h.code='CAN' AND a.code='URU';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-27 21:00:00+00', 'group', 'C', 'upcoming' FROM teams h, teams a WHERE h.code='MAR' AND a.code='POR';

-- ---------------------------
-- GRUPO D: ARG, CHI, POL, ALG
-- ---------------------------
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-13 21:00:00+00', 'group', 'D', 'upcoming' FROM teams h, teams a WHERE h.code='ARG' AND a.code='CHI';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-14 01:00:00+00', 'group', 'D', 'upcoming' FROM teams h, teams a WHERE h.code='POL' AND a.code='ALG';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-20 17:00:00+00', 'group', 'D', 'upcoming' FROM teams h, teams a WHERE h.code='ARG' AND a.code='POL';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-20 21:00:00+00', 'group', 'D', 'upcoming' FROM teams h, teams a WHERE h.code='CHI' AND a.code='ALG';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-28 21:00:00+00', 'group', 'D', 'upcoming' FROM teams h, teams a WHERE h.code='ARG' AND a.code='ALG';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-28 21:00:00+00', 'group', 'D', 'upcoming' FROM teams h, teams a WHERE h.code='CHI' AND a.code='POL';

-- ---------------------------
-- GRUPO E: BRA, COL, SAU, CMR
-- ---------------------------
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-14 17:00:00+00', 'group', 'E', 'upcoming' FROM teams h, teams a WHERE h.code='BRA' AND a.code='COL';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-14 21:00:00+00', 'group', 'E', 'upcoming' FROM teams h, teams a WHERE h.code='SAU' AND a.code='CMR';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-21 17:00:00+00', 'group', 'E', 'upcoming' FROM teams h, teams a WHERE h.code='BRA' AND a.code='SAU';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-21 21:00:00+00', 'group', 'E', 'upcoming' FROM teams h, teams a WHERE h.code='COL' AND a.code='CMR';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-29 21:00:00+00', 'group', 'E', 'upcoming' FROM teams h, teams a WHERE h.code='BRA' AND a.code='CMR';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-29 21:00:00+00', 'group', 'E', 'upcoming' FROM teams h, teams a WHERE h.code='COL' AND a.code='SAU';

-- ---------------------------
-- GRUPO F: FRA, BEL, AUS, JOR
-- ---------------------------
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-15 17:00:00+00', 'group', 'F', 'upcoming' FROM teams h, teams a WHERE h.code='FRA' AND a.code='BEL';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-15 21:00:00+00', 'group', 'F', 'upcoming' FROM teams h, teams a WHERE h.code='AUS' AND a.code='JOR';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-22 17:00:00+00', 'group', 'F', 'upcoming' FROM teams h, teams a WHERE h.code='FRA' AND a.code='AUS';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-22 21:00:00+00', 'group', 'F', 'upcoming' FROM teams h, teams a WHERE h.code='BEL' AND a.code='JOR';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-30 21:00:00+00', 'group', 'F', 'upcoming' FROM teams h, teams a WHERE h.code='FRA' AND a.code='JOR';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-30 21:00:00+00', 'group', 'F', 'upcoming' FROM teams h, teams a WHERE h.code='BEL' AND a.code='AUS';

-- ---------------------------
-- GRUPO G: ESP, CRO, JPN, SEN
-- ---------------------------
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-15 21:00:00+00', 'group', 'G', 'upcoming' FROM teams h, teams a WHERE h.code='ESP' AND a.code='CRO';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-16 01:00:00+00', 'group', 'G', 'upcoming' FROM teams h, teams a WHERE h.code='JPN' AND a.code='SEN';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-23 17:00:00+00', 'group', 'G', 'upcoming' FROM teams h, teams a WHERE h.code='ESP' AND a.code='JPN';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-23 21:00:00+00', 'group', 'G', 'upcoming' FROM teams h, teams a WHERE h.code='CRO' AND a.code='SEN';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-07-01 21:00:00+00', 'group', 'G', 'upcoming' FROM teams h, teams a WHERE h.code='ESP' AND a.code='SEN';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-07-01 21:00:00+00', 'group', 'G', 'upcoming' FROM teams h, teams a WHERE h.code='CRO' AND a.code='JPN';

-- ---------------------------
-- GRUPO H: GER, SRB, IRN, NGA
-- ---------------------------
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-16 17:00:00+00', 'group', 'H', 'upcoming' FROM teams h, teams a WHERE h.code='GER' AND a.code='SRB';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-16 21:00:00+00', 'group', 'H', 'upcoming' FROM teams h, teams a WHERE h.code='IRN' AND a.code='NGA';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-24 17:00:00+00', 'group', 'H', 'upcoming' FROM teams h, teams a WHERE h.code='GER' AND a.code='IRN';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-24 21:00:00+00', 'group', 'H', 'upcoming' FROM teams h, teams a WHERE h.code='SRB' AND a.code='NGA';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-07-02 21:00:00+00', 'group', 'H', 'upcoming' FROM teams h, teams a WHERE h.code='GER' AND a.code='NGA';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-07-02 21:00:00+00', 'group', 'H', 'upcoming' FROM teams h, teams a WHERE h.code='SRB' AND a.code='IRN';

-- ---------------------------
-- GRUPO I: ENG, NED, KOR, EGY
-- ---------------------------
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-17 17:00:00+00', 'group', 'I', 'upcoming' FROM teams h, teams a WHERE h.code='ENG' AND a.code='NED';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-17 21:00:00+00', 'group', 'I', 'upcoming' FROM teams h, teams a WHERE h.code='KOR' AND a.code='EGY';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-24 17:00:00+00', 'group', 'I', 'upcoming' FROM teams h, teams a WHERE h.code='ENG' AND a.code='KOR';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-24 21:00:00+00', 'group', 'I', 'upcoming' FROM teams h, teams a WHERE h.code='NED' AND a.code='EGY';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-07-02 17:00:00+00', 'group', 'I', 'upcoming' FROM teams h, teams a WHERE h.code='ENG' AND a.code='EGY';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-07-02 17:00:00+00', 'group', 'I', 'upcoming' FROM teams h, teams a WHERE h.code='NED' AND a.code='KOR';

-- ---------------------------
-- GRUPO J: ITA, TUR, QAT, CIV
-- ---------------------------
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-17 17:00:00+00', 'group', 'J', 'upcoming' FROM teams h, teams a WHERE h.code='ITA' AND a.code='TUR';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-17 21:00:00+00', 'group', 'J', 'upcoming' FROM teams h, teams a WHERE h.code='QAT' AND a.code='CIV';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-25 17:00:00+00', 'group', 'J', 'upcoming' FROM teams h, teams a WHERE h.code='ITA' AND a.code='QAT';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-25 21:00:00+00', 'group', 'J', 'upcoming' FROM teams h, teams a WHERE h.code='TUR' AND a.code='CIV';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-07-03 21:00:00+00', 'group', 'J', 'upcoming' FROM teams h, teams a WHERE h.code='ITA' AND a.code='CIV';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-07-03 21:00:00+00', 'group', 'J', 'upcoming' FROM teams h, teams a WHERE h.code='TUR' AND a.code='QAT';

-- ---------------------------
-- GRUPO K: SUI, DEN, VEN, RSA
-- ---------------------------
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-18 17:00:00+00', 'group', 'K', 'upcoming' FROM teams h, teams a WHERE h.code='SUI' AND a.code='DEN';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-18 21:00:00+00', 'group', 'K', 'upcoming' FROM teams h, teams a WHERE h.code='VEN' AND a.code='RSA';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-26 17:00:00+00', 'group', 'K', 'upcoming' FROM teams h, teams a WHERE h.code='SUI' AND a.code='VEN';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-26 21:00:00+00', 'group', 'K', 'upcoming' FROM teams h, teams a WHERE h.code='DEN' AND a.code='RSA';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-07-04 21:00:00+00', 'group', 'K', 'upcoming' FROM teams h, teams a WHERE h.code='SUI' AND a.code='RSA';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-07-04 21:00:00+00', 'group', 'K', 'upcoming' FROM teams h, teams a WHERE h.code='DEN' AND a.code='VEN';

-- ---------------------------
-- GRUPO L: CRC, HON, PER, MLI
-- ---------------------------
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-19 17:00:00+00', 'group', 'L', 'upcoming' FROM teams h, teams a WHERE h.code='CRC' AND a.code='HON';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-19 21:00:00+00', 'group', 'L', 'upcoming' FROM teams h, teams a WHERE h.code='PER' AND a.code='MLI';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-27 17:00:00+00', 'group', 'L', 'upcoming' FROM teams h, teams a WHERE h.code='CRC' AND a.code='PER';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-06-27 21:00:00+00', 'group', 'L', 'upcoming' FROM teams h, teams a WHERE h.code='HON' AND a.code='MLI';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-07-04 17:00:00+00', 'group', 'L', 'upcoming' FROM teams h, teams a WHERE h.code='CRC' AND a.code='MLI';
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, status)
SELECT h.id, a.id, '2026-07-04 17:00:00+00', 'group', 'L', 'upcoming' FROM teams h, teams a WHERE h.code='HON' AND a.code='PER';

-- ============================================================
-- Verificación final
-- ============================================================
SELECT COUNT(*) AS total_partidos FROM matches;
-- Debería retornar 72
