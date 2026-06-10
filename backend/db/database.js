const Database = require('better-sqlite3')
const path     = require('path')

// DATABASE_PATH allows tests to point to ':memory:' without touching the real DB
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'nutriapp.sqlite')
const db     = new Database(dbPath)

module.exports = db
