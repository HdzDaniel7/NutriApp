const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

const dbPath = path.join(__dirname, 'db', 'nutriapp.sqlite')
const seedPath = path.join(__dirname, 'db', 'seed_alimentos.json')

console.log('🥗 NutriApp — Setup inicial')
console.log('─────────────────────────────')

const db = new Database(dbPath)

// ─────────────────────────────────────────────
// TABLA: alimentos
// ─────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS alimentos (
    id                            INTEGER PRIMARY KEY,
    tipo                          TEXT,
    descripcion                   TEXT,
    nombre_cientifico             TEXT,
    porcion_comestible            REAL,
    energia_kilojulios            REAL,
    energia_kcal                  REAL,
    humedad                       REAL,
    cenizas                       REAL,
    grasa_total                   REAL,
    acidos_grasos_saturados       REAL,
    acidos_grasos_monoinsaturados REAL,
    acidos_grasos_poliinsaturados REAL,
    colesterol                    REAL,
    proteina                      REAL,
    carbohidratos                 REAL,
    azucares                      REAL,
    fibra_bruta                   REAL,
    fibra_dietetica_total         REAL,
    fibra_dietetica_insoluble     REAL,
    calcio                        REAL,
    fosforo                       REAL,
    hierro                        REAL,
    sodio                         REAL,
    potasio                       REAL,
    magnesio                      REAL,
    cobre                         REAL,
    zinc                          REAL,
    manganeso                     REAL,
    selenio                       REAL,
    litio                         REAL,
    vitamina_a_ui                 REAL,
    vitamina_a_rae                REAL,
    carotenos                     REAL,
    beta_carotenos                REAL,
    vitamina_b1_tiamina           REAL,
    vitamina_b2_riboflavina       REAL,
    vitamina_b3_niacina           REAL,
    vitamina_c                    REAL,
    vitamina_b6                   REAL,
    vitamina_b12                  REAL,
    acido_folico                  REAL,
    folato_dfe                    REAL,
    vitamina_d                    REAL
  )
`)
console.log('✓ Tabla alimentos lista')

// ─────────────────────────────────────────────
// TABLA: usuarios
// ─────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre          TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    rol             TEXT DEFAULT 'nutriologo',
    activo          INTEGER DEFAULT 1,
    fecha_creacion  TEXT DEFAULT (datetime('now')),
    plantilla_id    TEXT DEFAULT 'moderna',
    logo_base64     TEXT
  )
`)
console.log('✓ Tabla usuarios lista')

// ─────────────────────────────────────────────
// TABLA: pacientes
// ─────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS pacientes (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre            TEXT NOT NULL,
    apellido          TEXT,
    fecha_nacimiento  TEXT,
    sexo              TEXT,
    email             TEXT,
    telefono          TEXT,
    notas             TEXT,
    fecha_creacion    TEXT DEFAULT (datetime('now')),
    activo            INTEGER DEFAULT 1,
    usuario_id        INTEGER REFERENCES usuarios(id)
  )
`)
console.log('✓ Tabla pacientes lista')

// ─────────────────────────────────────────────
// TABLA: consultas
// ─────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS consultas (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id     INTEGER NOT NULL,
    fecha           TEXT NOT NULL,
    peso            REAL,
    talla           REAL,
    pct_grasa       REAL,
    imc             REAL,
    cintura         REAL,
    cadera          REAL,
    notas           TEXT,
    fecha_creacion  TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
  )
`)
console.log('✓ Tabla consultas lista')

// ─────────────────────────────────────────────
// TABLA: planes
// ─────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS planes (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id         INTEGER,
    consulta_id         INTEGER,
    nombre              TEXT DEFAULT 'Plan nutricional',
    fecha_creacion      TEXT DEFAULT (datetime('now')),
    vct_objetivo        REAL,
    distribucion_macros TEXT,
    modo                TEXT DEFAULT 'semanal_unico',
    contenido           TEXT,
    usuario_id          INTEGER REFERENCES usuarios(id),
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    FOREIGN KEY (consulta_id) REFERENCES consultas(id)
  )
`)
console.log('✓ Tabla planes lista')

// ─────────────────────────────────────────────
// TABLA: citas
// ─────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS citas (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id          INTEGER NOT NULL,
    paciente_id         INTEGER,
    nombre_provisional  TEXT,
    fecha               TEXT NOT NULL,
    hora_inicio         TEXT NOT NULL,
    hora_fin            TEXT NOT NULL,
    estado              TEXT DEFAULT 'programada',
    tipo                TEXT DEFAULT 'consulta',
    notas               TEXT,
    fecha_creacion      TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (usuario_id)  REFERENCES usuarios(id),
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
  )
`)
console.log('✓ Tabla citas lista')

// ─────────────────────────────────────────────
// TABLA: configuracion_agenda
// ─────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS configuracion_agenda (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id        INTEGER NOT NULL UNIQUE,
    hora_inicio       TEXT DEFAULT '09:00',
    hora_fin          TEXT DEFAULT '18:00',
    duracion_cita     INTEGER DEFAULT 60,
    dias_laborales    TEXT DEFAULT '1,2,3,4,5',
    descanso_inicio   TEXT DEFAULT '14:00',
    descanso_fin      TEXT DEFAULT '15:00',
    notas             TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  )
`)
console.log('✓ Tabla configuracion_agenda lista')

// ─────────────────────────────────────────────
// SEED: importar alimentos
// ─────────────────────────────────────────────
const totalAlimentos = db.prepare('SELECT COUNT(*) as total FROM alimentos').get().total

if (totalAlimentos === 0) {
  console.log('Importando alimentos desde seed_alimentos.json...')
  if (!fs.existsSync(seedPath)) {
    console.error('ERROR: No se encontró seed_alimentos.json')
    process.exit(1)
  }

  const alimentos = JSON.parse(fs.readFileSync(seedPath, 'utf8'))
  const cols = Object.keys(alimentos[0]).join(', ')
  const placeholders = Object.keys(alimentos[0]).map(() => '?').join(', ')
  const insert = db.prepare(`INSERT OR IGNORE INTO alimentos (${cols}) VALUES (${placeholders})`)

  const insertMany = db.transaction((items) => {
    for (const a of items) insert.run(Object.values(a))
  })
  insertMany(alimentos)
  console.log(`✓ ${alimentos.length} alimentos importados`)
} else {
  console.log(`✓ Alimentos ya existentes: ${totalAlimentos} — omitiendo importación`)
}

db.close()

console.log('─────────────────────────────')
console.log('✅ Setup completado. Puedes arrancar el servidor con: npm run dev')