const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// Rutas
const foodsRouter = require('./routes/foods')
const calculatorRouter = require('./routes/calculator')

app.use('/api/foods', foodsRouter)
app.use('/api/calculator', calculatorRouter)

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NutriApp backend funcionando' })
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})