-- ============================================================
-- JUGADORES POSIBLES - MUNDIAL 2026
-- Plantillas probables (actualizar cuando se confirmen)
-- Formato: 3 GK + 8 DEF + 8 MID + 7 FWD = 26 por equipo
-- Pegar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- ============================================================
-- ARGENTINA (ARG)
-- ============================================================
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, v.shirt_number
FROM teams t
CROSS JOIN (VALUES
  ('Emiliano Martínez',   'GK',  23),
  ('Gerónimo Rulli',      'GK',  12),
  ('Walter Benítez',      'GK',   1),
  ('Nahuel Molina',       'DEF', 26),
  ('Gonzalo Montiel',     'DEF',  4),
  ('Cristian Romero',     'DEF', 13),
  ('Lisandro Martínez',   'DEF', 14),
  ('Nicolás Otamendi',    'DEF', 19),
  ('Marcos Acuña',        'DEF',  8),
  ('Nicolás Tagliafico',  'DEF',  3),
  ('Facundo Medina',      'DEF',  2),
  ('Rodrigo De Paul',     'MID',  7),
  ('Leandro Paredes',     'MID',  5),
  ('Enzo Fernández',      'MID', 24),
  ('Alexis Mac Allister', 'MID', 20),
  ('Exequiel Palacios',   'MID', 25),
  ('Giovani Lo Celso',    'MID', 16),
  ('Thiago Almada',       'MID', 18),
  ('Guido Rodríguez',     'MID', 15),
  ('Lionel Messi',        'FWD', 10),
  ('Julián Álvarez',      'FWD',  9),
  ('Lautaro Martínez',    'FWD', 22),
  ('Paulo Dybala',        'FWD', 21),
  ('Alejandro Garnacho',  'FWD', 11),
  ('Valentín Carboni',    'FWD',  6),
  ('Ángel Correa',        'FWD', 17)
) AS v(name, position, shirt_number)
WHERE t.code = 'ARG';

-- ============================================================
-- BRASIL (BRA)
-- ============================================================
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, v.shirt_number
FROM teams t
CROSS JOIN (VALUES
  ('Alisson',             'GK',   1),
  ('Ederson',             'GK',  23),
  ('Weverton',            'GK',  12),
  ('Danilo',              'DEF',  2),
  ('Éder Militão',        'DEF',  3),
  ('Marquinhos',          'DEF',  4),
  ('Gabriel Magalhães',   'DEF',  5),
  ('Alex Sandro',         'DEF',  6),
  ('Renan Lodi',          'DEF', 18),
  ('Bremer',              'DEF', 14),
  ('Guilherme Arana',     'DEF', 25),
  ('Casemiro',            'MID', 15),
  ('Bruno Guimarães',     'MID', 17),
  ('Lucas Paquetá',       'MID', 10),
  ('Gerson',              'MID',  8),
  ('Douglas Luiz',        'MID', 16),
  ('João Gomes',          'MID', 26),
  ('Joelinton',           'MID', 11),
  ('Andreas Pereira',     'MID', 18),
  ('Vinicius Jr',         'FWD',  7),
  ('Raphinha',            'FWD', 11),
  ('Rodrygo',             'FWD', 21),
  ('Gabriel Martinelli',  'FWD', 24),
  ('Gabriel Jesus',       'FWD',  9),
  ('Endrick',             'FWD', 19),
  ('Richarlison',         'FWD', 20)
) AS v(name, position, shirt_number)
WHERE t.code = 'BRA';

