-- ============================================================
-- SEED REAL MUNDIAL 2026 — 48 selecciones con planteles oficiales
-- Fuente: listas definitivas FIFA (independentespanol.com, jun 2026)
-- Pegar en: Supabase Dashboard > SQL Editor
--
-- ⚠️ DESTRUCTIVO: borra TODOS los partidos, predicciones, eventos,
-- jugadores y equipos actuales, y resetea los puntos de los perfiles.
-- Los dorsales van NULL (la fuente no los publica); se pueden cargar
-- después desde el admin.
-- ============================================================

BEGIN;

-- 1) Reset de datos del torneo (conserva usuarios/perfiles)
DELETE FROM match_events;
DELETE FROM prediction_players;
DELETE FROM predictions;
DELETE FROM matches;
DELETE FROM players;
DELETE FROM teams;
UPDATE profiles SET total_points = 0;

-- 2) Equipos (códigos FIFA, grupos reales A-L)
INSERT INTO teams (name, code, group_name) VALUES
('México', 'MEX', 'A'),
('Sudáfrica', 'RSA', 'A'),
('Corea del Sur', 'KOR', 'A'),
('República Checa', 'CZE', 'A'),
('Canadá', 'CAN', 'B'),
('Bosnia y Herzegovina', 'BIH', 'B'),
('Catar', 'QAT', 'B'),
('Suiza', 'SUI', 'B'),
('Brasil', 'BRA', 'C'),
('Marruecos', 'MAR', 'C'),
('Haití', 'HAI', 'C'),
('Escocia', 'SCO', 'C'),
('Estados Unidos', 'USA', 'D'),
('Paraguay', 'PAR', 'D'),
('Australia', 'AUS', 'D'),
('Turquía', 'TUR', 'D'),
('Alemania', 'GER', 'E'),
('Curazao', 'CUW', 'E'),
('Costa de Marfil', 'CIV', 'E'),
('Ecuador', 'ECU', 'E'),
('Países Bajos', 'NED', 'F'),
('Japón', 'JPN', 'F'),
('Suecia', 'SWE', 'F'),
('Túnez', 'TUN', 'F'),
('Bélgica', 'BEL', 'G'),
('Egipto', 'EGY', 'G'),
('Irán', 'IRN', 'G'),
('Nueva Zelanda', 'NZL', 'G'),
('España', 'ESP', 'H'),
('Cabo Verde', 'CPV', 'H'),
('Arabia Saudita', 'KSA', 'H'),
('Uruguay', 'URU', 'H'),
('Francia', 'FRA', 'I'),
('Senegal', 'SEN', 'I'),
('Irak', 'IRQ', 'I'),
('Noruega', 'NOR', 'I'),
('Argentina', 'ARG', 'J'),
('Argelia', 'ALG', 'J'),
('Austria', 'AUT', 'J'),
('Jordania', 'JOR', 'J'),
('Portugal', 'POR', 'K'),
('RD Congo', 'COD', 'K'),
('Uzbekistán', 'UZB', 'K'),
('Colombia', 'COL', 'K'),
('Inglaterra', 'ENG', 'L'),
('Croacia', 'CRO', 'L'),
('Ghana', 'GHA', 'L'),
('Panamá', 'PAN', 'L');

-- 3) Planteles oficiales

-- ===== GRUPO A =====

-- México (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Raul Rangel', 'GK'),
  ('Guillermo Ochoa', 'GK'),
  ('Carlos Acevedo', 'GK'),
  ('Jorge Sánchez', 'DEF'),
  ('Israel Reyes', 'DEF'),
  ('César Montes', 'DEF'),
  ('Johan Vásquez', 'DEF'),
  ('Jesús Gallardo', 'DEF'),
  ('Mateo Chávez', 'DEF'),
  ('Erik Lira', 'MID'),
  ('Orbelín Pineda', 'MID'),
  ('Álvaro Fidalgo', 'MID'),
  ('Roberto Alvarado', 'MID'),
  ('Brian Gutiérrez', 'MID'),
  ('Luis Romo', 'MID'),
  ('Edson Álvarez', 'MID'),
  ('Obed Vargas', 'MID'),
  ('Gilberto Mora', 'MID'),
  ('Luis Chávez', 'MID'),
  ('César Huerta', 'FWD'),
  ('Alexis Vega', 'FWD'),
  ('Julián Quinones', 'FWD'),
  ('Guillermo Martínez', 'FWD'),
  ('Armando González', 'FWD'),
  ('Santiago Giménez', 'FWD'),
  ('Raúl Jiménez', 'FWD')
) AS v(name, position)
WHERE t.code = 'MEX';

-- Sudáfrica (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Ronwen Williams', 'GK'),
  ('Ricardo Goss', 'GK'),
  ('Sipho Chaine', 'GK'),
  ('Khuliso Mudau', 'DEF'),
  ('Aubrey Modiba', 'DEF'),
  ('Khulumani Ndamane', 'DEF'),
  ('Olwethu Makhanya', 'DEF'),
  ('Bradley Cross', 'DEF'),
  ('Thabang Matuludi', 'DEF'),
  ('Nkosinathi Sibisi', 'DEF'),
  ('Kamogelo Sebelebele', 'DEF'),
  ('Ime Okon', 'DEF'),
  ('Samukele Kabini', 'DEF'),
  ('Mbekezeli Mbokazi', 'DEF'),
  ('Teboho Mokoena', 'MID'),
  ('Jayden Adams', 'MID'),
  ('Thalente Mbatha', 'MID'),
  ('Sphephelo Sithole', 'MID'),
  ('Oswin Appollis', 'FWD'),
  ('Tshepang Moremi', 'FWD'),
  ('Evidence Makgopa', 'FWD'),
  ('Relebohile Mofokeng', 'FWD'),
  ('Lyle Foster', 'FWD'),
  ('Iqraam Rayners', 'FWD'),
  ('Themba Zwane', 'FWD'),
  ('Thapelo Maseko', 'FWD')
) AS v(name, position)
WHERE t.code = 'RSA';

-- Corea del Sur (22 — la fuente tiene texto corrupto en esta sección;
-- se cargan solo los jugadores legibles sin ambigüedad)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Jo Hyeon-woo', 'GK'),
  ('Kim Seung-gyu', 'GK'),
  ('Song Bum-keun', 'GK'),
  ('Kim Moon-hwan', 'DEF'),
  ('Kim Min-jae', 'DEF'),
  ('Kim Tae-hyon', 'DEF'),
  ('Park Jin-seob', 'DEF'),
  ('Seol Young-woo', 'DEF'),
  ('Jens Castrop', 'DEF'),
  ('Lee Ki-hyuk', 'DEF'),
  ('Cho Yu-min', 'DEF'),
  ('Kim Jin-gyu', 'MID'),
  ('Bae Jun-ho', 'MID'),
  ('Paik Seung-ho', 'MID'),
  ('Yang Hyun-jun', 'MID'),
  ('Eom Ji-sung', 'MID'),
  ('Lee Kang-in', 'MID'),
  ('Lee Dong-gyeong', 'MID'),
  ('Son Heung-min', 'FWD'),
  ('Oh Hyeon-gyu', 'FWD'),
  ('Cho Gue-sung', 'FWD'),
  ('Hwang Hee-chan', 'FWD')
) AS v(name, position)
WHERE t.code = 'KOR';

-- República Checa (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Lukas Hornicek', 'GK'),
  ('Matej Kovar', 'GK'),
  ('Jindrich Stanek', 'GK'),
  ('Vladimir Coufal', 'DEF'),
  ('David Doudera', 'DEF'),
  ('Tomas Holes', 'DEF'),
  ('Robin Hranac', 'DEF'),
  ('Stepan Chaloupek', 'DEF'),
  ('David Jurasek', 'DEF'),
  ('Ladislav Krejci', 'DEF'),
  ('Jaroslav Zeleny', 'DEF'),
  ('David Zima', 'DEF'),
  ('Lukas Cerv', 'MID'),
  ('Vladimir Darida', 'MID'),
  ('Lukas Provod', 'MID'),
  ('Michal Sadilek', 'MID'),
  ('Hugo Sochurek', 'MID'),
  ('Alexandr Sojka', 'MID'),
  ('Tomas Soucek', 'MID'),
  ('Pavel Sulc', 'MID'),
  ('Denis Visinsky', 'MID'),
  ('Adam Hlozek', 'FWD'),
  ('Tomas Chory', 'FWD'),
  ('Mojmir Chytil', 'FWD'),
  ('Jan Kuchta', 'FWD'),
  ('Patrik Schick', 'FWD')
) AS v(name, position)
WHERE t.code = 'CZE';

-- ===== GRUPO B =====

