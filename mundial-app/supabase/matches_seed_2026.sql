-- ============================================================
-- FIXTURE REAL MUNDIAL 2026 — Fase de grupos (72 partidos)
-- Ejecutar DESPUÉS de seed_real_2026.sql
-- Pegar en: Supabase Dashboard > SQL Editor
-- betting_closes_at se calcula solo (trigger: match_date - 15 min)
--
-- Horarios: hora LOCAL de cada sede con offset UTC explícito.
-- Offsets junio 2026: México UTC-6 (sin DST) | ET UTC-4 | CT UTC-5 | PT UTC-7
-- Fuente: Wikipedia (2026 FIFA World Cup, Groups A–L), verificado
-- contra FIFA/ESPN/Ticketmaster.
-- Orden: cronológico (instante UTC).
-- ============================================================

-- ===================== Jueves 11 de junio =====================

-- Partido 1: México vs Sudáfrica — Estadio Azteca, Ciudad de México (Grupo A)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-11T13:00:00-06:00'::timestamptz, 'group', 'A', 'Estadio Azteca, Ciudad de México', 'upcoming'
FROM teams h, teams a WHERE h.code = 'MEX' AND a.code = 'RSA';

-- Partido 2: Corea del Sur vs República Checa — Estadio Akron, Guadalajara (Grupo A)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-11T20:00:00-06:00'::timestamptz, 'group', 'A', 'Estadio Akron, Guadalajara', 'upcoming'
FROM teams h, teams a WHERE h.code = 'KOR' AND a.code = 'CZE';

-- ===================== Viernes 12 de junio =====================

-- Partido 3: Canadá vs Bosnia y Herzegovina — BMO Field, Toronto (Grupo B)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-12T15:00:00-04:00'::timestamptz, 'group', 'B', 'BMO Field, Toronto', 'upcoming'
FROM teams h, teams a WHERE h.code = 'CAN' AND a.code = 'BIH';

-- Partido 4: Estados Unidos vs Paraguay — SoFi Stadium, Los Ángeles (Grupo D)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-12T18:00:00-07:00'::timestamptz, 'group', 'D', 'SoFi Stadium, Los Ángeles', 'upcoming'
FROM teams h, teams a WHERE h.code = 'USA' AND a.code = 'PAR';

-- ===================== Sábado 13 de junio =====================

-- Partido 5: Catar vs Suiza — Levi's Stadium, Santa Clara (Grupo B)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-13T12:00:00-07:00'::timestamptz, 'group', 'B', 'Levi''s Stadium, Santa Clara', 'upcoming'
FROM teams h, teams a WHERE h.code = 'QAT' AND a.code = 'SUI';

-- Partido 6: Brasil vs Marruecos — MetLife Stadium, Nueva Jersey (Grupo C)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-13T18:00:00-04:00'::timestamptz, 'group', 'C', 'MetLife Stadium, Nueva Jersey', 'upcoming'
FROM teams h, teams a WHERE h.code = 'BRA' AND a.code = 'MAR';

-- Partido 7: Haití vs Escocia — Gillette Stadium, Boston (Grupo C)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-13T21:00:00-04:00'::timestamptz, 'group', 'C', 'Gillette Stadium, Boston', 'upcoming'
FROM teams h, teams a WHERE h.code = 'HAI' AND a.code = 'SCO';

-- Partido 8: Australia vs Turquía — BC Place, Vancouver (Grupo D)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-13T21:00:00-07:00'::timestamptz, 'group', 'D', 'BC Place, Vancouver', 'upcoming'
FROM teams h, teams a WHERE h.code = 'AUS' AND a.code = 'TUR';

-- ===================== Domingo 14 de junio =====================

-- Partido 9: Alemania vs Curazao — NRG Stadium, Houston (Grupo E)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-14T12:00:00-05:00'::timestamptz, 'group', 'E', 'NRG Stadium, Houston', 'upcoming'
FROM teams h, teams a WHERE h.code = 'GER' AND a.code = 'CUW';

-- Partido 10: Países Bajos vs Japón — AT&T Stadium, Dallas (Grupo F)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-14T15:00:00-05:00'::timestamptz, 'group', 'F', 'AT&T Stadium, Dallas', 'upcoming'
FROM teams h, teams a WHERE h.code = 'NED' AND a.code = 'JPN';