-- ============================================================
-- FRANCE (FRA)
-- ============================================================
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, v.shirt_number
FROM teams t
CROSS JOIN (VALUES
  ('Mike Maignan',         'GK',  16),
  ('Alphonse Areola',      'GK',  23),
  ('Guillaume Restes',     'GK',   1),
  ('Jules Koundé',         'DEF',  5),
  ('William Saliba',       'DEF', 17),
  ('Ibrahima Konaté',      'DEF',  4),
  ('Dayot Upamecano',      'DEF', 15),
  ('Theo Hernández',       'DEF', 22),
  ('Lucas Hernández',      'DEF', 21),
  ('Jonathan Clauss',      'DEF', 24),
  ('Benjamin Pavard',      'DEF',  2),
  ('N''Golo Kanté',        'MID', 13),
  ('Aurélien Tchouaméni',  'MID', 14),
  ('Eduardo Camavinga',    'MID',  8),
  ('Adrien Rabiot',        'MID', 25),
  ('Mattéo Guendouzi',     'MID', 18),
  ('Youssouf Fofana',      'MID', 20),
  ('Warren Zaïre-Emery',   'MID', 26),
  ('Antoine Griezmann',    'MID',  7),
  ('Kylian Mbappé',        'FWD', 10),
  ('Ousmane Dembélé',      'FWD', 11),
  ('Marcus Thuram',        'FWD',  9),
  ('Randal Kolo Muani',    'FWD', 19),
  ('Bradley Barcola',      'FWD', 12),
  ('Christopher Nkunku',   'FWD',  6),
  ('Kingsley Coman',       'FWD',  3)
) AS v(name, position, shirt_number)
WHERE t.code = 'FRA';

-- ============================================================
-- ALEMANIA (GER)
-- ============================================================
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, v.shirt_number
FROM teams t
CROSS JOIN (VALUES
  ('Manuel Neuer',         'GK',   1),
  ('Marc-André ter Stegen','GK',  22),
  ('Oliver Baumann',       'GK',  12),
  ('Joshua Kimmich',       'DEF',  6),
  ('Antonio Rüdiger',      'DEF',  2),
  ('Jonathan Tah',         'DEF',  4),
  ('Nico Schlotterbeck',   'DEF',  5),
  ('David Raum',           'DEF', 13),
  ('Maximilian Mittelstädt','DEF', 18),
  ('Benjamin Henrichs',    'DEF', 14),
  ('Waldemar Anton',       'DEF', 17),
  ('İlkay Gündoğan',       'MID', 21),
  ('Leon Goretzka',        'MID',  8),
  ('Florian Wirtz',        'MID', 10),
  ('Jamal Musiala',        'MID', 14),
  ('Kai Havertz',          'MID',  7),
  ('Pascal Groß',          'MID', 15),
  ('Robert Andrich',       'MID', 23),
  ('Angelo Stiller',       'MID', 20),
  ('Leroy Sané',           'FWD', 19),
  ('Thomas Müller',        'FWD', 25),
  ('Serge Gnabry',         'FWD', 16),
  ('Niclas Füllkrug',      'FWD',  9),
  ('Deniz Undav',          'FWD', 11),
  ('Maximilian Beier',     'FWD', 26),
  ('Tim Kleindienst',      'FWD', 24)
) AS v(name, position, shirt_number)
WHERE t.code = 'GER';

-- ============================================================
-- ESPAÑA (ESP)
-- ============================================================
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, v.shirt_number
FROM teams t
CROSS JOIN (VALUES
  ('Unai Simón',          'GK',  23),
  ('David Raya',          'GK',   1),
  ('Álex Remiro',         'GK',  13),
  ('Dani Carvajal',       'DEF',  2),
  ('Nacho Fernández',     'DEF',  4),
  ('Aymeric Laporte',     'DEF', 14),
  ('Robin Le Normand',    'DEF', 24),
  ('Marc Cucurella',      'DEF', 24),
  ('Alejandro Grimaldo',  'DEF', 22),
  ('Dani Vivian',         'DEF', 18),
  ('Pedro Porro',         'DEF', 12),
  ('Rodri',               'MID', 16),
  ('Pedri',               'MID',  8),
  ('Gavi',                'MID',  9),
  ('Fabián Ruiz',         'MID', 11),
  ('Mikel Merino',        'MID', 15),
  ('Martín Zubimendi',    'MID', 20),
  ('Dani Olmo',           'MID', 10),
  ('Álex Baena',          'MID', 21),
  ('Álvaro Morata',       'FWD',  7),
  ('Ferran Torres',       'FWD',  7),
  ('Nico Williams',       'FWD', 17),
  ('Lamine Yamal',        'FWD', 19),
  ('Joselu',              'FWD',  9),
  ('Ayoze Pérez',         'FWD', 13),
  ('Bryan Gil',           'FWD', 26)
) AS v(name, position, shirt_number)
WHERE t.code = 'ESP';

