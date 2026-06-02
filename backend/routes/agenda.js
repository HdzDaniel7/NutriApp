const express = require('express')
const router = express.Router()
const db = require('../db/database')

// ─────────────────────────────────────────────
// CONFIGURACIÓN DE AGENDA
// ─────────────────────────────────────────────

// GET /api/agenda/config — obtener configuración
router.get('/config', (req, res) => {
  try {
    let config = db.prepare(`SELECT * FROM configuracion_agenda WHERE usuario_id = ?`).get(req.usuario.id)
    if (!config) {
      // Crear configuración por defecto si no existe
      db.prepare(`
        INSERT INTO configuracion_agenda (usuario_id) VALUES (?)
      `).run(req.usuario.id)
      config = db.prepare(`SELECT * FROM configuracion_agenda WHERE usuario_id = ?`).get(req.usuario.id)
    }
    res.json({ ...config, dias_laborales: config.dias_laborales.split(',').map(Number) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/agenda/config — actualizar configuración
router.put('/config', (req, res) => {
  const { hora_inicio, hora_fin, duracion_cita, dias_laborales, descanso_inicio, descanso_fin, notas } = req.body
  try {
    db.prepare(`
      UPDATE configuracion_agenda SET
        hora_inicio = ?, hora_fin = ?, duracion_cita = ?,
        dias_laborales = ?, descanso_inicio = ?, descanso_fin = ?, notas = ?
      WHERE usuario_id = ?
    `).run(
      hora_inicio, hora_fin, duracion_cita,
      Array.isArray(dias_laborales) ? dias_laborales.join(',') : dias_laborales,
      descanso_inicio, descanso_fin, notas,
      req.usuario.id
    )
    const config = db.prepare(`SELECT * FROM configuracion_agenda WHERE usuario_id = ?`).get(req.usuario.id)
    res.json({ ...config, dias_laborales: config.dias_laborales.split(',').map(Number) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────
// CITAS
// ─────────────────────────────────────────────

// GET /api/agenda/citas — listar citas con filtros
router.get('/citas', (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, paciente_id, estado } = req.query
    let query = `
      SELECT c.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido
      FROM citas c
      LEFT JOIN pacientes p ON c.paciente_id = p.id
      WHERE c.usuario_id = ?
    `
    const params = [req.usuario.id]

    if (fecha_inicio) { query += ` AND c.fecha >= ?`; params.push(fecha_inicio) }
    if (fecha_fin)    { query += ` AND c.fecha <= ?`; params.push(fecha_fin) }
    if (paciente_id)  { query += ` AND c.paciente_id = ?`; params.push(paciente_id) }
    if (estado)       { query += ` AND c.estado = ?`; params.push(estado) }

    query += ` ORDER BY c.fecha ASC, c.hora_inicio ASC`
    const citas = db.prepare(query).all(...params)
    res.json({ data: citas, total: citas.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/agenda/citas/mes — citas de un mes específico
router.get('/citas/mes', (req, res) => {
  try {
    const { año, mes } = req.query
    const fechaInicio = `${año}-${String(mes).padStart(2, '0')}-01`
    const fechaFin    = `${año}-${String(mes).padStart(2, '0')}-31`

    const citas = db.prepare(`
      SELECT c.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido
      FROM citas c
      LEFT JOIN pacientes p ON c.paciente_id = p.id
      WHERE c.usuario_id = ? AND c.fecha BETWEEN ? AND ?
      ORDER BY c.fecha ASC, c.hora_inicio ASC
    `).all(req.usuario.id, fechaInicio, fechaFin)

    res.json({ data: citas, total: citas.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/agenda/citas — crear cita
router.post('/citas', (req, res) => {
  const { paciente_id, nombre_provisional, fecha, hora_inicio, hora_fin, estado, tipo, notas } = req.body
  if (!fecha || !hora_inicio || !hora_fin) {
    return res.status(400).json({ error: 'Fecha, hora inicio y hora fin son requeridos' })
  }
  try {
    const result = db.prepare(`
      INSERT INTO citas (usuario_id, paciente_id, nombre_provisional, fecha, hora_inicio, hora_fin, estado, tipo, notas)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.usuario.id, paciente_id || null, nombre_provisional || null, fecha, hora_inicio, hora_fin, estado || 'programada', tipo || 'consulta', notas)

    const cita = db.prepare(`
      SELECT c.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido
      FROM citas c LEFT JOIN pacientes p ON c.paciente_id = p.id
      WHERE c.id = ?
    `).get(result.lastInsertRowid)
    res.status(201).json(cita)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/agenda/citas/:id — actualizar cita
router.put('/citas/:id', (req, res) => {
  const { paciente_id, nombre_provisional, fecha, hora_inicio, hora_fin, estado, tipo, notas } = req.body
  try {
    db.prepare(`
      UPDATE citas SET
        paciente_id = ?, nombre_provisional = ?, fecha = ?, hora_inicio = ?, hora_fin = ?,
        estado = ?, tipo = ?, notas = ?
      WHERE id = ? AND usuario_id = ?
    `).run(paciente_id || null, nombre_provisional || null, fecha, hora_inicio, hora_fin, estado, tipo, notas, req.params.id, req.usuario.id)

    const cita = db.prepare(`
      SELECT c.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido
      FROM citas c LEFT JOIN pacientes p ON c.paciente_id = p.id
      WHERE c.id = ?
    `).get(req.params.id)
    res.json(cita)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/agenda/citas/:id — eliminar cita
router.delete('/citas/:id', (req, res) => {
  try {
    db.prepare(`DELETE FROM citas WHERE id = ? AND usuario_id = ?`).run(req.params.id, req.usuario.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/agenda/citas/:id/estado — cambiar estado
router.patch('/citas/:id/estado', (req, res) => {
  const { estado } = req.body
  if (!estado) return res.status(400).json({ error: 'Estado requerido' })
  try {
    db.prepare(`UPDATE citas SET estado = ? WHERE id = ? AND usuario_id = ?`)
      .run(estado, req.params.id, req.usuario.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router