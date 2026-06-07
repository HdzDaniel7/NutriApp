import { useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { PLANTILLAS, COLORES_PDF, POSICIONES_LOGO } from '../../config/plantillas.config'

export default function Perfil() {
  const { usuario, actualizarUsuario } = useAuth()
  const [tabActiva, setTabActiva] = useState('perfil')
  const [form, setForm] = useState({
    nombre:        usuario?.nombre        || '',
    email:         usuario?.email         || '',
    plantilla_id:  usuario?.plantilla_id  || 'moderna',
    logo_base64:   usuario?.logo_base64   || null,
    color_pdf:     usuario?.color_pdf     || 'verde',
    posicion_logo: usuario?.posicion_logo || 'superior_derecha',
  })
  const [passForm, setPassForm] = useState({
    password_actual: '', password_nuevo: '', password_confirmar: '',
  })
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [error, setError] = useState(null)
  const logoRef = useRef(null)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setPass = (key, val) => setPassForm(f => ({ ...f, [key]: val }))

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => set('logo_base64', reader.result)
    reader.readAsDataURL(file)
  }

  const handleGuardarPerfil = async () => {
    if (!form.nombre.trim()) { setError('El nombre es requerido'); return }
    setGuardando(true); setError(null); setMensaje(null)
    try {
      const res = await api.put('/auth/perfil', form)
      actualizarUsuario(res.data.usuario)
      setMensaje('Perfil actualizado correctamente')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const handleCambiarPassword = async () => {
    if (!passForm.password_actual || !passForm.password_nuevo) { setError('Completa todos los campos'); return }
    if (passForm.password_nuevo.length < 6) { setError('Mínimo 6 caracteres'); return }
    if (passForm.password_nuevo !== passForm.password_confirmar) { setError('Los passwords no coinciden'); return }
    setGuardando(true); setError(null); setMensaje(null)
    try {
      await api.put('/auth/password', { password_actual: passForm.password_actual, password_nuevo: passForm.password_nuevo })
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
          { id: 'perfil',    label: '👤 Datos' },
          { id: 'plantilla', label: '🎨 Plantilla PDF' },
          { id: 'password',  label: '🔒 Password' },
        ].map(t => (
          <button key={t.id}
            style={tabActiva === t.id ? {...s.tab, ...s.tabActive} : s.tab}
            onClick={() => { setTabActiva(t.id); setError(null); setMensaje(null) }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={s.card}>

        {/* Tab perfil */}
        {tabActiva === 'perfil' && (
          <div style={s.form}>
            <div style={s.avatarWrap}>
              <div style={s.avatar}>{usuario?.nombre?.[0]?.toUpperCase()}</div>
              <div>
                <div style={s.avatarNombre}>{usuario?.nombre}</div>
                <div style={s.avatarEmail}>{usuario?.email}</div>
                <div style={s.avatarRol}>{usuario?.rol}</div>
              </div>
            </div>
            <hr style={s.hr} />
            {[
              { key: 'nombre', label: 'Nombre', type: 'text' },
              { key: 'email',  label: 'Email',  type: 'email' },
            ].map(({ key, label, type }) => (
              <div key={key} style={s.field}>
                <label style={s.label}>{label}</label>
                <input style={s.input} type={type} value={form[key]}
                  onChange={e => set(key, e.target.value)} />
              </div>
            ))}
            {mensaje && <div style={s.success}>{mensaje}</div>}
            {error   && <div style={s.error}>{error}</div>}
            <button style={s.btnPrimario} onClick={handleGuardarPerfil} disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        )}

        {/* Tab plantilla */}
        {tabActiva === 'plantilla' && (
          <div style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Logo del consultorio</label>
              {form.logo_base64 ? (
                <div style={s.logoPreview}>
                  <img src={form.logo_base64} alt="Logo" style={s.logoImg} />
                  <button style={s.logoRemoveBtn} onClick={() => set('logo_base64', null)}>
                    Eliminar logo
                  </button>
                </div>
              ) : (
                <button style={s.logoUploadBtn} onClick={() => logoRef.current.click()}>
                  📷 Subir logo
                </button>
              )}
              <input ref={logoRef} type="file" accept="image/*"
                style={{ display: 'none' }} onChange={handleLogoChange} />
              <span style={{ fontSize: '11px', color: '#a1a1aa' }}>
                PNG o JPG recomendado · máx 2MB
              </span>
              <div style={s.field}>
                <label style={s.label}>Color principal del PDF</label>
                <select style={{...s.input, cursor: 'pointer'}}
                  value={form.color_pdf}
                  onChange={e => set('color_pdf', e.target.value)}>
                  {COLORES_PDF.map(c => (
                    <option key={c.id} value={c.id}
                      style={{ background: c.hex, color: '#fff', fontWeight: '500' }}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {COLORES_PDF.map(c => (
                    <div key={c.id}
                      onClick={() => set('color_pdf', c.id)}
                      title={c.nombre}
                      style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: c.hex, cursor: 'pointer',
                        borderWidth: '3px', borderStyle: 'solid',
                        borderColor: form.color_pdf === c.id ? '#18181b' : 'transparent',
                        transition: 'all .15s'
                      }} />
                  ))}
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Posición del logo en PDF</label>
                <select style={{...s.input, cursor: 'pointer'}}
                  value={form.posicion_logo}
                  onChange={e => set('posicion_logo', e.target.value)}>
                  {POSICIONES_LOGO.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Plantilla para PDF</label>
              <div style={s.plantillasGrid}>
                {PLANTILLAS.map(p => (
                  <div key={p.id}
                    onClick={() => set('plantilla_id', p.id)}
                    style={{
                      ...s.plantillaCard,
                      borderColor: form.plantilla_id === p.id ? '#22c55e' : '#e4e4e7',
                      background: form.plantilla_id === p.id ? '#f0fdf4' : '#fff',
                    }}>
                    <div style={{
                      ...s.plantillaHeader,
                      background: `rgb(${p.colores.primario.join(',')})`,
                    }}>
                      <span style={s.plantillaHeaderText}>{p.nombre}</span>
                    </div>
                    <div style={s.plantillaBody}>
                      <div style={{ ...s.plantillaLinea, background: `rgb(${p.colores.primario.join(',')})`, width: '60%' }} />
                      <div style={{ ...s.plantillaLinea, background: '#e4e4e7', width: '80%' }} />
                      <div style={{ ...s.plantillaLinea, background: '#e4e4e7', width: '70%' }} />
                    </div>
                    <div style={s.plantillaNombre}>{p.nombre}</div>
                    <div style={s.plantillaDesc}>{p.descripcion}</div>
                    {form.plantilla_id === p.id && (
                      <div style={s.plantillaCheck}>✓ Seleccionada</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {mensaje && <div style={s.success}>{mensaje}</div>}
            {error   && <div style={s.error}>{error}</div>}
            <button style={s.btnPrimario} onClick={handleGuardarPerfil} disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar configuración'}
            </button>
          </div>
        )}

        {/* Tab password */}
        {tabActiva === 'password' && (
          <div style={s.form}>
            {[
              { key: 'password_actual',    label: 'Password actual' },
              { key: 'password_nuevo',     label: 'Password nuevo' },
              { key: 'password_confirmar', label: 'Confirmar password nuevo' },
            ].map(({ key, label }) => (
              <div key={key} style={s.field}>
                <label style={s.label}>{label}</label>
                <input style={s.input} type="password" value={passForm[key]}
                  onChange={e => setPass(key, e.target.value)} />
              </div>
            ))}
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
  h1:             { fontSize: '22px', fontWeight: '600', color: '#18181b', marginBottom: '1.5rem' },
  tabs:           { display: 'flex', gap: '4px', marginBottom: '1rem' },
  tab:            { padding: '7px 16px', borderRadius: '20px', border: 'none', background: 'transparent', fontSize: '13px', color: '#57534e', cursor: 'pointer' },
  tabActive:      { background: 'linear-gradient(135deg, var(--color-primario-light), var(--color-primario))', color: '#fff', fontWeight: '500' },
  card:           { background: '#fff', border: '1px solid #e4e4e7', borderRadius: '12px', padding: '1.5rem', maxWidth: '520px' },
  form:           { display: 'flex', flexDirection: 'column', gap: '14px' },
  avatarWrap:     { display: 'flex', alignItems: 'center', gap: '16px' },
  avatar:         { width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primario-light), var(--color-primario))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', flexShrink: 0 },
  avatarNombre:   { fontSize: '16px', fontWeight: '600', color: '#18181b' },
  avatarEmail:    { fontSize: '13px', color: '#71717a' },
  avatarRol:      { fontSize: '11px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '.05em', marginTop: '2px' },
  hr:             { border: 'none', borderTop: '1px solid #f4f4f5', margin: '4px 0' },
  field:          { display: 'flex', flexDirection: 'column', gap: '4px' },
  label:          { fontSize: '13px', color: '#71717a', fontWeight: '500' },
  input:          { padding: '8px 10px', borderRadius: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#d4d4d8', fontSize: '14px', outline: 'none' },
  success:        { background: '#dcfce7', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#15803d' },
  error:          { background: '#fef2f2', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#ef4444' },
  btnPrimario:    { padding: '10px', borderRadius: '20px', border: 'none', background: 'linear-gradient(135deg, var(--color-primario-light), var(--color-primario))', color: '#fff', fontSize: '14px', cursor: 'pointer', fontWeight: '500' },
  logoPreview:    { display: 'flex', alignItems: 'center', gap: '12px' },
  logoImg:        { height: '60px', maxWidth: '180px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #e4e4e7' },
  logoRemoveBtn:  { fontSize: '12px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' },
  logoUploadBtn:  { padding: '8px 16px', borderRadius: '8px', borderWidth: '1px', borderStyle: 'dashed', borderColor: '#d4d4d8', background: '#fafaf9', fontSize: '13px', color: '#71717a', cursor: 'pointer', width: 'fit-content' },
  plantillasGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '6px' },
  plantillaCard:  { borderWidth: '2px', borderStyle: 'solid', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', transition: 'all .15s' },
  plantillaHeader:{ height: '36px', display: 'flex', alignItems: 'center', padding: '0 10px' },
  plantillaHeaderText: { fontSize: '11px', fontWeight: '500', color: '#fff' },
  plantillaBody:  { padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '4px' },
  plantillaLinea: { height: '4px', borderRadius: '2px' },
  plantillaNombre:{ fontSize: '12px', fontWeight: '500', color: '#18181b', padding: '0 10px' },
  plantillaDesc:  { fontSize: '10px', color: '#a1a1aa', padding: '2px 10px 8px' },
  plantillaCheck: { fontSize: '11px', color: '#16a34a', fontWeight: '500', padding: '4px 10px 8px', background: 'var(--color-primario-bg)' },
}