-- ============================================================
-- PORTUGAL (POR)
-- ============================================================
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, v.shirt_number
FROM teams t
CROSS JOIN (VALUES
  ('Diogo Costa',          'GK',  25),
  ('Rui Patrício',         'GK',   1),
  ('José Sá',              'GK',  22),
  ('João Cancelo',         'DEF', 20),
  ('Rúben Dias',           'DEF',  4),
  ('Pepe',                 'DEF',  3),
  ('Danilo Pereira',       'DEF',  15),
  ('Nuno Mendes',          'DEF', 19),
  ('Raphaël Guerreiro',    'DEF',  5),
  ('Gonçalo Inácio',       'DEF', 23),
  ('Diogo Dalot',          'DEF',  2),
  ('Bruno Fernandes',      'MID',  8),
  ('Bernardo Silva',       'MID', 10),
  ('Vitinha',              'MID', 16),
  ('João Palhinha',        'MID',  26),
  ('Rúben Neves',          'MID', 15),
  ('Otávio',               'MID', 13),
  ('João Neves',           'MID', 18),
  ('Matheus Nunes',        'MID', 17),
  ('Cristiano Ronaldo',    'FWD',  7),
  ('Rafael Leão',          'FWD', 11),
  ('Pedro Neto',           'FWD', 24),
  ('Gonçalo Ramos',        'FWD',  9),
  ('João Félix',           'FWD', 21),
  ('Francisco Conceição',  'FWD', 12),
  ('Rafa Silva',           'FWD',  6)
) AS v(name, position, shirt_number)
WHERE t.code = 'POR';

-- ============================================================
-- INGLATERRA (ENG)
-- ============================================================
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, v.shirt_number
FROM teams t
CROSS JOIN (VALUES
  ('Jordan Pickford',      'GK',   1),
  ('Aaron Ramsdale',       'GK',  22),
  ('Dean Henderson',       'GK',  13),
  ('Kyle Walker',          'DEF',  2),
  ('John Stones',          'DEF',  5),
  ('Harry Maguire',        'DEF',  6),
  ('Marc Guéhi',           'DEF', 14),
  ('Luke Shaw',            'DEF', 23),
  ('Trent Alexander-Arnold','DEF', 12),
  ('Ben Chilwell',         'DEF',  3),
  ('Levi Colwill',         'DEF', 26),
  ('Declan Rice',          'MID',  4),
  ('Jude Bellingham',      'MID', 10),
  ('Phil Foden',           'MID', 11),
  ('Kobbie Mainoo',        'MID', 24),
  ('Conor Gallagher',      'MID', 16),
  ('Adam Wharton',         'MID', 20),
  ('Curtis Jones',         'MID', 21),
  ('Morgan Gibbs-White',   'MID', 15),
  ('Harry Kane',           'FWD',  9),
  ('Bukayo Saka',          'FWD', 17),
  ('Raheem Sterling',      'FWD',  7),
  ('Marcus Rashford',      'FWD', 19),
  ('Jarrod Bowen',         'FWD', 18),
  ('Anthony Gordon',       'FWD', 25),
  ('Ollie Watkins',        'FWD',  8)
) AS v(name, position, shirt_number)
WHERE t.code = 'ENG';

-- ============================================================
-- HOLANDA (NED)
-- ============================================================
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, v.shirt_number
FROM teams t
CROSS JOIN (VALUES
  ('Bart Verbruggen',      'GK',  23),
  ('Mark Flekken',         'GK',   1),
  ('Remko Pasveer',        'GK',  22),
  ('Denzel Dumfries',      'DEF', 22),
  ('Stefan de Vrij',       'DEF',  6),
  ('Virgil van Dijk',      'DEF',  4),
  ('Nathan Aké',           'DEF',  5),
  ('Matthijs de Ligt',     'DEF',  3),
  ('Jurriën Timber',       'DEF', 12),
  ('Ian Maatsen',          'DEF', 18),
  ('Lutsharel Geertruida', 'DEF', 24),
  ('Frenkie de Jong',      'MID', 21),
  ('Ryan Gravenberch',     'MID', 10),
  ('Tijjani Reijnders',    'MID', 14),
  ('Teun Koopmeiners',     'MID',  8),
  ('Xavi Simons',          'MID', 20),
  ('Jerdy Schouten',       'MID', 15),
  ('Mats Wieffer',         'MID', 26),
  ('Joey Veerman',         'MID', 16),
  ('Cody Gakpo',           'FWD', 11),
  ('Memphis Depay',        'FWD',  9),
  ('Donyell Malen',        'FWD', 18),
  ('Wout Weghorst',        'FWD', 19),
  ('Brian Brobbey',        'FWD', 25),
  ('Steven Bergwijn',      'FWD',  7),
  ('Noa Lang',             'FWD', 17)
) AS v(name, position, shirt_number)
WHERE t.code = 'NED';

