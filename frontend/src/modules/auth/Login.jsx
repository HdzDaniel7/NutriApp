import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { login, register } = useAuth()
  const [modo, setModo] = useState('login')
  const [form, setForm] = useState({ nombre: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async () => {
    setError(null)
    if (!form.email || !form.password) { setError('Email y password son requeridos'); return }
    if (modo === 'register' && !form.nombre) { setError('El nombre es requerido'); return }

    setCargando(true)
    try {
      if (modo === 'login') {
        await login(form.email, form.password)
      } else {
        await register(form.nombre, form.email, form.password)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={s.wrap}>
      <div style={s.card}>

        <div style={s.logo}>🥗</div>
        <div style={s.titulo}>NutriApp</div>
        <div style={s.subtitulo}>
          {modo === 'login' ? 'Inicia sesión para continuar' : 'Crea tu cuenta de nutriólogo'}
        </div>

        <div style={s.modoToggle}>
          {[{ id: 'login', label: 'Iniciar sesión' }, { id: 'register', label: 'Registrarse' }].map(m => (
            <button key={m.id}
              style={modo === m.id ? {...s.modoBtn, ...s.modoBtnActive} : s.modoBtn}
              onClick={() => { setModo(m.id); setError(null) }}>
              {m.label}
            </button>
          ))}
        </div>

        {modo === 'register' && (
          <div style={s.field}>
            <label style={s.label}>Nombre</label>
            <input style={s.input} type="text" placeholder="Tu nombre completo"
              value={form.nombre} onChange={e => set('nombre', e.target.value)} />
          </div>
        )}

        <div style={s.field}>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" placeholder="tu@email.com"
            value={form.email} onChange={e => set('email', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </div>

        <div style={s.field}>
          <label style={s.label}>Password</label>
          <input style={s.input} type="password" placeholder="••••••••"
            value={form.password} onChange={e => set('password', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </div>

        {error && <div style={s.error}>{error}</div>}

        <button style={s.btnPrimario} onClick={handleSubmit} disabled={cargando}>
          {cargando ? 'Cargando...' : modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </button>

      </div>
    </div>
  )
}

const s = {
  wrap:          { minHeight: '100vh', background: '#f5f5f4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  card:          { background: '#fff', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '400px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '12px' },
  logo:          { fontSize: '48px', textAlign: 'center' },
  titulo:        { fontSize: '24px', fontWeight: '700', color: '#1c1917', textAlign: 'center' },
  subtitulo:     { fontSize: '14px', color: '#78716c', textAlign: 'center', marginBottom: '8px' },
  modoToggle:    { display: 'flex', borderRadius: '8px', overflow: 'hidden', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e7e5e4' },
  modoBtn:       { flex: 1, padding: '8px', fontSize: '13px', cursor: 'pointer', border: 'none', background: '#fafaf9', color: '#57534e' },
  modoBtnActive: { background: '#f0fdf4', color: '#16a34a', fontWeight: '500' },
  field:         { display: 'flex', flexDirection: 'column', gap: '4px' },
  label:         { fontSize: '13px', color: '#57534e', fontWeight: '500' },
  input:         { padding: '10px 12px', borderRadius: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#d6d3d1', fontSize: '14px', outline: 'none' },
  error:         { background: '#fef2f2', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#ef4444' },
  btnPrimario:   { padding: '12px', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#fff', fontSize: '15px', cursor: 'pointer', fontWeight: '600', marginTop: '4px' },
}