-- Canadá (25)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Dayne St Clair', 'GK'),
  ('Maxime Crepeau', 'GK'),
  ('Owen Goodman', 'GK'),
  ('Alistair Johnston', 'DEF'),
  ('Derek Cornelius', 'DEF'),
  ('Richie Laryea', 'DEF'),
  ('Niko Sigur', 'DEF'),
  ('Joel Waterman', 'DEF'),
  ('Luc de Fougerolles', 'DEF'),
  ('Moise Bombito', 'DEF'),
  ('Alphonso Davies', 'DEF'),
  ('Alfie Jones', 'DEF'),
  ('Stephen Eustaquio', 'MID'),
  ('Ismael Kone', 'MID'),
  ('Tajon Buchanan', 'MID'),
  ('Mathieu Choiniere', 'MID'),
  ('Ali Ahmed', 'MID'),
  ('Nathan Saliba', 'MID'),
  ('Liam Millar', 'MID'),
  ('Jacob Shaffelburg', 'MID'),
  ('Jonathan Osorio', 'MID'),
  ('Jonathan David', 'FWD'),
  ('Cyle Larin', 'FWD'),
  ('Tani Oluwaseyi', 'FWD'),
  ('Promise David', 'FWD')
) AS v(name, position)
WHERE t.code = 'CAN';

-- Bosnia y Herzegovina (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Nikola Vasilj', 'GK'),
  ('Martin Zlomislic', 'GK'),
  ('Osman Hadzikic', 'GK'),
  ('Sead Kolasinac', 'DEF'),
  ('Amar Dedic', 'DEF'),
  ('Nihad Mujakic', 'DEF'),
  ('Nikola Katic', 'DEF'),
  ('Tarik Muharemovic', 'DEF'),
  ('Stjepan Radeljic', 'DEF'),
  ('Dennis Hadzikadunic', 'DEF'),
  ('Nidal Celik', 'DEF'),
  ('Amir Hadziahmetovic', 'MID'),
  ('Ivan Sunjic', 'MID'),
  ('Ivan Basic', 'MID'),
  ('Dzenis Burnic', 'MID'),
  ('Ermin Mahmic', 'MID'),
  ('Benjamin Tahirovic', 'MID'),
  ('Amar Memic', 'MID'),
  ('Armin Gigovic', 'MID'),
  ('Kerim Alajbegovic', 'MID'),
  ('Esmir Bajraktarevic', 'MID'),
  ('Ermedin Demirovic', 'FWD'),
  ('Jovo Lukic', 'FWD'),
  ('Samed Bazdar', 'FWD'),
  ('Haris Tabakovic', 'FWD'),
  ('Edin Dzeko', 'FWD')
) AS v(name, position)
WHERE t.code = 'BIH';

-- Catar (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Salah Zakaria', 'GK'),
  ('Mahmoud Abunada', 'GK'),
  ('Meshaal Barsham', 'GK'),
  ('Hashmi Hussein', 'DEF'),
  ('Ayoub Alawi', 'DEF'),
  ('Boualem Khoukhi', 'DEF'),
  ('Pedro Miguel', 'DEF'),
  ('Issa Laaye', 'DEF'),
  ('Lucas Mendes', 'DEF'),
  ('Sultan Al-Brake', 'DEF'),
  ('Homam Al-Amin', 'DEF'),
  ('Mohammed Al-Manai', 'MID'),
  ('Jassem Jaber', 'MID'),
  ('Karim Boudiaf', 'MID'),
  ('Ahmed Fathi', 'MID'),
  ('Abdulaziz Hatem', 'MID'),
  ('Assim Madibo', 'MID'),
  ('Tahseen Mohammed', 'FWD'),
  ('Edmilson Junior', 'FWD'),
  ('Almoez Ali', 'FWD'),
  ('Akram Afif', 'FWD'),
  ('Mohammed Muntari', 'FWD'),
  ('Youssef Abdulrazzaq', 'FWD'),
  ('Ahmed Alaa', 'FWD'),
  ('Hassan Al-Haydos', 'FWD'),
  ('Ahmed Al-Janahi', 'FWD')
) AS v(name, position)
WHERE t.code = 'QAT';

-- Suiza (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Marvin Keller', 'GK'),
  ('Gregor Kobel', 'GK'),
  ('Yvon Mvogo', 'GK'),
  ('Manuel Akanji', 'DEF'),
  ('Aurele Amenda', 'DEF'),
  ('Eray Comert', 'DEF'),
  ('Nico Elvedi', 'DEF'),
  ('Luca Jaquez', 'DEF'),
  ('Miro Muheim', 'DEF'),
  ('Ricardo Rodriguez', 'DEF'),
  ('Silvan Widmer', 'DEF'),
  ('Michel Aebischer', 'MID'),
  ('Christian Fassnacht', 'MID'),
  ('Remo Freuler', 'MID'),
  ('Ardon Jashari', 'MID'),
  ('Johan Manzambi', 'MID'),
  ('Fabian Rieder', 'MID'),
  ('Djibril Sow', 'MID'),
  ('Ruben Vargas', 'MID'),
  ('Granit Xhaka', 'MID'),
  ('Denis Zakaria', 'MID'),
  ('Zeki Amdouni', 'FWD'),
  ('Breel Embolo', 'FWD'),
  ('Cedric Itten', 'FWD'),
  ('Dan Ndoye', 'FWD'),
  ('Noah Okafor', 'FWD')
) AS v(name, position)
WHERE t.code = 'SUI';

-- ===== GRUPO C =====

-- Brasil (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Alisson', 'GK'),
  ('Ederson', 'GK'),
  ('Weverton', 'GK'),
  ('Alex Sandro', 'DEF'),
  ('Bremer', 'DEF'),
  ('Danilo', 'DEF'),
  ('Douglas Santos', 'DEF'),
  ('Gabriel Magalhaes', 'DEF'),
  ('Ibanez', 'DEF'),
  ('Leo Pereira', 'DEF'),
  ('Marquinhos', 'DEF'),
  ('Wesley', 'DEF'),
  ('Bruno Guimaraes', 'MID'),
  ('Casemiro', 'MID'),
  ('Danilo Santos', 'MID'),
  ('Fabinho', 'MID'),
  ('Lucas Paqueta', 'MID'),
  ('Endrick', 'FWD'),
  ('Gabriel Martinelli', 'FWD'),
  ('Igor Thiago', 'FWD'),
  ('Luiz Henrique', 'FWD'),
  ('Matheus Cunha', 'FWD'),
  ('Neymar', 'FWD'),
  ('Raphinha', 'FWD'),
  ('Rayan', 'FWD'),
  ('Vinicius Jr.', 'FWD')
) AS v(name, position)
WHERE t.code = 'BRA';

-- Marruecos (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Yassine Bounou', 'GK'),
  ('Munir El Kajoui', 'GK'),
  ('Ahmed Reda Tagnaouti', 'GK'),
  ('Nayef Aguerd', 'DEF'),
  ('Youssef Belammari', 'DEF'),
  ('Issa Diop', 'DEF'),
  ('Zakaria El Ouahdi', 'DEF'),
  ('Achraf Hakimi', 'DEF'),
  ('Redouane Halhal', 'DEF'),
  ('Noussair Mazraoui', 'DEF'),
  ('Chadi Riad', 'DEF'),
  ('Anass Salah-Eddine', 'DEF'),
  ('Sofyan Amrabat', 'MID'),
  ('Ayyoub Bouaddi', 'MID'),
  ('Neil El Aynaoui', 'MID'),
  ('Bilal El Khannouss', 'MID'),
  ('Samir El Mourabet', 'MID'),
  ('Azzedine Ounahi', 'MID'),
  ('Ismael Saibari', 'MID'),
  ('Ayoube Amaimouni', 'FWD'),
  ('Brahim Diaz', 'FWD'),
  ('Ayoub El Kaabi', 'FWD'),
  ('Abdessamad Ezzalzouli', 'FWD'),
  ('Yassine Gessime', 'FWD'),
  ('Soufiane Rahimi', 'FWD'),
  ('Chemsdine Talbi', 'FWD')
) AS v(name, position)
WHERE t.code = 'MAR';

