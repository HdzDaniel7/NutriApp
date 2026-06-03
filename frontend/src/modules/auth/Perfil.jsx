import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function Perfil() {
  const { usuario, login } = useAuth()
  const [tabActiva, setTabActiva] = useState('perfil')
  const [form, setForm] = useState({
    nombre: usuario?.nombre || '',
    email:  usuario?.email  || '',
  })
  const [passForm, setPassForm] = useState({
    password_actual:  '',
    password_nuevo:   '',
    password_confirmar: '',
  })
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [error, setError] = useState(null)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setPass = (key, val) => setPassForm(f => ({ ...f, [key]: val }))

  const handleGuardarPerfil = async () => {
    if (!form.nombre.trim()) { setError('El nombre es requerido'); return }
    setGuardando(true)
    setError(null)
    setMensaje(null)
    try {
      await api.put('/auth/perfil', form)
      setMensaje('Perfil actualizado correctamente')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const handleCambiarPassword = async () => {
    if (!passForm.password_actual || !passForm.password_nuevo) {
      setError('Completa todos los campos')
      return
    }
    if (passForm.password_nuevo.length < 6) {
      setError('El password nuevo debe tener al menos 6 caracteres')
      return
    }
    if (passForm.password_nuevo !== passForm.password_confirmar) {
      setError('Los passwords nuevos no coinciden')
      return
    }
    setGuardando(true)
    setError(null)
    setMensaje(null)
    try {
      await api.put('/auth/password', {
        password_actual: passForm.password_actual,
        password_nuevo:  passForm.password_nuevo,
      })
      setMensaje('Password actualizado correctamente')
      setPassForm({ password_actual: '', password_nuevo: '', password_confirmar: '' })
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar password')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div>
      <h1 style={s.h1}>Mi perfil</h1>

      <div style={s.tabs}>
        {[
          { id: 'perfil',   label: '👤 Datos personales' },
          { id: 'password', label: '🔒 Cambiar password' },
        ].map(t => (
          <button key={t.id}
            style={tabActiva === t.id ? {...s.tab, ...s.tabActive} : s.tab}
            onClick={() => { setTabActiva(t.id); setError(null); setMensaje(null) }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={s.card}>
        {tabActiva === 'perfil' && (
          <div style={s.form}>
            <div style={s.avatarWrap}>
              <div style={s.avatar}>
                {usuario?.nombre?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={s.avatarNombre}>{usuario?.nombre}</div>
                <div style={s.avatarEmail}>{usuario?.email}</div>
                <div style={s.avatarRol}>{usuario?.rol}</div>
              </div>
            </div>

            <hr style={s.hr} />

            <div style={s.field}>
              <label style={s.label}>Nombre</label>
              <input style={s.input} type="text" value={form.nombre}
                onChange={e => set('nombre', e.target.value)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input style={s.input} type="email" value={form.email}
                onChange={e => set('email', e.target.value)} />
            </div>

            {mensaje && <div style={s.success}>{mensaje}</div>}
            {error   && <div style={s.error}>{error}</div>}

            <button style={s.btnPrimario} onClick={handleGuardarPerfil} disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        )}

        {tabActiva === 'password' && (
          <div style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Password actual</label>
              <input style={s.input} type="password"
                value={passForm.password_actual}
                onChange={e => setPass('password_actual', e.target.value)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Password nuevo</label>
              <input style={s.input} type="password"
                value={passForm.password_nuevo}
                onChange={e => setPass('password_nuevo', e.target.value)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Confirmar password nuevo</label>
              <input style={s.input} type="password"
                value={passForm.password_confirmar}
                onChange={e => setPass('password_confirmar', e.target.value)} />
            </div>

            {mensaje && <div style={s.success}>{mensaje}</div>}
            {error   && <div style={s.error}>{error}</div>}

            <button style={s.btnPrimario} onClick={handleCambiarPassword} disabled={guardando}>
              {guardando ? 'Guardando...' : 'Cambiar password'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  h1:          { fontSize: '22px', fontWeight: '600', color: '#1c1917', marginBottom: '1.5rem' },
  tabs:        { display: 'flex', gap: '4px', marginBottom: '1rem' },
  tab:         { padding: '7px 16px', borderRadius: '20px', border: 'none', background: 'transparent', fontSize: '13px', color: '#57534e', cursor: 'pointer' },
  tabActive:   { background: '#f0fdf4', color: '#16a34a', fontWeight: '500' },
  card:        { background: '#fff', border: '1px solid #e7e5e4', borderRadius: '10px', padding: '1.5rem', maxWidth: '480px' },
  form:        { display: 'flex', flexDirection: 'column', gap: '14px' },
  avatarWrap:  { display: 'flex', alignItems: 'center', gap: '16px' },
  avatar:      { width: '56px', height: '56px', borderRadius: '50%', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', flexShrink: 0 },
  avatarNombre:{ fontSize: '16px', fontWeight: '600', color: '#1c1917' },
  avatarEmail: { fontSize: '13px', color: '#78716c' },
  avatarRol:   { fontSize: '11px', color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '.05em', marginTop: '2px' },
  hr:          { border: 'none', borderTop: '1px solid #f5f5f4', margin: '4px 0' },
  field:       { display: 'flex', flexDirection: 'column', gap: '4px' },
  label:       { fontSize: '13px', color: '#57534e', fontWeight: '500' },
  input:       { padding: '8px 10px', borderRadius: '6px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#d6d3d1', fontSize: '14px', outline: 'none' },
  success:     { background: '#f0fdf4', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', color: '#16a34a' },
  error:       { background: '#fef2f2', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', color: '#ef4444' },
  btnPrimario: { padding: '10px', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#fff', fontSize: '14px', cursor: 'pointer', fontWeight: '500' },
}