const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, 'db', 'nutriapp.sqlite'))

console.log('Iniciando migración v5 — plantillas y logo...')

const cols = db.prepare('PRAGMA table_info(usuarios)').all().map(c => c.name)

if (!cols.includes('plantilla_id')) {
  db.prepare('ALTER TABLE usuarios ADD COLUMN plantilla_id TEXT DEFAULT "moderna"').run()
  console.log('✓ Columna plantilla_id agregada')
} else {
  console.log('- plantilla_id ya existe')
}

if (!cols.includes('logo_base64')) {
  db.prepare('ALTER TABLE usuarios ADD COLUMN logo_base64 TEXT').run()
  console.log('✓ Columna logo_base64 agregada')
} else {
  console.log('- logo_base64 ya existe')
}

// Agregar también al setup.js para nuevas instalaciones
console.log('\n⚠️  Recuerda agregar estas columnas a setup.js')
console.log('Migración v5 completada.')

db.close()