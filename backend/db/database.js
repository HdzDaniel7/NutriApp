const Database = require('better-sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, 'nutriapp.sqlite')

const db = new Database(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS alimentos (
    id                            INTEGER PRIMARY KEY AUTOINCREMENT,
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

console.log('Base de datos conectada:', dbPath)

module.exports = db