-- Haití (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Johnny Placide', 'GK'),
  ('Alexandre Pierre', 'GK'),
  ('Josue Duverger', 'GK'),
  ('Carlens Arcus', 'DEF'),
  ('Wilguens Pauguain', 'DEF'),
  ('Duke Lacroix', 'DEF'),
  ('Martin Experience', 'DEF'),
  ('Jean-Kevin Duverne', 'DEF'),
  ('Ricardo Ade', 'DEF'),
  ('Hannes Delcroix', 'DEF'),
  ('Keeto Thermoncy', 'DEF'),
  ('Leverton Pierre', 'MID'),
  ('Carl-Fred Sainthe', 'MID'),
  ('Jean-Jacques Danley', 'MID'),
  ('Jean-Ricner Bellegarde', 'MID'),
  ('Pierre Woodenski', 'MID'),
  ('Dominique Simon', 'MID'),
  ('Louicius Deedson', 'FWD'),
  ('Ruben Providence', 'FWD'),
  ('Josue Casimir', 'FWD'),
  ('Derrick Etienne', 'FWD'),
  ('Wilson Isidor', 'FWD'),
  ('Duckens Nazon', 'FWD'),
  ('Frantzdy Pierrot', 'FWD'),
  ('Yassin Fortune', 'FWD'),
  ('Lenny Joseph', 'FWD')
) AS v(name, position)
WHERE t.code = 'HAI';

-- Escocia (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Craig Gordon', 'GK'),
  ('Angus Gunn', 'GK'),
  ('Liam Kelly', 'GK'),
  ('Grant Hanley', 'DEF'),
  ('Jack Hendry', 'DEF'),
  ('Aaron Hickey', 'DEF'),
  ('Dom Hyam', 'DEF'),
  ('Scott McKenna', 'DEF'),
  ('Nathan Patterson', 'DEF'),
  ('Anthony Ralston', 'DEF'),
  ('Andy Robertson', 'DEF'),
  ('John Souttar', 'DEF'),
  ('Kieran Tierney', 'DEF'),
  ('Ryan Christie', 'MID'),
  ('Finlay Curtis', 'MID'),
  ('Lewis Ferguson', 'MID'),
  ('Ben Gannon-Doak', 'MID'),
  ('Tyler Fletcher', 'MID'),
  ('John McGinn', 'MID'),
  ('Kenny McLean', 'MID'),
  ('Scott McTominay', 'MID'),
  ('Che Adams', 'FWD'),
  ('Lyndon Dykes', 'FWD'),
  ('George Hirst', 'FWD'),
  ('Lawrence Shankland', 'FWD'),
  ('Ross Stewart', 'FWD')
) AS v(name, position)
WHERE t.code = 'SCO';

-- ===== GRUPO D =====

-- Estados Unidos (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Chris Brady', 'GK'),
  ('Matt Freese', 'GK'),
  ('Matt Turner', 'GK'),
  ('Max Arfsten', 'DEF'),
  ('Sergino Dest', 'DEF'),
  ('Alex Freeman', 'DEF'),
  ('Mark McKenzie', 'DEF'),
  ('Tim Ream', 'DEF'),
  ('Chris Richards', 'DEF'),
  ('Antonee Robinson', 'DEF'),
  ('Miles Robinson', 'DEF'),
  ('Joe Scally', 'DEF'),
  ('Auston Trusty', 'DEF'),
  ('Tyler Adams', 'MID'),
  ('Sebastian Berhalter', 'MID'),
  ('Weston McKennie', 'MID'),
  ('Cristian Roldan', 'MID'),
  ('Brenden Aaronson', 'MID'),
  ('Christian Pulisic', 'MID'),
  ('Gio Reyna', 'MID'),
  ('Malik Tillman', 'MID'),
  ('Tim Weah', 'MID'),
  ('Alejandro Zendejas', 'MID'),
  ('Folarin Balogun', 'FWD'),
  ('Ricardo Pepi', 'FWD'),
  ('Haji Wright', 'FWD')
) AS v(name, position)
WHERE t.code = 'USA';

-- Paraguay (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Roberto Junior Fernández', 'GK'),
  ('Orlando Gill', 'GK'),
  ('Gastón Olveira', 'GK'),
  ('Omar Alderete', 'DEF'),
  ('Junior Alonso', 'DEF'),
  ('Fabián Balbuena', 'DEF'),
  ('Juan José Cáceres', 'DEF'),
  ('José Canale', 'DEF'),
  ('Gustavo Gómez', 'DEF'),
  ('Alexandro Maidana', 'DEF'),
  ('Gustavo Velázquez', 'DEF'),
  ('Damián Bobadilla', 'MID'),
  ('Gustavo Caballero', 'MID'),
  ('Andrés Cubas', 'MID'),
  ('Matías Galarza', 'MID'),
  ('Diego Gómez', 'MID'),
  ('Mauricio Magalhaes', 'MID'),
  ('Briaian Ojeda', 'MID'),
  ('Alejandro Romero', 'MID'),
  ('Miguel Almirón', 'FWD'),
  ('Gabriel Ávalos', 'FWD'),
  ('Alex Arce', 'FWD'),
  ('Julio Enciso', 'FWD'),
  ('Isidro Pitta', 'FWD'),
  ('Antonio Sanabria', 'FWD'),
  ('Ramón Sosa', 'FWD')
) AS v(name, position)
WHERE t.code = 'PAR';

-- Australia (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Mat Ryan', 'GK'),
  ('Paul Izzo', 'GK'),
  ('Patrick Beach', 'GK'),
  ('Aziz Behich', 'DEF'),
  ('Jordan Bos', 'DEF'),
  ('Cameron Burgess', 'DEF'),
  ('Alessandro Circati', 'DEF'),
  ('Milos Degenek', 'DEF'),
  ('Jason Geria', 'DEF'),
  ('Lucas Herrington', 'DEF'),
  ('Jacob Italiano', 'DEF'),
  ('Harry Souttar', 'DEF'),
  ('Kai Trewin', 'DEF'),
  ('Cammy Devlin', 'MID'),
  ('Ajdin Hrustic', 'MID'),
  ('Jackson Irvine', 'MID'),
  ('Connor Metcalfe', 'MID'),
  ('Paul Okon-Englster', 'MID'),
  ('Aiden O''Neill', 'MID'),
  ('Nestory Irankunda', 'FWD'),
  ('Mathew Leckie', 'FWD'),
  ('Awer Mabil', 'FWD'),
  ('Mohamed Toure', 'FWD'),
  ('Nishan Velupilly', 'FWD'),
  ('Cristian Volpato', 'FWD'),
  ('Tete Yengi', 'FWD')
) AS v(name, position)
WHERE t.code = 'AUS';

-- Turquía (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Altay Bayindir', 'GK'),
  ('Mert Gunok', 'GK'),
  ('Ugurcan Cakir', 'GK'),
  ('Abdulkerim Bardakci', 'DEF'),
  ('Caglar Soyuncu', 'DEF'),
  ('Eren Elmali', 'DEF'),
  ('Ferdi Kadioglu', 'DEF'),
  ('Merih Demiral', 'DEF'),
  ('Mert Muldur', 'DEF'),
  ('Ozan Kabak', 'DEF'),
  ('Samet Akaydin', 'DEF'),
  ('Zeki Celik', 'DEF'),
  ('Hakan Çalhanoğlu', 'MID'),
  ('Ismail Yuksek', 'MID'),
  ('Kaan Ayhan', 'MID'),
  ('Orkun Kokcu', 'MID'),
  ('Salih Ozcan', 'MID'),
  ('Arda Güler', 'FWD'),
  ('Baris Alper Yilmaz', 'FWD'),
  ('Can Uzun', 'FWD'),
  ('Deniz Gul', 'FWD'),
  ('Irfan Can Kahveci', 'FWD'),
  ('Kenan Yildiz', 'FWD'),
  ('Kerem Akturkoglu', 'FWD'),
  ('Oguz Aydin', 'FWD'),
  ('Yunus Akgun', 'FWD')
) AS v(name, position)
WHERE t.code = 'TUR';

-- ===== GRUPO E =====

-- Alemania (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Oliver Baumann', 'GK'),
  ('Manuel Neuer', 'GK'),
  ('Alexander Nübel', 'GK'),
  ('Joshua Kimmich', 'DEF'),
  ('Nico Schlotterbeck', 'DEF'),
  ('Nathaniel Brown', 'DEF'),
  ('David Raum', 'DEF'),
  ('Waldemar Anton', 'DEF'),
  ('Antonio Rudiger', 'DEF'),
  ('Malick Thiaw', 'DEF'),
  ('Jonathan Tah', 'DEF'),
  ('Jamal Musiala', 'MID'),
  ('Jamie Leweling', 'MID'),
  ('Aleksandar Pavlovic', 'MID'),
  ('Nadiem Amiri', 'MID'),
  ('Felix Nmecha', 'MID'),
  ('Angelo Stiller', 'MID'),
  ('Leon Goretzka', 'MID'),
  ('Pascal Gross', 'MID'),
  ('Kai Havertz', 'FWD'),
  ('Deniz Undav', 'FWD'),
  ('Maximilian Beier', 'FWD'),
  ('Florian Wirtz', 'FWD'),
  ('Nick Woltemade', 'FWD'),
  ('Lennart Karl', 'FWD'),
  ('Leroy Sane', 'FWD')
) AS v(name, position)
WHERE t.code = 'GER';

