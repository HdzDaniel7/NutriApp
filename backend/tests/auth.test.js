const request = require('supertest')
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')

// app must be required AFTER setup.js has set env vars (guaranteed via jest setupFiles)
const app = require('../app')
const db  = require('../db/database')

const TEST_USER = {
  nombre:   'Nutrióloga Test',
  email:    'test@nutridesk.test',
  password: 'Test1234!',
}

let authToken

beforeAll(() => {
  const hash = bcrypt.hashSync(TEST_USER.password, 10)
  db.prepare(`
    INSERT INTO usuarios (nombre, email, password_hash, plantilla_id, color_pdf, posicion_logo)
    VALUES (?, ?, ?, 'moderna', 'verde', 'superior_derecha')
  `).run(TEST_USER.nombre, TEST_USER.email, hash)
})

// ── POST /api/auth/login ─────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  it('200 con credenciales correctas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    authToken = res.body.token
  })

  it('responde con todos los campos del usuario', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password })
    const { usuario } = res.body
    expect(usuario.nombre).toBeDefined()
    expect(usuario.email).toBeDefined()
    expect(usuario.plantilla_id).toBeDefined()
    expect(usuario.color_pdf).toBeDefined()
    expect(usuario.password_hash).toBeUndefined()  // nunca debe exponerse
  })

  it('token JWT contiene el id del usuario', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password })
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET)
    expect(decoded.id).toBeDefined()
    expect(decoded.email).toBe(TEST_USER.email)
  })

  it('401 con password incorrecto', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: 'wrongpassword' })
    expect(res.status).toBe(401)
  })

  it('401 con email inexistente', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@nutridesk.test', password: 'cualquiera' })
    expect(res.status).toBe(401)
  })

  it('400 sin email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: TEST_USER.password })
    expect(res.status).toBe(400)
  })

  it('400 sin password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_USER.email })
    expect(res.status).toBe(400)
  })
})

// ── POST /api/auth/register ──────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  const newUser = {
    nombre:   'Nuevo Nutriólogo',
    email:    'nuevo@nutridesk.test',
    password: 'Nuevo1234!',
    codigo:   'TEST123',
  }

  it('201 con datos y código correcto', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(newUser)
    expect(res.status).toBe(201)
    expect(res.body.token).toBeDefined()
    expect(res.body.usuario.email).toBe(newUser.email)
  })

  it('403 con código de registro incorrecto', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...newUser, email: 'otro@test.com', codigo: 'WRONG' })
    expect(res.status).toBe(403)
  })

  it('409 con email duplicado', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(newUser)  // mismo email registrado antes
    expect(res.status).toBe(409)
  })

  it('400 con password menor a 6 caracteres', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...newUser, email: 'corto@test.com', password: '123' })
    expect(res.status).toBe(400)
  })

  it('400 sin nombre', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'sinombre@test.com', password: 'Test1234!', codigo: 'TEST123' })
    expect(res.status).toBe(400)
  })
})

// ── GET /api/auth/me ─────────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  it('200 con token válido', async () => {
    // Get token first
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password })

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.token}`)
    expect(res.status).toBe(200)
    expect(res.body.usuario.email).toBe(TEST_USER.email)
  })

  it('401 sin token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })

  it('401 con token malformado', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer token_invalido')
    expect(res.status).toBe(401)
  })
})

// ── PUT /api/auth/perfil ─────────────────────────────────────────────────────

describe('PUT /api/auth/perfil', () => {
  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password })
    authToken = loginRes.body.token
  })

  it('200 actualiza nombre y email', async () => {
    const res = await request(app)
      .put('/api/auth/perfil')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ nombre: 'Nombre Actualizado', email: TEST_USER.email, plantilla_id: 'moderna', color_pdf: 'azul', posicion_logo: 'superior_derecha' })
    expect(res.status).toBe(200)
    expect(res.body.usuario.nombre).toBe('Nombre Actualizado')
    expect(res.body.usuario.color_pdf).toBe('azul')
  })

  it('400 si logo_base64 supera el límite de tamaño', async () => {
    const logoGrande = 'data:image/png;base64,' + 'A'.repeat(1_600_000)
    const res = await request(app)
      .put('/api/auth/perfil')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ nombre: 'Test', email: TEST_USER.email, logo_base64: logoGrande })
    expect(res.status).toBe(400)
  })

  it('401 sin token', async () => {
    const res = await request(app)
      .put('/api/auth/perfil')
      .send({ nombre: 'Test', email: TEST_USER.email })
    expect(res.status).toBe(401)
  })

  it('400 sin nombre', async () => {
    const res = await request(app)
      .put('/api/auth/perfil')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ email: TEST_USER.email })
    expect(res.status).toBe(400)
  })
})

// ── GET /api/health ──────────────────────────────────────────────────────────

describe('GET /api/health', () => {
  it('responde con status ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})
