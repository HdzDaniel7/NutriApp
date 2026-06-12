import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { crearPlanVacio, agregarAlimento, eliminarAlimento, actualizarGramos, agregarTiempo, eliminarTiempo, renombrarTiempo, calcularTotales, activarModoPorDia, activarModoSemanalUnico, agregarDia, eliminarDia, renombrarDia, agregarAlimentoDia, eliminarAlimentoDia, actualizarGramosDia, agregarTiempoDia, eliminarTiempoDia, renombrarTiempoDia, calcularTotalesDia } from './planUtils'
import { TIEMPOS_SUGERIDOS } from '../../config/porciones.config'
import TiempoComida from './TiempoComida'
import BuscadorAlimento from './BuscadorAlimento'
import ModalGuardarPlan from './ModalGuardarPlan'
import ModalNuevoDia from './ModalNuevoDia'
import { useExportarPDF, PlantillaOffscreen } from './components/ExportadorPDF'
import { Save, FileDown, X } from 'lucide-react'
import { PageHeader } from '../../components/ui'

export default function PlanConstructor({ planInicial = null, planId = null, onPlanGuardado = null, pacienteIdInicial = null, pacienteNombreInicial = null, vctInicial = null, consultaIdInicial = null, distribucionInicial = null }) {
  const { usuario } = useAuth()
  const [ultimoAgregadoId, setUltimoAgregadoId] = useState(null)
  const [vctInput, setVctInput] = useState(
    planInicial?.vct_objetivo?.toString() ||
    planInicial?.contenido?.vct_objetivo?.toString() ||
    vctInicial?.toString() || ''
  )
  const [plan, setPlan] = useState(() => {
    if (planInicial) {
      const contenido = planInicial.contenido
      if (!contenido || !contenido.tiempos) return null
      return contenido
    }
    // VCT recibido desde la calculadora o la consulta: el plan arranca
    // directo, sin pasar por el formulario de VCT objetivo
    const vct = parseFloat(vctInicial)
    if (vct > 0) return crearPlanVacio(vct, distribucionInicial)
    return null
  })
  const [vctEdicion, setVctEdicion] = useState(null) // string mientras se edita; null en reposo
  const [editandoPlanId]                          = useState(planId)
  const [buscadorAbierto, setBuscadorAbierto]     = useState(false)
  const [tiempoActivo, setTiempoActivo]           = useState(null)
  const [agregandoTiempo, setAgregandoTiempo]     = useState(false)
  const [nuevoTiempoNombre, setNuevoTiempoNombre] = useState('')
  const [gramosEnEdicionGlobal, setGramosEnEdicionGlobal] = useState({})
  const [diaActivoId, setDiaActivoId]             = useState(null)
  const [mostrarNuevoDia, setMostrarNuevoDia]     = useState(false)
  const [editandoDiaNombre, setEditandoDiaNombre] = useState(null)
  const [nuevoDiaNombre, setNuevoDiaNombre]       = useState('')
  const [mostrarGuardar, setMostrarGuardar]       = useState(false)
  const [nombrePlan, setNombrePlan]               = useState(planInicial?.nombre || 'Plan nutricional')
  const { ref, config, paginaActual, exportar, capturar } = useExportarPDF()

  useEffect(() => {
    if (!plan) return
    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [plan])

  const cambiarDia = (id) => {
    setDiaActivoId(id)
    setUltimoAgregadoId(null)
  }

  const iniciarPlan = () => {
    const vct = parseFloat(vctInput)
    if (!vct || vct <= 0) return
    setPlan(crearPlanVacio(vct, distribucionInicial))
  }

  // Edición inline del VCT objetivo desde la tarjeta de resumen
  const confirmarVct = () => {
    const v = parseFloat(vctEdicion)
    if (v > 0) setPlan(prev => ({ ...prev, vct_objetivo: v }))
    setVctEdicion(null)
  }

  const handleAgregarAlimento = (tiempoId) => {
    setTiempoActivo(tiempoId)
    setBuscadorAbierto(true)
  }

  const handleSeleccionarAlimento = (alimento) => {
    setBuscadorAbierto(false)
    const gramos = 100

    if (plan.modo === 'por_dia') {
      const nuevoPlan = agregarAlimentoDia(plan, diaActivoId, tiempoActivo, alimento, gramos)
      setPlan(nuevoPlan)
      const dia = nuevoPlan.dias.find(d => d.id === diaActivoId)
      const tiempo = dia?.tiempos.find(t => t.id === tiempoActivo)
      const ultimoAlimento = tiempo?.alimentos[tiempo.alimentos.length - 1]
      if (ultimoAlimento) setUltimoAgregadoId(ultimoAlimento.id)
    } else {
      const nuevoPlan = agregarAlimento(plan, tiempoActivo, alimento, gramos)
      setPlan(nuevoPlan)
      const tiempo = nuevoPlan.tiempos.find(t => t.id === tiempoActivo)
      const ultimoAlimento = tiempo?.alimentos[tiempo.alimentos.length - 1]
      if (ultimoAlimento) setUltimoAgregadoId(ultimoAlimento.id)
    }

    setTiempoActivo(null)
  }

  const handleActualizarGramos = (tiempoId, alimentoId, gramos, alimentoOriginal) => {
    setPlan(prev => actualizarGramos(prev, tiempoId, alimentoId, gramos, alimentoOriginal))
  }

  const handleEliminarAlimento = (tiempoId, alimentoId) => {
    if (plan.modo === 'por_dia') {
      setPlan(prev => eliminarAlimentoDia(prev, diaActivoId, tiempoId, alimentoId))
    } else {
      setPlan(prev => eliminarAlimento(prev, tiempoId, alimentoId))
    }
  }

  const handleAgregarTiempo = (nombre) => {
    if (!nombre.trim()) return
    setPlan(prev => agregarTiempo(prev, nombre.trim()))
    setNuevoTiempoNombre('')
    setAgregandoTiempo(false)
  }

  const handleEliminarTiempo = (tiempoId) => {
    if (plan.tiempos.length <= 1) return
    setPlan(prev => eliminarTiempo(prev, tiempoId))
  }

  const handleRenombrarTiempo = (tiempoId, nombre) => {
    setPlan(prev => renombrarTiempo(prev, tiempoId, nombre))
  }

  const totales = plan ? (() => {
    if (plan.modo === 'por_dia') {
      const diaId = diaActivoId || plan.dias?.[0]?.id
      const dia = plan.dias?.find(d => d.id === diaId)
      if (dia) {
        const t = calcularTotalesDia(dia, gramosEnEdicionGlobal)
        return {
          ...t,
          pct_vct: plan.vct_objetivo > 0
            ? Math.round((t.energia_kcal / plan.vct_objetivo) * 100)
            : 0
        }
      }
    }
    return calcularTotales(plan, gramosEnEdicionGlobal)
  })() : null

  if (!plan) {
    return (
      <div className="nd-page" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <PageHeader titulo="Constructor de Planes"
          subtitulo={pacienteNombreInicial ? `Plan para ${pacienteNombreInicial}` : null} />
        <div style={s.iniciarCard}>
          <div style={s.iniciarTitulo}>¿Cuál es el VCT objetivo del paciente?</div>
          <div style={s.iniciarDesc}>
            {vctInicial
              ? 'VCT pre-cargado desde la consulta del paciente — ajústalo si lo necesitas.'
              : 'Ingresa las kilocalorías diarias objetivo, o calcúlalas desde la consulta del paciente para ligarlas a su expediente.'}
          </div>
          <div style={s.iniciarRow}>
            <input
              style={s.vctInput}
              type="number"
              placeholder="ej. 2000"
              value={vctInput}
              onChange={e => setVctInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && iniciarPlan()}
            />
            <span style={s.vctLabel}>kcal / día</span>
            <button style={s.iniciarBtn} onClick={iniciarPlan}>
              Crear plan →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={s.topBar}>
        <input
          style={s.nombrePlanInput}
          value={nombrePlan}
          onChange={e => setNombrePlan(e.target.value)}
          placeholder="Nombre del plan"
        />
        <div style={s.topBarAcciones}>
          <div style={s.modoToggle}>
            <button
              style={plan.modo === 'semanal_unico' ? {...s.modoBtn, ...s.modoBtnActive} : s.modoBtn}
              onClick={() => setPlan(prev => activarModoSemanalUnico(prev))}>
              Semanal único
            </button>
            <button
              style={plan.modo === 'por_dia' ? {...s.modoBtn, ...s.modoBtnActive} : s.modoBtn}
              onClick={() => {
                setPlan(prev => {
                  const nuevoPlan = activarModoPorDia(prev)
                  cambiarDia(nuevoPlan.dias[0].id)
                  return nuevoPlan
                })
              }}>
              Por día
            </button>
          </div>
          <button style={s.guardarPlanBtn} onClick={() => setMostrarGuardar(true)}>
            <Save size={14} style={{verticalAlign:"middle",marginRight:5}}/>Guardar plan
          </button>
          <button
            style={{ ...s.guardarPlanBtn, background: '#fef2f2', color: '#dc2626' }}
            onClick={() => {
              exportar({
                plan,
                nombrePlan,
                plantillaId:  usuario?.plantilla_id  || 'moderna',
                colorId:      usuario?.color_pdf     || 'verde',
                logoBase64:   usuario?.logo_base64   || null,
                posicionLogo: usuario?.posicion_logo || 'superior_derecha',
              })
            }}>
            <FileDown size={14} style={{verticalAlign:"middle",marginRight:5}}/>Exportar PDF
          </button>
          <button style={s.resetBtn} onClick={() => setPlan(null)}>
            Nuevo plan
          </button>
        </div>
      </div>

      {/* Barra de progreso general */}
      <div style={s.resumenCard}>
        <div style={s.resumenRow}>
          <div style={s.resumenItem}>
            <div style={s.resumenLabel}>Objetivo</div>
            <div style={s.resumenVal}>
              <input
                style={s.vctObjetivoInput}
                type="text"
                inputMode="numeric"
                title="Editar VCT objetivo"
                aria-label="VCT objetivo en kcal"
                value={vctEdicion !== null ? vctEdicion : plan.vct_objetivo}
                onChange={e => setVctEdicion(e.target.value.replace(/[^\d.]/g, ''))}
                onFocus={e => e.target.select()}
                onBlur={confirmarVct}
                onKeyDown={e => e.key === 'Enter' && e.target.blur()}
              />
              <span style={s.vctUnidad}>kcal</span>
            </div>
          </div>
          <div style={s.resumenItem}>
            <div style={s.resumenLabel}>Acumulado</div>
            <div style={{ ...s.resumenVal, color: totales.pct_vct > 100 ? '#ef4444' : '#16a34a' }}>
              {totales.energia_kcal} kcal
            </div>
          </div>
          <div style={s.resumenItem}>
            <div style={s.resumenLabel}>Restante</div>
            <div style={s.resumenVal}>
              {Math.round(Math.max(0, plan.vct_objetivo - totales.energia_kcal))} kcal
            </div>
          </div>
          <div style={s.resumenItem}>
            <div style={s.resumenLabel}>Avance</div>
            <div style={{ ...s.resumenVal, color: totales.pct_vct > 100 ? '#ef4444' : '#1c1917' }}>
              {totales.pct_vct}%
            </div>
          </div>
        </div>

        <div style={s.barraFondo}>
          <div style={{
            ...s.barraRelleno,
            width: `${Math.min(totales.pct_vct, 100)}%`,
            background: totales.pct_vct > 100 ? '#ef4444' : '#16a34a'
          }} />
        </div>

        <div style={s.macrosTotales}>
          {[
            { label: 'Proteína',      val: totales.proteina,             color: '#2563eb' },
            { label: 'Carbohidratos', val: totales.carbohidratos,        color: '#16a34a' },
            { label: 'Grasa',         val: totales.grasa_total,          color: '#d97706' },
            { label: 'Fibra',         val: totales.fibra_dietetica_total, color: '#7c3aed' },
          ].map(({ label, val, color }) => (
            <div key={label} style={s.macroTotal}>
              <div style={{ ...s.macroTotalLabel, color }}>{label}</div>
              <div style={s.macroTotalVal}>{val}g</div>
            </div>
          ))}
        </div>
      </div>

      {/* Modo semanal único */}
      {plan.modo === 'semanal_unico' && (
        <>
          {plan.tiempos.map(tiempo => (
            <TiempoComida
              key={tiempo.id}
              tiempo={tiempo}
              ultimoAgregadoId={ultimoAgregadoId}
              onAgregarAlimento={handleAgregarAlimento}
              onEliminarAlimento={handleEliminarAlimento}
              onActualizarGramos={(tiempoId, alimentoId, gramos, alimentoOriginal) => {
                handleActualizarGramos(tiempoId, alimentoId, gramos, alimentoOriginal)
              }}
              onEliminar={handleEliminarTiempo}
              onRenombrar={handleRenombrarTiempo}
              onGramosChangeGlobal={(alimentoId, g) => setGramosEnEdicionGlobal(prev => ({...prev, [alimentoId]: g}))}
              onGuardarGlobal={(alimentoId) => setGramosEnEdicionGlobal(prev => { const n = {...prev}; delete n[alimentoId]; return n })}
            />
          ))}

          {agregandoTiempo ? (
            <div style={s.nuevoTiempoCard}>
              <input style={s.nuevoTiempoInput} type="text"
                placeholder="Nombre del tiempo de comida"
                value={nuevoTiempoNombre}
                onChange={e => setNuevoTiempoNombre(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAgregarTiempo(nuevoTiempoNombre)}
                autoFocus />
              <div style={s.sugeridos}>
                {TIEMPOS_SUGERIDOS.map(s => (
                  <button key={s} style={sug.btn} onClick={() => handleAgregarTiempo(s)}>{s}</button>
                ))}
              </div>
              <div style={s.nuevoTiempoAcciones}>
                <button style={s.cancelarBtn} onClick={() => setAgregandoTiempo(false)}>Cancelar</button>
                <button style={s.confirmarBtn} onClick={() => handleAgregarTiempo(nuevoTiempoNombre)}>Agregar</button>
              </div>
            </div>
          ) : (
            <button style={s.addTiempoBtn} onClick={() => setAgregandoTiempo(true)}>
              + Agregar tiempo de comida
            </button>
          )}
        </>
      )}

      {/* Modo por día */}
      {plan.modo === 'por_dia' && (
        <>
          <div style={s.diasTabs}>
            {plan.dias.map(dia => (
              <div key={dia.id} style={s.diaTabWrapper}>
                {editandoDiaNombre === dia.id ? (
                  <input
                    style={s.diaTabInput}
                    value={nuevoDiaNombre}
                    onChange={e => setNuevoDiaNombre(e.target.value)}
                    onBlur={() => {
                      if (nuevoDiaNombre.trim()) setPlan(prev => renombrarDia(prev, dia.id, nuevoDiaNombre.trim()))
                      setEditandoDiaNombre(null)
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        if (nuevoDiaNombre.trim()) setPlan(prev => renombrarDia(prev, dia.id, nuevoDiaNombre.trim()))
                        setEditandoDiaNombre(null)
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <button
                    style={diaActivoId === dia.id ? {...s.diaTab, ...s.diaTabActive} : s.diaTab}
                    onClick={() => cambiarDia(dia.id)}
                    onDoubleClick={() => { setEditandoDiaNombre(dia.id); setNuevoDiaNombre(dia.nombre) }}>
                    {dia.nombre}
                  </button>
                )}
                {plan.dias.length > 1 && diaActivoId === dia.id && (
                  <button style={s.diaTabDelete}
                    onClick={() => {
                      const otroId = plan.dias.find(d => d.id !== dia.id)?.id
                      setPlan(prev => eliminarDia(prev, dia.id))
                      cambiarDia(otroId)
                    }}><X size={14}/></button>
                )}
              </div>
            ))}
            <button style={s.addDiaBtn} onClick={() => setMostrarNuevoDia(true)}>
              + Día
            </button>
          </div>

          {plan.dias.filter(d => d.id === diaActivoId).map(dia => (
            <div key={dia.id}>
              {dia.tiempos.map(tiempo => (
                <TiempoComida
                  key={tiempo.id}
                  tiempo={tiempo}
                  ultimoAgregadoId={ultimoAgregadoId}
                  onAgregarAlimento={handleAgregarAlimento}
                  onEliminarAlimento={handleEliminarAlimento}
                  onActualizarGramos={(tiempoId, alimentoId, gramos, alimentoOriginal) => {
                    setPlan(prev => actualizarGramosDia(prev, diaActivoId, tiempoId, alimentoId, gramos, alimentoOriginal))
                  }}
                  onEliminar={(tiempoId) => setPlan(prev => eliminarTiempoDia(prev, diaActivoId, tiempoId))}
                  onRenombrar={(tiempoId, nombre) => setPlan(prev => renombrarTiempoDia(prev, diaActivoId, tiempoId, nombre))}
                  onGramosChangeGlobal={(alimentoId, g) => setGramosEnEdicionGlobal(prev => ({...prev, [alimentoId]: g}))}
                  onGuardarGlobal={(alimentoId) => setGramosEnEdicionGlobal(prev => { const n = {...prev}; delete n[alimentoId]; return n })}
                />
              ))}
              <button style={s.addTiempoBtn}
                onClick={() => setPlan(prev => agregarTiempoDia(prev, diaActivoId, 'Nueva comida'))}>
                + Agregar tiempo de comida
              </button>
            </div>
          ))}

          {mostrarNuevoDia && (
            <ModalNuevoDia
              dias={plan.dias}
              onAgregar={(diaId) => {
                setPlan(prev => {
                  const nuevoPlan = agregarDia(prev, diaId)
                  cambiarDia(nuevoPlan.dias[nuevoPlan.dias.length - 1].id)
                  return nuevoPlan
                })
              }}
              onClose={() => setMostrarNuevoDia(false)}
            />
          )}
        </>
      )}

      {mostrarGuardar && (
        <ModalGuardarPlan
          editandoPlanId={editandoPlanId}
          plan={plan}
          nombrePlan={nombrePlan}
          pacienteIdInicial={pacienteIdInicial || ''}
          pacienteNombreInicial={pacienteNombreInicial || ''}
          consultaId={consultaIdInicial}
          onGuardado={() => { if (onPlanGuardado) onPlanGuardado() }}
          onClose={() => setMostrarGuardar(false)}
        />
      )}

      {buscadorAbierto && (
        <BuscadorAlimento
          onSeleccionar={handleSeleccionarAlimento}
          onCerrar={() => { setBuscadorAbierto(false); setTiempoActivo(null) }}
        />
      )}

      <PlantillaOffscreen
        containerRef={ref}
        config={config}
        paginaActual={paginaActual}
        onListo={capturar}
      />
    </div>
  )
}

const s = {
  topBar:              { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' },
  topBarAcciones:      { display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' },
  modoToggle:          { display: 'flex', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--ui-border)' },
  modoBtn:             { padding: '5px 13px', fontSize: '11px', cursor: 'pointer', border: 'none', background: '#fff', color: 'var(--ui-txt-secondary)' },
  modoBtnActive:       { background: 'linear-gradient(135deg, var(--ui-green-light), var(--ui-green))', color: '#fff', fontWeight: '600' },
  resetBtn:            { padding: '5px 13px', borderRadius: '20px', border: '1px solid var(--ui-border)', background: '#fff', fontSize: '12px', color: 'var(--ui-txt-secondary)', cursor: 'pointer' },
  guardarPlanBtn:      { padding: '5px 13px', borderRadius: '20px', border: '1px solid var(--ui-green-pale)', background: 'var(--ui-green-bg)', fontSize: '12px', color: 'var(--ui-green)', cursor: 'pointer', fontWeight: '600' },
  nombrePlanInput:     { fontSize: '20px', fontWeight: '600', color: 'var(--ui-txt-primary)', border: 'none', borderBottom: '2px solid var(--ui-border)', outline: 'none', background: 'transparent', padding: '2px 4px', borderRadius: '4px', minWidth: '220px', letterSpacing: '-0.3px' },
  iniciarCard:         { background: '#fff', border: '1px solid var(--ui-border)', borderRadius: '14px', padding: '2rem', maxWidth: '440px', margin: '2rem auto', width: '100%' },
  iniciarTitulo:       { fontSize: '17px', fontWeight: '700', color: 'var(--ui-txt-primary)', marginBottom: '8px', letterSpacing: '-0.2px' },
  iniciarDesc:         { fontSize: '13px', color: 'var(--ui-txt-muted)', marginBottom: '1.5rem', lineHeight: 1.6 },
  iniciarRow:          { display: 'flex', gap: '8px', alignItems: 'center' },
  vctInput:            { width: '120px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--ui-border)', fontSize: '16px', outline: 'none', color: 'var(--ui-txt-primary)' },
  vctLabel:            { fontSize: '14px', color: 'var(--ui-txt-muted)' },
  iniciarBtn:          { padding: '8px 20px', borderRadius: '20px', border: 'none', background: 'linear-gradient(135deg, var(--ui-green-light), var(--ui-green))', color: '#fff', fontSize: '14px', cursor: 'pointer', fontWeight: '600', marginLeft: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' },
  resumenCard:         { background: '#fff', border: '1px solid var(--ui-border)', borderRadius: '14px', padding: '20px', marginBottom: '14px' },
  resumenRow:          { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '12px' },
  resumenItem:         { textAlign: 'center' },
  resumenLabel:        { fontSize: '10px', color: 'var(--ui-txt-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: '600' },
  resumenVal:          { fontSize: '22px', fontWeight: '700', color: 'var(--ui-txt-primary)' },
  vctObjetivoInput:    { width: '84px', fontSize: '22px', fontWeight: '700', color: 'var(--ui-txt-primary)', border: 'none', borderBottom: '2px dashed var(--ui-border)', outline: 'none', background: 'transparent', textAlign: 'center', padding: '0 0 1px', fontFamily: 'inherit' },
  vctUnidad:           { fontSize: '13px', fontWeight: '600', color: 'var(--ui-txt-muted)', marginLeft: '4px' },
  barraFondo:          { height: '6px', borderRadius: '3px', background: 'var(--ui-border-subtle)', overflow: 'hidden', marginBottom: '12px' },
  barraRelleno:        { height: '100%', borderRadius: '3px', transition: 'width .4s, background .3s' },
  macrosTotales:       { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' },
  macroTotal:          { background: 'var(--ui-bg-page)', borderRadius: '8px', padding: '8px 12px', textAlign: 'center', border: '1px solid var(--ui-border-subtle)' },
  macroTotalLabel:     { fontSize: '11px', fontWeight: '600', marginBottom: '2px' },
  macroTotalVal:       { fontSize: '16px', fontWeight: '600', color: 'var(--ui-txt-primary)' },
  addTiempoBtn:        { width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px dashed var(--ui-green-pale)', background: 'transparent', fontSize: '13px', color: 'var(--ui-txt-muted)', cursor: 'pointer', marginTop: '4px' },
  nuevoTiempoCard:     { background: '#fff', border: '1px solid var(--ui-border)', borderRadius: '14px', padding: '1rem', marginBottom: '8px' },
  nuevoTiempoInput:    { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--ui-border)', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '10px' },
  sugeridos:           { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' },
  nuevoTiempoAcciones: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
  cancelarBtn:         { padding: '6px 14px', borderRadius: '20px', border: '1px solid var(--ui-border)', background: '#fff', fontSize: '13px', color: 'var(--ui-txt-secondary)', cursor: 'pointer' },
  confirmarBtn:        { padding: '6px 14px', borderRadius: '20px', border: 'none', background: 'linear-gradient(135deg, var(--ui-green-light), var(--ui-green))', color: '#fff', fontSize: '13px', cursor: 'pointer', fontWeight: '600' },
  diasTabs:            { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' },
  diaTab:              { padding: '5px 14px', borderRadius: '20px', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--ui-border)', background: '#fff', fontSize: '12px', color: 'var(--ui-txt-secondary)', cursor: 'pointer' },
  diaTabActive:        { background: 'linear-gradient(135deg, var(--ui-green-light), var(--ui-green))', color: '#fff', borderColor: 'transparent', fontWeight: '600' },
  addDiaBtn:           { padding: '5px 12px', borderRadius: '20px', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--ui-border)', background: 'var(--ui-bg-page)', fontSize: '12px', color: 'var(--ui-txt-muted)', cursor: 'pointer' },
  diaTabWrapper:       { display: 'flex', alignItems: 'center', gap: '2px' },
  diaTabInput:         { padding: '5px 10px', borderRadius: '20px', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--ui-green-pale)', fontSize: '12px', outline: 'none', width: '100px' },
  diaTabDelete:        { background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: 'var(--ui-txt-muted)', padding: '2px 4px', borderRadius: '4px' },
}

const sug = {
  btn: { padding: '4px 12px', borderRadius: '20px', border: '1px solid var(--ui-border)', background: 'var(--ui-bg-page)', fontSize: '12px', color: 'var(--ui-txt-secondary)', cursor: 'pointer' },
}