-- Curazao (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Tyrick Bodak', 'GK'),
  ('Trevor Doornbusch', 'GK'),
  ('Eloy Room', 'GK'),
  ('Riechedly Bazoer', 'DEF'),
  ('Joshua Brenet', 'DEF'),
  ('Roshon Van Eijma', 'DEF'),
  ('Sherel Floranus', 'DEF'),
  ('Deveron Fonville', 'DEF'),
  ('Jurien Gaari', 'DEF'),
  ('Armando Obispo', 'DEF'),
  ('Shurandy Sambo', 'DEF'),
  ('Juninho Bacuna', 'MID'),
  ('Leandro Bacuna', 'MID'),
  ('Livano Comenencia', 'MID'),
  ('Kevin Felida', 'MID'),
  ('Ar''Jany Martha', 'MID'),
  ('Tyrese Noslin', 'MID'),
  ('Godfried Roemeratoe', 'MID'),
  ('Jeremy Antonisse', 'FWD'),
  ('Tahith Chong', 'FWD'),
  ('Kenji Gorre', 'FWD'),
  ('Sontje Hansen', 'FWD'),
  ('Gervane Kastaneer', 'FWD'),
  ('Brandley Kuwas', 'FWD'),
  ('Jurgen Locadia', 'FWD'),
  ('Jearl Margaritha', 'FWD')
) AS v(name, position)
WHERE t.code = 'CUW';

-- Costa de Marfil (26) — "Wilfried" figura así (incompleto) en la fuente
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Yahia Fofana', 'GK'),
  ('Mohamed Kone', 'GK'),
  ('Alban Lafont', 'GK'),
  ('Emmanuel Agbadou', 'DEF'),
  ('Clement Akpa', 'DEF'),
  ('Ousmane Diomande', 'DEF'),
  ('Guela Doue', 'DEF'),
  ('Ghislain Konan', 'DEF'),
  ('Odilon Kossonou', 'DEF'),
  ('Evan Ndicka', 'DEF'),
  ('Wilfried', 'DEF'),
  ('Seko Fofana', 'MID'),
  ('Parfait Guiagon', 'MID'),
  ('Franck Kessie', 'MID'),
  ('Christ Oulai', 'MID'),
  ('Ibrahim Sangare', 'MID'),
  ('Jean-Michael Seri', 'MID'),
  ('Simon Adingra', 'FWD'),
  ('Ange-Yoan Bonny', 'FWD'),
  ('Amad Diallo', 'FWD'),
  ('Oumar Diakite', 'FWD'),
  ('Yan Diomande', 'FWD'),
  ('Evann Guessand', 'FWD'),
  ('Nicolas Pepe', 'FWD'),
  ('Bazoumana Touré', 'FWD'),
  ('Elye Wahi', 'FWD')
) AS v(name, position)
WHERE t.code = 'CIV';

-- Ecuador (23)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Hernan Galindez', 'GK'),
  ('Moises Ramirez', 'GK'),
  ('Gonzalo Valle', 'GK'),
  ('Piero Hincapié', 'DEF'),
  ('Willian Pacho', 'DEF'),
  ('Pervis Estupinan', 'DEF'),
  ('Felix Torres', 'DEF'),
  ('Joel Ordonez', 'DEF'),
  ('Jackson Porozo', 'DEF'),
  ('Angelo Preciado', 'DEF'),
  ('Moisés Caicedo', 'MID'),
  ('Alan Franco', 'MID'),
  ('Kendry Paez', 'MID'),
  ('Pedro Vite', 'MID'),
  ('Jordy Alcivar', 'MID'),
  ('Denil Castillo', 'MID'),
  ('Yaimar Medina', 'MID'),
  ('Enner Valencia', 'FWD'),
  ('Kevin Rodríguez', 'FWD'),
  ('Jordy Caicedo', 'FWD'),
  ('Nilson Angulo', 'FWD'),
  ('Anthony Valencia', 'FWD'),
  ('Jeremy Arévalo', 'FWD')
) AS v(name, position)
WHERE t.code = 'ECU';

-- ===== GRUPO F =====

-- Países Bajos (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Mark Flekken', 'GK'),
  ('Robin Roefs', 'GK'),
  ('Bart Verbruggen', 'GK'),
  ('Nathan Ake', 'DEF'),
  ('Denzel Dumfries', 'DEF'),
  ('Jorrel Hato', 'DEF'),
  ('Jurrien Timber', 'DEF'),
  ('Micky van de Ven', 'DEF'),
  ('Virgil van Dijk', 'DEF'),
  ('Jan Paul van Hecke', 'DEF'),
  ('Frenkie de Jong', 'MID'),
  ('Marten de Roon', 'MID'),
  ('Ryan Gravenberch', 'MID'),
  ('Justin Kluivert', 'MID'),
  ('Teun Koopmeiners', 'MID'),
  ('Tijjani Reijnders', 'MID'),
  ('Guus Til', 'MID'),
  ('Quinten Timber', 'MID'),
  ('Mats Wieffer', 'MID'),
  ('Brian Brobbey', 'FWD'),
  ('Memphis Depay', 'FWD'),
  ('Cody Gakpo', 'FWD'),
  ('Noa Lang', 'FWD'),
  ('Donyell Malen', 'FWD'),
  ('Crysencio Summerville', 'FWD'),
  ('Wout Weghorst', 'FWD')
) AS v(name, position)
WHERE t.code = 'NED';

-- Japón (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Tomoki Hayakawa', 'GK'),
  ('Keisuke Osako', 'GK'),
  ('Aya Suzuka', 'GK'),
  ('Yuto Nagatomo', 'DEF'),
  ('Shogo Taniguchi', 'DEF'),
  ('Ko Itakura', 'DEF'),
  ('Tsuyoshi Watanabe', 'DEF'),
  ('Takehiro Tomiyasu', 'DEF'),
  ('Hiroki Ito', 'DEF'),
  ('Ayumu Seko', 'DEF'),
  ('Yukinari Sugawara', 'DEF'),
  ('Junosuke Suzuki', 'DEF'),
  ('Wataru Endo', 'MID'),
  ('Junya Ito', 'MID'),
  ('Daichi Kamada', 'MID'),
  ('Koki Ogawa', 'MID'),
  ('Daizen Maeda', 'MID'),
  ('Ritsu Doan', 'MID'),
  ('Ao Tanaka', 'MID'),
  ('Kaishu Sano', 'MID'),
  ('Takefusa Kubo', 'MID'),
  ('Ayase Ueda', 'FWD'),
  ('Keito Nakamura', 'FWD'),
  ('Ito Suzuki', 'FWD'),
  ('Kento Shiode', 'FWD'),
  ('Keisuke Goto', 'FWD')
) AS v(name, position)
WHERE t.code = 'JPN';

-- Suecia (26) — la fuente listaba a los atacantes como
-- centrocampistas; se corrigió la posición de los delanteros inequívocos
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Kristoffer Nordfeldt', 'GK'),
  ('Viktor Johansson', 'GK'),
  ('Jacob Widell Zetterstrom', 'GK'),
  ('Daniel Svensson', 'DEF'),
  ('Victor Lindelof', 'DEF'),
  ('Isak Hien', 'DEF'),
  ('Carl Starfelt', 'DEF'),
  ('Elliot Stroud', 'DEF'),
  ('Gustaf Lagerbielke', 'DEF'),
  ('Gabriel Gudmundsson', 'DEF'),
  ('Herman Johansson', 'DEF'),
  ('Hjalmar Ekdal', 'DEF'),
  ('Erik Smith', 'DEF'),
  ('Taha Ali', 'MID'),
  ('Yasin Ayari', 'MID'),
  ('Lucas Bergvall', 'MID'),
  ('Anthony Elanga', 'FWD'),
  ('Viktor Gyokeres', 'FWD'),
  ('Jesper Karlstrom', 'MID'),
  ('Gustaf Nilsson', 'FWD'),
  ('Benjamin Nygren', 'MID'),
  ('Mattias Svanberg', 'MID'),
  ('Besfort Zeneli', 'MID'),
  ('Alexander Isak', 'FWD'),
  ('Alexander Bernhardsson', 'MID'),
  ('Ken Sema', 'MID')
) AS v(name, position)
WHERE t.code = 'SWE';

