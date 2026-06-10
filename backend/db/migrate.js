const path = require('path')
const fs   = require('fs')

const MIGRATIONS = [
  // v1: base schema — runs on fresh installs and in-memory test databases.
  // All statements use IF NOT EXISTS so running on existing production DBs is safe.
  {
    version: 1,
    name: 'base_schema',
    up(db) {
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
          logo_base64     TEXT,
          logo_path       TEXT,
          color_pdf       TEXT DEFAULT 'verde',
          posicion_logo   TEXT DEFAULT 'superior_derecha'
        );

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
        );

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
        );

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
        );

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
        );

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
        );
      `)
    },
  },

  // v7: indexes and logo_path.
  // Skips indexes 2–6 because those were applied via ad-hoc scripts before this system existed.
  {
    version: 7,
    name: 'indexes_and_logo_path',
    up(db) {
      // Add logo_path if missing (existing installs that pre-date this migration)
      const cols = db.prepare('PRAGMA table_info(usuarios)').all().map(c => c.name)
      if (!cols.includes('logo_path')) {
        db.prepare('ALTER TABLE usuarios ADD COLUMN logo_path TEXT').run()
      }

      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_pacientes_usuario ON pacientes(usuario_id);
        CREATE INDEX IF NOT EXISTS idx_pacientes_activo  ON pacientes(activo);
        CREATE INDEX IF NOT EXISTS idx_planes_usuario    ON planes(usuario_id);
        CREATE INDEX IF NOT EXISTS idx_planes_paciente   ON planes(paciente_id);
        CREATE INDEX IF NOT EXISTS idx_citas_usuario     ON citas(usuario_id);
        CREATE INDEX IF NOT EXISTS idx_citas_fecha       ON citas(fecha);
      `)

      if (process.env.NODE_ENV !== 'test') {
        fs.mkdirSync(path.join(__dirname, '..', 'uploads', 'logos'), { recursive: true })
      }
    },
  },
]

function runMigrations(db) {
  const current = db.pragma('user_version', { simple: true })
  let applied = 0

  for (const m of MIGRATIONS) {
    if (m.version > current) {
      m.up(db)
      db.pragma(`user_version = ${m.version}`)
      console.log(`[db] Migration v${m.version} aplicada: ${m.name}`)
      applied++
    }
  }

  const target = MIGRATIONS[MIGRATIONS.length - 1]?.version ?? current
  if (applied === 0) {
    console.log(`[db] Esquema v${target} — sin migraciones pendientes`)
  }
}

module.exports = { runMigrations }
