/**
 * Base de datos de pruebas con datos realistas.
 * Genera: backend/db/nutriapp_test.sqlite
 *
 * Uso: node backend/db/seed_test.js
 *
 * Credenciales del usuario de prueba:
 *   email:    ana@nutridesk.test
 *   password: Test1234!
 */

const Database = require('better-sqlite3')
const bcrypt   = require('bcryptjs')
const path     = require('path')
const fs       = require('fs')

const dbPath = path.join(__dirname, 'nutriapp_test.sqlite')

// Start fresh
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath)
const db = new Database(dbPath)

console.log('Creando base de datos de prueba...')

// ── Schema ────────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE usuarios (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre          TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    rol             TEXT DEFAULT 'nutriologo',
    activo          INTEGER DEFAULT 1,
    fecha_creacion  TEXT DEFAULT (datetime('now')),
    plantilla_id    TEXT DEFAULT 'moderna',
    logo_base64     TEXT,
    logo_path       TEXT,
    color_pdf       TEXT DEFAULT 'verde',
    posicion_logo   TEXT DEFAULT 'superior_derecha'
  );

  CREATE TABLE pacientes (
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
  );

  CREATE TABLE consultas (
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
  );

  CREATE TABLE planes (
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
  );

  CREATE TABLE citas (
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
  );

  CREATE TABLE configuracion_agenda (
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
  );

  CREATE INDEX idx_pacientes_usuario ON pacientes(usuario_id);
  CREATE INDEX idx_pacientes_activo  ON pacientes(activo);
  CREATE INDEX idx_planes_usuario    ON planes(usuario_id);
  CREATE INDEX idx_planes_paciente   ON planes(paciente_id);
  CREATE INDEX idx_citas_usuario     ON citas(usuario_id);
  CREATE INDEX idx_citas_fecha       ON citas(fecha);
`)

// ── Usuario de prueba ─────────────────────────────────────────────────────────

const usuarioId = db.prepare(`
  INSERT INTO usuarios (nombre, email, password_hash, plantilla_id, color_pdf, posicion_logo)
  VALUES (?, ?, ?, 'moderna', 'verde', 'superior_derecha')
`).run(
  'Dra. Ana García',
  'ana@nutridesk.test',
  bcrypt.hashSync('Test1234!', 10)
).lastInsertRowid

console.log(`✓ Usuario creado  (id=${usuarioId})  ana@nutridesk.test / Test1234!`)

// ── Configuración de agenda ───────────────────────────────────────────────────

db.prepare(`
  INSERT INTO configuracion_agenda (usuario_id, hora_inicio, hora_fin, duracion_cita, dias_laborales)
  VALUES (?, '08:00', '17:00', 45, '1,2,3,4,5')