-- Túnez (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Sabri Ben Hessen', 'GK'),
  ('Abdelmouhib Chamakh', 'GK'),
  ('Aymen Dahman', 'GK'),
  ('Ali Abdi', 'DEF'),
  ('Adem Arous', 'DEF'),
  ('Mohamed Amine Ben Hamida', 'DEF'),
  ('Dylan Bronn', 'DEF'),
  ('Raed Chikhaoui', 'DEF'),
  ('Moutaz Neffati', 'DEF'),
  ('Omar Rekik', 'DEF'),
  ('Montassar Talbi', 'DEF'),
  ('Yan Valery', 'DEF'),
  ('Mortadha Ben Ouanes', 'MID'),
  ('Anis Ben Slimane', 'MID'),
  ('Ismael Gharbi', 'MID'),
  ('Rani Khedira', 'MID'),
  ('Mohamed Hadj Mahmoud', 'MID'),
  ('Hannibal Mejbri', 'MID'),
  ('Ellyes Skhiri', 'MID'),
  ('Elias Achouri', 'FWD'),
  ('Khalil Ayari', 'FWD'),
  ('Firas Chaouat', 'FWD'),
  ('Rayan Elloumi', 'FWD'),
  ('Hazem Mastouri', 'FWD'),
  ('Elias Saad', 'FWD'),
  ('Sebastian Tounekti', 'FWD')
) AS v(name, position)
WHERE t.code = 'TUN';

-- ===== GRUPO G =====

-- Bélgica (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Thibaut Courtois', 'GK'),
  ('Senne Lammens', 'GK'),
  ('Mike Penders', 'GK'),
  ('Timothy Castagne', 'DEF'),
  ('Zeno Debast', 'DEF'),
  ('Maxim De Cuyper', 'DEF'),
  ('Koni De Winter', 'DEF'),
  ('Brandon Mechele', 'DEF'),
  ('Thomas Meunier', 'DEF'),
  ('Nathan Ngoy', 'DEF'),
  ('Joaquin Seys', 'DEF'),
  ('Arthur Theate', 'DEF'),
  ('Kevin De Bruyne', 'MID'),
  ('Amadou Onana', 'MID'),
  ('Nicolas Raskin', 'MID'),
  ('Youri Tielemans', 'MID'),
  ('Hans Vanaken', 'MID'),
  ('Axel Witsel', 'MID'),
  ('Charles De Ketelaere', 'FWD'),
  ('Jeremy Doku', 'FWD'),
  ('Matias Fernandez-Pardo', 'FWD'),
  ('Romelu Lukaku', 'FWD'),
  ('Dodi Lukebakio', 'FWD'),
  ('Diego Moreira', 'FWD'),
  ('Alexis Saelemaekers', 'FWD'),
  ('Leandro Trossard', 'FWD')
) AS v(name, position)
WHERE t.code = 'BEL';

-- Egipto (27 — la fuente lista 27 jugadores)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Mohamed El Shenawy', 'GK'),
  ('Mostafa Shobeir', 'GK'),
  ('El Mahdi Soliman', 'GK'),
  ('Mohamed Alaa', 'GK'),
  ('Mohamed Hany', 'DEF'),
  ('Tarek Alaa', 'DEF'),
  ('Hamdy Fathy', 'DEF'),
  ('Rami Rabia', 'DEF'),
  ('Yasser Ibrahim', 'DEF'),
  ('Hossam Abdelmaguid', 'DEF'),
  ('Mohamed Abdelmonem', 'DEF'),
  ('Ahmed Fatouh', 'DEF'),
  ('Karim Hafez', 'DEF'),
  ('Marwan Ateya', 'MID'),
  ('Mohanad Lasheen', 'MID'),
  ('Nabil Emad', 'MID'),
  ('Mahmoud Saber', 'MID'),
  ('Ahmed Zizo', 'MID'),
  ('Emam Ashour', 'MID'),
  ('Mostafa Ziko', 'MID'),
  ('Mahmoud Trezeguet', 'MID'),
  ('Ibrahim Adel', 'MID'),
  ('Haissem Hassan', 'MID'),
  ('Omar Marmoush', 'FWD'),
  ('Mohamed Salah', 'FWD'),
  ('Aqtay Abdallah', 'FWD'),
  ('Hamza Abdelkarim', 'FWD')
) AS v(name, position)
WHERE t.code = 'EGY';

-- Irán (27 — la fuente lista 27 jugadores)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Alireza Beiranvand', 'GK'),
  ('Hossein Hosseini', 'GK'),
  ('Payam Niazmand', 'GK'),
  ('Danial Eiri', 'DEF'),
  ('Ehsan Hajsafi', 'DEF'),
  ('Saleh Hardani', 'DEF'),
  ('Hossein Kanaani', 'DEF'),
  ('Shoja Khalilzadeh', 'DEF'),
  ('Milad Mohammadi', 'DEF'),
  ('Ali Nemati', 'DEF'),
  ('Omid Noorafkan', 'DEF'),
  ('Ramin Rezaeian', 'DEF'),
  ('Rouzbeh Cheshmi', 'MID'),
  ('Saeid Ezatolahi', 'MID'),
  ('Mehdi Ghaedi', 'MID'),
  ('Saman Ghoddos', 'MID'),
  ('Mohammad Ghorbani', 'MID'),
  ('Alireza Jahanbakhsh', 'MID'),
  ('Mohammad Mohebi', 'MID'),
  ('Amir Mohammad Razzaghinia', 'MID'),
  ('Mehdi Torabi', 'MID'),
  ('Aria Yousefi', 'MID'),
  ('Ali Alipour', 'FWD'),
  ('Dennis Dargahi', 'FWD'),
  ('Amirhossein Hosseinzadeh', 'FWD'),
  ('Shahriyar Moghanlou', 'FWD'),
  ('Mehdi Taremi', 'FWD')
) AS v(name, position)
WHERE t.code = 'IRN';

-- Nueva Zelanda (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Max Crocombe', 'GK'),
  ('Alex Paulsen', 'GK'),
  ('Michael Woud', 'GK'),
  ('Tim Payne', 'DEF'),
  ('Francis De Vries', 'DEF'),
  ('Tyler Bindon', 'DEF'),
  ('Michael Boxall', 'DEF'),
  ('Liberato Cacace', 'DEF'),
  ('Nando Pijnaker', 'DEF'),
  ('Finn Surman', 'DEF'),
  ('Callan Elliot', 'DEF'),
  ('Tommy Smith', 'DEF'),
  ('Joe Bell', 'MID'),
  ('Marko Stamenic', 'MID'),
  ('Alex Rufer', 'MID'),
  ('Ryan Thomas', 'MID'),
  ('Lachlan Bayliss', 'MID'),
  ('Matt Garbett', 'FWD'),
  ('Chris Wood', 'FWD'),
  ('Sarpreet Singh', 'FWD'),
  ('Eli Just', 'FWD'),
  ('Kosta Barbarouses', 'FWD'),
  ('Ben Waine', 'FWD'),
  ('Ben Old', 'FWD'),
  ('Callum McCowatt', 'FWD'),
  ('Jesse Randall', 'FWD')
) AS v(name, position)
WHERE t.code = 'NZL';

-- ===== GRUPO H =====

-- España (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Unai Simon', 'GK'),
  ('David Raya', 'GK'),
  ('Joan Garcia', 'GK'),
  ('Pedro Porro', 'DEF'),
  ('Marcos Llorente', 'DEF'),
  ('Pau Cubarsi', 'DEF'),
  ('Marc Pubill', 'DEF'),
  ('Aymeric Laporte', 'DEF'),
  ('Eric García', 'DEF'),
  ('Alejandro Grimaldo', 'DEF'),
  ('Marc Cucurella', 'DEF'),
  ('Rodri', 'MID'),
  ('Martín Zubimendi', 'MID'),
  ('Gavi', 'MID'),
  ('Dani Olmo', 'MID'),
  ('Pedri', 'MID'),
  ('Fabian Ruiz', 'MID'),
  ('Mikel Merino', 'MID'),
  ('Alex Baena', 'MID'),
  ('Lamine Yamal', 'FWD'),
  ('Ferran Torres', 'FWD'),
  ('Yeremy Pino', 'FWD'),
  ('Nico Williams', 'FWD'),
  ('Víctor Munoz', 'FWD'),
  ('Mikel Oyarzabal', 'FWD'),
  ('Borja Iglesias', 'FWD')
) AS v(name, position)
WHERE t.code = 'ESP';

