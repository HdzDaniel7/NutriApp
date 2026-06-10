import { useState, useEffect } from 'react'
import { patientsAPI, agendaAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
 
/* ── Tokens locales (espejo de App.jsx) ── */
const T = {
  green:        '#3A7D52',
  greenLight:   '#5A9E6F',
  greenPale:    '#C8E0CC',
  greenBg:      '#EBF4ED',
  txtPrimary:   '#1E3A2A',
  txtSecondary: '#4A6B55',
  txtMuted:     '#8AA896',
  border:       '#D8E8D2',
  borderSubtle: '#EAF2E6',
  bgCard:       '#FFFFFF',
  bgPage:       '#F4F7F1',
  earth:        '#8B6E52',
  earthBg:      '#F5EDE4',
  earthBorder:  '#E2CDB4',
  blue:         '#2563EB',
  blueBg:       '#EFF6FF',
  blueBorder:   '#BFDBFE',
  amber:        '#B45309',
  amberBg:      '#FFFBEB',
  amberBorder:  '#FDE68A',
  purple:       '#6D28D9',
  purpleBg:     '#F5F3FF',
  purpleBorder: '#DDD6FE',
}
 
/* ── SVG Íconos ── */
const Ico = {
  patients: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  today:    (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="12" cy="16" r="2" fill={c}/></svg>,
  week:     (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  month:    (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>,
  clock:    (c) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>,
  leaf:     () =>  <svg viewBox="0 0 18 18" fill="none" style={{ width: 13, height: 13 }}><path d="M9 16 Q7 13 6.5 10.5 Q6 8 8 6 Q8.5 8 9 9.5 Q9 7.5 10.5 5.5 Q12 7.5 12 9.5 Q12.5 8 13 6 Q15 8 14.5 10.5 Q14 13 11 16 Q10 16.3 9 16Z" fill={T.green}/></svg>,
}
 
const ESTADO_STYLE = {
  programada: { bg: T.blueBg,   color: T.blue,   border: T.blueBorder },
  completada:  { bg: T.greenBg,  color: T.green,  border: T.greenPale },
  cancelada:   { bg: '#FEF2F2',  color: '#DC2626', border: '#FECACA' },
  reagendada:  { bg: T.amberBg,  color: T.amber,  border: T.amberBorder },
}
 
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
 
/* ── Componente tarjeta stat ── */
function StatCard({ label, valor, accent, bgAccent, borderAccent, renderIcon }) {
  return (
    <div style={{
      background: T.bgCard,
      border: `1px solid ${T.border}`,
      borderRadius: 14,
      padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 10,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Franja lateral de color */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: accent, borderRadius: '14px 0 0 14px',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: T.txtMuted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </span>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: bgAccent, border: `1px solid ${borderAccent}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {renderIcon(accent)}
        </div>
      </div>
      <div style={{ fontSize: 36, fontWeight: 700, color: T.txtPrimary, lineHeight: 1 }}>
        {valor}
      </div>
    </div>
  )
}
 
/* ── Fila de cita ── */
function CitaRow({ cita, showDate, onEstadoChange }) {
  const est = ESTADO_STYLE[cita.estado] || ESTADO_STYLE.programada
  const nombre = cita.paciente_nombre
    ? `${cita.paciente_nombre} ${cita.paciente_apellido || ''}`.trim()
    : cita.nombre_provisional || 'Sin paciente'
 
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 0',
      borderBottom: `1px solid ${T.borderSubtle}`,
    }}>
      {/* Hora / fecha */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        minWidth: showDate ? 96 : 86, flexShrink: 0,
      }}>
        {Ico.clock(T.txtMuted)}
        <span style={{ fontSize: 12, color: T.txtSecondary, fontWeight: 500 }}>
          {showDate
            ? new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' }) + ' ' + cita.hora_inicio
            : `${cita.hora_inicio} – ${cita.hora_fin}`
          }
        </span>
      </div>
 
      {/* Nombre */}
      <span style={{ fontSize: 13.5, color: T.txtPrimary, flex: 1, fontWeight: 500 }}>
        {nombre}
      </span>
 
      {/* Estado select */}
      <select
        value={cita.estado}
        onChange={e => onEstadoChange(cita.id, e.target.value)}
        style={{
          fontSize: 11.5, padding: '3px 9px',
          borderRadius: 20,
          border: `1px solid ${est.border}`,
          background: est.bg,
          color: est.color,
          fontWeight: 600,
          cursor: 'pointer', outline: 'none',
          appearance: 'auto',
          flexShrink: 0,
        }}
      >
        <option value="programada">Programada</option>
        <option value="completada">Completada</option>
        <option value="cancelada">Cancelada</option>
        <option value="reagendada">Reagendada</option>
      </select>
    </div>
  )
}
 
/* ── Card wrapper ── */
function Card({ title, children, style = {} }) {
  return (
    <div style={{
      background: T.bgCard,
      border: `1px solid ${T.border}`,
      borderRadius: 14,
      padding: '20px',
      ...style,
    }}>
      {title && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          marginBottom: 14,
          paddingBottom: 12,
          borderBottom: `1px solid ${T.borderSubtle}`,
        }}>
          {Ico.leaf()}
          <span style={{ fontSize: 12, fontWeight: 600, color: T.txtMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {title}
          </span>
        </div>
      )}
      {children}
    </div>
  )
}
 
/* ── Empty state ── */
function Empty({ text }) {
  return (
    <div style={{
      textAlign: 'center', padding: '28px 0',
      fontSize: 13, color: T.txtMuted,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={T.greenPale} strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>
      {text}
    </div>
  )
}
 
/* ════════════════════════════════════════
   DASHBOARD PRINCIPAL
════════════════════════════════════════ */
export default function Dashboard() {
  const { usuario } = useAuth()
  const [stats, setStats]               = useState(null)
  const [citasHoy, setCitasHoy]         = useState([])
  const [citasSemana, setCitasSemana]   = useState([])
  const [actividadMes, setActividadMes] = useState({})
  const [cargando, setCargando]         = useState(true)
 
  const hoy = new Date()
  const fechaHoy = hoy.toISOString().split('T')[0]
  const inicioSemana = new Date(hoy)
  inicioSemana.setDate(hoy.getDate() - hoy.getDay())
  const finSemana = new Date(inicioSemana)
  finSemana.setDate(inicioSemana.getDate() + 6)
 
  useEffect(() => { cargarDatos() }, [])
 
  const cargarDatos = async () => {
    setCargando(true)
    try {
      const [pacientesRes, citasHoyRes, citasSemanaRes, citasMesRes] = await Promise.all([
        patientsAPI.list(),
        agendaAPI.getCitas({ fecha_inicio: fechaHoy, fecha_fin: fechaHoy }),
        agendaAPI.getCitas({
          fecha_inicio: inicioSemana.toISOString().split('T')[0],
          fecha_fin:    finSemana.toISOString().split('T')[0],
        }),
        agendaAPI.getCitasMes(hoy.getFullYear(), hoy.getMonth() + 1),
      ])
      setStats({
        totalPacientes: pacientesRes.data.total,
        citasHoy:       citasHoyRes.data.total,
        citasSemana:    citasSemanaRes.data.total,
        citasMes:       citasMesRes.data.total,
      })
      setCitasHoy(citasHoyRes.data.data)
      setCitasSemana(citasSemanaRes.data.data)
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
 
  const handleEstado = async (id, estado) => {
    await agendaAPI.updateEstado(id, estado)
    cargarDatos()
  }
 
  const diasEnMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate()
  const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1).getDay()
 
  /* Colores calendario — paleta botánica */
  const calColor = (citas, esHoy) => {
    if (esHoy)    return { bg: T.blueBg,   border: T.blueBorder,  txt: T.blue,        fw: 700 }
    if (!citas)   return { bg: T.bgPage,   border: 'transparent', txt: T.txtMuted,    fw: 400 }
    if (citas===1)return { bg: '#D1FAE5',  border: 'transparent', txt: T.txtSecondary,fw: 400 }
    if (citas<=3) return { bg: T.greenPale,border: 'transparent', txt: T.green,       fw: 500 }
    return               { bg: T.green,    border: 'transparent', txt: '#fff',        fw: 600 }
  }
 
  if (cargando) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: T.txtMuted, fontSize: 14 }}>
      Cargando dashboard…
    </div>
  )
 
  return (
    <div className="nd-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
 
      {/* ── Header de bienvenida ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: T.txtPrimary, margin: 0, letterSpacing: '-0.4px' }}>
            Bienvenido, {usuario?.nombre}
          </h1>
          <p style={{ fontSize: 13.5, color: T.txtMuted, margin: '4px 0 0' }}>
            {hoy.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {/* Adorno simétrico de hojas */}
        <div style={{ display: 'flex', gap: 5, opacity: 0.35 }}>
          {[0, 1, 2, 1, 0].map((s, i) => (
            <svg key={i} viewBox="0 0 18 18" fill="none"
              style={{ width: 12 + s * 5, height: 12 + s * 5, transform: i > 2 ? 'scaleX(-1)' : 'none' }}>
              <path d="M9 16 Q7 13 6.5 10.5 Q6 8 8 6 Q8.5 8 9 9.5 Q9 7.5 10.5 5.5 Q12 7.5 12 9.5 Q12.5 8 13 6 Q15 8 14.5 10.5 Q14 13 11 16 Q10 16.3 9 16Z"
                fill={T.green} />
            </svg>
          ))}
        </div>
      </div>
 
      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
        <StatCard label="Pacientes activos" valor={stats?.totalPacientes || 0}
          accent={T.green}  bgAccent={T.greenBg}   borderAccent={T.greenPale}  renderIcon={Ico.patients} />
        <StatCard label="Citas hoy"         valor={stats?.citasHoy || 0}
          accent={T.blue}   bgAccent={T.blueBg}    borderAccent={T.blueBorder} renderIcon={Ico.today} />
        <StatCard label="Esta semana"       valor={stats?.citasSemana || 0}
          accent={T.amber}  bgAccent={T.amberBg}   borderAccent={T.amberBorder}renderIcon={Ico.week} />
        <StatCard label="Este mes"          valor={stats?.citasMes || 0}
          accent={T.purple} bgAccent={T.purpleBg}  borderAccent={T.purpleBorder} renderIcon={Ico.month} />
      </div>
 
      {/* ── Citas hoy + semana ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
        <Card title="Citas de hoy">
          {citasHoy.length === 0
            ? <Empty text="Sin citas programadas para hoy" />
            : citasHoy.map(c => <CitaRow key={c.id} cita={c} showDate={false} onEstadoChange={handleEstado} />)
          }
        </Card>
        <Card title="Esta semana">
          {citasSemana.length === 0
            ? <Empty text="Sin citas esta semana" />
            : citasSemana.map(c => <CitaRow key={c.id} cita={c} showDate={true} onEstadoChange={handleEstado} />)
          }
        </Card>
      </div>
 
      {/* ── Calendario de actividad ── */}
      <Card title={`Actividad de ${MESES[hoy.getMonth()]}`}>
        {/* Días de la semana */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
          {DIAS.map(d => (
            <div key={d} style={{ fontSize: 11, color: T.txtMuted, textAlign: 'center', padding: '2px 0', fontWeight: 600 }}>
              {d}
            </div>
          ))}
        </div>
        {/* Celdas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {Array(primerDia).fill(null).map((_, i) => <div key={`v${i}`} />)}
          {Array(diasEnMes).fill(null).map((_, i) => {
            const dia = i + 1
            const citas = actividadMes[dia] || 0
            const esHoy = dia === hoy.getDate()
            const c = calColor(citas, esHoy)
            return (
              <div key={dia}
                title={`${dia} ${MESES[hoy.getMonth()]}: ${citas} cita${citas !== 1 ? 's' : ''}`}
                style={{
                  aspectRatio: '1', borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: c.bg,
                  border: `1.5px solid ${c.border}`,
                  cursor: 'default',
                }}>
                <span style={{ fontSize: 11, color: c.txt, fontWeight: c.fw }}>
                  {dia}
                </span>
              </div>
            )
          })}
        </div>
        {/* Leyenda */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 14, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 11, color: T.txtMuted }}>Menos</span>
          {[T.bgPage, '#D1FAE5', T.greenPale, T.green].map(c => (
            <div key={c} style={{ width: 13, height: 13, borderRadius: 3, background: c, border: `1px solid ${T.border}` }} />
          ))}
          <span style={{ fontSize: 11, color: T.txtMuted }}>Más citas</span>
        </div>
      </Card>
 
    </div>
  )
}