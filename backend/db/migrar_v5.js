const Database = require('better-sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, 'nutriapp.sqlite')
const db = new Database(dbPath)

console.log('Iniciando migración v5 — requerimientos energéticos en consultas...')

// ─────────────────────────────────────────────
// Columnas nuevas en consultas: resultado de la
// calculadora nutrimental capturado durante la consulta.
// distribucion_macros se guarda como JSON: {proteina, carbohidratos, grasa}
// ─────────────────────────────────────────────
const columnas = [
  ['formula_tmb',         'TEXT'],
  ['factor_actividad',    'REAL'],
  ['objetivo_kcal',       'INTEGER'],
  ['tmb_kcal',            'INTEGER'],
  ['get_kcal',            'INTEGER'],
  ['vct_kcal',            'INTEGER'],
  ['distribucion_macros', 'TEXT'],
]

const existentes = db.prepare(`PRAGMA table_info(consultas)`).all().map(c => c.name)

columnas.forEach(([nombre, tipo]) => {
  if (existentes.includes(nombre)) {
    console.log(`· Columna ${nombre} ya existe — se omite`)
    return
  }
  db.exec(`ALTER TABLE consultas ADD COLUMN ${nombre} ${tipo}`)
  console.log(`✓ Columna ${nombre} agregada`)
})

console.log('\nMigración v5 completada exitosamente.')
db.close()