-- Cabo Verde (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Vozinha', 'GK'),
  ('Marcio Rosa', 'GK'),
  ('CJ dos Santos', 'GK'),
  ('Stopira', 'DEF'),
  ('Roberto Lopes', 'DEF'),
  ('Joao Paulo', 'DEF'),
  ('Diney', 'DEF'),
  ('Logan Costa', 'DEF'),
  ('Steven Moreira', 'DEF'),
  ('Wagner Pina', 'DEF'),
  ('Sidny Lopes Cabral', 'DEF'),
  ('Kelvin Pires', 'DEF'),
  ('Jamiro Monteiro', 'MID'),
  ('Kevin Pina', 'MID'),
  ('Deroy Duarte', 'MID'),
  ('Telmo Arcanjo', 'MID'),
  ('Laros Duarte', 'MID'),
  ('Yannick Semedo', 'MID'),
  ('Ryan Mendes', 'FWD'),
  ('Garry Rodrigues', 'FWD'),
  ('Willy Semedo', 'FWD'),
  ('Jovane Cabral', 'FWD'),
  ('Gilson Tavares', 'FWD'),
  ('Dailon Livramento', 'FWD'),
  ('Helio Varela', 'FWD'),
  ('Nuno da Costa', 'FWD')
) AS v(name, position)
WHERE t.code = 'CPV';

-- Arabia Saudita (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Mohammed Al-Owais', 'GK'),
  ('Nawaf Al-Aqidi', 'GK'),
  ('Ahmed Al-Kassar', 'GK'),
  ('Abdulelah Al-Amri', 'DEF'),
  ('Hassan Tambakti', 'DEF'),
  ('Jehad Thikri', 'DEF'),
  ('Ali Lajami', 'DEF'),
  ('Hassan Kadesh', 'DEF'),
  ('Saud Abdulhamid', 'DEF'),
  ('Mohammed Abu Al-Shamat', 'DEF'),
  ('Ali Majrashi', 'DEF'),
  ('Moteb Al-Harbi', 'DEF'),
  ('Nawaf Boushal', 'DEF'),
  ('Sultan Al-Ghannam', 'DEF'),
  ('Mohammed Kanno', 'MID'),
  ('Abdullah Al-Khaibari', 'MID'),
  ('Ziyad Al-Johani', 'MID'),
  ('Nasser Al-Dawsari', 'MID'),
  ('Musab Al-Juwayr', 'MID'),
  ('Alaa Al-Hajji', 'MID'),
  ('Salem Al-Dawsari', 'MID'),
  ('Khalid Al-Ghannam', 'MID'),
  ('Ayman Yahya', 'MID'),
  ('Firas Al-Buraikan', 'FWD'),
  ('Saleh Al-Shehri', 'FWD'),
  ('Abdullah Al-Hamdan', 'FWD')
) AS v(name, position)
WHERE t.code = 'KSA';

-- Uruguay (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Sergio Rochet', 'GK'),
  ('Fernando Muslera', 'GK'),
  ('Santiago Mele', 'GK'),
  ('Guillermo Varela', 'DEF'),
  ('Ronald Araujo', 'DEF'),
  ('Jose María Giménez', 'DEF'),
  ('Santiago Bueno', 'DEF'),
  ('Sebastián Cáceres', 'DEF'),
  ('Mathías Olivera', 'DEF'),
  ('Joaquin Piquerez', 'DEF'),
  ('Matias Vina', 'DEF'),
  ('Manuel Ugarte', 'MID'),
  ('Emiliano Martínez', 'MID'),
  ('Rodrigo Bentancur', 'MID'),
  ('Federico Valverde', 'MID'),
  ('Agustín Canobbio', 'MID'),
  ('Juan Manuel Sanabria', 'MID'),
  ('Giorgian de Arrascaeta', 'MID'),
  ('Nicolás de la Cruz', 'MID'),
  ('Rodrigo Zalazar', 'MID'),
  ('Facundo Pellistri', 'MID'),
  ('Maximiliano Araujo', 'MID'),
  ('Brian Rodríguez', 'MID'),
  ('Rodrigo Aguirre', 'FWD'),
  ('Federico Vinas', 'FWD'),
  ('Darwin Núñez', 'FWD')
) AS v(name, position)
WHERE t.code = 'URU';

-- ===== GRUPO I =====

-- Francia (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Mike Maignan', 'GK'),
  ('Robin Risser', 'GK'),
  ('Brice Samba', 'GK'),
  ('Lucas Digne', 'DEF'),
  ('Malo Gusto', 'DEF'),
  ('Lucas Hernandez', 'DEF'),
  ('Theo Hernandez', 'DEF'),
  ('Ibrahima Konate', 'DEF'),
  ('Maxence Lacroix', 'DEF'),
  ('Jules Kounde', 'DEF'),
  ('William Saliba', 'DEF'),
  ('Dayot Upamecano', 'DEF'),
  ('N''Golo Kante', 'MID'),
  ('Manu Kone', 'MID'),
  ('Adrien Rabiot', 'MID'),
  ('Aurelien Tchouameni', 'MID'),
  ('Warren Zaire-Emery', 'MID'),
  ('Maghnes Akliouche', 'FWD'),
  ('Bradley Barcola', 'FWD'),
  ('Rayan Cherki', 'FWD'),
  ('Ousmane Dembele', 'FWD'),
  ('Desire Doue', 'FWD'),
  ('Michael Olise', 'FWD'),
  ('Kylian Mbappe', 'FWD'),
  ('Jean-Phillipe Mateta', 'FWD'),
  ('Marcus Thuram', 'FWD')
) AS v(name, position)
WHERE t.code = 'FRA';

-- Senegal (28 — la fuente lista 28 jugadores)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Edouard Mendy', 'GK'),
  ('Yehvann Diouf', 'GK'),
  ('Mory Diaw', 'GK'),
  ('Krepin Diatta', 'DEF'),
  ('Antoine Mendy', 'DEF'),
  ('Abdoulaye Seck', 'DEF'),
  ('Kalidou Koulibaly', 'DEF'),
  ('Ilay Camara', 'DEF'),
  ('Moussa Niakhate', 'DEF'),
  ('Mamadou Sarr', 'DEF'),
  ('El-Hadji Malick Diouf', 'DEF'),
  ('Moustapha Mbow', 'DEF'),
  ('Ismail Jakobs', 'DEF'),
  ('Idrissa Gueye', 'MID'),
  ('Habib Diarra', 'MID'),
  ('Pape Matar Sarr', 'MID'),
  ('Pape Gueye', 'MID'),
  ('Lamine Camara', 'MID'),
  ('Pathe Ciss', 'MID'),
  ('Bara Ndiaye', 'MID'),
  ('Sadio Mane', 'FWD'),
  ('Bamba Dieng', 'FWD'),
  ('Iliman Ndiaye', 'FWD'),
  ('Nicolas Jackson', 'FWD'),
  ('Assane Diao', 'FWD'),
  ('Ibrahim Mbaye', 'FWD'),
  ('Cherif Ndiaye', 'FWD'),
  ('Ismaila Sarr', 'FWD')
) AS v(name, position)
WHERE t.code = 'SEN';

-- Irak (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Fahad Talib', 'GK'),
  ('Jalal Hassan', 'GK'),
  ('Ahmed Basil', 'GK'),
  ('Hussein Ali', 'DEF'),
  ('Manaf Younis', 'DEF'),
  ('Ahmed Yahya', 'DEF'),
  ('Mustafa Saadoon', 'DEF'),
  ('Zaid Tahseen', 'DEF'),
  ('Rebin Sulaka', 'DEF'),
  ('Akam Hashim', 'DEF'),
  ('Merchas Doski', 'DEF'),
  ('Zaid Ismail', 'DEF'),
  ('Frans Putros', 'DEF'),
  ('Amir Al-Ammari', 'MID'),
  ('Kevin Yakob', 'MID'),
  ('Zidane Iqbal', 'MID'),
  ('Aimar Sher', 'MID'),
  ('Ibrahim Bayesh', 'MID'),
  ('Ahmed Qasem', 'MID'),
  ('Youssef Amyn', 'MID'),
  ('Marko Farji', 'MID'),
  ('Ali Jassim', 'FWD'),
  ('Ali Al-Hamadi', 'FWD'),
  ('Ali Yousef', 'FWD'),
  ('Aymen Hussein', 'FWD'),
  ('Mohanad Ali', 'FWD')
) AS v(name, position)
WHERE t.code = 'IRQ';

