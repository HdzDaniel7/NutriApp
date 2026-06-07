import { useState, useEffect } from 'react'
import { agendaAPI, patientsAPI } from '../../services/api'

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const COLORES_ESTADO = {
  programada: { bg: '#dbeafe', color: '#1d4ed8', label: 'Programada' },
  completada:  { bg: '#dcfce7', color: '#15803d', label: 'Completada' },
  cancelada:   { bg: '#fee2e2', color: '#b91c1c', label: 'Cancelada' },
  reagendada:  { bg: '#fef9c3', color: '#a16207', label: 'Reagendada' },
}

export default function Agenda() {
  const hoy = new Date()
  const [mesActual, setMesActual] = useState(hoy.getMonth())
  const [añoActual, setAñoActual] = useState(hoy.getFullYear())
  const [diaSeleccionado, setDiaSeleccionado] = useState(null)
  const [citas, setCitas] = useState([])
  const [config, setConfig] = useState(null)
  const [tabActiva, setTabActiva] = useState('calendario')
  const [modalCita, setModalCita] = useState(false)
  const [modalConfig, setModalConfig] = useState(false)
  const [citaEditando, setCitaEditando] = useState(null)
  const [busquedaPaciente, setBusquedaPaciente] = useState('')
  const [citasBusqueda, setCitasBusqueda] = useState([])

  const cargarCitas = () => {
    agendaAPI.getCitasMes(añoActual, mesActual + 1)
      .then(r => setCitas(r.data.data))
      .catch(err => console.error(err))
  }

  const cargarConfig = () => {
    agendaAPI.getConfig()
      .then(r => setConfig(r.data))
      .catch(err => console.error(err))
  }

  useEffect(() => { cargarCitas(); cargarConfig() }, [mesActual, añoActual])

  useEffect(() => {
    if (!busquedaPaciente || busquedaPaciente.length < 1) { setCitasBusqueda([]); return }
    agendaAPI.getCitas({ q: busquedaPaciente })
      .then(r => setCitasBusqueda(r.data.data))
      .catch(err => console.error(err))
  }, [busquedaPaciente])

  // Construir días del mes
  const primerDia = new Date(añoActual, mesActual, 1).getDay()
  const diasEnMes = new Date(añoActual, mesActual + 1, 0).getDate()

  const citasPorDia = citas.reduce((acc, c) => {
    const dia = parseInt(c.fecha.split('-')[2])
    if (!acc[dia]) acc[dia] = []
    acc[dia].push(c)
    return acc
  }, {})

  const citasDiaSeleccionado = diaSeleccionado ? (citasPorDia[diaSeleccionado] || []) : []

  const generarHorarios = () => {
    if (!config) return []
    const slots = []
    const [hIni, mIni] = config.hora_inicio.split(':').map(Number)
    const [hFin, mFin] = config.hora_fin.split(':').map(Number)
    const duracion = config.duracion_cita || 60
    let hora = hIni * 60 + mIni
    const fin = hFin * 60 + mFin

    while (hora + duracion <= fin) {
      const h = Math.floor(hora / 60)
      const m = hora % 60
      const horaStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
      const horaFinStr = (() => {
        const hf = Math.floor((hora + duracion) / 60)
        const mf = (hora + duracion) % 60
        return `${String(hf).padStart(2,'0')}:${String(mf).padStart(2,'0')}`
      })()

      // Verificar si hay descanso
      const [hDesc, mDesc] = (config.descanso_inicio || '14:00').split(':').map(Number)
      const [hDescFin, mDescFin] = (config.descanso_fin || '15:00').split(':').map(Number)
      const descInicio = hDesc * 60 + mDesc
      const descFin = hDescFin * 60 + mDescFin
      const esDescanso = hora >= descInicio && hora < descFin

      const citaEnSlot = citasDiaSeleccionado.find(c => {
        const citaMin = parseInt(c.hora_inicio.split(':')[0]) * 60 + parseInt(c.hora_inicio.split(':')[1])
        const slotMin = parseInt(horaStr.split(':')[0]) * 60 + parseInt(horaStr.split(':')[1])
        const slotFinMin = parseInt(horaFinStr.split(':')[0]) * 60 + parseInt(horaFinStr.split(':')[1])
        return citaMin >= slotMin && citaMin < slotFinMin
      })
      slots.push({ horaStr, horaFinStr, citaEnSlot, esDescanso })
      hora += duracion
    }
    return slots
  }

  const slots = generarHorarios()

  const navMes = (dir) => {
    let m = mesActual + dir
    let a = añoActual
    if (m < 0) { m = 11; a-- }
    if (m > 11) { m = 0; a++ }
    setMesActual(m)
    setAñoActual(a)
    setDiaSeleccionado(null)
  }

  return (
    <div>
      <div style={s.topBar}>
        <h1 style={s.h1}>Agenda</h1>
        <div style={s.topAcciones}>
          <button style={s.btnSecundario} onClick={() => setModalConfig(true)}>⚙️ Configurar horario</button>
          <button style={s.btnPrimario} onClick={() => { setCitaEditando(null); setModalCita(true) }}>+ Nueva cita</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {[
          { id: 'calendario', label: '📅 Calendario' },
          { id: 'buscar',     label: '🔍 Buscar citas' },
        ].map(t => (
          <button key={t.id}
            style={tabActiva === t.id ? {...s.tab, ...s.tabActive} : s.tab}
            onClick={() => setTabActiva(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Calendario */}
      {tabActiva === 'calendario' && (
        <div style={s.calendarioLayout}>

          {/* Calendario izquierda */}
          <div style={s.calendarioCard}>
            <div style={s.mesNav}>
              <button style={s.navBtn} onClick={() => navMes(-1)}>←</button>
              <span style={s.mesLabel}>{MESES[mesActual]} {añoActual}</span>
              <button style={s.navBtn} onClick={() => navMes(1)}>→</button>
            </div>

            {/* Cabecera días semana */}
            <div style={s.semanaCabecera}>
              {DIAS_SEMANA.map(d => (
                <div key={d} style={s.diaSemanaLabel}>{d}</div>
              ))}
            </div>

            {/* Grid días */}
            <div style={s.diasGrid}>
              {Array(primerDia).fill(null).map((_, i) => (
                <div key={`vacio-${i}`} />
              ))}
              {Array(diasEnMes).fill(null).map((_, i) => {
                const dia = i + 1
                const citasDia = citasPorDia[dia] || []
                const esHoy = dia === hoy.getDate() && mesActual === hoy.getMonth() && añoActual === hoy.getFullYear()
                const esPasado = new Date(añoActual, mesActual, dia) < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
                const seleccionado = diaSeleccionado === dia

                return (
                  <div key={dia} onClick={() => setDiaSeleccionado(dia)}
                    style={{
                      ...s.diaBtn,
                      ...(esHoy ? s.diaHoy : {}),
                      ...(seleccionado ? s.diaSeleccionado : {}),
                      ...(esPasado && !esHoy ? s.diaPasado : {}),
                    }}>
                    <span style={s.diaNum}>{dia}</span>
                    {citasDia.length > 0 && (
                      <div style={s.citaIndicadores}>
                        {citasDia.slice(0, 3).map(c => (
                          <span key={c.id} style={{
                            ...s.citaDot,
                            background: COLORES_ESTADO[c.estado]?.color || '#16a34a'
                          }} />
                        ))}
                        {citasDia.length > 3 && <span style={s.masIndicador}>+{citasDia.length - 3}</span>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Leyenda */}
            <div style={s.leyenda}>
              {Object.entries(COLORES_ESTADO).map(([key, val]) => (
                <div key={key} style={s.leyendaItem}>
                  <span style={{ ...s.leyendaDot, background: val.color }} />
                  <span style={s.leyendaLabel}>{val.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Panel derecho — horarios */}
          <div style={s.horariosPanel}>
            {!diaSeleccionado ? (
              <div style={s.sinDia}>
                <div style={s.sinDiaIcon}>📅</div>
                <div>Selecciona un día para ver los horarios</div>
              </div>
            ) : (
              <>
                <div style={s.horarioHeader}>
                  <div style={s.horarioTitulo}>
                    {diaSeleccionado} de {MESES[mesActual]}
                  </div>
                  <button style={s.btnPrimarioSm}
                    onClick={() => { setCitaEditando(null); setModalCita(true) }}>
                    + Cita
                  </button>
                </div>

                {citasDiaSeleccionado.length === 0 && slots.length === 0 && (
                  <div style={s.sinConfig}>Configura tu horario para ver los slots disponibles</div>
                )}

                <div style={s.slotsList}>
                  {slots.map(({ horaStr, horaFinStr, citaEnSlot, esDescanso }) => (
                    <div key={horaStr}
                      style={{
                        ...s.slot,
                        ...(esDescanso ? s.slotDescanso : {}),
                        ...(citaEnSlot ? s.slotOcupado : s.slotLibre),
                      }}>
                      <div style={s.slotHora}>{horaStr} – {horaFinStr}</div>
                      {esDescanso ? (
                        <div style={s.slotDescLabel}>🍽 Descanso</div>
                      ) : citaEnSlot ? (
                        <div style={s.citaInfo}>
                          <div style={s.citaPaciente}>
                            {citaEnSlot.paciente_nombre
                              ? `${citaEnSlot.paciente_nombre} ${citaEnSlot.paciente_apellido || ''}`.trim()
                              : citaEnSlot.nombre_provisional || 'Sin paciente'}
                          </div>
                          <div style={s.citaAcciones}>
                            <span style={{
                              ...s.estadoBadge,
                              background: COLORES_ESTADO[citaEnSlot.estado]?.bg,
                              color: COLORES_ESTADO[citaEnSlot.estado]?.color
                            }}>
                              {COLORES_ESTADO[citaEnSlot.estado]?.label}
                            </span>
                            <button style={s.editCitaBtn}
                              onClick={() => { setCitaEditando(citaEnSlot); setModalCita(true) }}>
                              ✏️
                            </button>
                            <button style={s.deleteCitaBtn}
                              onClick={() => {
                                if (confirm('¿Eliminar esta cita?')) {
                                  agendaAPI.deleteCita(citaEnSlot.id)
                                    .then(() => cargarCitas())
                                }
                              }}>
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button style={s.slotLibreBtn}
                          onClick={() => {
                            setCitaEditando({ hora_inicio: horaStr, hora_fin: horaFinStr })
                            setModalCita(true)
                          }}>
                          + Agendar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab Buscar */}
      {tabActiva === 'buscar' && (
        <div style={s.card}>
          <div style={s.buscarHeader}>
            <input style={s.buscarInput} type="text"
              placeholder="Buscar por nombre del paciente..."
              value={busquedaPaciente}
              onChange={e => setBusquedaPaciente(e.target.value)} />
          </div>
          {citasBusqueda.length === 0 && busquedaPaciente && (
            <div style={s.sinDatos}>No se encontraron citas</div>
          )}
          {citasBusqueda.map(c => (
            <div key={c.id} style={s.citaBusquedaRow}>
              <div style={s.citaBusquedaFecha}>
                {new Date(c.fecha + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                &nbsp;·&nbsp; {c.hora_inicio} – {c.hora_fin}
              </div>
              <div style={s.citaBusquedaInfo}>
                <span style={s.citaBusquedaNombre}>
                  {c.paciente_nombre
                    ? `${c.paciente_nombre} ${c.paciente_apellido || ''}`
                    : c.nombre_provisional || 'Sin paciente'}
                </span>
                <span style={{
                  ...s.estadoBadge,
                  background: COLORES_ESTADO[c.estado]?.bg,
                  color: COLORES_ESTADO[c.estado]?.color
                }}>
                  {COLORES_ESTADO[c.estado]?.label}
                </span>
              </div>
              {c.notas && <div style={s.citaBusquedaNotas}>{c.notas}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Modal nueva/editar cita */}
      {modalCita && (
        <FormCita
          cita={citaEditando}
          fecha={diaSeleccionado ? `${añoActual}-${String(mesActual+1).padStart(2,'0')}-${String(diaSeleccionado).padStart(2,'0')}` : ''}
          config={config}
          onGuardar={() => { setModalCita(false); setCitaEditando(null); cargarCitas() }}
          onCerrar={() => { setModalCita(false); setCitaEditando(null) }}
        />
      )}

      {/* Modal configuración */}
      {modalConfig && (
        <FormConfig
          config={config}
          onGuardar={(nuevaConfig) => { setConfig(nuevaConfig); setModalConfig(false); cargarCitas() }}
          onCerrar={() => setModalConfig(false)}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Formulario de cita
// ─────────────────────────────────────────────
function FormCita({ cita, fecha, config, onGuardar, onCerrar }) {
const [form, setForm] = useState({
  paciente_id:         cita?.paciente_id         || '',
  nombre_provisional:  cita?.nombre_provisional   || '',
  fecha:               cita?.fecha               || fecha || '',
  hora_inicio:         cita?.hora_inicio         || '',
  hora_fin:            cita?.hora_fin            || '',
  estado:              cita?.estado              || 'programada',
  tipo:                cita?.tipo                || 'consulta',
  notas:               cita?.notas               || '',
})
  const [pacientes, setPacientes] = useState([])
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    patientsAPI.list().then(r => setPacientes(r.data.data)).catch(err => console.error(err))
  }, [])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleGuardar = () => {
    if (!form.fecha || !form.hora_inicio || !form.hora_fin) {
      setError('Fecha, hora inicio y hora fin son requeridos')
      return
    }
    setGuardando(true)
    const accion = cita?.id
      ? agendaAPI.updateCita(cita.id, form)
      : agendaAPI.createCita(form)

    accion
      .then(() => onGuardar())
      .catch(err => setError(err.response?.data?.error || 'Error al guardar'))
      .finally(() => setGuardando(false))
  }

  return (
    <div style={m.overlay} onClick={onCerrar}>
      <div style={m.modal} onClick={e => e.stopPropagation()}>
        <div style={m.header}>
          <span style={m.titulo}>{cita?.id ? 'Editar cita' : 'Nueva cita'}</span>
          <button style={m.cerrarBtn} onClick={onCerrar}>✕</button>
        </div>
        <div style={m.body}>
          <div style={m.field}>
            <label style={m.label}>Nombre provisional</label>
            <input style={m.input} type="text"
                placeholder="ej. Juan (nuevo paciente)"
                value={form.nombre_provisional}
                onChange={e => set('nombre_provisional', e.target.value)} />
            <span style={{fontSize:'11px', color:'#a8a29e'}}>Opcional — para cuando aún no tienes el expediente</span>
          </div>
          <div style={m.field}>
            <label style={m.label}>Ligar a paciente existente</label>
            <select style={m.input} value={form.paciente_id} onChange={e => set('paciente_id', e.target.value)}>
                <option value="">Sin paciente asignado</option>
                {pacientes.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} {p.apellido || ''}</option>
                ))}
            </select>
            <span style={{fontSize:'11px', color:'#a8a29e'}}>Opcional — puedes ligarlo después desde aquí</span>
          </div>
          <div style={m.field}>
            <label style={m.label}>Fecha *</label>
            <input style={m.input} type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} />
          </div>
          <div style={m.grid2}>
            <div style={m.field}>
              <label style={m.label}>Hora inicio *</label>
              <input style={m.input} type="time" value={form.hora_inicio} onChange={e => set('hora_inicio', e.target.value)} />
            </div>
            <div style={m.field}>
              <label style={m.label}>Hora fin *</label>
              <input style={m.input} type="time" value={form.hora_fin} onChange={e => set('hora_fin', e.target.value)} />
            </div>
          </div>
          <div style={m.grid2}>
            <div style={m.field}>
              <label style={m.label}>Estado</label>
              <select style={m.input} value={form.estado} onChange={e => set('estado', e.target.value)}>
                <option value="programada">Programada</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
                <option value="reagendada">Reagendada</option>
              </select>
            </div>
            <div style={m.field}>
              <label style={m.label}>Tipo</label>
              <select style={m.input} value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                <option value="consulta">Consulta</option>
                <option value="seguimiento">Seguimiento</option>
                <option value="primera_vez">Primera vez</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>
          <div style={m.field}>
            <label style={m.label}>Notas</label>
            <textarea style={m.textarea} rows={3} value={form.notas}
              onChange={e => set('notas', e.target.value)}
              placeholder="Observaciones de la cita..." />
          </div>
          {error && <div style={m.error}>{error}</div>}
        </div>
        <div style={m.footer}>
          <button style={m.cancelarBtn} onClick={onCerrar}>Cancelar</button>
          <button style={m.guardarBtn} onClick={handleGuardar} disabled={guardando}>
            {guardando ? 'Guardando...' : cita?.id ? 'Guardar cambios' : 'Crear cita'}
          </button>
        </div>
      </div>
    </div>
  )
}
// ─────────────────────────────────────────────
// Formulario de configuración
// ─────────────────────────────────────────────
function FormConfig({ config, onGuardar, onCerrar }) {
  const [form, setForm] = useState({
    hora_inicio:     config?.hora_inicio     || '09:00',
    hora_fin:        config?.hora_fin        || '18:00',
    duracion_cita:   config?.duracion_cita   || 60,
    dias_laborales:  config?.dias_laborales  || [1,2,3,4,5],
    descanso_inicio: config?.descanso_inicio || '14:00',
    descanso_fin:    config?.descanso_fin    || '15:00',
    notas:           config?.notas           || '',
  })
  const [guardando, setGuardando] = useState(false)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const toggleDia = (dia) => {
    const dias = form.dias_laborales.includes(dia)
      ? form.dias_laborales.filter(d => d !== dia)
      : [...form.dias_laborales, dia].sort()
    set('dias_laborales', dias)
  }

  const handleGuardar = () => {
    setGuardando(true)
    agendaAPI.updateConfig({
      ...form,
      duracion_cita: parseInt(form.duracion_cita)
    })
      .then(r => onGuardar(r.data))
      .catch(err => console.error(err))
      .finally(() => setGuardando(false))
  }

  return (
    <div style={m.overlay} onClick={onCerrar}>
      <div style={m.modal} onClick={e => e.stopPropagation()}>
        <div style={m.header}>
          <span style={m.titulo}>Configurar horario</span>
          <button style={m.cerrarBtn} onClick={onCerrar}>✕</button>
        </div>
        <div style={m.body}>
          <div style={m.grid2}>
            <div style={m.field}>
              <label style={m.label}>Hora inicio</label>
              <input style={m.input} type="time" value={form.hora_inicio}
                onChange={e => set('hora_inicio', e.target.value)} />
            </div>
            <div style={m.field}>
              <label style={m.label}>Hora fin</label>
              <input style={m.input} type="time" value={form.hora_fin}
                onChange={e => set('hora_fin', e.target.value)} />
            </div>
          </div>
          <div style={m.field}>
            <label style={m.label}>Duración de cita (minutos)</label>
            <select style={m.input} value={form.duracion_cita}
              onChange={e => set('duracion_cita', parseInt(e.target.value))}>
              {[20, 30, 45, 60, 90, 120].map(d => (
                <option key={d} value={d}>{d} minutos</option>
              ))}
            </select>
          </div>
          <div style={m.field}>
            <label style={m.label}>Días laborales</label>
            <div style={m.diasGrid}>
              {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map((dia, i) => (
                <button key={i} onClick={() => toggleDia(i)}
                  style={form.dias_laborales.includes(i)
                    ? {...m.diaBtn, ...m.diaBtnActive}
                    : m.diaBtn}>
                  {dia}
                </button>
              ))}
            </div>
          </div>
          <div style={m.grid2}>
            <div style={m.field}>
              <label style={m.label}>Inicio descanso</label>
              <input style={m.input} type="time" value={form.descanso_inicio}
                onChange={e => set('descanso_inicio', e.target.value)} />
            </div>
            <div style={m.field}>
              <label style={m.label}>Fin descanso</label>
              <input style={m.input} type="time" value={form.descanso_fin}
                onChange={e => set('descanso_fin', e.target.value)} />
            </div>
          </div>
          <div style={m.field}>
            <label style={m.label}>Notas del horario</label>
            <textarea style={m.textarea} rows={2} value={form.notas}
              onChange={e => set('notas', e.target.value)}
              placeholder="ej. No atiendo por las tardes los viernes" />
          </div>
        </div>
        <div style={m.footer}>
          <button style={m.cancelarBtn} onClick={onCerrar}>Cancelar</button>
          <button style={m.guardarBtn} onClick={handleGuardar} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar configuración'}
          </button>
        </div>
      </div>
    </div>
  )
}

const s = {
  topBar:            { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  h1:                { fontSize: '22px', fontWeight: '600', color: '#1c1917', margin: 0 },
  topAcciones:       { display: 'flex', gap: '8px' },
  btnPrimario:       { padding: '8px 18px', borderRadius: '8px', border: 'none', background: 'var(--color-primario)', color: '#fff', fontSize: '14px', cursor: 'pointer', fontWeight: '500' },
  btnPrimarioSm:     { padding: '5px 12px', borderRadius: '6px', border: 'none', background: 'var(--color-primario)', color: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: '500' },
  btnSecundario:     { padding: '8px 16px', borderRadius: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e7e5e4', background: '#fff', fontSize: '14px', color: '#57534e', cursor: 'pointer' },
  tabs:              { display: 'flex', gap: '4px', marginBottom: '1rem' },
  tab:               { padding: '7px 16px', borderRadius: '20px', border: 'none', background: 'transparent', fontSize: '13px', color: '#57534e', cursor: 'pointer' },
  tabActive:         { background: 'var(--color-primario-bg)', color: 'var(--color-primario)', fontWeight: '500' },
  calendarioLayout:  { display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1rem', alignItems: 'start' },
  calendarioCard:    { background: '#fff', border: '1px solid #e7e5e4', borderRadius: '12px', padding: '1.25rem' },
  mesNav:            { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  navBtn:            { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#57534e', padding: '4px 8px', borderRadius: '6px' },
  mesLabel:          { fontSize: '15px', fontWeight: '600', color: '#1c1917' },
  semanaCabecera:    { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '6px' },
  diaSemanaLabel:    { fontSize: '11px', color: '#a8a29e', textAlign: 'center', padding: '4px 0', fontWeight: '500' },
  diasGrid:          { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' },
  diaBtn:            { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 2px', borderRadius: '6px', cursor: 'pointer', minHeight: '36px', background: 'transparent' },
  diaHoy:            { background: 'var(--color-primario-bg)', borderRadius: '6px' },
  diaSeleccionado:   { background: '#16a34a', borderRadius: '6px' },
  diaPasado:         { opacity: 0.45 },
  diaNum:            { fontSize: '12px', color: '#1c1917', fontWeight: '500' },
  citaIndicadores:   { display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '2px' },
  citaDot:           { width: '5px', height: '5px', borderRadius: '50%' },
  masIndicador:      { fontSize: '8px', color: '#78716c' },
  leyenda:           { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f5f5f4' },
  leyendaItem:       { display: 'flex', alignItems: 'center', gap: '4px' },
  leyendaDot:        { width: '8px', height: '8px', borderRadius: '50%' },
  leyendaLabel:      { fontSize: '11px', color: '#78716c' },
  horariosPanel:     { background: '#fff', border: '1px solid #e7e5e4', borderRadius: '12px', padding: '1.25rem', minHeight: '400px' },
  sinDia:            { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '12px', color: '#a8a29e', fontSize: '13px' },
  sinDiaIcon:        { fontSize: '40px' },
  horarioHeader:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '10px', borderBottom: '1px solid #f5f5f4' },
  horarioTitulo:     { fontSize: '15px', fontWeight: '600', color: '#1c1917' },
  sinConfig:         { fontSize: '13px', color: '#a8a29e', textAlign: 'center', padding: '2rem' },
  slotsList:         { display: 'flex', flexDirection: 'column', gap: '6px' },
  slot:              { borderRadius: '8px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  slotLibre:         { background: 'var(--color-primario-bg)', borderWidth: '1px', borderStyle: 'dashed', borderColor: 'var(--color-primario-border)' },
  slotOcupado:       { background: '#fff', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e7e5e4' },
  slotDescanso:      { background: '#fafaf9', borderWidth: '1px', borderStyle: 'solid', borderColor: '#f5f5f4', opacity: 0.7 },
  slotHora:          { fontSize: '12px', fontWeight: '500', color: '#57534e', minWidth: '90px' },
  slotDescLabel:     { fontSize: '12px', color: '#a8a29e' },
  slotLibreBtn:      { fontSize: '12px', color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' },
  citaInfo:          { flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  citaPaciente:      { fontSize: '13px', fontWeight: '500', color: '#1c1917' },
  citaAcciones:      { display: 'flex', alignItems: 'center', gap: '6px' },
  estadoBadge:       { fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '500' },
  editCitaBtn:       { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: '2px 4px' },
  deleteCitaBtn:     { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#ef4444', padding: '2px 4px' },
  card:              { background: '#fff', border: '1px solid #e7e5e4', borderRadius: '12px', padding: '1.25rem' },
  buscarHeader:      { marginBottom: '1rem' },
  buscarInput:       { width: '100%', padding: '8px 12px', borderRadius: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#d6d3d1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  sinDatos:          { fontSize: '13px', color: '#a8a29e', textAlign: 'center', padding: '2rem' },
  citaBusquedaRow:   { padding: '12px 0', borderBottom: '1px solid #f5f5f4' },
  citaBusquedaFecha: { fontSize: '12px', color: '#78716c', marginBottom: '4px' },
  citaBusquedaInfo:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  citaBusquedaNombre:{ fontSize: '14px', fontWeight: '500', color: '#1c1917' },
  citaBusquedaNotas: { fontSize: '12px', color: '#78716c', marginTop: '4px' },
}

const m = {
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal:      { background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '500px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e7e5e4' },
  titulo:     { fontSize: '16px', fontWeight: '600', color: '#1c1917' },
  cerrarBtn:  { background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#78716c' },
  body:       { padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' },
  grid2:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  field:      { display: 'flex', flexDirection: 'column', gap: '4px' },
  label:      { fontSize: '13px', color: '#57534e', fontWeight: '500' },
  input:      { padding: '8px 10px', borderRadius: '6px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#d6d3d1', fontSize: '14px', outline: 'none', background: '#fff' },
  textarea:   { padding: '8px 10px', borderRadius: '6px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#d6d3d1', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' },
  error:      { background: '#fef2f2', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', color: '#ef4444' },
  footer:     { display: 'flex', gap: '8px', justifyContent: 'flex-end', padding: '1rem 1.5rem', borderTop: '1px solid #e7e5e4' },
  cancelarBtn:{ padding: '8px 16px', borderRadius: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e7e5e4', background: '#fff', fontSize: '14px', color: '#57534e', cursor: 'pointer' },
  guardarBtn: { padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'var(--color-primario)', color: '#fff', fontSize: '14px', cursor: 'pointer', fontWeight: '500' },
  diasGrid:   { display: 'flex', gap: '6px' },
  diaBtn:     { flex: 1, padding: '6px 4px', borderRadius: '6px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e7e5e4', background: '#fafaf9', fontSize: '12px', color: '#57534e', cursor: 'pointer', textAlign: 'center' },
  diaBtnActive:{ background: 'var(--color-primario-bg)', borderColor: 'var(--color-primario-border)', color: 'var(--color-primario)', fontWeight: '500' },
}