-- ============================================================
-- ITALIA (ITA)
-- ============================================================
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, v.shirt_number
FROM teams t
CROSS JOIN (VALUES
  ('Gianluigi Donnarumma', 'GK',  25),
  ('Alex Meret',           'GK',   1),
  ('Guglielmo Vicario',    'GK',  13),
  ('Giovanni Di Lorenzo',  'DEF',  2),
  ('Alessandro Bastoni',   'DEF', 23),
  ('Giorgio Scalvini',     'DEF', 19),
  ('Federico Dimarco',     'DEF',  3),
  ('Matteo Darmian',       'DEF', 18),
  ('Gianluca Mancini',     'DEF', 15),
  ('Riccardo Calafiori',   'DEF', 16),
  ('Alessandro Florenzi',  'DEF', 24),
  ('Jorginho',             'MID',  8),
  ('Nicolò Barella',       'MID',  7),
  ('Lorenzo Pellegrini',   'MID', 10),
  ('Sandro Tonali',        'MID', 14),
  ('Davide Frattesi',      'MID', 20),
  ('Bryan Cristante',      'MID',  4),
  ('Samuele Ricci',        'MID', 22),
  ('Nicolò Fagioli',       'MID', 26),
  ('Federico Chiesa',      'FWD', 11),
  ('Giacomo Raspadori',    'FWD', 18),
  ('Mateo Retegui',        'FWD',  9),
  ('Mattia Zaccagni',      'FWD', 17),
  ('Moise Kean',           'FWD', 12),
  ('Lorenzo Lucca',        'FWD', 21),
  ('Stephan El Shaarawy',  'FWD',  6)
) AS v(name, position, shirt_number)
WHERE t.code = 'ITA';

-- ============================================================
-- BÉLGICA (BEL)
-- ============================================================
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, v.shirt_number
FROM teams t
CROSS JOIN (VALUES
  ('Thibaut Courtois',     'GK',   1),
  ('Simon Mignolet',       'GK',  12),
  ('Koen Casteels',        'GK',  23),
  ('Timothy Castagne',     'DEF',  2),
  ('Zeno Debast',          'DEF',  3),
  ('Wout Faes',            'DEF',  5),
  ('Arthur Theate',        'DEF', 17),
  ('Thomas Meunier',       'DEF', 15),
  ('Maxim De Cuyper',      'DEF', 22),
  ('Brandon Mechele',      'DEF', 24),
  ('Jan Vertonghen',       'DEF',  5),
  ('Kevin De Bruyne',      'MID',  7),
  ('Youri Tielemans',      'MID', 10),
  ('Amadou Onana',         'MID', 18),
  ('Orel Mangala',         'MID', 16),
  ('Nicolas Raskin',       'MID', 20),
  ('Johan Bakayoko',       'MID', 14),
  ('Leandro Trossard',     'MID', 11),
  ('Axel Witsel',          'MID',  6),
  ('Romelu Lukaku',        'FWD',  9),
  ('Lois Openda',          'FWD', 19),
  ('Dodi Lukebakio',       'FWD', 26),
  ('Charles De Ketelaere', 'FWD',  8),
  ('Jeremy Doku',          'FWD', 21),
  ('Alexis Saelemaekers',  'FWD', 13),
  ('Yannick Carrasco',     'FWD', 25)
) AS v(name, position, shirt_number)
WHERE t.code = 'BEL';