-- Noruega (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Orjan Haskjold Nyland', 'GK'),
  ('Egil Selvik', 'GK'),
  ('Sander Tangvik', 'GK'),
  ('Julian Ryerson', 'DEF'),
  ('Marcus Holmgren Pedersen', 'DEF'),
  ('David Moller Wolfe', 'DEF'),
  ('Fredrik Bjorkan', 'DEF'),
  ('Kristoffer Ajer', 'DEF'),
  ('Torbjorn Heggem', 'DEF'),
  ('Leo Skiri Ostigard', 'DEF'),
  ('Sondre Langas', 'DEF'),
  ('Henrik Falchener', 'DEF'),
  ('Martin Odegaard', 'MID'),
  ('Sander Berge', 'MID'),
  ('Fredrik Aursnes', 'MID'),
  ('Patrick Berg', 'MID'),
  ('Kristian Thorstvedt', 'MID'),
  ('Morten Thorsby', 'MID'),
  ('Thelo Aasgaard', 'MID'),
  ('Erling Haaland', 'FWD'),
  ('Alexander Sorloth', 'FWD'),
  ('Jorgen Strand Larsen', 'FWD'),
  ('Antonio Nusa', 'FWD'),
  ('Oscar Bobb', 'FWD'),
  ('Andreas Schjelderup', 'FWD'),
  ('Jens Petter Hauge', 'FWD')
) AS v(name, position)
WHERE t.code = 'NOR';

-- ===== GRUPO J =====

-- Argentina (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Juan Musso', 'GK'),
  ('Gerónimo Rulli', 'GK'),
  ('Emiliano Martínez', 'GK'),
  ('Leonardo Balerdi', 'DEF'),
  ('Nicolás Tagliafico', 'DEF'),
  ('Gonzalo Montiel', 'DEF'),
  ('Lisandro Martínez', 'DEF'),
  ('Cristian Romero', 'DEF'),
  ('Nicolás Otamendi', 'DEF'),
  ('Facundo Medina', 'DEF'),
  ('Nahuel Molina', 'DEF'),
  ('Leandro Paredes', 'MID'),
  ('Rodrigo de Paul', 'MID'),
  ('Valentín Barco', 'MID'),
  ('Giovani lo Celso', 'MID'),
  ('Ezequiel Palacios', 'MID'),
  ('Alexis Mac Allister', 'MID'),
  ('Enzo Fernández', 'MID'),
  ('Julián Alvarez', 'FWD'),
  ('Lionel Messi', 'FWD'),
  ('Nicolás González', 'FWD'),
  ('Thiago Almada', 'FWD'),
  ('Giuliano Simeone', 'FWD'),
  ('Nico Paz', 'FWD'),
  ('José Manuel López', 'FWD'),
  ('Lautaro Martínez', 'FWD')
) AS v(name, position)
WHERE t.code = 'ARG';

-- Argelia (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Oussama Benbot', 'GK'),
  ('Melvin Masstil', 'GK'),
  ('Luca Zidane', 'GK'),
  ('Achraf Abada', 'DEF'),
  ('Rayan Ait-Nouri', 'DEF'),
  ('Zinedine Belaid', 'DEF'),
  ('Rafik Belghali', 'DEF'),
  ('Ramy Bensebaini', 'DEF'),
  ('Samir Chergui', 'DEF'),
  ('Jaouen Hadjam', 'DEF'),
  ('Aissa Mandi', 'DEF'),
  ('Mohamed Amine Tougai', 'DEF'),
  ('Houssem Aouar', 'MID'),
  ('Nabil Bentaleb', 'MID'),
  ('Hicham Boudaoui', 'MID'),
  ('Fares Chaibi', 'MID'),
  ('Ibrahim Maza', 'MID'),
  ('Yassine Titraoui', 'MID'),
  ('Ramiz Zerrouki', 'MID'),
  ('Mohamed Amine Amoura', 'FWD'),
  ('Nadir Benbouali', 'FWD'),
  ('Adil Boulbina', 'FWD'),
  ('Fares Ghedjemis', 'FWD'),
  ('Amine Gouiri', 'FWD'),
  ('Riyad Mahrez', 'FWD'),
  ('Anis Hadj Moussa', 'FWD')
) AS v(name, position)
WHERE t.code = 'ALG';

-- Austria (25)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Patrick Pentz', 'GK'),
  ('Alexander Schlager', 'GK'),
  ('Florian Wiegele', 'GK'),
  ('David Affengruber', 'DEF'),
  ('David Alaba', 'DEF'),
  ('Kevin Danso', 'DEF'),
  ('Marco Friedl', 'DEF'),
  ('Philipp Lienhart', 'DEF'),
  ('Phillipp Mwene', 'DEF'),
  ('Stefan Posch', 'DEF'),
  ('Alexander Prass', 'DEF'),
  ('Michael Svoboda', 'DEF'),
  ('Carney Chukwuemeka', 'MID'),
  ('Florian Grillitsch', 'MID'),
  ('Konrad Laimer', 'MID'),
  ('Marcel Sabitzer', 'MID'),
  ('Xaver Schlager', 'MID'),
  ('Romano Schmid', 'MID'),
  ('Alessandro Schopf', 'MID'),
  ('Nicolas Seiwald', 'MID'),
  ('Paul Wanner', 'MID'),
  ('Patrick Wimmer', 'MID'),
  ('Marko Arnautovic', 'FWD'),
  ('Michael Gregoritsch', 'FWD'),
  ('Sasa Kalajdzic', 'FWD')
) AS v(name, position)
WHERE t.code = 'AUT';

-- Jordania (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Yazeed Abulaila', 'GK'),
  ('Abdullah Al-Fakhouri', 'GK'),
  ('Noor Bani Attiah', 'GK'),
  ('Abdallah Nasib', 'DEF'),
  ('Ehsan Haddad', 'DEF'),
  ('Saed Al-Rosan', 'DEF'),
  ('Saleem Obaid', 'DEF'),
  ('Yazan Al-Arab', 'DEF'),
  ('Mohammad Abualnadi', 'DEF'),
  ('Husam Abu Dahab', 'DEF'),
  ('Anas Banawi', 'DEF'),
  ('Mohannad Abu Taha', 'DEF'),
  ('Mohammad Abu Hasheesh', 'DEF'),
  ('Noor Al Rawabdeh', 'MID'),
  ('Nizar Al Rashdan', 'MID'),
  ('Ibrahim Saadeh', 'MID'),
  ('Rajaei Ayed', 'MID'),
  ('Mahmoud Al-Mardi', 'MID'),
  ('Amer Jamous', 'MID'),
  ('Mohammad Al-Dawoud', 'MID'),
  ('Mousa Al-Tamari', 'FWD'),
  ('Odeh Al-Fakhouri', 'FWD'),
  ('Mohammad Abu Zrayq', 'FWD'),
  ('Ali Azaizeh', 'FWD'),
  ('Ibrahim Sabra', 'FWD'),
  ('Ali Olwan', 'FWD')
) AS v(name, position)
WHERE t.code = 'JOR';

-- ===== GRUPO K =====

-- Portugal (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Diogo Costa', 'GK'),
  ('Jose Sa', 'GK'),
  ('Rui Silva', 'GK'),
  ('Diogo Dalot', 'DEF'),
  ('Matheus Nunes', 'DEF'),
  ('Ruben Dias', 'DEF'),
  ('Nelson Semedo', 'DEF'),
  ('Joao Cancelo', 'DEF'),
  ('Nuno Mendes', 'DEF'),
  ('Goncalo Inacio', 'DEF'),
  ('Renato Veiga', 'DEF'),
  ('Tomas Araujo', 'DEF'),
  ('Ruben Neves', 'MID'),
  ('Samu Costa', 'MID'),
  ('Joao Neves', 'MID'),
  ('Vitinha', 'MID'),
  ('Bruno Fernandes', 'MID'),
  ('Bernardo Silva', 'MID'),
  ('Cristiano Ronaldo', 'FWD'),
  ('Joao Felix', 'FWD'),
  ('Francisco Trincao', 'FWD'),
  ('Francisco Conceicao', 'FWD'),
  ('Pedro Neto', 'FWD'),
  ('Rafael Leao', 'FWD'),
  ('Goncalo Guedes', 'FWD'),
  ('Goncalo Ramos', 'FWD')
) AS v(name, position)
WHERE t.code = 'POR';

-- RD Congo (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Matthieu Epolo', 'GK'),
  ('Timothy Fayulu', 'GK'),
  ('Lionel Mpasi', 'GK'),
  ('Dylan Batubinsika', 'DEF'),
  ('Rocky Bushiri', 'DEF'),
  ('Gedeon Kalulu', 'DEF'),
  ('Steve Kapuadi', 'DEF'),
  ('Joris Kayembe', 'DEF'),
  ('Arthur Masuaku', 'DEF'),
  ('Chancel Mbemba', 'DEF'),
  ('Axel Tuanzebe', 'DEF'),
  ('Aaron Wan-Bissaka', 'DEF'),
  ('Theo Bongonda', 'MID'),
  ('Brian Cipenga', 'MID'),
  ('Elia Meshack', 'MID'),
  ('Gael Kakuta', 'MID'),
  ('Edo Kayembe', 'MID'),
  ('Nathanael Mbuku', 'MID'),
  ('Samuel Moutoussamy', 'MID'),
  ('Ngalayel Mukau', 'MID'),
  ('Charles Pickel', 'MID'),
  ('Noah Sadiki', 'MID'),
  ('Cedric Bakambu', 'FWD'),
  ('Simon Banza', 'FWD'),
  ('Fiston Mayele', 'FWD'),
  ('Yoane Wissa', 'FWD')
) AS v(name, position)
WHERE t.code = 'COD';

