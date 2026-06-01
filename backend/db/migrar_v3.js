const Database = require('better-sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, 'nutriapp.sqlite')
const db = new Database(dbPath)

console.log('Iniciando migración v3 — autenticación multi-usuario...')

// ─────────────────────────────────────────────
// Limpiar datos de ejemplo
// ─────────────────────────────────────────────
db.exec(`DELETE FROM planes`)
db.exec(`DELETE FROM consultas`)
db.exec(`DELETE FROM pacientes`)
db.exec(`DELETE FROM sqlite_sequence WHERE name IN ('planes', 'consultas', 'pacientes')`)
console.log('✓ Datos de ejemplo eliminados')

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
    fecha_creacion  TEXT DEFAULT (datetime('now'))
  )
`)
console.log('✓ Tabla usuarios lista')

// ─────────────────────────────────────────────
// Agregar usuario_id a pacientes y planes
// ─────────────────────────────────────────────
const columnasPacientes = db.prepare(`PRAGMA table_info(pacientes)`).all()
if (!columnasPacientes.find(c => c.name === 'usuario_id')) {
  db.exec(`ALTER TABLE pacientes ADD COLUMN usuario_id INTEGER REFERENCES usuarios(id)`)
  console.log('✓ Columna usuario_id agregada a pacientes')
} else {
  console.log('- usuario_id ya existe en pacientes')
}

const columnasPlanes = db.prepare(`PRAGMA table_info(planes)`).all()
if (!columnasPlanes.find(c => c.name === 'usuario_id')) {
  db.exec(`ALTER TABLE planes ADD COLUMN usuario_id INTEGER REFERENCES usuarios(id)`)
  console.log('✓ Columna usuario_id agregada a planes')
} else {
  console.log('- usuario_id ya existe en planes')
}

// ─────────────────────────────────────────────
// Verificar resultado
// ─────────────────────────────────────────────
const tablas = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).all()
console.log('\nTablas en la base de datos:')
tablas.forEach(t => console.log(' -', t.name))
console.log('\nMigración v3 completada exitosamente.')

db.close()