-- Partido 11: Costa de Marfil vs Ecuador — Lincoln Financial Field, Filadelfia (Grupo E)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-14T19:00:00-04:00'::timestamptz, 'group', 'E', 'Lincoln Financial Field, Filadelfia', 'upcoming'
FROM teams h, teams a WHERE h.code = 'CIV' AND a.code = 'ECU';

-- Partido 12: Suecia vs Túnez — Estadio BBVA, Monterrey (Grupo F)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-14T20:00:00-06:00'::timestamptz, 'group', 'F', 'Estadio BBVA, Monterrey', 'upcoming'
FROM teams h, teams a WHERE h.code = 'SWE' AND a.code = 'TUN';

-- ===================== Lunes 15 de junio =====================

-- Partido 13: España vs Cabo Verde — Mercedes-Benz Stadium, Atlanta (Grupo H)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-15T12:00:00-04:00'::timestamptz, 'group', 'H', 'Mercedes-Benz Stadium, Atlanta', 'upcoming'
FROM teams h, teams a WHERE h.code = 'ESP' AND a.code = 'CPV';

-- Partido 14: Bélgica vs Egipto — Lumen Field, Seattle (Grupo G)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-15T12:00:00-07:00'::timestamptz, 'group', 'G', 'Lumen Field, Seattle', 'upcoming'
FROM teams h, teams a WHERE h.code = 'BEL' AND a.code = 'EGY';

-- Partido 15: Arabia Saudita vs Uruguay — Hard Rock Stadium, Miami (Grupo H)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-15T18:00:00-04:00'::timestamptz, 'group', 'H', 'Hard Rock Stadium, Miami', 'upcoming'
FROM teams h, teams a WHERE h.code = 'KSA' AND a.code = 'URU';

-- Partido 16: Irán vs Nueva Zelanda — SoFi Stadium, Los Ángeles (Grupo G)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-15T18:00:00-07:00'::timestamptz, 'group', 'G', 'SoFi Stadium, Los Ángeles', 'upcoming'
FROM teams h, teams a WHERE h.code = 'IRN' AND a.code = 'NZL';

-- ===================== Martes 16 de junio =====================

-- Partido 17: Francia vs Senegal — MetLife Stadium, Nueva Jersey (Grupo I)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-16T15:00:00-04:00'::timestamptz, 'group', 'I', 'MetLife Stadium, Nueva Jersey', 'upcoming'
FROM teams h, teams a WHERE h.code = 'FRA' AND a.code = 'SEN';

-- Partido 18: Irak vs Noruega — Gillette Stadium, Boston (Grupo I)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-16T18:00:00-04:00'::timestamptz, 'group', 'I', 'Gillette Stadium, Boston', 'upcoming'
FROM teams h, teams a WHERE h.code = 'IRQ' AND a.code = 'NOR';

-- Partido 19: Argentina vs Argelia — Arrowhead Stadium, Kansas City (Grupo J)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-16T20:00:00-05:00'::timestamptz, 'group', 'J', 'Arrowhead Stadium, Kansas City', 'upcoming'
FROM teams h, teams a WHERE h.code = 'ARG' AND a.code = 'ALG';

-- Partido 20: Austria vs Jordania — Levi's Stadium, Santa Clara (Grupo J)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-16T21:00:00-07:00'::timestamptz, 'group', 'J', 'Levi''s Stadium, Santa Clara', 'upcoming'
FROM teams h, teams a WHERE h.code = 'AUT' AND a.code = 'JOR';

-- ===================== Miércoles 17 de junio =====================

-- Partido 21: Portugal vs RD Congo — NRG Stadium, Houston (Grupo K)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-17T12:00:00-05:00'::timestamptz, 'group', 'K', 'NRG Stadium, Houston', 'upcoming'
FROM teams h, teams a WHERE h.code = 'POR' AND a.code = 'COD';

-- Partido 22: Inglaterra vs Croacia — AT&T Stadium, Dallas (Grupo L)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-17T15:00:00-05:00'::timestamptz, 'group', 'L', 'AT&T Stadium, Dallas', 'upcoming'
FROM teams h, teams a WHERE h.code = 'ENG' AND a.code = 'CRO';

-- Partido 23: Ghana vs Panamá — BMO Field, Toronto (Grupo L)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-17T19:00:00-04:00'::timestamptz, 'group', 'L', 'BMO Field, Toronto', 'upcoming'
FROM teams h, teams a WHERE h.code = 'GHA' AND a.code = 'PAN';