-- ============================================================
-- CROACIA (CRO)
-- ============================================================
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, v.shirt_number
FROM teams t
CROSS JOIN (VALUES
  ('Dominik Livaković',    'GK',  23),
  ('Ivo Grbić',            'GK',  12),
  ('Nediljko Labrović',    'GK',   1),
  ('Josip Stanišić',       'DEF',  2),
  ('Duje Ćaleta-Car',      'DEF',  6),
  ('Joško Gvardiol',       'DEF',  3),
  ('Borna Sosa',           'DEF', 20),
  ('Martin Erlić',         'DEF', 24),
  ('Josip Šutalo',         'DEF', 22),
  ('Petar Sucić',          'DEF', 25),
  ('Domagoj Vida',         'DEF',  4),
  ('Luka Modrić',          'MID', 10),
  ('Mateo Kovačić',        'MID',  8),
  ('Marcelo Brozović',     'MID', 11),
  ('Mario Pašalić',        'MID', 14),
  ('Lovro Majer',          'MID',  7),
  ('Luka Ivanušec',        'MID', 15),
  ('Martin Baturina',      'MID', 18),
  ('Nikola Moro',          'MID', 19),
  ('Andrej Kramarić',      'FWD', 16),
  ('Ivan Perišić',         'FWD',  4),
  ('Bruno Petković',       'FWD', 21),
  ('Marko Livaja',         'FWD', 17),
  ('Mislav Oršić',         'FWD', 13),
  ('Ante Budimir',         'FWD',  9),
  ('Petar Musa',           'FWD', 26)
) AS v(name, position, shirt_number)
WHERE t.code = 'CRO';

-- ============================================================
-- ESTADOS UNIDOS (USA)
-- ============================================================
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, v.shirt_number
FROM teams t
CROSS JOIN (VALUES
  ('Matt Turner',           'GK',  25),
  ('Zack Steffen',          'GK',  12),
  ('Ethan Horvath',         'GK',   1),
  ('Sergino Dest',          'DEF',  2),
  ('Miles Robinson',        'DEF',  5),
  ('Cameron Carter-Vickers','DEF', 15),
  ('Chris Richards',        'DEF', 22),
  ('Antonee Robinson',      'DEF',  3),
  ('Joe Scally',            'DEF', 24),
  ('Mark McKenzie',         'DEF', 16),
  ('Tim Ream',              'DEF',  4),
  ('Tyler Adams',           'MID',  4),
  ('Weston McKennie',       'MID',  8),
  ('Yunus Musah',           'MID', 18),
  ('Brenden Aaronson',      'MID', 11),
  ('Giovanni Reyna',        'MID', 20),
  ('Luca de la Torre',      'MID', 13),
  ('Kellyn Acosta',         'MID', 23),
  ('Malik Tillman',         'MID', 19),
  ('Christian Pulisic',     'FWD', 10),
  ('Ricardo Pepi',          'FWD',  9),
  ('Josh Sargent',          'FWD', 21),
  ('Jordan Morris',         'FWD',  7),
  ('Tim Weah',              'FWD', 21),
  ('Folarin Balogun',       'FWD', 14),
  ('Jesus Ferreira',        'FWD', 17)
) AS v(name, position, shirt_number)
WHERE t.code = 'USA';

-- ============================================================
-- MÉXICO (MEX)
-- ============================================================
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, v.shirt_number
FROM teams t
CROSS JOIN (VALUES
  ('Guillermo Ochoa',      'GK',  13),
  ('Luis Malagón',         'GK',   1),
  ('Rodolfo Cota',         'GK',  22),
  ('Héctor Moreno',        'DEF',  3),
  ('César Montes',         'DEF',  4),
  ('Johan Vásquez',        'DEF',  24),
  ('Kevin Álvarez',        'DEF',  2),
  ('Jorge Sánchez',        'DEF', 19),
  ('Gerardo Arteaga',      'DEF', 17),
  ('Israel Reyes',         'DEF', 15),
  ('Jesús Angulo',         'DEF', 14),
  ('Edson Álvarez',        'MID', 18),
  ('Orbelín Pineda',       'MID', 21),
  ('Luis Chávez',          'MID', 23),
  ('Erick Gutiérrez',      'MID', 20),
  ('Carlos Rodríguez',     'MID', 11),
  ('Fernando Beltrán',     'MID', 16),
  ('Roberto Alvarado',     'MID', 25),
  ('Sebastián Córdova',    'MID', 26),
  ('Raúl Jiménez',         'FWD',  9),
  ('Hirving Lozano',       'FWD', 22),
  ('Alexis Vega',          'FWD', 10),
  ('Santiago Giménez',     'FWD',  7),
  ('Uriel Antuna',         'FWD',  8),
  ('Henry Martín',         'FWD', 12),
  ('Diego Lainez',         'FWD',  6)
) AS v(name, position, shirt_number)
WHERE t.code = 'MEX';

