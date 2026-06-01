const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db/database')

const JWT_SECRET = process.env.JWT_SECRET || 'nutriapp_secret_dev'
const JWT_EXPIRES = '8h'

// ─────────────────────────────────────────────
// POST /api/auth/register — registrar nutriólogo
// ─────────────────────────────────────────────
router.post('/register', (req, res) => {
  const { nombre, email, password } = req.body
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y password son requeridos' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'El password debe tener al menos 6 caracteres' })
  }

  try {
    const existe = db.prepare(`SELECT id FROM usuarios WHERE email = ?`).get(email)
    if (existe) return res.status(409).json({ error: 'Ya existe una cuenta con ese email' })

    const password_hash = bcrypt.hashSync(password, 10)
    const result = db.prepare(`
      INSERT INTO usuarios (nombre, email, password_hash)
      VALUES (?, ?, ?)
    `).run(nombre, email.toLowerCase().trim(), password_hash)

    const usuario = db.prepare(`SELECT id, nombre, email, rol FROM usuarios WHERE id = ?`).get(result.lastInsertRowid)
    const token = jwt.sign({ id: usuario.id, email: usuario.email, rol: usuario.rol }, JWT_SECRET, { expiresIn: JWT_EXPIRES })

    res.status(201).json({ usuario, token })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────
// POST /api/auth/login — iniciar sesión
// ─────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son requeridos' })
  }

  try {
    const usuario = db.prepare(`SELECT * FROM usuarios WHERE email = ? AND activo = 1`).get(email.toLowerCase().trim())
    if (!usuario) return res.status(401).json({ error: 'Credenciales incorrectas' })

    const passwordValido = bcrypt.compareSync(password, usuario.password_hash)
    if (!passwordValido) return res.status(401).json({ error: 'Credenciales incorrectas' })

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    )

    res.json({
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
      token
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────
// GET /api/auth/me — verificar sesión activa
// ─────────────────────────────────────────────
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'No autorizado' })

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const usuario = db.prepare(`SELECT id, nombre, email, rol FROM usuarios WHERE id = ? AND activo = 1`).get(decoded.id)
    if (!usuario) return res.status(401).json({ error: 'Usuario no encontrado' })
    res.json({ usuario })
  } catch (err) {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
})

module.exports = router