-- Partido 24: Uzbekistán vs Colombia — Estadio Azteca, Ciudad de México (Grupo K)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-17T20:00:00-06:00'::timestamptz, 'group', 'K', 'Estadio Azteca, Ciudad de México', 'upcoming'
FROM teams h, teams a WHERE h.code = 'UZB' AND a.code = 'COL';

-- ===================== Jueves 18 de junio =====================

-- Partido 25: República Checa vs Sudáfrica — Mercedes-Benz Stadium, Atlanta (Grupo A)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-18T12:00:00-04:00'::timestamptz, 'group', 'A', 'Mercedes-Benz Stadium, Atlanta', 'upcoming'
FROM teams h, teams a WHERE h.code = 'CZE' AND a.code = 'RSA';

-- Partido 26: Suiza vs Bosnia y Herzegovina — SoFi Stadium, Los Ángeles (Grupo B)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-18T12:00:00-07:00'::timestamptz, 'group', 'B', 'SoFi Stadium, Los Ángeles', 'upcoming'
FROM teams h, teams a WHERE h.code = 'SUI' AND a.code = 'BIH';

-- Partido 27: Canadá vs Catar — BC Place, Vancouver (Grupo B)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-18T15:00:00-07:00'::timestamptz, 'group', 'B', 'BC Place, Vancouver', 'upcoming'
FROM teams h, teams a WHERE h.code = 'CAN' AND a.code = 'QAT';

-- Partido 28: México vs Corea del Sur — Estadio Akron, Guadalajara (Grupo A)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-18T19:00:00-06:00'::timestamptz, 'group', 'A', 'Estadio Akron, Guadalajara', 'upcoming'
FROM teams h, teams a WHERE h.code = 'MEX' AND a.code = 'KOR';

-- ===================== Viernes 19 de junio =====================

-- Partido 29: Estados Unidos vs Australia — Lumen Field, Seattle (Grupo D)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-19T12:00:00-07:00'::timestamptz, 'group', 'D', 'Lumen Field, Seattle', 'upcoming'
FROM teams h, teams a WHERE h.code = 'USA' AND a.code = 'AUS';

-- Partido 30: Escocia vs Marruecos — Gillette Stadium, Boston (Grupo C)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-19T18:00:00-04:00'::timestamptz, 'group', 'C', 'Gillette Stadium, Boston', 'upcoming'
FROM teams h, teams a WHERE h.code = 'SCO' AND a.code = 'MAR';

-- Partido 31: Brasil vs Haití — Lincoln Financial Field, Filadelfia (Grupo C)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-19T20:30:00-04:00'::timestamptz, 'group', 'C', 'Lincoln Financial Field, Filadelfia', 'upcoming'
FROM teams h, teams a WHERE h.code = 'BRA' AND a.code = 'HAI';

-- Partido 32: Turquía vs Paraguay — Levi's Stadium, Santa Clara (Grupo D)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-19T20:00:00-07:00'::timestamptz, 'group', 'D', 'Levi''s Stadium, Santa Clara', 'upcoming'
FROM teams h, teams a WHERE h.code = 'TUR' AND a.code = 'PAR';

-- ===================== Sábado 20 de junio =====================

-- Partido 33: Países Bajos vs Suecia — NRG Stadium, Houston (Grupo F)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-20T12:00:00-05:00'::timestamptz, 'group', 'F', 'NRG Stadium, Houston', 'upcoming'
FROM teams h, teams a WHERE h.code = 'NED' AND a.code = 'SWE';

-- Partido 34: Alemania vs Costa de Marfil — BMO Field, Toronto (Grupo E)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-20T16:00:00-04:00'::timestamptz, 'group', 'E', 'BMO Field, Toronto', 'upcoming'
FROM teams h, teams a WHERE h.code = 'GER' AND a.code = 'CIV';

-- Partido 35: Ecuador vs Curazao — Arrowhead Stadium, Kansas City (Grupo E)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-20T19:00:00-05:00'::timestamptz, 'group', 'E', 'Arrowhead Stadium, Kansas City', 'upcoming'
FROM teams h, teams a WHERE h.code = 'ECU' AND a.code = 'CUW';

