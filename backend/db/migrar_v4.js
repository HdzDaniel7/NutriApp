const Database = require('better-sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, 'nutriapp.sqlite')
const db = new Database(dbPath)

console.log('Iniciando migración v4 — agenda y citas...')

// ─────────────────────────────────────────────
// TABLA: configuracion_agenda
// Horario de trabajo del nutriólogo
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
// TABLA: citas
// ─────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS citas (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id      INTEGER NOT NULL,
    paciente_id     INTEGER,
    fecha           TEXT NOT NULL,
    hora_inicio     TEXT NOT NULL,
    hora_fin        TEXT NOT NULL,
    estado          TEXT DEFAULT 'programada',
    tipo            TEXT DEFAULT 'consulta',
    notas           TEXT,
    fecha_creacion  TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (usuario_id)  REFERENCES usuarios(id),
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
  )
`)
console.log('✓ Tabla citas lista')

// ─────────────────────────────────────────────
// Verificar resultado
// ─────────────────────────────────────────────
const tablas = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).all()
console.log('\nTablas en la base de datos:')
tablas.forEach(t => console.log(' -', t.name))
console.log('\nMigración v4 completada exitosamente.')

db.close()