-- ============================================================
-- CANADÁ (CAN)
-- ============================================================
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, v.shirt_number
FROM teams t
CROSS JOIN (VALUES
  ('Maxime Crépeau',       'GK',   1),
  ('Dayne St. Clair',      'GK',  22),
  ('Milan Borjan',         'GK',  18),
  ('Alistair Johnston',    'DEF',  2),
  ('Kamal Miller',         'DEF',  5),
  ('Steven Vitória',       'DEF',  4),
  ('Derek Cornelius',      'DEF',  26),
  ('Sam Adekugbe',         'DEF',  3),
  ('Richie Laryea',        'DEF', 12),
  ('Doneil Henry',         'DEF', 14),
  ('Joel Waterman',        'DEF', 23),
  ('Atiba Hutchinson',     'MID',  6),
  ('Stephen Eustáquio',    'MID', 18),
  ('Tajon Buchanan',       'MID', 11),
  ('Mark-Anthony Kaye',    'MID', 16),
  ('Ismael Koné',          'MID', 25),
  ('Liam Millar',          'MID',  7),
  ('Jacob Shaffelburg',    'MID', 20),
  ('Charles-Andreas Brym', 'MID', 17),
  ('Alphonso Davies',      'FWD', 19),
  ('Jonathan David',       'FWD',  9),
  ('Cyle Larin',           'FWD', 17),
  ('Lucas Cavallini',      'FWD', 21),
  ('Theo Bair',            'FWD', 24),
  ('Junior Hoilett',       'FWD', 10),
  ('Liam Fraser',          'FWD', 13)
) AS v(name, position, shirt_number)
WHERE t.code = 'CAN';

-- ============================================================
-- COLOMBIA (COL)
-- ============================================================
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, v.shirt_number
FROM teams t
CROSS JOIN (VALUES
  ('David Ospina',         'GK',  25),
  ('Camilo Vargas',        'GK',   1),
  ('Álvaro Montero',       'GK',  22),
  ('Santiago Arias',       'DEF',  2),
  ('Dávinson Sánchez',     'DEF',  12),
  ('Yerry Mina',           'DEF',  13),
  ('Daniel Muñoz',         'DEF',  19),
  ('Johan Mojica',         'DEF',  3),
  ('Carlos Cuesta',        'DEF',  23),
  ('Jhon Lucumí',          'DEF',  16),
  ('Andrés Andrade',       'DEF',  18),
  ('Matheus Uribe',        'MID',  8),
  ('Wilmar Barrios',       'MID',  5),
  ('Richard Ríos',         'MID', 20),
  ('Jorge Carrascal',      'MID', 21),
  ('James Rodríguez',      'MID', 10),
  ('Jorman Campuzano',     'MID', 24),
  ('Juan Cuadrado',        'MID', 11),
  ('Gustavo Puerta',       'MID', 26),
  ('Luis Díaz',            'FWD',  7),
  ('Radamel Falcao',       'FWD',  9),
  ('Miguel Ángel Borja',   'FWD', 14),
  ('Rafael Santos Borré',  'FWD', 15),
  ('Jhon Córdoba',         'FWD', 17),
  ('Jhon Jáder Durán',     'FWD',  6),
  ('Déiver Machado',       'FWD',  4)
) AS v(name, position, shirt_number)
WHERE t.code = 'COL';