-- Partido 36: Túnez vs Japón — Estadio BBVA, Monterrey (Grupo F)
-- (Partido N° 1000 de la historia de los Mundiales; horario tardío para TV de Japón)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-20T22:00:00-06:00'::timestamptz, 'group', 'F', 'Estadio BBVA, Monterrey', 'upcoming'
FROM teams h, teams a WHERE h.code = 'TUN' AND a.code = 'JPN';

-- ===================== Domingo 21 de junio =====================

-- Partido 37: España vs Arabia Saudita — Mercedes-Benz Stadium, Atlanta (Grupo H)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-21T12:00:00-04:00'::timestamptz, 'group', 'H', 'Mercedes-Benz Stadium, Atlanta', 'upcoming'
FROM teams h, teams a WHERE h.code = 'ESP' AND a.code = 'KSA';

-- Partido 38: Bélgica vs Irán — SoFi Stadium, Los Ángeles (Grupo G)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-21T12:00:00-07:00'::timestamptz, 'group', 'G', 'SoFi Stadium, Los Ángeles', 'upcoming'
FROM teams h, teams a WHERE h.code = 'BEL' AND a.code = 'IRN';

-- Partido 39: Uruguay vs Cabo Verde — Hard Rock Stadium, Miami (Grupo H)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-21T18:00:00-04:00'::timestamptz, 'group', 'H', 'Hard Rock Stadium, Miami', 'upcoming'
FROM teams h, teams a WHERE h.code = 'URU' AND a.code = 'CPV';

-- Partido 40: Nueva Zelanda vs Egipto — BC Place, Vancouver (Grupo G)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-21T18:00:00-07:00'::timestamptz, 'group', 'G', 'BC Place, Vancouver', 'upcoming'
FROM teams h, teams a WHERE h.code = 'NZL' AND a.code = 'EGY';

-- ===================== Lunes 22 de junio =====================

-- Partido 41: Argentina vs Austria — AT&T Stadium, Dallas (Grupo J)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-22T12:00:00-05:00'::timestamptz, 'group', 'J', 'AT&T Stadium, Dallas', 'upcoming'
FROM teams h, teams a WHERE h.code = 'ARG' AND a.code = 'AUT';

-- Partido 42: Francia vs Irak — Lincoln Financial Field, Filadelfia (Grupo I)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-22T17:00:00-04:00'::timestamptz, 'group', 'I', 'Lincoln Financial Field, Filadelfia', 'upcoming'
FROM teams h, teams a WHERE h.code = 'FRA' AND a.code = 'IRQ';

-- Partido 43: Noruega vs Senegal — MetLife Stadium, Nueva Jersey (Grupo I)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-22T20:00:00-04:00'::timestamptz, 'group', 'I', 'MetLife Stadium, Nueva Jersey', 'upcoming'
FROM teams h, teams a WHERE h.code = 'NOR' AND a.code = 'SEN';

-- Partido 44: Jordania vs Argelia — Levi's Stadium, Santa Clara (Grupo J)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-22T20:00:00-07:00'::timestamptz, 'group', 'J', 'Levi''s Stadium, Santa Clara', 'upcoming'
FROM teams h, teams a WHERE h.code = 'JOR' AND a.code = 'ALG';

-- ===================== Martes 23 de junio =====================

-- Partido 45: Portugal vs Uzbekistán — NRG Stadium, Houston (Grupo K)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-23T12:00:00-05:00'::timestamptz, 'group', 'K', 'NRG Stadium, Houston', 'upcoming'
FROM teams h, teams a WHERE h.code = 'POR' AND a.code = 'UZB';

-- Partido 46: Inglaterra vs Ghana — Gillette Stadium, Boston (Grupo L)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-23T16:00:00-04:00'::timestamptz, 'group', 'L', 'Gillette Stadium, Boston', 'upcoming'
FROM teams h, teams a WHERE h.code = 'ENG' AND a.code = 'GHA';

-- Partido 47: Panamá vs Croacia — BMO Field, Toronto (Grupo L)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-23T19:00:00-04:00'::timestamptz, 'group', 'L', 'BMO Field, Toronto', 'upcoming'
FROM teams h, teams a WHERE h.code = 'PAN' AND a.code = 'CRO';

-- Partido 48: Colombia vs RD Congo — Estadio Akron, Guadalajara (Grupo K)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-23T20:00:00-06:00'::timestamptz, 'group', 'K', 'Estadio Akron, Guadalajara', 'upcoming'
FROM teams h, teams a WHERE h.code = 'COL' AND a.code = 'COD';

