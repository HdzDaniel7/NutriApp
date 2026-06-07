import { useState, useEffect } from 'react'
import { patientsAPI } from '../../services/api'
import FormPaciente from './FormPaciente'
import ExpedientePaciente from './ExpedientePaciente'

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [pacienteEditando, setPacienteEditando] = useState(null)
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null)

  const cargarPacientes = () => {
    setCargando(true)
    patientsAPI.list(busqueda ? { q: busqueda } : {})
      .then(r => setPacientes(r.data.data))
      .catch(err => console.error(err))
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargarPacientes()
  }, [busqueda])

  const handleGuardar = () => {
    setModalAbierto(false)
    setPacienteEditando(null)
    cargarPacientes()
  }

  const handleEditar = (paciente) => {
    setPacienteEditando(paciente)
    setModalAbierto(true)
  }

  const handleEliminar = (id) => {
    if (!confirm('¿Desactivar este paciente?')) return
    patientsAPI.delete(id)
      .then(() => cargarPacientes())
      .catch(err => console.error(err))
  }

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null
    const hoy = new Date()
    const nac = new Date(fechaNacimiento)
    const edad = hoy.getFullYear() - nac.getFullYear()
    return edad
  }

  if (pacienteSeleccionado) {
    return (
      <ExpedientePaciente
        pacienteId={pacienteSeleccionado}
        onVolver={() => setPacienteSeleccionado(null)}
      />
    )
  }

  return (
    <div>
      <div style={s.topBar}>
        <h1 style={s.h1}>Pacientes</h1>
        <button style={s.btnPrimario} onClick={() => { setPacienteEditando(null); setModalAbierto(true) }}>
          + Nuevo paciente
        </button>
      </div>

      {/* Buscador */}
      <div style={s.card}>
        <input
          style={s.input}
          type="text"
          placeholder="Buscar por nombre, apellido o email..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* Lista */}
      {cargando ? (
        <div style={s.msg}>Cargando pacientes...</div>
      ) : pacientes.length === 0 ? (
        <div style={s.emptyState}>
          <div style={s.emptyIcon}>👤</div>
          <div style={s.emptyTitulo}>
            {busqueda ? 'No se encontraron pacientes' : 'Aún no hay pacientes registrados'}
          </div>
          <div style={s.emptyDesc}>
            {busqueda ? 'Intenta con otro término de búsqueda' : 'Presiona "+ Nuevo paciente" para comenzar'}
          </div>
        </div>
      ) : (
        <div style={s.grid}>
          {pacientes.map(p => (
            <div key={p.id} style={s.pacienteCard}>
              <div style={s.pacienteHeader}>
                <div style={s.avatar}>
                  {p.nombre[0]}{p.apellido?.[0] || ''}
                </div>
                <div style={s.pacienteInfo}>
                  <div style={s.pacienteNombre}>{p.nombre} {p.apellido}</div>
                  <div style={s.pacienteMeta}>
                    {p.sexo && <span style={s.badge}>{p.sexo === 'M' ? 'Masculino' : 'Femenino'}</span>}
                    {calcularEdad(p.fecha_nacimiento) && (
                      <span style={s.badge}>{calcularEdad(p.fecha_nacimiento)} años</span>
                    )}
                  </div>
                </div>
              </div>

              {(p.email || p.telefono) && (
                <div style={s.pacienteContacto}>
                  {p.email && <div style={s.contactoItem}>✉ {p.email}</div>}
                  {p.telefono && <div style={s.contactoItem}>📞 {p.telefono}</div>}
                </div>
              )}

              {p.notas && <div style={s.pacienteNotas}>{p.notas}</div>}

              <div style={s.pacienteAcciones}>
                <button style={s.btnSecundario} onClick={() => handleEditar(p)}>
                  Editar
                </button>
                <button style={s.btnExpediente} onClick={() => setPacienteSeleccionado(p.id)}>
                  Ver expediente →
                </button>
                <button style={s.btnPeligro} onClick={() => handleEliminar(p.id)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal formulario */}
      {modalAbierto && (
        <FormPaciente
          paciente={pacienteEditando}
          onGuardar={handleGuardar}
          onCerrar={() => { setModalAbierto(false); setPacienteEditando(null) }}
        />
      )}
    </div>
  )
}

const s = {
  topBar:          { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  h1:              { fontSize: '22px', fontWeight: '600', color: '#1c1917', margin: 0 },
  btnPrimario:     { padding: '8px 18px', borderRadius: '8px', border: 'none', background: 'var(--color-primario)', color: '#fff', fontSize: '14px', cursor: 'pointer', fontWeight: '500' },
  btnSecundario:   { padding: '6px 14px', borderRadius: '6px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e7e5e4', background: '#fff', fontSize: '13px', color: '#57534e', cursor: 'pointer' },
  btnPeligro:      { padding: '6px 14px', borderRadius: '6px', border: 'none', background: '#fef2f2', fontSize: '13px', color: '#ef4444', cursor: 'pointer' },
  card:            { background: '#fff', border: '1px solid #e7e5e4', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' },
  input:           { width: '100%', padding: '8px 12px', borderRadius: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#d6d3d1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  msg:             { textAlign: 'center', padding: '3rem', fontSize: '14px', color: '#a8a29e' },
  emptyState:      { textAlign: 'center', padding: '4rem 2rem' },
  emptyIcon:       { fontSize: '48px', marginBottom: '1rem' },
  emptyTitulo:     { fontSize: '16px', fontWeight: '500', color: '#1c1917', marginBottom: '8px' },
  emptyDesc:       { fontSize: '13px', color: '#78716c' },
  grid:            { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
  pacienteCard:    { background: '#fff', border: '1px solid #e7e5e4', borderRadius: '10px', padding: '1.25rem' },
  pacienteHeader:  { display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' },
  avatar:          { width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primario-bg)', color: 'var(--color-primario)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600', flexShrink: 0 },
  pacienteInfo:    { flex: 1 },
  pacienteNombre:  { fontSize: '15px', fontWeight: '600', color: '#1c1917', marginBottom: '4px' },
  pacienteMeta:    { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  badge:           { fontSize: '11px', background: '#f5f5f4', color: '#78716c', padding: '2px 8px', borderRadius: '20px' },
  pacienteContacto:{ marginBottom: '8px' },
  contactoItem:    { fontSize: '12px', color: '#57534e', marginBottom: '2px' },
  pacienteNotas:   { fontSize: '12px', color: '#78716c', background: '#fafaf9', borderRadius: '6px', padding: '6px 10px', marginBottom: '10px', lineHeight: 1.5 },
  pacienteAcciones:{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px', borderTop: '1px solid #f5f5f4', paddingTop: '10px' },
  btnExpediente:   { padding: '6px 14px', borderRadius: '6px', border: 'none', background: 'var(--color-primario-bg)', fontSize: '13px', color: 'var(--color-primario)', cursor: 'pointer', fontWeight: '500' },
}