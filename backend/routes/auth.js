const express = require('express')
const router  = express.Router()
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const fs      = require('fs')
const path    = require('path')
const db      = require('../db/database')

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET no está definido en las variables de entorno')
const JWT_EXPIRES = '8h'

const UPLOADS_DIR    = path.join(__dirname, '..', 'uploads', 'logos')
const MAX_LOGO_CHARS = 1_500_000  // ~1.1 MB de imagen real (base64 = ~1.33× tamaño)

// ── Helpers de logo ─────────────────────────────────────────────────────────

function guardarLogo(logoBase64, userId) {
  const match = logoBase64.match(/^data:image\/(\w+);base64,(.+)$/)
  if (!match) return null
  const [, ext, data] = match
  const filename = `logo_${userId}.${ext === 'jpeg' ? 'jpg' : ext}`
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), Buffer.from(data, 'base64'))
  return filename
}

function leerLogo(logoPath) {
  if (!logoPath) return null
  const filepath = path.join(UPLOADS_DIR, logoPath)
  if (!fs.existsSync(filepath)) return null
  const ext  = path.extname(logoPath).slice(1)
  const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`
  return `data:${mime};base64,${fs.readFileSync(filepath).toString('base64')}`
}

function eliminarLogo(logoPath) {
  if (!logoPath) return
  try { fs.unlinkSync(path.join(UPLOADS_DIR, logoPath)) } catch {}
}

// Builds the user object returned in API responses.
// Reads logo from disk if logo_path is set; falls back to legacy logo_base64 column.
function buildUsuario(row) {
  const logo = row.logo_path ? leerLogo(row.logo_path) : (row.logo_base64 || null)
  return {
    id:            row.id,
    nombre:        row.nombre,
    email:         row.email,
    rol:           row.rol,
    plantilla_id:  row.plantilla_id  || 'moderna',
    logo_base64:   logo,
    color_pdf:     row.color_pdf     || 'verde',
    posicion_logo: row.posicion_logo || 'superior_derecha',
  }
}

const SELECT_USUARIO = `
  SELECT id, nombre, email, rol, plantilla_id, logo_path, logo_base64, color_pdf, posicion_logo
  FROM usuarios WHERE id = ?
`

// ── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', (req, res) => {
  const { nombre, email, password, codigo } = req.body
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y password son requeridos' })
  }

  const codigoValido = process.env.REGISTRO_CODIGO
  if (!codigoValido || codigo !== codigoValido) {
    return res.status(403).json({ error: 'Código de registro incorrecto' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'El password debe tener al menos 6 caracteres' })
  }

  try {
    const existe = db.prepare(`SELECT id FROM usuarios WHERE email = ?`).get(email)
    if (existe) return res.status(409).json({ error: 'Ya existe una cuenta con ese email' })

    const password_hash = bcrypt.hashSync(password, 10)
    const result = db.prepare(`INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)`)
      .run(nombre, email.toLowerCase().trim(), password_hash)

    const row    = db.prepare(SELECT_USUARIO).get(result.lastInsertRowid)
    const usuario = buildUsuario(row)
    const token   = jwt.sign({ id: row.id, email: row.email, rol: row.rol }, JWT_SECRET, { expiresIn: JWT_EXPIRES })

    res.status(201).json({ usuario, token })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son requeridos' })
  }

  try {
    const row = db.prepare(`
      SELECT id, nombre, email, rol, password_hash, plantilla_id, logo_path, logo_base64, color_pdf, posicion_logo
      FROM usuarios WHERE email = ? AND activo = 1
    `).get(email.toLowerCase().trim())

    if (!row) return res.status(401).json({ error: 'Credenciales incorrectas' })

    if (!bcrypt.compareSync(password, row.password_hash)) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    const token   = jwt.sign({ id: row.id, email: row.email, rol: row.rol }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
    const usuario = buildUsuario(row)

    res.json({ usuario, token })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'No autorizado' })

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const row     = db.prepare(`${SELECT_USUARIO} AND activo = 1`).get(decoded.id)
    if (!row) return res.status(401).json({ error: 'Usuario no encontrado' })
    res.json({ usuario: buildUsuario(row) })
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
})

const autenticar = require('../middleware/auth')

// ── PUT /api/auth/perfil ─────────────────────────────────────────────────────
router.put('/perfil', autenticar, (req, res) => {
  const { nombre, email, plantilla_id, logo_base64, color_pdf, posicion_logo } = req.body
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' })

  // Validate logo size before doing any work
  if (logo_base64 && logo_base64.length > MAX_LOGO_CHARS) {
    return res.status(400).json({ error: 'El logo es demasiado grande. Máximo 1 MB.' })
  }

  try {
    const existe = db.prepare(`SELECT id FROM usuarios WHERE email = ? AND id != ?`).get(email, req.usuario.id)
    if (existe) return res.status(409).json({ error: 'Ese email ya está en uso' })

    // Resolve logo path: keep existing, delete on null, write new file on upload
    const current  = db.prepare(`SELECT logo_path FROM usuarios WHERE id = ?`).get(req.usuario.id)
    let logoPath   = current?.logo_path || null

    if (logo_base64 === null || logo_base64 === '') {
      eliminarLogo(logoPath)
      logoPath = null
    } else if (logo_base64?.startsWith('data:')) {
      const filename = guardarLogo(logo_base64, req.usuario.id)
      if (filename) {
        if (logoPath && logoPath !== filename) eliminarLogo(logoPath)
        logoPath = filename
      }
    }

    db.prepare(`
      UPDATE usuarios
      SET nombre = ?, email = ?, plantilla_id = ?, logo_base64 = NULL, logo_path = ?,
          color_pdf = ?, posicion_logo = ?
      WHERE id = ?
    `).run(
      nombre, email.toLowerCase().trim(),
      plantilla_id || 'moderna', logoPath,
      color_pdf || 'verde', posicion_logo || 'superior_derecha',
      req.usuario.id
    )

    const row = db.prepare(SELECT_USUARIO).get(req.usuario.id)
    res.json({ usuario: buildUsuario(row) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── PUT /api/auth/password ───────────────────────────────────────────────────
router.put('/password', autenticar, (req, res) => {
  const { password_actual, password_nuevo } = req.body
  if (!password_actual || !password_nuevo) {
    return res.status(400).json({ error: 'Faltan campos requeridos' })
  }
  if (password_nuevo.length < 6) {
    return res.status(400).json({ error: 'El password debe tener al menos 6 caracteres' })
  }
  try {
    const row = db.prepare(`SELECT password_hash FROM usuarios WHERE id = ?`).get(req.usuario.id)
    if (!bcrypt.compareSync(password_actual, row.password_hash)) {
      return res.status(401).json({ error: 'El password actual es incorrecto' })
    }
    db.prepare(`UPDATE usuarios SET password_hash = ? WHERE id = ?`)
      .run(bcrypt.hashSync(password_nuevo, 10), req.usuario.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
