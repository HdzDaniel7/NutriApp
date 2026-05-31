const express = require('express')
const router = express.Router()
const db = require('../db/database')

// ─────────────────────────────────────────────
// PACIENTES
// ─────────────────────────────────────────────

// GET /api/patients — lista de pacientes activos
router.get('/', (req, res) => {
  try {
    const { q } = req.query
    let query = `SELECT * FROM pacientes WHERE activo = 1`
    const params = []

    if (q) {
      query += ` AND (nombre LIKE ? OR apellido LIKE ? OR email LIKE ?)`
      params.push(`%${q}%`, `%${q}%`, `%${q}%`)
    }

    query += ` ORDER BY nombre ASC`
    const pacientes = db.prepare(query).all(...params)
    res.json({ data: pacientes, total: pacientes.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/patients/:id — expediente completo
router.get('/:id', (req, res) => {
  try {
    const paciente = db.prepare(`SELECT * FROM pacientes WHERE id = ?`).get(req.params.id)
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' })

    const consultas = db.prepare(`
      SELECT * FROM consultas WHERE paciente_id = ? ORDER BY fecha DESC
    `).all(req.params.id)

    const planes = db.prepare(`
      SELECT id, nombre, fecha_creacion, vct_objetivo, modo FROM planes
      WHERE paciente_id = ? ORDER BY fecha_creacion DESC
    `).all(req.params.id)

    res.json({ ...paciente, consultas, planes })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/patients — crear paciente
router.post('/', (req, res) => {
  const { nombre, apellido, fecha_nacimiento, sexo, email, telefono, notas } = req.body
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' })

  try {
    const result = db.prepare(`
      INSERT INTO pacientes (nombre, apellido, fecha_nacimiento, sexo, email, telefono, notas)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(nombre, apellido, fecha_nacimiento, sexo, email, telefono, notas)

    const paciente = db.prepare(`SELECT * FROM pacientes WHERE id = ?`).get(result.lastInsertRowid)
    res.status(201).json(paciente)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/patients/:id — actualizar paciente
router.put('/:id', (req, res) => {
  const { nombre, apellido, fecha_nacimiento, sexo, email, telefono, notas } = req.body
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' })

  try {
    db.prepare(`
      UPDATE pacientes SET
        nombre = ?, apellido = ?, fecha_nacimiento = ?,
        sexo = ?, email = ?, telefono = ?, notas = ?
      WHERE id = ?
    `).run(nombre, apellido, fecha_nacimiento, sexo, email, telefono, notas, req.params.id)

    const paciente = db.prepare(`SELECT * FROM pacientes WHERE id = ?`).get(req.params.id)
    res.json(paciente)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/patients/:id — desactivar paciente (soft delete)
router.delete('/:id', (req, res) => {
  try {
    db.prepare(`UPDATE pacientes SET activo = 0 WHERE id = ?`).run(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────
// CONSULTAS
// ─────────────────────────────────────────────

// GET /api/patients/:id/consultas
router.get('/:id/consultas', (req, res) => {
  try {
    const consultas = db.prepare(`
      SELECT * FROM consultas WHERE paciente_id = ? ORDER BY fecha DESC
    `).all(req.params.id)
    res.json({ data: consultas, total: consultas.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/patients/:id/consultas
router.post('/:id/consultas', (req, res) => {
  const { fecha, peso, talla, pct_grasa, imc, cintura, cadera, notas } = req.body
  if (!fecha) return res.status(400).json({ error: 'La fecha es requerida' })

  try {
    const result = db.prepare(`
      INSERT INTO consultas (paciente_id, fecha, peso, talla, pct_grasa, imc, cintura, cadera, notas)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.params.id, fecha, peso, talla, pct_grasa, imc, cintura, cadera, notas)

    const consulta = db.prepare(`SELECT * FROM consultas WHERE id = ?`).get(result.lastInsertRowid)
    res.status(201).json(consulta)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────
// PLANES
// ─────────────────────────────────────────────

// GET /api/patients/:id/planes
router.get('/:id/planes', (req, res) => {
  try {
    const planes = db.prepare(`
      SELECT id, nombre, fecha_creacion, vct_objetivo, modo
      FROM planes WHERE paciente_id = ? ORDER BY fecha_creacion DESC
    `).all(req.params.id)
    res.json({ data: planes, total: planes.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/patients/:id/planes — guardar plan
router.post('/:id/planes', (req, res) => {
  const { consulta_id, nombre, vct_objetivo, distribucion_macros, modo, contenido } = req.body

  try {
    const result = db.prepare(`
      INSERT INTO planes (paciente_id, consulta_id, nombre, vct_objetivo, distribucion_macros, modo, contenido)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.params.id,
      consulta_id || null,
      nombre || 'Plan nutricional',
      vct_objetivo,
      JSON.stringify(distribucion_macros),
      modo || 'semanal_unico',
      JSON.stringify(contenido)
    )

    const plan = db.prepare(`SELECT * FROM planes WHERE id = ?`).get(result.lastInsertRowid)
    res.status(201).json(plan)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/plans/:id — obtener plan completo
router.get('/planes/:id', (req, res) => {
  try {
    const plan = db.prepare(`SELECT * FROM planes WHERE id = ?`).get(req.params.id)
    if (!plan) return res.status(404).json({ error: 'Plan no encontrado' })

    res.json({
      ...plan,
      distribucion_macros: JSON.parse(plan.distribucion_macros || '{}'),
      contenido: JSON.parse(plan.contenido || '{}'),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