-- Uzbekistán (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Utkir Yusupov', 'GK'),
  ('Abduvohid Nematov', 'GK'),
  ('Botirali Ergashev', 'GK'),
  ('Rustam Ashurmatov', 'DEF'),
  ('Farrukh Sayfiev', 'DEF'),
  ('Khojiakbar Alijonov', 'DEF'),
  ('Sherzod Nasrullaev', 'DEF'),
  ('Umar Eshmurodov', 'DEF'),
  ('Abdukodir Khusanov', 'DEF'),
  ('Abdulla Abdullaev', 'DEF'),
  ('Bekhruz Karimov', 'DEF'),
  ('Jakhongir Urozov', 'DEF'),
  ('Avazbek Ulmasaliev', 'DEF'),
  ('Otabek Shukurov', 'MID'),
  ('Jaloliddin Masharipov', 'MID'),
  ('Odiljon Hamrobekov', 'MID'),
  ('Oston Urunov', 'MID'),
  ('Jamshid Iskanderov', 'MID'),
  ('Dostonbek Khamdamov', 'MID'),
  ('Abbosbek Fayzullaev', 'MID'),
  ('Akmal Mozgovoy', 'MID'),
  ('Azizjon Ganiev', 'MID'),
  ('Sherzod Esanov', 'MID'),
  ('Eldor Shomurodov', 'FWD'),
  ('Igor Sergeev', 'FWD'),
  ('Azizbek Amonov', 'FWD')
) AS v(name, position)
WHERE t.code = 'UZB';

-- Colombia (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Camilo Vargas', 'GK'),
  ('Álvaro Montero', 'GK'),
  ('David Ospina', 'GK'),
  ('Davinson Sánchez', 'DEF'),
  ('Jhon Lucumi', 'DEF'),
  ('Yerry Mina', 'DEF'),
  ('Willer Ditta', 'DEF'),
  ('Daniel Muñoz', 'DEF'),
  ('Santiago Arias', 'DEF'),
  ('Johan Mojica', 'DEF'),
  ('Deiver Machado', 'DEF'),
  ('Richard Ríos', 'MID'),
  ('Jefferson Lerma', 'MID'),
  ('Kevin Castano', 'MID'),
  ('Juan Camilo Portilla', 'MID'),
  ('Gustavo Puerta', 'MID'),
  ('Jhon Arias', 'MID'),
  ('Jorge Carrascal', 'MID'),
  ('Juan Fernando Quintero', 'MID'),
  ('James Rodríguez', 'MID'),
  ('Jaminton Campaz', 'MID'),
  ('Juan Camilo Hernández', 'FWD'),
  ('Luis Díaz', 'FWD'),
  ('Luis Suárez', 'FWD'),
  ('Carlos Andrés Gómez', 'FWD'),
  ('Jhon Córdoba', 'FWD')
) AS v(name, position)
WHERE t.code = 'COL';

-- ===== GRUPO L =====

-- Inglaterra (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Jordan Pickford', 'GK'),
  ('Dean Henderson', 'GK'),
  ('James Trafford', 'GK'),
  ('Reece James', 'DEF'),
  ('Tino Livramento', 'DEF'),
  ('John Stones', 'DEF'),
  ('Marc Guehi', 'DEF'),
  ('Ezri Konsa', 'DEF'),
  ('Dan Burn', 'DEF'),
  ('Jarell Quansah', 'DEF'),
  ('Djed Spence', 'DEF'),
  ('Nico O''Reilly', 'DEF'),
  ('Elliott Anderson', 'MID'),
  ('Jordan Henderson', 'MID'),
  ('Declan Rice', 'MID'),
  ('Kobbie Mainoo', 'MID'),
  ('Eberechi Eze', 'MID'),
  ('Jude Bellingham', 'MID'),
  ('Morgan Rogers', 'MID'),
  ('Bukayo Saka', 'FWD'),
  ('Noni Madueke', 'FWD'),
  ('Anthony Gordon', 'FWD'),
  ('Marcus Rashford', 'FWD'),
  ('Harry Kane', 'FWD'),
  ('Ollie Watkins', 'FWD'),
  ('Ivan Toney', 'FWD')
) AS v(name, position)
WHERE t.code = 'ENG';

-- Croacia (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Dominik Livakovic', 'GK'),
  ('Dominik Kotarski', 'GK'),
  ('Ivor Pandur', 'GK'),
  ('Josko Gvardiol', 'DEF'),
  ('Duje Caleta-Car', 'DEF'),
  ('Josip Sutalo', 'DEF'),
  ('Josip Stanisic', 'DEF'),
  ('Marin Pongracic', 'DEF'),
  ('Martin Erlic', 'DEF'),
  ('Luka Vuskovic', 'DEF'),
  ('Luka Modric', 'MID'),
  ('Mateo Kovacic', 'MID'),
  ('Mario Pasalic', 'MID'),
  ('Nikola Vlasic', 'MID'),
  ('Luka Sucic', 'MID'),
  ('Martin Baturina', 'MID'),
  ('Kristijan Jakic', 'MID'),
  ('Petar Sucic', 'MID'),
  ('Nikola Moro', 'MID'),
  ('Toni Fruk', 'MID'),
  ('Ivan Perisic', 'FWD'),
  ('Andrej Kramaric', 'FWD'),
  ('Ante Budimir', 'FWD'),
  ('Marco Pasalic', 'FWD'),
  ('Petar Musa', 'FWD'),
  ('Igor Matanovic', 'FWD')
) AS v(name, position)
WHERE t.code = 'CRO';

-- Ghana (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Benjamin Asare', 'GK'),
  ('Lawrence Ati-Zigi', 'GK'),
  ('Joseph Anang', 'GK'),
  ('Baba Abdul Rahman', 'DEF'),
  ('Gideon Mensah', 'DEF'),
  ('Marvin Senaya', 'DEF'),
  ('Alidu Seidu', 'DEF'),
  ('Abdul Mumin', 'DEF'),
  ('Jerome Opoku', 'DEF'),
  ('Jonas Adjetey', 'DEF'),
  ('Kojo Oppong Peprah', 'DEF'),
  ('Derrick Luckassen', 'DEF'),
  ('Elisha Owusu', 'DEF'),
  ('Thomas Partey', 'MID'),
  ('Kwasi Sibo', 'MID'),
  ('Augustine Boakye', 'MID'),
  ('Caleb Yirenkyi', 'MID'),
  ('Abdul Fatawu', 'MID'),
  ('Kamaldeen Sulemana', 'FWD'),
  ('Christopher Bonsu Baah', 'FWD'),
  ('Ernest Nuamah', 'FWD'),
  ('Antoine Semenyo', 'FWD'),
  ('Brandon Thomas-Asante', 'FWD'),
  ('Prince Kwabena Adu', 'FWD'),
  ('Inaki Williams', 'FWD'),
  ('Jordan Ayew', 'FWD')
) AS v(name, position)
WHERE t.code = 'GHA';

-- Panamá (26)
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, NULL::int
FROM teams t
CROSS JOIN (VALUES
  ('Orlando Mosquera', 'GK'),
  ('Luis Mejía', 'GK'),
  ('César Samudio', 'GK'),
  ('César Blackman', 'DEF'),
  ('Jorge Gutiérrez', 'DEF'),
  ('Amir Murillo', 'DEF'),
  ('Fidel Escobar', 'DEF'),
  ('Andres Andrade', 'DEF'),
  ('Edgardo Farina', 'DEF'),
  ('José Córdoba', 'DEF'),
  ('Eric Davis', 'DEF'),
  ('Jiovany Ramos', 'DEF'),
  ('Roderick Miller', 'DEF'),
  ('Aníbal Godoy', 'MID'),
  ('Adalberto Carrasquilla', 'MID'),
  ('Carlos Harvey', 'MID'),
  ('Cristian Martínez', 'MID'),
  ('José Luis Rodríguez', 'MID'),
  ('César Yanis', 'MID'),
  ('Yoel Barcenas', 'MID'),
  ('Alberto Quintero', 'MID'),
  ('Azarias Londono', 'MID'),
  ('Ismael Díaz', 'FWD'),
  ('Cecilio Waterman', 'FWD'),
  ('Jose Fajardo', 'FWD'),
  ('Tomas Rodríguez', 'FWD')
) AS v(name, position)
WHERE t.code = 'PAN';

COMMIT;
