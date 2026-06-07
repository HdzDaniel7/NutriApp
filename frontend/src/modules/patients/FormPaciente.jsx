import { useState } from 'react'
import { patientsAPI } from '../../services/api'

export default function FormPaciente({ paciente, onGuardar, onCerrar }) {
  const [form, setForm] = useState({
    nombre:           paciente?.nombre           || '',
    apellido:         paciente?.apellido         || '',
    fecha_nacimiento: paciente?.fecha_nacimiento || '',
    sexo:             paciente?.sexo             || '',
    email:            paciente?.email            || '',
    telefono:         paciente?.telefono         || '',
    notas:            paciente?.notas            || '',
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleGuardar = () => {
    if (!form.nombre.trim()) { setError('El nombre es requerido'); return }
    setGuardando(true)
    setError(null)

    const accion = paciente
      ? patientsAPI.update(paciente.id, form)
      : patientsAPI.create(form)

    accion
      .then(() => onGuardar())
      .catch(err => setError(err.response?.data?.error || 'Error al guardar'))
      .finally(() => setGuardando(false))
  }

  return (
    <div style={s.overlay} onClick={onCerrar}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>

        <div style={s.header}>
          <span style={s.titulo}>{paciente ? 'Editar paciente' : 'Nuevo paciente'}</span>
          <button style={s.cerrarBtn} onClick={onCerrar}>✕</button>
        </div>

        <div style={s.body}>
          <div style={s.grid2}>
            <div style={s.field}>
              <label style={s.label}>Nombre *</label>
              <input style={s.input} type="text" placeholder="ej. María"
                value={form.nombre} onChange={e => set('nombre', e.target.value)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Apellido</label>
              <input style={s.input} type="text" placeholder="ej. González"
                value={form.apellido} onChange={e => set('apellido', e.target.value)} />
            </div>
          </div>

          <div style={s.grid2}>
            <div style={s.field}>
              <label style={s.label}>Fecha de nacimiento</label>
              <input style={s.input} type="date"
                value={form.fecha_nacimiento} onChange={e => set('fecha_nacimiento', e.target.value)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Sexo biológico</label>
              <div style={s.toggle}>
                {[{ val: 'M', label: 'Masculino' }, { val: 'F', label: 'Femenino' }].map(({ val, label }) => (
                  <button key={val} onClick={() => set('sexo', val)}
                    style={form.sexo === val ? {...s.toggleBtn, ...s.toggleActive} : s.toggleBtn}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={s.grid2}>
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input style={s.input} type="email" placeholder="ej. maria@email.com"
                value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Teléfono</label>
              <input style={s.input} type="tel" placeholder="ej. 444 123 4567"
                value={form.telefono} onChange={e => set('telefono', e.target.value)} />
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Notas</label>
            <textarea style={s.textarea} placeholder="Observaciones, antecedentes, alergias..."
              value={form.notas} onChange={e => set('notas', e.target.value)} rows={3} />
          </div>

          {error && <div style={s.error}>{error}</div>}
        </div>

        <div style={s.footer}>
          <button style={s.cancelarBtn} onClick={onCerrar}>Cancelar</button>
          <button style={s.guardarBtn} onClick={handleGuardar} disabled={guardando}>
            {guardando ? 'Guardando...' : paciente ? 'Guardar cambios' : 'Crear paciente'}
          </button>
        </div>

      </div>
    </div>
  )
}

const s = {
  overlay:     { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal:       { background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '560px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e7e5e4' },
  titulo:      { fontSize: '16px', fontWeight: '600', color: '#1c1917' },
  cerrarBtn:   { background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#78716c', padding: '4px 8px', borderRadius: '4px' },
  body:        { padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' },
  grid2:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  field:       { display: 'flex', flexDirection: 'column', gap: '4px' },
  label:       { fontSize: '13px', color: '#57534e', fontWeight: '500' },
  input:       { padding: '8px 10px', borderRadius: '6px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#d6d3d1', fontSize: '14px', outline: 'none' },
  textarea:    { padding: '8px 10px', borderRadius: '6px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#d6d3d1', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' },
  toggle:      { display: 'flex' },
  toggleBtn:   { flex: 1, padding: '8px', fontSize: '13px', cursor: 'pointer', borderWidth: '1px', borderStyle: 'solid', borderColor: '#d6d3d1', background: '#fafaf9', color: '#57534e' },
  toggleActive:{ background: 'var(--color-primario-bg)', borderColor: 'var(--color-primario-border)', color: 'var(--color-primario)', fontWeight: '500' },
  error:       { background: '#fef2f2', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', color: '#ef4444' },
  footer:      { display: 'flex', gap: '8px', justifyContent: 'flex-end', padding: '1rem 1.5rem', borderTop: '1px solid #e7e5e4' },
  cancelarBtn: { padding: '8px 16px', borderRadius: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e7e5e4', background: '#fff', fontSize: '14px', color: '#57534e', cursor: 'pointer' },
  guardarBtn:  { padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'var(--color-primario)', color: '#fff', fontSize: '14px', cursor: 'pointer', fontWeight: '500' },
}