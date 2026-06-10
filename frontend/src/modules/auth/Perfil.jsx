import { useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { aplicarTema } from '../../utils/theme'
import api from '../../services/api'
import { PLANTILLAS, COLORES_PDF, POSICIONES_LOGO } from '../../config/plantillas.config'
import PreviewPDF from './components/PreviewPDF'

/* ── Colores disponibles con vista previa para el entorno ── */
const COLORES_ENTORNO = [
  { id: 'verde',    nombre: 'Bosque',    ui: '#3A7D52', pdf: '#16a34a' },
  { id: 'azul',     nombre: 'Cielo',     ui: '#2A5E8C', pdf: '#2563eb' },
  { id: 'marino',   nombre: 'Océano',    ui: '#1E3A6A', pdf: '#1e3a8a' },
  { id: 'morado',   nombre: 'Lavanda',   ui: '#5A3A8C', pdf: '#7c3aed' },
  { id: 'rosa',     nombre: 'Peonía',    ui: '#8C2A5A', pdf: '#db2777' },
  { id: 'rojo',     nombre: 'Arcilla',   ui: '#8C2A2A', pdf: '#dc2626' },
  { id: 'naranja',  nombre: 'Ámbar',     ui: '#8C4A1A', pdf: '#ea580c' },
  { id: 'amarillo', nombre: 'Trigo',     ui: '#8C7010', pdf: '#ca8a04' },
  { id: 'gris',     nombre: 'Piedra',    ui: '#374151', pdf: '#374151' },
  { id: 'negro',    nombre: 'Carbón',    ui: '#2C2C30', pdf: '#18181b' },
]

/* ── Iconos SVG ── */
const Ico = {
  user:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  palette:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>,
  lock:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  upload: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  check:  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  leaf:   <svg viewBox="0 0 18 18" fill="none" style={{width:12,height:12}}><path d="M9 16 Q7 13 6.5 10.5 Q6 8 8 6 Q8.5 8 9 9.5 Q9 7.5 10.5 5.5 Q12 7.5 12 9.5 Q12.5 8 13 6 Q15 8 14.5 10.5 Q14 13 11 16 Q10 16.3 9 16Z" fill="var(--ui-green)"/></svg>,
}

function Field({ label, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ui-txt-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
        {label}
      </label>
      {children}
      {hint && <span style={{ fontSize: 11.5, color: 'var(--ui-txt-muted)' }}>{hint}</span>}
    </div>
  )
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--ui-border)',
      borderRadius: 14,
      padding: '24px',
      ...style,
    }}>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', height: 40,
  background: '#fff',
  border: '1px solid var(--ui-border)',
  borderRadius: 9,
  padding: '0 12px',
  fontSize: 14,
  color: 'var(--ui-txt-primary)',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s, box-shadow 0.15s',
}

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
  const [mensaje, setMensaje]     = useState(null)
  const [error, setError]         = useState(null)
  const logoRef = useRef(null)

  const colorActual = COLORES_PDF.find(c => c.id === form.color_pdf) || COLORES_PDF[0]
  const set     = (key, val) => setForm(f => ({ ...f, [key]: val }))
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
      await api.put('/auth/password', {
        password_actual: passForm.password_actual,
        password_nuevo:  passForm.password_nuevo,
      })
      setMensaje('Contraseña actualizada correctamente')
      setPassForm({ password_actual: '', password_nuevo: '', password_confirmar: '' })
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar contraseña')
    } finally {
      setGuardando(false)
    }
  }

  const TABS = [
    { id: 'perfil',    label: 'Mis datos',    icon: Ico.user },
    { id: 'plantilla', label: 'Plantilla PDF', icon: Ico.palette },
    { id: 'password',  label: 'Contraseña',   icon: Ico.lock },
  ]

  return (
    <div className="nd-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Avatar grande */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(140deg, var(--ui-green), var(--ui-green-light))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 700, color: '#fff',
          boxShadow: '0 3px 12px rgba(0,0,0,0.12)',
        }}>
          {usuario?.nombre?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--ui-txt-primary)', margin: 0, letterSpacing: '-0.3px' }}>
            {usuario?.nombre}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--ui-txt-muted)', margin: '2px 0 0' }}>
            {usuario?.email} · <span style={{ textTransform: 'capitalize' }}>{usuario?.rol}</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--ui-border)', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t.id}
            onClick={() => { setTabActiva(t.id); setError(null); setMensaje(null) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '9px 18px',
              border: 'none',
              borderBottom: tabActiva === t.id ? '2px solid var(--ui-green)' : '2px solid transparent',
              background: 'transparent',
              fontSize: 13.5, fontWeight: tabActiva === t.id ? 600 : 400,
              color: tabActiva === t.id ? 'var(--ui-green)' : 'var(--ui-txt-muted)',
              cursor: 'pointer', transition: 'all 0.15s',
              marginBottom: -1,
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Mis datos ── */}
      {tabActiva === 'perfil' && (
        <Card style={{ maxWidth: 520 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Nombre completo">
              <input style={inputStyle} type="text" value={form.nombre}
                onChange={e => set('nombre', e.target.value)}
                onFocus={e => { e.target.style.borderColor='var(--ui-green)'; e.target.style.boxShadow='0 0 0 3px var(--ui-green-bg)' }}
                onBlur={e =>  { e.target.style.borderColor='var(--ui-border)'; e.target.style.boxShadow='none' }}
              />
            </Field>
            <Field label="Correo electrónico">
              <input style={inputStyle} type="email" value={form.email}
                onChange={e => set('email', e.target.value)}
                onFocus={e => { e.target.style.borderColor='var(--ui-green)'; e.target.style.boxShadow='0 0 0 3px var(--ui-green-bg)' }}
                onBlur={e =>  { e.target.style.borderColor='var(--ui-border)'; e.target.style.boxShadow='none' }}
              />
            </Field>
            {mensaje && <div style={{ background: 'var(--ui-green-bg)', border: '1px solid var(--ui-green-pale)', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: 'var(--ui-green)' }}>{mensaje}</div>}
            {error   && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#DC2626' }}>{error}</div>}
            <button onClick={handleGuardarPerfil} disabled={guardando}
              style={{
                height: 42, borderRadius: 9, border: 'none',
                background: 'linear-gradient(135deg, var(--ui-green), var(--ui-green-light))',
                color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
              }}>
              {guardando ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </Card>
      )}

      {/* ── Tab: Plantilla PDF ── */}
      {tabActiva === 'plantilla' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,550px)', gap: 20, alignItems: 'start' }}>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

              {/* Color del entorno y PDF */}
              <Field label="Color del entorno y PDF"
                hint="Cambia la paleta de toda la aplicación y el color base de tus PDFs">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginTop: 4 }}>
                  {COLORES_ENTORNO.map(c => (
                    <button key={c.id}
                      onClick={() => {
                        set('color_pdf', c.id)
                        /* Preview inmediato sin guardar */
                        aplicarTema(c.id)
                      }}
                      title={c.nombre}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                        padding: '10px 6px', borderRadius: 10, cursor: 'pointer',
                        border: form.color_pdf === c.id
                          ? `2px solid ${c.ui}`
                          : '2px solid var(--ui-border)',
                        background: form.color_pdf === c.id ? c.ui + '18' : '#fff',
                        transition: 'all 0.15s',
                      }}>
                      {/* Muestra: círculo UI (opaco) + círculo PDF (vibrante) */}
                      <div style={{ display: 'flex', gap: 3 }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: c.ui }} title="Entorno" />
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: c.pdf }} title="PDF" />
                      </div>
                      <span style={{ fontSize: 10.5, color: 'var(--ui-txt-muted)', fontWeight: form.color_pdf === c.id ? 600 : 400 }}>
                        {c.nombre}
                      </span>
                      {form.color_pdf === c.id && (
                        <span style={{ color: c.ui }}>{Ico.check}</span>
                      )}
                    </button>
                  ))}
                </div>
                <div style={{
                  marginTop: 10, padding: '10px 14px', borderRadius: 9,
                  background: 'var(--ui-green-bg)', border: '1px solid var(--ui-green-pale)',
                  fontSize: 12.5, color: 'var(--ui-txt-secondary)',
                  display: 'flex', alignItems: 'center', gap: 7,
                }}>
                  {Ico.leaf}
                  El círculo izquierdo muestra el tono del entorno · el derecho el color PDF
                </div>
              </Field>

              {/* Logo */}
              <Field label="Logo del consultorio" hint="PNG o JPG · máx 2MB">
                {form.logo_base64 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src={form.logo_base64} alt="Logo"
                      style={{ height: 56, maxWidth: 160, objectFit: 'contain', borderRadius: 8, border: '1px solid var(--ui-border)' }} />
                    <button onClick={() => set('logo_base64', null)}
                      style={{ fontSize: 12.5, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Eliminar
                    </button>
                  </div>
                ) : (
                  <button onClick={() => logoRef.current.click()}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 16px', borderRadius: 9,
                      border: '1.5px dashed var(--ui-border)',
                      background: 'var(--ui-green-bg)',
                      fontSize: 13.5, color: 'var(--ui-txt-secondary)',
                      cursor: 'pointer', width: 'fit-content',
                      transition: 'border-color 0.15s',
                    }}>
                    {Ico.upload} Subir logo
                  </button>
                )}
                <input ref={logoRef} type="file" accept="image/*"
                  style={{ display: 'none' }} onChange={handleLogoChange} />
              </Field>

              {/* Posición logo */}
              <Field label="Posición del logo en PDF">
                <select style={{ ...inputStyle, cursor: 'pointer' }}
                  value={form.posicion_logo}
                  onChange={e => set('posicion_logo', e.target.value)}
                  onFocus={e => { e.target.style.borderColor='var(--ui-green)' }}
                  onBlur={e =>  { e.target.style.borderColor='var(--ui-border)' }}>
                  {POSICIONES_LOGO.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </Field>

              {/* Plantillas */}
              <Field label="Plantilla para PDF">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 4 }}>
                  {PLANTILLAS.map(p => (
                    <div key={p.id} onClick={() => set('plantilla_id', p.id)}
                      style={{
                        borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                        border: form.plantilla_id === p.id
                          ? '2px solid var(--ui-green)'
                          : '2px solid var(--ui-border)',
                        background: form.plantilla_id === p.id ? 'var(--ui-green-bg)' : '#fff',
                        transition: 'all 0.15s',
                      }}>
                      <div style={{ height: 32, background: `rgb(${p.colores.primario.join(',')})`, display: 'flex', alignItems: 'center', padding: '0 10px' }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#fff' }}>{p.nombre}</span>
                      </div>
                      <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <div style={{ height: 4, borderRadius: 2, background: `rgb(${p.colores.primario.join(',')})`, width: '60%' }} />
                        <div style={{ height: 3, borderRadius: 2, background: 'var(--ui-border)', width: '80%' }} />
                        <div style={{ height: 3, borderRadius: 2, background: 'var(--ui-border)', width: '70%' }} />
                      </div>
                      <div style={{ padding: '0 10px 8px', fontSize: 10.5, color: 'var(--ui-txt-muted)' }}>{p.descripcion}</div>
                      {form.plantilla_id === p.id && (
                        <div style={{
                          padding: '4px 10px 8px', fontSize: 11,
                          color: 'var(--ui-green)', fontWeight: 600,
                          background: 'var(--ui-green-bg)',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          {Ico.check} Seleccionada
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Field>

              {mensaje && <div style={{ background: 'var(--ui-green-bg)', border: '1px solid var(--ui-green-pale)', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: 'var(--ui-green)' }}>{mensaje}</div>}
              {error   && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#DC2626' }}>{error}</div>}
              <button onClick={handleGuardarPerfil} disabled={guardando}
                style={{
                  height: 42, borderRadius: 9, border: 'none',
                  background: 'linear-gradient(135deg, var(--ui-green), var(--ui-green-light))',
                  color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
                }}>
                {guardando ? 'Guardando…' : 'Guardar configuración'}
              </button>
            </div>
          </Card>

          {/* Preview PDF */}
          <Card style={{ position: 'sticky', top: 80 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14,
              paddingBottom: 12, borderBottom: '1px solid var(--ui-border-subtle)' }}>
              {Ico.leaf}
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ui-txt-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Vista previa PDF
              </span>
            </div>
            <PreviewPDF
              plantillaId={form.plantilla_id}
              color={colorActual?.hex || '#16a34a'}
              colorBg={colorActual?.hex ? colorActual.hex + '18' : '#f0fdf4'}
              colorBorder={colorActual?.hex ? colorActual.hex + '60' : '#86efac'}
              logo={form.logo_base64}
              posicionLogo={form.posicion_logo}
            />
          </Card>
        </div>
      )}

      {/* ── Tab: Contraseña ── */}
      {tabActiva === 'password' && (
        <Card style={{ maxWidth: 520 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { key: 'password_actual',    label: 'Contraseña actual' },
              { key: 'password_nuevo',     label: 'Nueva contraseña' },
              { key: 'password_confirmar', label: 'Confirmar nueva contraseña' },
            ].map(({ key, label }) => (
              <Field key={key} label={label}>
                <input style={inputStyle} type="password" value={passForm[key]}
                  onChange={e => setPass(key, e.target.value)}
                  onFocus={e => { e.target.style.borderColor='var(--ui-green)'; e.target.style.boxShadow='0 0 0 3px var(--ui-green-bg)' }}
                  onBlur={e =>  { e.target.style.borderColor='var(--ui-border)'; e.target.style.boxShadow='none' }}
                />
              </Field>
            ))}
            {mensaje && <div style={{ background: 'var(--ui-green-bg)', border: '1px solid var(--ui-green-pale)', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: 'var(--ui-green)' }}>{mensaje}</div>}
            {error   && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#DC2626' }}>{error}</div>}
            <button onClick={handleCambiarPassword} disabled={guardando}
              style={{
                height: 42, borderRadius: 9, border: 'none',
                background: 'linear-gradient(135deg, var(--ui-green), var(--ui-green-light))',
                color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
              }}>
              {guardando ? 'Actualizando…' : 'Cambiar contraseña'}
            </button>
          </div>
        </Card>
      )}

    </div>
  )
}