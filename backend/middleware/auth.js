const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'nutriapp_secret_dev'

// ─────────────────────────────────────────────
// Middleware de autenticación
// Verifica el JWT en cada petición protegida
// Agrega req.usuario con los datos del token
// ─────────────────────────────────────────────

module.exports = function autenticar(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado — token requerido' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.usuario = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}