-- ============================================================
-- ECUADOR (ECU)
-- ============================================================
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, v.shirt_number
FROM teams t
CROSS JOIN (VALUES
  ('Hernán Galíndez',      'GK',  25),
  ('Alexander Domínguez',  'GK',   1),
  ('Moisés Ramírez',       'GK',  22),
  ('Ángelo Preciado',      'DEF',  2),
  ('Piero Hincapié',       'DEF',  3),
  ('Xavier Arreaga',       'DEF', 18),
  ('Robert Arboleda',      'DEF',  4),
  ('Pervis Estupiñán',     'DEF', 17),
  ('Diego Palacios',       'DEF', 23),
  ('Jackson Porozo',       'DEF', 15),
  ('Félix Torres',         'DEF', 16),
  ('Carlos Gruezo',        'MID', 19),
  ('Moisés Caicedo',       'MID', 10),
  ('Jhegson Méndez',       'MID', 20),
  ('Ángel Mena',           'MID',  8),
  ('Romario Ibarra',       'MID', 21),
  ('Jeremy Sarmiento',     'MID', 14),
  ('Alan Minda',           'MID', 26),
  ('Gonzalo Plata',        'MID', 11),
  ('Enner Valencia',       'FWD', 13),
  ('Leonardo Campana',     'FWD',  9),
  ('Djorkaeff Reasco',     'FWD', 24),
  ('Kevin Rodríguez',      'FWD', 12),
  ('Fidel Martínez',       'FWD',  7),
  ('Jordy Caicedo',        'FWD',  6),
  ('Michael Estrada',      'FWD',  5)
) AS v(name, position, shirt_number)
WHERE t.code = 'ECU';

-- ============================================================
-- CHILE (CHI)
-- ============================================================
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, v.shirt_number
FROM teams t
CROSS JOIN (VALUES
  ('Gabriel Arias',        'GK',   1),
  ('Brayan Cortés',        'GK',  22),
  ('Cristopher Toselli',   'GK',  12),
  ('Mauricio Isla',        'DEF',  4),
  ('Paulo Díaz',           'DEF',  5),
  ('Guillermo Maripán',    'DEF',  2),
  ('Benjamín Kuscevic',    'DEF', 18),
  ('Aarón Meléndez',       'DEF', 21),
  ('Ignacio Jeraldino',    'DEF', 14),
  ('Marcos Bolados',       'DEF', 23),
  ('Thomas Galdames',      'DEF', 25),
  ('Arturo Vidal',         'MID',  8),
  ('Erick Pulgar',         'MID', 20),
  ('Diego Valdés',         'MID', 10),
  ('Marcelino Núñez',      'MID', 17),
  ('Darío Osorio',         'MID', 19),
  ('Jean Meneses',         'MID', 16),
  ('César Pérez',          'MID', 15),
  ('Fabián Hormazábal',    'MID', 26),
  ('Alexis Sánchez',       'FWD',  7),
  ('Ben Brereton Díaz',    'FWD',  9),
  ('Eduardo Vargas',       'FWD', 11),
  ('Víctor Dávila',        'FWD', 13),
  ('Carlos Palacios',      'FWD',  6),
  ('Pablo Solari',         'FWD', 24),
  ('Cristián Zavala',      'FWD',  3)
) AS v(name, position, shirt_number)
WHERE t.code = 'CHI';

-- ============================================================
-- PERÚ (PER)
-- ============================================================
INSERT INTO players (name, team_id, position, shirt_number)
SELECT v.name, t.id, v.position::text, v.shirt_number
FROM teams t
CROSS JOIN (VALUES
  ('Pedro Gallese',        'GK',   1),
  ('Carlos Cáceda',        'GK',  12),
  ('José Carvallo',        'GK',  22),
  ('Luis Advíncula',       'DEF', 17),
  ('Alexander Callens',    'DEF',  2),
  ('Carlos Zambrano',      'DEF',  3),
  ('Miguel Araujo',        'DEF', 14),
  ('Marcos López',         'DEF',  5),
  ('Nilson Loyola',        'DEF', 21),
  ('Aldo Corzo',           'DEF', 19),
  ('Anderson Santamaría',  'DEF',  6),
  ('Renato Tapia',         'MID',  4),
  ('Wilder Cartagena',     'MID',  8),
  ('Yoshimar Yotún',       'MID', 18),
  ('Sergio Peña',          'MID', 20),
  ('Raziel García',        'MID', 15),
  ('Gabriel Costa',        'MID', 23),
  ('Andy Polo',            'MID', 16),
  ('Jesús Castillo',       'MID', 26),
  ('Gianluca Lapadula',    'FWD',  9),
  ('Edison Flores',        'FWD', 11),
  ('Bryan Reyna',          'FWD', 22),
  ('Alex Valera',          'FWD', 25),
  ('Joao Grimaldo',        'FWD', 24),
  ('Christofer Gonzales',  'FWD', 10),
  ('Paolo Guerrero',       'FWD',  7)
) AS v(name, position, shirt_number)
WHERE t.code = 'PER';
