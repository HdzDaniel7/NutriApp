import { useState, useEffect } from 'react'
import { patientsAPI } from '../../services/api'
import FormPaciente from './FormPaciente'
import ExpedientePaciente from './ExpedientePaciente'
import { Mail, Phone, Users } from 'lucide-react'
import { PageHeader } from '../../components/ui'

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
    <div className="nd-page" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <PageHeader titulo="Pacientes" subtitulo="Expedientes, consultas y planes de tus pacientes">
        <button style={s.btnPrimario} onClick={() => { setPacienteEditando(null); setModalAbierto(true) }}>
          + Nuevo paciente
        </button>
      </PageHeader>

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
          <div style={s.emptyIcon}><Users size={48} strokeWidth={1.2} color="var(--ui-green-pale)"/></div>
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
                  {p.email && <div style={s.contactoItem}><Mail size={11} style={{marginRight:3,verticalAlign:"middle"}}/>{p.email}</div>}
                  {p.telefono && <div style={s.contactoItem}><Phone size={11} style={{marginRight:3,verticalAlign:"middle"}}/>{p.telefono}</div>}
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
  btnPrimario:     { padding: '8px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, var(--ui-green-light), var(--ui-green))', color: '#fff', fontSize: '13.5px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' },
  btnSecundario:   { padding: '6px 14px', borderRadius: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--ui-border)', background: '#fff', fontSize: '13px', color: 'var(--ui-txt-secondary)', cursor: 'pointer' },
  btnPeligro:      { padding: '6px 14px', borderRadius: '8px', border: '1px solid #FECACA', background: '#FEF2F2', fontSize: '13px', color: '#DC2626', cursor: 'pointer' },
  card:            { background: '#fff', border: '1px solid var(--ui-border)', borderRadius: '14px', padding: '14px 16px' },
  input:           { width: '100%', padding: '8px 12px', borderRadius: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--ui-border)', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: 'var(--ui-txt-primary)' },
  msg:             { textAlign: 'center', padding: '3rem', fontSize: '14px', color: 'var(--ui-txt-muted)' },
  emptyState:      { textAlign: 'center', padding: '4rem 2rem', background: '#fff', border: '1px solid var(--ui-border)', borderRadius: '14px' },
  emptyIcon:       { fontSize: '48px', marginBottom: '1rem' },
  emptyTitulo:     { fontSize: '16px', fontWeight: '600', color: 'var(--ui-txt-primary)', marginBottom: '8px' },
  emptyDesc:       { fontSize: '13px', color: 'var(--ui-txt-muted)' },
  grid:            { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' },
  pacienteCard:    { background: '#fff', border: '1px solid var(--ui-border)', borderRadius: '14px', padding: '18px 20px' },
  pacienteHeader:  { display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' },
  avatar:          { width: '40px', height: '40px', borderRadius: '50%', background: 'var(--ui-green-bg)', color: 'var(--ui-green)', border: '1.5px solid var(--ui-green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', flexShrink: 0 },
  pacienteInfo:    { flex: 1 },
  pacienteNombre:  { fontSize: '15px', fontWeight: '600', color: 'var(--ui-txt-primary)', marginBottom: '4px' },
  pacienteMeta:    { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  badge:           { fontSize: '11px', background: 'var(--ui-green-bg)', color: 'var(--ui-txt-secondary)', padding: '2px 8px', borderRadius: '20px', border: '1px solid var(--ui-border-subtle)' },
  pacienteContacto:{ marginBottom: '8px' },
  contactoItem:    { fontSize: '12px', color: 'var(--ui-txt-secondary)', marginBottom: '2px' },
  pacienteNotas:   { fontSize: '12px', color: 'var(--ui-txt-muted)', background: 'var(--ui-bg-page)', borderRadius: '8px', padding: '6px 10px', marginBottom: '10px', lineHeight: 1.5, border: '1px solid var(--ui-border-subtle)' },
  pacienteAcciones:{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px', borderTop: '1px solid var(--ui-border-subtle)', paddingTop: '10px' },
  btnExpediente:   { padding: '6px 14px', borderRadius: '8px', border: 'none', background: 'var(--ui-green-bg)', fontSize: '13px', color: 'var(--ui-green)', cursor: 'pointer', fontWeight: '600' },
}