`).run(usuarioId)

// ── Pacientes ─────────────────────────────────────────────────────────────────

const insertPaciente = db.prepare(`
  INSERT INTO pacientes (nombre, apellido, fecha_nacimiento, sexo, email, telefono, notas, usuario_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`)

const pacientes = [
  ['Carlos',    'Mendoza Ríos',     '1989-03-15', 'M', 'carlos.mendoza@gmail.com',   '5512345678', 'Objetivo: bajar 10 kg en 6 meses. Hábito sedentario.'],
  ['María',     'López Hernández',  '1996-07-22', 'F', 'maria.lopez@gmail.com',       '5598765432', 'Amenorrea funcional. Control de composición corporal.'],
  ['Juan',      'García Reyes',     '1972-11-08', 'M', 'juan.garcia@outlook.com',     null,         'DM2 controlada. Dieta baja en carbohidratos.'],
  ['Ana',       'Martínez Soto',    '1979-05-30', 'F', 'anam@outlook.com',            '5567891234', 'Hipotiroidismo. Medicada con levotiroxina.'],
  ['Roberto',   'Torres Blanco',    '2002-01-14', 'M', 'rtorres@gmail.com',           '5543219876', 'Deportista. Hipertrofia muscular. 5 días de entrenamiento/semana.'],
  ['Sandra',    'Flores Castillo',  '1986-09-03', 'F', null,                          '5523456789', null],
  ['Miguel',    'Ramírez Fuentes',  '1963-12-25', 'M', 'miguelr@gmail.com',           null,         'HAS. Dieta DASH. Restricción de sodio.'],
  ['Patricia',  'Vega Díaz',        '1993-04-17', 'F', 'patriciav@gmail.com',         '5589012345', null],
  ['Luis',      'Hernández Cruz',   '1977-08-10', 'M', null,                          '5534567890', 'Triglicéridos elevados. Restricción de azúcares simples.'],
  ['Elena',     'Cruz Morales',     '2005-02-28', 'F', 'elenac@gmail.com',            '5512398765', 'Estudiante universitaria. Primer control.'],
]

const pacienteIds = pacientes.map(([nombre, apellido, fnac, sexo, email, tel, notas]) =>
  insertPaciente.run(nombre, apellido, fnac, sexo, email, tel, notas, usuarioId).lastInsertRowid
)

console.log(`✓ ${pacientes.length} pacientes creados`)

// ── Consultas ─────────────────────────────────────────────────────────────────

const insertConsulta = db.prepare(`
  INSERT INTO consultas (paciente_id, fecha, peso, talla, pct_grasa, imc, cintura, cadera, notas)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

// Carlos — 3 consultas (seguimiento de pérdida de peso)
const consultaCarlos1 = insertConsulta.run(pacienteIds[0], '2024-10-01', 88.5, 175, 22.0, 28.9, 95, 104, 'Inicio de plan. Resistencia a la insulina leve.').lastInsertRowid
const consultaCarlos2 = insertConsulta.run(pacienteIds[0], '2024-11-05', 86.2, 175, 20.5, 28.1, 92, 102, 'Buena adherencia. Redujo refrescos. Continuar plan.').lastInsertRowid
const consultaCarlos3 = insertConsulta.run(pacienteIds[0], '2025-01-15', 83.8, 175, 19.0, 27.4, 89, 100, 'Excelente progreso. IMC ya en sobrepeso bajo.').lastInsertRowid

// María — 2 consultas
const consultaMaria1  = insertConsulta.run(pacienteIds[1], '2024-09-20', 72.0, 162, 32.0, 27.4, 80, 96,  'Amenorrea de 4 meses. Restricción calórica previa severa.').lastInsertRowid
const consultaMaria2  = insertConsulta.run(pacienteIds[1], '2024-12-10', 68.5, 162, 29.0, 26.1, 76, 93,  'Ciclo menstrual restablecido. Energia mejorada.').lastInsertRowid

// Juan — 1 consulta
const consultaJuan1   = insertConsulta.run(pacienteIds[2], '2025-02-01', 95.0, 172, 28.0, 32.1, 102, 108, 'HbA1c: 7.2. Meta: < 7. Patrón bajo en CHO.').lastInsertRowid

// Roberto — 2 consultas
insertConsulta.run(pacienteIds[4], '2025-03-01', 68.0, 178, 12.0, 21.5, 78, 92,  'Vol. entrenamiento: push/pull/legs 5×/semana. Meta: +5 kg músculo.')
insertConsulta.run(pacienteIds[4], '2025-04-15', 71.0, 178, 13.0, 22.4, 79, 93,  'Ganó 3 kg en 6 semanas. Buena respuesta al superávit calórico.')

// Ana — 1 consulta
insertConsulta.run(pacienteIds[3], '2025-01-20', 74.0, 160, 34.0, 28.9, 83, 100, 'TSH: 3.8. Levotiroxina 50 mcg. Fatiga y retención de líquidos.')

console.log('✓ 9 consultas creadas')

// ── Planes ────────────────────────────────────────────────────────────────────

const planCarlos = JSON.stringify({
  vct_objetivo: 2100,
  distribucion_macros: { proteina: 30, carbohidratos: 40, grasa: 30 },
  modo: 'semanal_unico',
  tiempos: [
    { id: 'desayuno', nombre: 'Desayuno',  emoji: '🌅', orden: 1, alimentos: [] },
    { id: 'colacion', nombre: 'Colación',  emoji: '🍎', orden: 2, alimentos: [] },
    { id: 'comida',   nombre: 'Comida',    emoji: '🍽️', orden: 3, alimentos: [] },
    { id: 'cena',     nombre: 'Cena',      emoji: '🌙', orden: 4, alimentos: [] },
  ],
})

const planMaria = JSON.stringify({
  vct_objetivo: 1750,
  distribucion_macros: { proteina: 25, carbohidratos: 50, grasa: 25 },
  modo: 'semanal_unico',
  tiempos: [
    { id: 'desayuno', nombre: 'Desayuno',    emoji: '🌅', orden: 1, alimentos: [] },
    { id: 'colacion', nombre: 'Colación AM', emoji: '🍎', orden: 2, alimentos: [] },
    { id: 'comida',   nombre: 'Comida',      emoji: '🍽️', orden: 3, alimentos: [] },
    { id: 'merienda', nombre: 'Merienda',    emoji: '🥤', orden: 4, alimentos: [] },
    { id: 'cena',     nombre: 'Cena',        emoji: '🌙', orden: 5, alimentos: [] },
  ],
})

const planRoberto = JSON.stringify({
  vct_objetivo: 3200,
  distribucion_macros: { proteina: 35, carbohidratos: 45, grasa: 20 },
  modo: 'por_dia',
  tiempos: [],
  dias: [
    {
      id: 'entrenamiento', nombre: 'Día de entrenamiento', orden: 1,
      tiempos: [
        { id: 'pre',  nombre: 'Pre-entreno',  emoji: '⚡', orden: 1, alimentos: [] },
        { id: 'post', nombre: 'Post-entreno', emoji: '💪', orden: 2, alimentos: [] },
        { id: 'com',  nombre: 'Comida',       emoji: '🍽️', orden: 3, alimentos: [] },
        { id: 'cena', nombre: 'Cena',         emoji: '🌙', orden: 4, alimentos: [] },
      ],
    },
    {
      id: 'descanso', nombre: 'Día de descanso', orden: 2,
      tiempos: [
        { id: 'des',  nombre: 'Desayuno', emoji: '🌅', orden: 1, alimentos: [] },
        { id: 'com',  nombre: 'Comida',   emoji: '🍽️', orden: 2, alimentos: [] },
        { id: 'cena', nombre: 'Cena',     emoji: '🌙', orden: 3, alimentos: [] },
      ],
    },
  ],
})

db.prepare(`
  INSERT INTO planes (paciente_id, consulta_id, nombre, vct_objetivo, distribucion_macros, modo, contenido, usuario_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run(pacienteIds[0], consultaCarlos3, 'Plan pérdida de peso — Carlos', 2100, '{"proteina":30,"carbohidratos":40,"grasa":30}', 'semanal_unico', planCarlos, usuarioId)

db.prepare(`
  INSERT INTO planes (paciente_id, consulta_id, nombre, vct_objetivo, distribucion_macros, modo, contenido, usuario_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run(pacienteIds[1], consultaMaria2, 'Plan restitución hormonal — María', 1750, '{"proteina":25,"carbohidratos":50,"grasa":25}', 'semanal_unico', planMaria, usuarioId)

db.prepare(`
  INSERT INTO planes (paciente_id, consulta_id, nombre, vct_objetivo, distribucion_macros, modo, contenido, usuario_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run(pacienteIds[4], null, 'Plan hipertrofia — Roberto', 3200, '{"proteina":35,"carbohidratos":45,"grasa":20}', 'por_dia', planRoberto, usuarioId)

console.log('✓ 3 planes creados')

// ── Citas ─────────────────────────────────────────────────────────────────────

const insertCita = db.prepare(`
  INSERT INTO citas (usuario_id, paciente_id, fecha, hora_inicio, hora_fin, estado, tipo, notas)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`)

insertCita.run(usuarioId, pacienteIds[0], '2025-07-01', '09:00', '09:45', 'programada', 'consulta',    'Seguimiento mensual. Traer análisis de glucosa.')
insertCita.run(usuarioId, pacienteIds[1], '2025-07-01', '10:00', '10:45', 'programada', 'consulta',    null)
insertCita.run(usuarioId, pacienteIds[2], '2025-07-02', '09:00', '09:45', 'programada', 'consulta',    'Revisar HbA1c actualizada.')
insertCita.run(usuarioId, pacienteIds[4], '2025-07-02', '11:00', '11:45', 'programada', 'consulta',    null)
insertCita.run(usuarioId, pacienteIds[3], '2025-07-03', '09:00', '09:45', 'programada', 'primera_vez', null)
insertCita.run(usuarioId, null,           '2025-07-03', '16:00', '16:45', 'programada', 'consulta',    null)

console.log('✓ 6 citas creadas')

// ── Summary ───────────────────────────────────────────────────────────────────

db.close()

console.log('')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`✅ Base de datos de prueba creada en:`)
console.log(`   ${dbPath}`)
console.log('')
console.log('   Usuario de prueba:')
console.log('   email:    ana@nutridesk.test')
console.log('   password: Test1234!')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