-- ===================== Miércoles 24 de junio =====================
-- (3ª fecha: partidos del mismo grupo en simultáneo)

-- Partido 49: Suiza vs Canadá — BC Place, Vancouver (Grupo B)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-24T12:00:00-07:00'::timestamptz, 'group', 'B', 'BC Place, Vancouver', 'upcoming'
FROM teams h, teams a WHERE h.code = 'SUI' AND a.code = 'CAN';

-- Partido 50: Bosnia y Herzegovina vs Catar — Lumen Field, Seattle (Grupo B)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-24T12:00:00-07:00'::timestamptz, 'group', 'B', 'Lumen Field, Seattle', 'upcoming'
FROM teams h, teams a WHERE h.code = 'BIH' AND a.code = 'QAT';

-- Partido 51: Escocia vs Brasil — Hard Rock Stadium, Miami (Grupo C)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-24T18:00:00-04:00'::timestamptz, 'group', 'C', 'Hard Rock Stadium, Miami', 'upcoming'
FROM teams h, teams a WHERE h.code = 'SCO' AND a.code = 'BRA';

-- Partido 52: Marruecos vs Haití — Mercedes-Benz Stadium, Atlanta (Grupo C)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-24T18:00:00-04:00'::timestamptz, 'group', 'C', 'Mercedes-Benz Stadium, Atlanta', 'upcoming'
FROM teams h, teams a WHERE h.code = 'MAR' AND a.code = 'HAI';

-- Partido 53: República Checa vs México — Estadio Azteca, Ciudad de México (Grupo A)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-24T19:00:00-06:00'::timestamptz, 'group', 'A', 'Estadio Azteca, Ciudad de México', 'upcoming'
FROM teams h, teams a WHERE h.code = 'CZE' AND a.code = 'MEX';

-- Partido 54: Sudáfrica vs Corea del Sur — Estadio BBVA, Monterrey (Grupo A)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-24T19:00:00-06:00'::timestamptz, 'group', 'A', 'Estadio BBVA, Monterrey', 'upcoming'
FROM teams h, teams a WHERE h.code = 'RSA' AND a.code = 'KOR';

-- ===================== Jueves 25 de junio =====================

-- Partido 55: Curazao vs Costa de Marfil — Lincoln Financial Field, Filadelfia (Grupo E)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-25T16:00:00-04:00'::timestamptz, 'group', 'E', 'Lincoln Financial Field, Filadelfia', 'upcoming'
FROM teams h, teams a WHERE h.code = 'CUW' AND a.code = 'CIV';

-- Partido 56: Ecuador vs Alemania — MetLife Stadium, Nueva Jersey (Grupo E)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-25T16:00:00-04:00'::timestamptz, 'group', 'E', 'MetLife Stadium, Nueva Jersey', 'upcoming'
FROM teams h, teams a WHERE h.code = 'ECU' AND a.code = 'GER';

-- Partido 57: Japón vs Suecia — AT&T Stadium, Dallas (Grupo F)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-25T18:00:00-05:00'::timestamptz, 'group', 'F', 'AT&T Stadium, Dallas', 'upcoming'
FROM teams h, teams a WHERE h.code = 'JPN' AND a.code = 'SWE';

-- Partido 58: Túnez vs Países Bajos — Arrowhead Stadium, Kansas City (Grupo F)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-25T18:00:00-05:00'::timestamptz, 'group', 'F', 'Arrowhead Stadium, Kansas City', 'upcoming'
FROM teams h, teams a WHERE h.code = 'TUN' AND a.code = 'NED';

-- Partido 59: Turquía vs Estados Unidos — SoFi Stadium, Los Ángeles (Grupo D)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-25T19:00:00-07:00'::timestamptz, 'group', 'D', 'SoFi Stadium, Los Ángeles', 'upcoming'
FROM teams h, teams a WHERE h.code = 'TUR' AND a.code = 'USA';

-- Partido 60: Paraguay vs Australia — Levi's Stadium, Santa Clara (Grupo D)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-25T19:00:00-07:00'::timestamptz, 'group', 'D', 'Levi''s Stadium, Santa Clara', 'upcoming'
FROM teams h, teams a WHERE h.code = 'PAR' AND a.code = 'AUS';

-- ===================== Viernes 26 de junio =====================

