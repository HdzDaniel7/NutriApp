const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
require('dotenv').config()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Rutas
const foodsRouter = require('./routes/foods')
const calculatorRouter = require('./routes/calculator')
const patientsRouter = require('./routes/patients')

app.use('/api/foods', foodsRouter)
app.use('/api/calculator', calculatorRouter)
app.use('/api/patients', patientsRouter)

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NutriApp backend funcionando' })
})

// ─────────────────────────────────────────────
// Middleware global de errores
// Captura cualquier error no manejado en las rutas
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.message)
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    timestamp: new Date().toISOString(),
  })
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})