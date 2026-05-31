const Database = require('better-sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, 'nutriapp.sqlite')
const db = new Database(dbPath)

console.log('Iniciando migración v2...')

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
    activo            INTEGER DEFAULT 1
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
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    FOREIGN KEY (consulta_id) REFERENCES consultas(id)
  )
`)
console.log('✓ Tabla planes lista')

// ─────────────────────────────────────────────
// Verificar tablas creadas
// ─────────────────────────────────────────────
const tablas = db.prepare(`
  SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
`).all()

console.log('\nTablas en la base de datos:')
tablas.forEach(t => console.log(' -', t.name))
console.log('\nMigración v2 completada exitosamente.')

db.close()