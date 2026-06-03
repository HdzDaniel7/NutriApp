import { useState, useEffect } from 'react'
import { patientsAPI, agendaAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function Dashboard() {
  const { usuario } = useAuth()
  const [stats, setStats] = useState(null)
  const [citasHoy, setCitasHoy] = useState([])
  const [citasSemana, setCitasSemana] = useState([])
  const [actividadMes, setActividadMes] = useState({})
  const [cargando, setCargando] = useState(true)

  const hoy = new Date()
  const fechaHoy = hoy.toISOString().split('T')[0]
  const inicioSemana = new Date(hoy)
  inicioSemana.setDate(hoy.getDate() - hoy.getDay())
  const finSemana = new Date(inicioSemana)
  finSemana.setDate(inicioSemana.getDate() + 6)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const [pacientesRes, citasHoyRes, citasSemanaRes, citasMesRes] = await Promise.all([
        patientsAPI.list(),
        agendaAPI.getCitas({ fecha_inicio: fechaHoy, fecha_fin: fechaHoy }),
        agendaAPI.getCitas({
          fecha_inicio: inicioSemana.toISOString().split('T')[0],
          fecha_fin: finSemana.toISOString().split('T')[0]
        }),
        agendaAPI.getCitasMes(hoy.getFullYear(), hoy.getMonth() + 1),
      ])

      setStats({
        totalPacientes: pacientesRes.data.total,
        citasHoy: citasHoyRes.data.total,
        citasSemana: citasSemanaRes.data.total,
        citasMes: citasMesRes.data.total,
      })
      setCitasHoy(citasHoyRes.data.data)
      setCitasSemana(citasSemanaRes.data.data)

      // Construir mapa de actividad por día
      const actividad = {}
      citasMesRes.data.data.forEach(c => {
        const dia = parseInt(c.fecha.split('-')[2])
        actividad[dia] = (actividad[dia] || 0) + 1
      })
      setActividadMes(actividad)
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  const COLORES_ESTADO = {
    programada: { bg: '#dbeafe', color: '#1d4ed8' },
    completada:  { bg: '#dcfce7', color: '#15803d' },
    cancelada:   { bg: '#fee2e2', color: '#b91c1c' },
    reagendada:  { bg: '#fef9c3', color: '#a16207' },
  }

  const diasEnMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate()
  const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1).getDay()
  const DIAS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

  if (cargando) return <div style={s.msg}>Cargando dashboard...</div>

  return (
    <div>
      <div style={s.topBar}>
        <div>
          <h1 style={s.h1}>Bienvenido, {usuario?.nombre} 👋</h1>
          <div style={s.fecha}>{hoy.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div style={s.statsGrid}>
        {[
          { label: 'Pacientes activos', valor: stats?.totalPacientes || 0, icon: '👥', color: '#2563eb' },
          { label: 'Citas hoy',         valor: stats?.citasHoy || 0,       icon: '📅', color: '#16a34a' },
          { label: 'Citas esta semana', valor: stats?.citasSemana || 0,    icon: '📆', color: '#d97706' },
          { label: 'Citas este mes',    valor: stats?.citasMes || 0,       icon: '🗓',  color: '#7c3aed' },
        ].map(({ label, valor, icon, color }) => (
          <div key={label} style={s.statCard}>
            <div style={s.statIcon}>{icon}</div>
            <div style={s.statValor}>{valor}</div>
            <div style={s.statLabel}>{label}</div>
            <div style={{ ...s.statBar, background: color + '20' }}>
              <div style={{ ...s.statBarFill, background: color, width: `${Math.min(valor * 10, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div style={s.grid2}>

        {/* Citas de hoy */}
        <div style={s.card}>
          <div style={s.cardTitle}>Citas de hoy</div>
          {citasHoy.length === 0 ? (
            <div style={s.empty}>Sin citas programadas para hoy</div>
          ) : (
            citasHoy.map(c => (
              <div key={c.id} style={s.citaRow}>
                <div style={s.citaHora}>{c.hora_inicio} – {c.hora_fin}</div>
                <div style={s.citaNombre}>
                  {c.paciente_nombre
                    ? `${c.paciente_nombre} ${c.paciente_apellido || ''}`.trim()
                    : c.nombre_provisional || 'Sin paciente'}
                </div>
                <select
                    value={c.estado}
                    onChange={async (e) => {
                        await agendaAPI.updateEstado(c.id, e.target.value)
                        cargarDatos()
                    }}
                    style={{
                        ...s.estadoBadge,
                        background: COLORES_ESTADO[c.estado]?.bg,
                        color: COLORES_ESTADO[c.estado]?.color,
                        border: 'none',
                        cursor: 'pointer',
                        outline: 'none',
                        appearance: 'auto',
                    }}>
                    <option value="programada">Programada</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="reagendada">Reagendada</option>
                </select>
              </div>
            ))
          )}
        </div>

        {/* Citas de la semana */}
        <div style={s.card}>
          <div style={s.cardTitle}>Esta semana</div>
          {citasSemana.length === 0 ? (
            <div style={s.empty}>Sin citas esta semana</div>
          ) : (
            citasSemana.map(c => (
              <div key={c.id} style={s.citaRow}>
                <div style={s.citaFecha}>
                  {new Date(c.fecha + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' })}
                  &nbsp;{c.hora_inicio}
                </div>
                <div style={s.citaNombre}>
                  {c.paciente_nombre
                    ? `${c.paciente_nombre} ${c.paciente_apellido || ''}`.trim()
                    : c.nombre_provisional || 'Sin paciente'}
                </div>
                <select
                    value={c.estado}
                    onChange={async (e) => {
                        await agendaAPI.updateEstado(c.id, e.target.value)
                        cargarDatos()
                    }}
                    style={{
                        ...s.estadoBadge,
                        background: COLORES_ESTADO[c.estado]?.bg,
                        color: COLORES_ESTADO[c.estado]?.color,
                        border: 'none',
                        cursor: 'pointer',
                        outline: 'none',
                        appearance: 'auto',
                    }}>
                    <option value="programada">Programada</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="reagendada">Reagendada</option>
                </select>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Calendario de actividad del mes */}
      <div style={s.card}>
        <div style={s.cardTitle}>Actividad de {MESES[hoy.getMonth()]}</div>
        <div style={s.calGrid}>
          {DIAS.map(d => <div key={d} style={s.calHeader}>{d}</div>)}
          {Array(primerDia).fill(null).map((_, i) => <div key={`v${i}`} />)}
          {Array(diasEnMes).fill(null).map((_, i) => {
            const dia = i + 1
            const citas = actividadMes[dia] || 0
            const esHoy = dia === hoy.getDate()
            const intensidad = citas === 0 ? 0 : citas === 1 ? 1 : citas <= 3 ? 2 : 3
            const colores = ['#f5f5f4', '#bbf7d0', '#4ade80', '#16a34a']
            return (
              <div key={dia} style={{
                ...s.calDia,
                background: esHoy ? '#dbeafe' : colores[intensidad],
                borderWidth: esHoy ? '2px' : '0px',
                borderStyle: 'solid',
                borderColor: esHoy ? '#2563eb' : 'transparent',
              }} title={`${dia} ${MESES[hoy.getMonth()]}: ${citas} cita${citas !== 1 ? 's' : ''}`}>
                <span style={{ fontSize: '10px', color: esHoy ? '#1d4ed8' : intensidad > 1 ? '#fff' : '#78716c', fontWeight: esHoy ? '600' : '400' }}>
                  {dia}
                </span>
              </div>
            )
          })}
        </div>
        <div style={s.leyenda}>
          <span style={s.leyendaLabel}>Menos</span>
          {['#f5f5f4','#bbf7d0','#4ade80','#16a34a'].map(c => (
            <div key={c} style={{ width: '14px', height: '14px', borderRadius: '3px', background: c }} />
          ))}
          <span style={s.leyendaLabel}>Más citas</span>
        </div>
      </div>

    </div>
  )
}

const s = {
  msg:          { textAlign: 'center', padding: '3rem', color: '#a8a29e', fontSize: '14px' },
  topBar:       { marginBottom: '1.5rem' },
  h1:           { fontSize: '22px', fontWeight: '600', color: '#1c1917', margin: 0 },
  fecha:        { fontSize: '13px', color: '#78716c', marginTop: '4px' },
  statsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' },
  statCard:     { background: '#fff', border: '1px solid #e7e5e4', borderRadius: '10px', padding: '1.25rem' },
  statIcon:     { fontSize: '24px', marginBottom: '8px' },
  statValor:    { fontSize: '32px', fontWeight: '700', color: '#1c1917', lineHeight: 1 },
  statLabel:    { fontSize: '12px', color: '#78716c', marginTop: '4px', marginBottom: '8px' },
  statBar:      { height: '4px', borderRadius: '2px', overflow: 'hidden' },
  statBarFill:  { height: '100%', borderRadius: '2px', transition: 'width .5s' },
  grid2:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1rem' },
  card:         { background: '#fff', border: '1px solid #e7e5e4', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem' },
  cardTitle:    { fontSize: '12px', fontWeight: '500', color: '#78716c', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '1rem' },
  empty:        { fontSize: '13px', color: '#a8a29e', textAlign: 'center', padding: '1.5rem 0' },
  citaRow:      { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f5f5f4' },
  citaHora:     { fontSize: '12px', fontWeight: '500', color: '#57534e', minWidth: '90px' },
  citaFecha:    { fontSize: '12px', fontWeight: '500', color: '#57534e', minWidth: '80px' },
  citaNombre:   { fontSize: '13px', color: '#1c1917', flex: 1 },
  estadoBadge:  { fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '500', flexShrink: 0 },
  calGrid:      { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' },
  calHeader:    { fontSize: '11px', color: '#a8a29e', textAlign: 'center', padding: '4px 0', fontWeight: '500' },
  calDia:       { aspectRatio: '1', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default' },
  leyenda:      { display: 'flex', gap: '6px', alignItems: 'center', marginTop: '12px', justifyContent: 'flex-end' },
  leyendaLabel: { fontSize: '11px', color: '#78716c' },
}