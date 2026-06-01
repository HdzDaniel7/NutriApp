import { useState, useEffect } from 'react'
import { patientsAPI, consultasAPI, plansAPI } from '../../services/api'
import { useNavigate } from 'react-router-dom'

export default function ExpedientePaciente({ pacienteId, onVolver }) {
  const [paciente, setPaciente] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [tabActiva, setTabActiva] = useState('resumen')
  const [modalConsulta, setModalConsulta] = useState(false)
  const [planViendoId, setPlanViendoId] = useState(null)
  const [renombrandoPlanId, setRenombrandoPlanId] = useState(null)
  const [nuevoPlanNombre, setNuevoPlanNombre] = useState('')
  const navigate = useNavigate()

  const cargar = () => {
    setCargando(true)
    patientsAPI.getById(pacienteId)
      .then(r => setPaciente(r.data))
      .catch(err => console.error(err))
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargar() }, [pacienteId])

  const calcularEdad = (fecha) => {
    if (!fecha) return null
    const diff = new Date() - new Date(fecha)
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
  }

  const ultimaConsulta = paciente?.consultas?.[0]

  if (cargando) return <div style={s.msg}>Cargando expediente...</div>
  if (!paciente) return <div style={s.msg}>Paciente no encontrado</div>

  return (
    <div>
      {/* Header */}
      <div style={s.headerCard}>
        <button style={s.volverBtn} onClick={onVolver}>← Volver</button>
        <div style={s.pacienteHeader}>
          <div style={s.avatar}>
            {paciente.nombre[0]}{paciente.apellido?.[0] || ''}
          </div>
          <div>
            <div style={s.nombre}>{paciente.nombre} {paciente.apellido}</div>
            <div style={s.meta}>
              {paciente.sexo && <span style={s.badge}>{paciente.sexo === 'M' ? 'Masculino' : 'Femenino'}</span>}
              {calcularEdad(paciente.fecha_nacimiento) && (
                <span style={s.badge}>{calcularEdad(paciente.fecha_nacimiento)} años</span>
              )}
              {paciente.email && <span style={s.badge}>✉ {paciente.email}</span>}
              {paciente.telefono && <span style={s.badge}>📞 {paciente.telefono}</span>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          {[
            { id: 'resumen',   label: 'Resumen' },
            { id: 'consultas', label: `Consultas (${paciente.consultas?.length || 0})` },
            { id: 'planes',    label: `Planes (${paciente.planes?.length || 0})` },
          ].map(tab => (
            <button key={tab.id}
              style={tabActiva === tab.id ? {...s.tab, ...s.tabActive} : s.tab}
              onClick={() => setTabActiva(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Resumen */}
      {tabActiva === 'resumen' && (
        <div style={s.grid2}>
          <div style={s.card}>
            <div style={s.cardTitle}>Última consulta</div>
            {ultimaConsulta ? (
              <div>
                <div style={s.fechaConsulta}>{new Date(ultimaConsulta.fecha).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <div style={s.medidasGrid}>
                  {[
                    { label: 'Peso',      val: ultimaConsulta.peso,      unit: 'kg' },
                    { label: 'Talla',     val: ultimaConsulta.talla,     unit: 'cm' },
                    { label: 'IMC',       val: ultimaConsulta.imc,       unit: '' },
                    { label: '% Grasa',   val: ultimaConsulta.pct_grasa, unit: '%' },
                    { label: 'Cintura',   val: ultimaConsulta.cintura,   unit: 'cm' },
                    { label: 'Cadera',    val: ultimaConsulta.cadera,    unit: 'cm' },
                  ].map(({ label, val, unit }) => val && (
                    <div key={label} style={s.medidaItem}>
                      <div style={s.medidaLabel}>{label}</div>
                      <div style={s.medidaVal}>{val} {unit}</div>
                    </div>
                  ))}
                </div>
                {ultimaConsulta.notas && (
                  <div style={s.notasBox}>{ultimaConsulta.notas}</div>
                )}
              </div>
            ) : (
              <div style={s.emptyMsg}>Sin consultas registradas</div>
            )}
            <button style={s.btnPrimario} onClick={() => setModalConsulta(true)}>
              + Nueva consulta
            </button>
          </div>

          <div style={s.card}>
            <div style={s.cardTitle}>Notas del paciente</div>
            {paciente.notas
              ? <div style={s.notasBox}>{paciente.notas}</div>
              : <div style={s.emptyMsg}>Sin notas</div>
            }
          </div>
        </div>
      )}

      {/* Tab: Consultas */}
      {tabActiva === 'consultas' && (
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div style={s.cardTitle}>Historial de consultas</div>
            <button style={s.btnPrimario} onClick={() => setModalConsulta(true)}>
              + Nueva consulta
            </button>
          </div>
          {paciente.consultas?.length === 0 ? (
            <div style={s.emptyMsg}>Sin consultas registradas</div>
          ) : (
            paciente.consultas?.map(c => (
              <div key={c.id} style={s.consultaRow}>
                <div style={s.consultaFecha}>
                  {new Date(c.fecha).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div style={s.consultaMedidas}>
                  {c.peso    && <span style={s.medidaBadge}>⚖ {c.peso} kg</span>}
                  {c.talla   && <span style={s.medidaBadge}>📏 {c.talla} cm</span>}
                  {c.imc     && <span style={s.medidaBadge}>IMC {c.imc}</span>}
                  {c.pct_grasa && <span style={s.medidaBadge}>🔥 {c.pct_grasa}% grasa</span>}
                  {c.cintura && <span style={s.medidaBadge}>Cintura {c.cintura} cm</span>}
                  {c.cadera  && <span style={s.medidaBadge}>Cadera {c.cadera} cm</span>}
                </div>
                {c.notas && <div style={s.consultaNotas}>{c.notas}</div>}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Planes */}
      {tabActiva === 'planes' && (
        <div style={s.card}>
          <div style={s.cardTitle}>Planes nutricionales</div>
          {paciente.planes?.length === 0 ? (
            <div style={s.emptyMsg}>Sin planes guardados</div>
          ) : (
            paciente.planes?.map(p => (
                <div key={p.id} style={s.planRow}>
                    {renombrandoPlanId === p.id ? (
                    <div style={s.renombrando}>
                        <input
                        style={s.renombrандоInput}
                        value={nuevoPlanNombre}
                        onChange={e => setNuevoPlanNombre(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                            plansAPI.renombrar(p.id, nuevoPlanNombre)
                                .then(() => { setRenombrandoPlanId(null); cargar() })
                                .catch(err => console.error(err))
                            }
                            if (e.key === 'Escape') setRenombrandoPlanId(null)
                        }}
                        autoFocus
                        />
                        <button style={s.verPlanBtn} onClick={() => {
                        plansAPI.renombrar(p.id, nuevoPlanNombre)
                            .then(() => { setRenombrandoPlanId(null); cargar() })
                            .catch(err => console.error(err))
                        }}>✓</button>
                        <button style={{...s.verPlanBtn, background:'#fef2f2', color:'#ef4444'}}
                        onClick={() => setRenombrandoPlanId(null)}>✕</button>
                    </div>
                    ) : (
                    <div style={s.planNombre}
                      onClick={() => { setRenombrandoPlanId(p.id); setNuevoPlanNombre(p.nombre) }}
                      title="Clic para renombrar">
                      {p.nombre} ✏️
                    </div>
                    )}
                    <div style={s.planMeta}>
                    <span style={s.medidaBadge}>{p.vct_objetivo} kcal</span>
                    <span style={s.medidaBadge}>{p.modo === 'semanal_unico' ? 'Semanal único' : 'Por día'}</span>
                    <span style={s.planFecha}>
                        {new Date(p.fecha_creacion).toLocaleDateString('es-MX')}
                    </span>
                    <button style={s.verPlanBtn} onClick={() => setPlanViendoId(p.id)}>
                        Ver →
                    </button>
                    <button style={{...s.verPlanBtn, background:'#fefce8', color:'#ca8a04'}}
                        onClick={() => {
                        plansAPI.getById(p.id)
                            .then(r => navigate('/plan', { state: { planId: r.data.id, planInicial: r.data } }))
                            .catch(err => console.error(err))
                        }}>
                        Editar →
                    </button>
                    <button style={{...s.verPlanBtn, background:'#f0f9ff', color:'#0284c7'}}
                        onClick={() => {
                        plansAPI.duplicar(p.id)
                            .then(() => cargar())
                            .catch(err => console.error(err))
                        }}>
                        Duplicar
                    </button>
                    <button style={{...s.verPlanBtn, background:'#fafaf9', color:'#78716c'}}
                        onClick={() => { setRenombrandoPlanId(p.id); setNuevoPlanNombre(p.nombre) }}>
                        Renombrar
                    </button>
                    <button style={{...s.verPlanBtn, background:'#fef2f2', color:'#ef4444'}}
                        onClick={() => {
                        if (!confirm(`¿Eliminar "${p.nombre}"?`)) return
                        plansAPI.delete(p.id)
                            .then(() => cargar())
                            .catch(err => console.error(err))
                        }}>
                        Eliminar
                    </button>
                    </div>
                </div>
            ))
          )}
        </div>
      )}

      {/* Modal nueva consulta */}
      {modalConsulta && (
        <FormConsulta
          pacienteId={pacienteId}
          onGuardar={() => { setModalConsulta(false); cargar() }}
          onCerrar={() => setModalConsulta(false)}
        />
      )}
      {/* Modal ver plan */}
        {planViendoId && (
        <ModalVerPlan
            planId={planViendoId}
            onCerrar={() => setPlanViendoId(null)}
        />
        )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Formulario de nueva consulta — componente interno
// ─────────────────────────────────────────────
function FormConsulta({ pacienteId, onGuardar, onCerrar }) {
  const [form, setForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    peso: '', talla: '', pct_grasa: '', imc: '',
    cintura: '', cadera: '', notas: ''
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  // Calcular IMC automáticamente
  useEffect(() => {
    const p = parseFloat(form.peso)
    const t = parseFloat(form.talla)
    if (p && t) {
      const imc = (p / Math.pow(t / 100, 2)).toFixed(1)
      setForm(f => ({ ...f, imc }))
    }
  }, [form.peso, form.talla])

  const handleGuardar = () => {
    if (!form.fecha) { setError('La fecha es requerida'); return }
    setGuardando(true)
    consultasAPI.create(pacienteId, form)
      .then(() => onGuardar())
      .catch(err => setError(err.response?.data?.error || 'Error al guardar'))
      .finally(() => setGuardando(false))
  }

  return (
    <div style={s.overlay} onClick={onCerrar}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <span style={s.modalTitulo}>Nueva consulta</span>
          <button style={s.cerrarBtn} onClick={onCerrar}>✕</button>
        </div>
        <div style={s.modalBody}>
          <div style={s.field}>
            <label style={s.label}>Fecha *</label>
            <input style={s.input} type="date" value={form.fecha}
              onChange={e => set('fecha', e.target.value)} />
          </div>
          <div style={s.grid3}>
            {[
              { key: 'peso',      label: 'Peso (kg)',    placeholder: 'ej. 70' },
              { key: 'talla',     label: 'Talla (cm)',   placeholder: 'ej. 165' },
              { key: 'imc',       label: 'IMC',          placeholder: 'Auto' },
              { key: 'pct_grasa', label: '% Grasa',      placeholder: 'ej. 22' },
              { key: 'cintura',   label: 'Cintura (cm)', placeholder: 'ej. 80' },
              { key: 'cadera',    label: 'Cadera (cm)',  placeholder: 'ej. 95' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} style={s.field}>
                <label style={s.label}>{label}</label>
                <input style={s.input} type="number" placeholder={placeholder}
                  value={form[key]}
                  onChange={e => set(key, e.target.value)}
                  readOnly={key === 'imc'} />
              </div>
            ))}
          </div>
          <div style={s.field}>
            <label style={s.label}>Notas</label>
            <textarea style={s.textarea} rows={3} placeholder="Observaciones de la consulta..."
              value={form.notas} onChange={e => set('notas', e.target.value)} />
          </div>
          {error && <div style={s.error}>{error}</div>}
        </div>
        <div style={s.modalFooter}>
          <button style={s.cancelarBtn} onClick={onCerrar}>Cancelar</button>
          <button style={s.guardarBtn} onClick={handleGuardar} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar consulta'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalVerPlan({ planId, onCerrar }) {
  const [plan, setPlan] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    plansAPI.getById(planId)
      .then(r => setPlan(r.data))
      .catch(err => console.error(err))
      .finally(() => setCargando(false))
  }, [planId])

  return (
    <div style={s.overlay} onClick={onCerrar}>
      <div style={{...s.modal, maxWidth: '700px'}} onClick={e => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <span style={s.modalTitulo}>{plan?.nombre || 'Plan nutricional'}</span>
          <button style={s.cerrarBtn} onClick={onCerrar}>✕</button>
        </div>
        <div style={s.modalBody}>
          {cargando ? (
            <div style={{textAlign:'center', padding:'2rem', color:'#a8a29e'}}>Cargando plan...</div>
          ) : !plan ? (
            <div style={{textAlign:'center', padding:'2rem', color:'#a8a29e'}}>Plan no encontrado</div>
          ) : (
            <div>
              <div style={s.medidasGrid}>
                {[
                  { label: 'VCT objetivo', val: `${plan.vct_objetivo} kcal` },
                  { label: 'Modo',         val: plan.modo === 'semanal_unico' ? 'Semanal único' : 'Por día' },
                  { label: 'Creado',       val: new Date(plan.fecha_creacion).toLocaleDateString('es-MX') },
                ].map(({ label, val }) => (
                  <div key={label} style={s.medidaItem}>
                    <div style={s.medidaLabel}>{label}</div>
                    <div style={s.medidaVal}>{val}</div>
                  </div>
                ))}
              </div>

              {plan.contenido?.tiempos?.map(tiempo => (
                <div key={tiempo.id} style={{marginBottom:'12px'}}>
                  <div style={{fontSize:'13px', fontWeight:'600', color:'#1c1917', marginBottom:'6px'}}>
                    {tiempo.emoji} {tiempo.nombre}
                  </div>
                  {tiempo.alimentos?.length === 0 ? (
                    <div style={{fontSize:'12px', color:'#a8a29e'}}>Sin alimentos</div>
                  ) : (
                    tiempo.alimentos?.map(a => (
                      <div key={a.id} style={{display:'flex', justifyContent:'space-between', padding:'6px 10px', background:'#fafaf9', borderRadius:'6px', marginBottom:'4px'}}>
                        <div>
                          <span style={{fontSize:'13px', color:'#1c1917'}}>{a.descripcion}</span>
                          <span style={{fontSize:'11px', color:'#78716c', marginLeft:'8px'}}>
                            {a.porcion_medida_emoji} {a.porcion_medida_nombre ? `${a.porcion_medida_nombre} · ` : ''}{a.porcion_gramos}g
                          </span>
                        </div>
                        <div style={{fontSize:'12px', color:'#57534e'}}>
                          {a.nutrientes?.energia_kcal} kcal &nbsp;·&nbsp;
                          P: {a.nutrientes?.proteina}g &nbsp;·&nbsp;
                          C: {a.nutrientes?.carbohidratos}g &nbsp;·&nbsp;
                          G: {a.nutrientes?.grasa_total}g
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={s.modalFooter}>
          <button style={s.guardarBtn} onClick={onCerrar}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}

const s = {
  msg:            { textAlign: 'center', padding: '3rem', fontSize: '14px', color: '#a8a29e' },
  headerCard:     { background: '#fff', border: '1px solid #e7e5e4', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem' },
  volverBtn:      { background: 'none', border: 'none', fontSize: '13px', color: '#57534e', cursor: 'pointer', padding: '0 0 12px 0' },
  pacienteHeader: { display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '1rem' },
  avatar:         { width: '48px', height: '48px', borderRadius: '50%', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '600', flexShrink: 0 },
  nombre:         { fontSize: '20px', fontWeight: '600', color: '#1c1917', marginBottom: '6px' },
  meta:           { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  badge:          { fontSize: '11px', background: '#f5f5f4', color: '#78716c', padding: '3px 10px', borderRadius: '20px' },
  tabs:           { display: 'flex', gap: '4px', borderTop: '1px solid #f5f5f4', paddingTop: '12px' },
  tab:            { padding: '6px 16px', borderRadius: '20px', border: 'none', background: 'transparent', fontSize: '13px', color: '#57534e', cursor: 'pointer' },
  tabActive:      { background: '#f0fdf4', color: '#16a34a', fontWeight: '500' },
  grid2:          { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' },
  grid3:          { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' },
  card:           { background: '#fff', border: '1px solid #e7e5e4', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem' },
  cardHeader:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  cardTitle:      { fontSize: '12px', fontWeight: '500', color: '#78716c', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.75rem' },
  fechaConsulta:  { fontSize: '14px', fontWeight: '500', color: '#1c1917', marginBottom: '10px' },
  medidasGrid:    { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '10px' },
  medidaItem:     { background: '#fafaf9', borderRadius: '6px', padding: '8px 10px' },
  medidaLabel:    { fontSize: '11px', color: '#78716c', marginBottom: '2px' },
  medidaVal:      { fontSize: '15px', fontWeight: '500', color: '#1c1917' },
  notasBox:       { fontSize: '13px', color: '#57534e', background: '#fafaf9', borderRadius: '6px', padding: '8px 12px', marginBottom: '10px', lineHeight: 1.6 },
  emptyMsg:       { fontSize: '13px', color: '#a8a29e', textAlign: 'center', padding: '1.5rem 0' },
  btnPrimario:    { padding: '7px 16px', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#fff', fontSize: '13px', cursor: 'pointer', fontWeight: '500', marginTop: '10px' },
  consultaRow:    { padding: '12px 0', borderBottom: '1px solid #f5f5f4' },
  consultaFecha:  { fontSize: '13px', fontWeight: '500', color: '#1c1917', marginBottom: '6px' },
  consultaMedidas:{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' },
  medidaBadge:    { fontSize: '11px', background: '#f5f5f4', color: '#57534e', padding: '2px 8px', borderRadius: '20px' },
  consultaNotas:  { fontSize: '12px', color: '#78716c', marginTop: '4px' },
  planRow:        { padding: '10px 0', borderBottom: '1px solid #f5f5f4' },
  planNombre:     { fontSize: '14px', fontWeight: '500', color: '#1c1917', marginBottom: '4px' },
  planMeta:       { display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' },
  planFecha:      { fontSize: '11px', color: '#a8a29e', marginLeft: 'auto' },
  overlay:        { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal:          { background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  modalHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e7e5e4' },
  modalTitulo:    { fontSize: '16px', fontWeight: '600', color: '#1c1917' },
  cerrarBtn:      { background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#78716c' },
  modalBody:      { padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' },
  modalFooter:    { display: 'flex', gap: '8px', justifyContent: 'flex-end', padding: '1rem 1.5rem', borderTop: '1px solid #e7e5e4' },
  field:          { display: 'flex', flexDirection: 'column', gap: '4px' },
  label:          { fontSize: '13px', color: '#57534e', fontWeight: '500' },
  input:          { padding: '8px 10px', borderRadius: '6px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#d6d3d1', fontSize: '14px', outline: 'none' },
  textarea:       { padding: '8px 10px', borderRadius: '6px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#d6d3d1', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' },
  error:          { background: '#fef2f2', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', color: '#ef4444' },
  cancelarBtn:    { padding: '8px 16px', borderRadius: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e7e5e4', background: '#fff', fontSize: '14px', color: '#57534e', cursor: 'pointer' },
  guardarBtn:     { padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#fff', fontSize: '14px', cursor: 'pointer', fontWeight: '500' },
  verPlanBtn:     { padding: '4px 10px', borderRadius: '6px', border: 'none', background: '#f0fdf4', fontSize: '12px', color: '#16a34a', cursor: 'pointer', fontWeight: '500' },
  renombrando:    { display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' },
  renombrандоInput:{ flex: 1, padding: '6px 10px', borderRadius: '6px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#86efac', fontSize: '14px', outline: 'none' },
}