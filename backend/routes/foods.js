const express = require('express')
const router = express.Router()
const db = require('../db/database')

// Buscar alimentos
router.get('/search', (req, res) => {
  const { q, tipo, limit = 50 } = req.query

  let query = 'SELECT * FROM alimentos WHERE 1=1'
  const params = []

  if (q) {
    query += ' AND descripcion LIKE ?'
    params.push(`%${q}%`)
  }

  if (tipo) {
    query += ' AND tipo LIKE ?'
    params.push(`%${tipo}%`)
  }

  query += ' LIMIT ?'
  params.push(parseInt(limit))

  try {
    const alimentos = db.prepare(query).all(...params)
    res.json({ data: alimentos, total: alimentos.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Obtener un alimento por id
router.get('/:id', (req, res) => {
  try {
    const alimento = db.prepare('SELECT * FROM alimentos WHERE id = ?').get(req.params.id)
    if (!alimento) return res.status(404).json({ error: 'Alimento no encontrado' })
    res.json(alimento)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Obtener todos los tipos/categorías
router.get('/meta/tipos', (req, res) => {
  try {
    const tipos = db.prepare('SELECT DISTINCT tipo FROM alimentos ORDER BY tipo').all()
    res.json(tipos.map(t => t.tipo))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router