-- Partido 61: Noruega vs Francia — Gillette Stadium, Boston (Grupo I)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-26T15:00:00-04:00'::timestamptz, 'group', 'I', 'Gillette Stadium, Boston', 'upcoming'
FROM teams h, teams a WHERE h.code = 'NOR' AND a.code = 'FRA';

-- Partido 62: Senegal vs Irak — BMO Field, Toronto (Grupo I)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-26T15:00:00-04:00'::timestamptz, 'group', 'I', 'BMO Field, Toronto', 'upcoming'
FROM teams h, teams a WHERE h.code = 'SEN' AND a.code = 'IRQ';

-- Partido 63: Uruguay vs España — Estadio Akron, Guadalajara (Grupo H)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-26T18:00:00-06:00'::timestamptz, 'group', 'H', 'Estadio Akron, Guadalajara', 'upcoming'
FROM teams h, teams a WHERE h.code = 'URU' AND a.code = 'ESP';

-- Partido 64: Cabo Verde vs Arabia Saudita — NRG Stadium, Houston (Grupo H)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-26T19:00:00-05:00'::timestamptz, 'group', 'H', 'NRG Stadium, Houston', 'upcoming'
FROM teams h, teams a WHERE h.code = 'CPV' AND a.code = 'KSA';

-- Partido 65: Egipto vs Irán — Lumen Field, Seattle (Grupo G)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-26T20:00:00-07:00'::timestamptz, 'group', 'G', 'Lumen Field, Seattle', 'upcoming'
FROM teams h, teams a WHERE h.code = 'EGY' AND a.code = 'IRN';

-- Partido 66: Nueva Zelanda vs Bélgica — BC Place, Vancouver (Grupo G)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-26T20:00:00-07:00'::timestamptz, 'group', 'G', 'BC Place, Vancouver', 'upcoming'
FROM teams h, teams a WHERE h.code = 'NZL' AND a.code = 'BEL';

-- ===================== Sábado 27 de junio =====================

-- Partido 67: Panamá vs Inglaterra — MetLife Stadium, Nueva Jersey (Grupo L)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-27T17:00:00-04:00'::timestamptz, 'group', 'L', 'MetLife Stadium, Nueva Jersey', 'upcoming'
FROM teams h, teams a WHERE h.code = 'PAN' AND a.code = 'ENG';

-- Partido 68: Croacia vs Ghana — Lincoln Financial Field, Filadelfia (Grupo L)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-27T17:00:00-04:00'::timestamptz, 'group', 'L', 'Lincoln Financial Field, Filadelfia', 'upcoming'
FROM teams h, teams a WHERE h.code = 'CRO' AND a.code = 'GHA';

-- Partido 69: Colombia vs Portugal — Hard Rock Stadium, Miami (Grupo K)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-27T19:30:00-04:00'::timestamptz, 'group', 'K', 'Hard Rock Stadium, Miami', 'upcoming'
FROM teams h, teams a WHERE h.code = 'COL' AND a.code = 'POR';

-- Partido 70: RD Congo vs Uzbekistán — Mercedes-Benz Stadium, Atlanta (Grupo K)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-27T19:30:00-04:00'::timestamptz, 'group', 'K', 'Mercedes-Benz Stadium, Atlanta', 'upcoming'
FROM teams h, teams a WHERE h.code = 'COD' AND a.code = 'UZB';

-- Partido 71: Argelia vs Austria — Arrowhead Stadium, Kansas City (Grupo J)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-27T21:00:00-05:00'::timestamptz, 'group', 'J', 'Arrowhead Stadium, Kansas City', 'upcoming'
FROM teams h, teams a WHERE h.code = 'ALG' AND a.code = 'AUT';

-- Partido 72: Jordania vs Argentina — AT&T Stadium, Dallas (Grupo J)
INSERT INTO matches (home_team_id, away_team_id, match_date, stage, group_name, venue, status)
SELECT h.id, a.id, '2026-06-27T21:00:00-05:00'::timestamptz, 'group', 'J', 'AT&T Stadium, Dallas', 'upcoming'
FROM teams h, teams a WHERE h.code = 'JOR' AND a.code = 'ARG';

-- ============================================================
-- VERIFICACIÓN (opcional, ejecutar después del seed):
--   SELECT COUNT(*) FROM matches WHERE stage = 'group';            -- 72
--   SELECT group_name, COUNT(*) FROM matches WHERE stage = 'group'
--     GROUP BY group_name ORDER BY group_name;                     -- 6 c/u
-- ============================================================
