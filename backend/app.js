const express    = require('express')
const cors       = require('cors')
const path       = require('path')
const rateLimit  = require('express-rate-limit')
const logger     = require('./logger')

const app = express()

// Migrations run once before any request is handled
const db = require('./db/database')
const { runMigrations } = require('./db/migrate')
runMigrations(db)

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Rate limiting: 10 login attempts per 15 min per IP (skipped in test env)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
})
app.use('/api/auth/login', loginLimiter)

// Routes
const autenticar       = require('./middleware/auth')
const authRouter       = require('./routes/auth')
const foodsRouter      = require('./routes/foods')
const calculatorRouter = require('./routes/calculator')
const patientsRouter   = require('./routes/patients')
const plansRouter      = require('./routes/plans')
const agendaRouter     = require('./routes/agenda')

app.use('/api/auth',       authRouter)
app.use('/api/foods',      foodsRouter)
app.use('/api/calculator', autenticar, calculatorRouter)
app.use('/api/patients',   autenticar, patientsRouter)
app.use('/api/plans',      autenticar, plansRouter)
app.use('/api/agenda',     autenticar, agendaRouter)

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

// Global error handler
app.use((err, req, res, _next) => {
  logger.error({ err, method: req.method, path: req.path }, 'Unhandled error')
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    timestamp: new Date().toISOString(),
  })
})

module.exports = app
