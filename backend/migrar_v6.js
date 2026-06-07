const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, 'db', 'nutriapp.sqlite'))

console.log('Iniciando migración v6 — colores y posición de logo...')

const cols = db.prepare('PRAGMA table_info(usuarios)').all().map(c => c.name)

if (!cols.includes('color_pdf')) {
  db.prepare(`ALTER TABLE usuarios ADD COLUMN color_pdf TEXT DEFAULT 'verde'`).run()
  console.log('✓ Columna color_pdf agregada')
} else {
  console.log('- color_pdf ya existe')
}

if (!cols.includes('posicion_logo')) {
  db.prepare(`ALTER TABLE usuarios ADD COLUMN posicion_logo TEXT DEFAULT 'superior_derecha'`).run()
  console.log('✓ Columna posicion_logo agregada')
} else {
  console.log('- posicion_logo ya existe')
}

console.log('Migración v6 completada.')
db.close()