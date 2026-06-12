const express = require('express')
const router = express.Router()
const db = require('../db/database')

function safeJsonParse(str, fallback = {}) {
  if (!str) return fallback
  try { return JSON.parse(str) } catch { return fallback }
}

function verificarPaciente(pacienteId, usuarioId) {
  return db.prepare(`SELECT id FROM pacientes WHERE id = ? AND usuario_id = ? AND activo = 1`).get(pacienteId, usuarioId)
}

// ─────────────────────────────────────────────
// PACIENTES
// ─────────────────────────────────────────────

// GET /api/patients — lista de pacientes activos
router.get('/', (req, res) => {
  try {
    const { q } = req.query
    let query = `SELECT * FROM pacientes WHERE activo = 1 AND usuario_id = ?`
    const params = [req.usuario.id]

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
    const paciente = db.prepare(`SELECT * FROM pacientes WHERE id = ? AND usuario_id = ?`)
      .get(req.params.id, req.usuario.id)
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' })

    const consultas = db.prepare(`
      SELECT * FROM consultas WHERE paciente_id = ? ORDER BY fecha DESC
    `).all(req.params.id)

    const planes = db.prepare(`
      SELECT id, nombre, fecha_creacion, vct_objetivo, modo FROM planes
      WHERE paciente_id = ? AND usuario_id = ? ORDER BY fecha_creacion DESC
    `).all(req.params.id, req.usuario.id)

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
      INSERT INTO pacientes (nombre, apellido, fecha_nacimiento, sexo, email, telefono, notas, usuario_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(nombre, apellido, fecha_nacimiento, sexo, email, telefono, notas, req.usuario.id)

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
    const info = db.prepare(`
      UPDATE pacientes SET
        nombre = ?, apellido = ?, fecha_nacimiento = ?,
        sexo = ?, email = ?, telefono = ?, notas = ?
      WHERE id = ? AND usuario_id = ?
    `).run(nombre, apellido, fecha_nacimiento, sexo, email, telefono, notas, req.params.id, req.usuario.id)

    if (info.changes === 0) return res.status(404).json({ error: 'Paciente no encontrado' })

    const paciente = db.prepare(`SELECT * FROM pacientes WHERE id = ?`).get(req.params.id)
    res.json(paciente)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/patients/:id — desactivar paciente (soft delete)
router.delete('/:id', (req, res) => {
  try {
    const info = db.prepare(`UPDATE pacientes SET activo = 0 WHERE id = ? AND usuario_id = ?`)
      .run(req.params.id, req.usuario.id)
    if (info.changes === 0) return res.status(404).json({ error: 'Paciente no encontrado' })
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
    if (!verificarPaciente(req.params.id, req.usuario.id))
      return res.status(404).json({ error: 'Paciente no encontrado' })

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
  const {
    fecha, peso, talla, pct_grasa, imc, cintura, cadera, notas,
    formula_tmb, factor_actividad, objetivo_kcal, tmb_kcal, get_kcal, vct_kcal, distribucion_macros,
  } = req.body
  if (!fecha) return res.status(400).json({ error: 'La fecha es requerida' })

  try {
    if (!verificarPaciente(req.params.id, req.usuario.id))
      return res.status(404).json({ error: 'Paciente no encontrado' })

    const result = db.prepare(`
      INSERT INTO consultas (
        paciente_id, fecha, peso, talla, pct_grasa, imc, cintura, cadera, notas,
        formula_tmb, factor_actividad, objetivo_kcal, tmb_kcal, get_kcal, vct_kcal, distribucion_macros
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.params.id, fecha, peso, talla, pct_grasa, imc, cintura, cadera, notas,
      formula_tmb || null, factor_actividad || null, objetivo_kcal ?? null,
      tmb_kcal || null, get_kcal || null, vct_kcal || null,
      distribucion_macros ? JSON.stringify(distribucion_macros) : null,
    )

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
    if (!verificarPaciente(req.params.id, req.usuario.id))
      return res.status(404).json({ error: 'Paciente no encontrado' })

    const planes = db.prepare(`
      SELECT id, nombre, fecha_creacion, vct_objetivo, modo
      FROM planes WHERE paciente_id = ? AND usuario_id = ? ORDER BY fecha_creacion DESC
    `).all(req.params.id, req.usuario.id)
    res.json({ data: planes, total: planes.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/patients/:id/planes — guardar plan
router.post('/:id/planes', (req, res) => {
  const { consulta_id, nombre, vct_objetivo, distribucion_macros, modo, contenido } = req.body

  try {
    if (!verificarPaciente(req.params.id, req.usuario.id))
      return res.status(404).json({ error: 'Paciente no encontrado' })

    const result = db.prepare(`
      INSERT INTO planes (paciente_id, consulta_id, nombre, vct_objetivo, distribucion_macros, modo, contenido, usuario_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.params.id,
      consulta_id || null,
      nombre || 'Plan nutricional',
      vct_objetivo,
      JSON.stringify(distribucion_macros),
      modo || 'semanal_unico',
      JSON.stringify(contenido),
      req.usuario.id
    )

    const plan = db.prepare(`SELECT * FROM planes WHERE id = ?`).get(result.lastInsertRowid)
    res.status(201).json(plan)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/patients/planes/:id — obtener plan completo
router.get('/planes/:id', (req, res) => {
  try {
    const plan = db.prepare(`SELECT * FROM planes WHERE id = ? AND usuario_id = ?`)
      .get(req.params.id, req.usuario.id)
    if (!plan) return res.status(404).json({ error: 'Plan no encontrado' })

    res.json({
      ...plan,
      distribucion_macros: safeJsonParse(plan.distribucion_macros),
      contenido: safeJsonParse(plan.contenido),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
