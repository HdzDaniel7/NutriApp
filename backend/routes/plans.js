const express = require('express')
const router = express.Router()
const db = require('../db/database')

// GET /api/plans/:id — obtener plan completo
router.get('/:id', (req, res) => {
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

// PUT /api/plans/:id — actualizar plan existente
router.put('/:id', (req, res) => {
  const { nombre, vct_objetivo, distribucion_macros, modo, contenido } = req.body
  try {
    db.prepare(`
      UPDATE planes SET
        nombre = ?,
        vct_objetivo = ?,
        distribucion_macros = ?,
        modo = ?,
        contenido = ?
      WHERE id = ?
    `).run(
      nombre || 'Plan nutricional',
      vct_objetivo,
      JSON.stringify(distribucion_macros),
      modo || 'semanal_unico',
      JSON.stringify(contenido),
      req.params.id
    )

    const plan = db.prepare(`SELECT * FROM planes WHERE id = ?`).get(req.params.id)
    res.json({
      ...plan,
      distribucion_macros: JSON.parse(plan.distribucion_macros || '{}'),
      contenido: JSON.parse(plan.contenido || '{}'),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/plans/:id — eliminar plan
router.delete('/:id', (req, res) => {
  try {
    db.prepare(`DELETE FROM planes WHERE id = ?`).run(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/plans/:id/duplicar — duplicar plan
router.post('/:id/duplicar', (req, res) => {
  try {
    const plan = db.prepare(`SELECT * FROM planes WHERE id = ?`).get(req.params.id)
    if (!plan) return res.status(404).json({ error: 'Plan no encontrado' })

    const result = db.prepare(`
      INSERT INTO planes (paciente_id, consulta_id, nombre, vct_objetivo, distribucion_macros, modo, contenido)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      plan.paciente_id,
      plan.consulta_id,
      `${plan.nombre} duplicado`,
      plan.vct_objetivo,
      plan.distribucion_macros,
      plan.modo,
      plan.contenido
    )

    const nuevo = db.prepare(`SELECT * FROM planes WHERE id = ?`).get(result.lastInsertRowid)
    res.status(201).json({
      ...nuevo,
      distribucion_macros: JSON.parse(nuevo.distribucion_macros || '{}'),
      contenido: JSON.parse(nuevo.contenido || '{}'),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/plans/:id/renombrar — renombrar plan
router.patch('/:id/renombrar', (req, res) => {
  const { nombre } = req.body
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' })
  try {
    db.prepare(`UPDATE planes SET nombre = ? WHERE id = ?`).run(nombre, req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router