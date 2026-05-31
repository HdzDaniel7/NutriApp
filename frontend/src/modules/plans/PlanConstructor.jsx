import { useState } from 'react'
import { crearPlanVacio, agregarAlimento, eliminarAlimento, actualizarGramos, agregarTiempo, eliminarTiempo, renombrarTiempo, calcularTotales, activarModoPorDia, activarModoSemanalUnico, agregarDia, eliminarDia, renombrarDia, agregarAlimentoDia, actualizarGramosDia, agregarTiempoDia, eliminarTiempoDia, renombrarTiempoDia, calcularTotalesDia } from './planUtils'
import { TIEMPOS_SUGERIDOS } from '../../config/porciones.config'
import TiempoComida from './TiempoComida'
import BuscadorAlimento from './BuscadorAlimento'

export default function PlanConstructor() {
  const [ultimoAgregadoId, setUltimoAgregadoId] = useState(null)
  const [vctInput, setVctInput] = useState('')
  const [plan, setPlan] = useState(null)
  const [buscadorAbierto, setBuscadorAbierto] = useState(false)
  const [tiempoActivo, setTiempoActivo] = useState(null)
  const [agregandoTiempo, setAgregandoTiempo] = useState(false)
  const [nuevoTiempoNombre, setNuevoTiempoNombre] = useState('')
  const [gramosEnEdicionGlobal, setGramosEnEdicionGlobal] = useState({})
  const [diaActivoId, setDiaActivoId] = useState(null)
  const [modalNuevoDia, setModalNuevoDia] = useState(false)
  const [editandoDiaNombre, setEditandoDiaNombre] = useState(null)
  const [nuevoDiaNombre, setNuevoDiaNombre] = useState('')

  const cambiarDia = (id) => {
    setDiaActivoId(id)
    setUltimoAgregadoId(null)
  }

  // ── Iniciar plan ──────────────────────────────
  const iniciarPlan = () => {
    const vct = parseFloat(vctInput)
    if (!vct || vct <= 0) return
    setPlan(crearPlanVacio(vct))
  }

  // ── Abrir buscador para un tiempo específico ──
  const handleAgregarAlimento = (tiempoId) => {
    setTiempoActivo(tiempoId)
    setBuscadorAbierto(true)
  }

  // ── Seleccionar alimento del buscador ─────────
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

  // ── Actualizar gramos ─────────────────────────
  const handleActualizarGramos = (tiempoId, alimentoId, gramos, alimentoOriginal) => {
    setPlan(prev => actualizarGramos(prev, tiempoId, alimentoId, gramos, alimentoOriginal))
  }

  // ── Eliminar alimento ─────────────────────────
  const handleEliminarAlimento = (tiempoId, alimentoId) => {
    setPlan(prev => eliminarAlimento(prev, tiempoId, alimentoId))
  }

  // ── Agregar tiempo de comida ──────────────────
  const handleAgregarTiempo = (nombre) => {
    if (!nombre.trim()) return
    setPlan(prev => agregarTiempo(prev, nombre.trim()))
    setNuevoTiempoNombre('')
    setAgregandoTiempo(false)
  }

  // ── Eliminar tiempo ───────────────────────────
  const handleEliminarTiempo = (tiempoId) => {
    if (plan.tiempos.length <= 1) return
    setPlan(prev => eliminarTiempo(prev, tiempoId))
  }

  // ── Renombrar tiempo ──────────────────────────
  const handleRenombrarTiempo = (tiempoId, nombre) => {
    setPlan(prev => renombrarTiempo(prev, tiempoId, nombre))
  }

  const totales = plan ? (() => {
    if (plan.modo === 'por_dia' && diaActivoId) {
      const dia = plan.dias.find(d => d.id === diaActivoId)
      if (dia) return { ...calcularTotalesDia(dia, gramosEnEdicionGlobal), pct_vct: plan.vct_objetivo > 0 ? Math.round((calcularTotalesDia(dia, gramosEnEdicionGlobal).energia_kcal / plan.vct_objetivo) * 100) : 0 }
    }
    return calcularTotales(plan, gramosEnEdicionGlobal)
  })() : null

  // ── Sin plan iniciado ─────────────────────────
  if (!plan) {
    return (
      <div>
        <h1 style={s.h1}>Constructor de Planes</h1>
        <div style={s.iniciarCard}>
          <div style={s.iniciarTitulo}>¿Cuál es el VCT objetivo del paciente?</div>
          <div style={s.iniciarDesc}>
            Ingresa las kilocalorías diarias objetivo. Puedes obtenerlo desde la calculadora nutrimental.
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

  // ── Plan activo ───────────────────────────────
  return (
    <div>
      <div style={s.topBar}>
        <h1 style={s.h1}>Constructor de Planes</h1>
        <div style={s.topBarAcciones}>
            {/* Toggle semanal único / por día */}
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
            <div style={s.resumenVal}>{plan.vct_objetivo} kcal</div>
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
              {Math.max(0, plan.vct_objetivo - totales.energia_kcal)} kcal
            </div>
          </div>
          <div style={s.resumenItem}>
            <div style={s.resumenLabel}>Avance</div>
            <div style={{ ...s.resumenVal, color: totales.pct_vct > 100 ? '#ef4444' : '#1c1917' }}>
              {totales.pct_vct}%
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div style={s.barraFondo}>
          <div style={{
            ...s.barraRelleno,
            width: `${Math.min(totales.pct_vct, 100)}%`,
            background: totales.pct_vct > 100 ? '#ef4444' : '#16a34a'
          }} />
        </div>

        {/* Macros totales */}
        <div style={s.macrosTotales}>
          {[
            { label: 'Proteína',      val: totales.proteina,      color: '#2563eb' },
            { label: 'Carbohidratos', val: totales.carbohidratos, color: '#16a34a' },
            { label: 'Grasa',         val: totales.grasa_total,   color: '#d97706' },
            { label: 'Fibra',         val: totales.fibra_dietetica_total, color: '#7c3aed' },
          ].map(({ label, val, color }) => (
            <div key={label} style={s.macroTotal}>
              <div style={{ ...s.macroTotalLabel, color }}>{label}</div>
              <div style={s.macroTotalVal}>{val}g</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tiempos de comida */}
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
            {/* Pestañas de días */}
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
                      }}>
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button style={s.addDiaBtn} onClick={() => setModalNuevoDia(true)}>
                + Día
              </button>
            </div>

            {/* Contenido del día activo */}
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

            {/* Modal nuevo día */}
            {modalNuevoDia && (
            <div style={ms.overlay} onClick={() => setModalNuevoDia(false)}>
                <div style={ms.modal} onClick={e => e.stopPropagation()}>
                <div style={ms.titulo}>Agregar nuevo día</div>
                <div style={ms.opcion}
                    onClick={() => {
                      setPlan(prev => {
                        const nuevoPlan = agregarDia(prev, null)
                        cambiarDia(nuevoPlan.dias[nuevoPlan.dias.length - 1].id)
                        return nuevoPlan
                      })
                      setModalNuevoDia(false)
                    }}>
                    <div style={ms.opcionTitulo}>📋 Empezar desde cero</div>
                    <div style={ms.opcionDesc}>Día vacío con los tiempos de comida por defecto</div>
                </div>
                {plan.dias.map(dia => (
                    <div key={dia.id} style={ms.opcion}
                    onClick={() => {
                      setPlan(prev => {
                        const nuevoPlan = agregarDia(prev, dia.id)
                        cambiarDia(nuevoPlan.dias[nuevoPlan.dias.length - 1].id)
                        return nuevoPlan
                      })
                      setModalNuevoDia(false)
                    }}>
                    <div style={ms.opcionTitulo}>📄 Copiar {dia.nombre}</div>
                    <div style={ms.opcionDesc}>Mismos tiempos y alimentos que {dia.nombre}</div>
                    </div>
                ))}
                <button style={ms.cancelar} onClick={() => setModalNuevoDia(false)}>Cancelar</button>
                </div>
            </div>
            )}
        </>
        )}

        {/* Buscador modal */}
        {buscadorAbierto && (
          <BuscadorAlimento
            onSeleccionar={handleSeleccionarAlimento}
            onCerrar={() => { setBuscadorAbierto(false); setTiempoActivo(null) }}
          />
        )}

    </div>
  )
}

const s = {
  h1:               { fontSize: '22px', fontWeight: '600', color: '#1c1917', margin: 0 },
  topBar:           { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  resetBtn:         { padding: '6px 14px', borderRadius: '6px', border: '1px solid #e7e5e4', background: '#fff', fontSize: '13px', color: '#57534e', cursor: 'pointer' },
  iniciarCard:      { background: '#fff', border: '1px solid #e7e5e4', borderRadius: '12px', padding: '2rem', maxWidth: '480px', margin: '2rem auto' },
  iniciarTitulo:    { fontSize: '17px', fontWeight: '600', color: '#1c1917', marginBottom: '8px' },
  iniciarDesc:      { fontSize: '13px', color: '#78716c', marginBottom: '1.5rem', lineHeight: 1.6 },
  iniciarRow:       { display: 'flex', gap: '8px', alignItems: 'center' },
  vctInput:         { width: '120px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d6d3d1', fontSize: '16px', outline: 'none' },
  vctLabel:         { fontSize: '14px', color: '#57534e' },
  iniciarBtn:       { padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#fff', fontSize: '14px', cursor: 'pointer', fontWeight: '500', marginLeft: 'auto' },
  resumenCard:      { background: '#fff', border: '1px solid #e7e5e4', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem' },
  resumenRow:       { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '12px' },
  resumenItem:      { textAlign: 'center' },
  resumenLabel:     { fontSize: '11px', color: '#78716c', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '4px' },
  resumenVal:       { fontSize: '20px', fontWeight: '600', color: '#1c1917' },
  barraFondo:       { height: '8px', borderRadius: '4px', background: '#e7e5e4', overflow: 'hidden', marginBottom: '12px' },
  barraRelleno:     { height: '100%', borderRadius: '4px', transition: 'width .4s, background .3s' },
  macrosTotales:    { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' },
  macroTotal:       { background: '#fafaf9', borderRadius: '8px', padding: '8px 12px', textAlign: 'center' },
  macroTotalLabel:  { fontSize: '11px', fontWeight: '500', marginBottom: '2px' },
  macroTotalVal:    { fontSize: '16px', fontWeight: '600', color: '#1c1917' },
  addTiempoBtn:     { width: '100%', padding: '12px', borderRadius: '10px', border: '2px dashed #d6d3d1', background: 'transparent', fontSize: '14px', color: '#78716c', cursor: 'pointer', marginTop: '4px' },
  nuevoTiempoCard:  { background: '#fff', border: '1px solid #e7e5e4', borderRadius: '10px', padding: '1rem', marginBottom: '0.75rem' },
  nuevoTiempoInput: { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d6d3d1', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '10px' },
  sugeridos:        { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' },
  nuevoTiempoAcciones: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
  cancelarBtn:      { padding: '6px 14px', borderRadius: '6px', border: '1px solid #e7e5e4', background: '#fff', fontSize: '13px', color: '#57534e', cursor: 'pointer' },
  confirmarBtn:     { padding: '6px 14px', borderRadius: '6px', border: 'none', background: '#16a34a', color: '#fff', fontSize: '13px', cursor: 'pointer', fontWeight: '500' },
  topBarAcciones:   { display: 'flex', gap: '8px', alignItems: 'center' },
  modoToggle:       { display: 'flex' },
  modoBtn:          { padding: '6px 14px', fontSize: '13px', cursor: 'pointer', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e7e5e4', background: '#fff', color: '#57534e' },
  modoBtnActive:    { background: '#f0fdf4', borderColor: '#86efac', color: '#16a34a', fontWeight: '500' },
  diasTabs:         { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' },
  diaTab:           { padding: '7px 16px', borderRadius: '20px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e7e5e4', background: '#fff', fontSize: '13px', color: '#57534e', cursor: 'pointer' },
  diaTabActive:     { background: '#f0fdf4', borderColor: '#86efac', color: '#16a34a', fontWeight: '500' },
  addDiaBtn:        { padding: '7px 14px', borderRadius: '20px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#d6d3d1', background: '#fafaf9', fontSize: '13px', color: '#78716c', cursor: 'pointer' },
  diaTabWrapper:    { display: 'flex', alignItems: 'center', gap: '2px' },
  diaTabInput:      { padding: '6px 10px', borderRadius: '20px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#86efac', fontSize: '13px', outline: 'none', width: '100px' },
  diaTabDelete:     { background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#a8a29e', padding: '2px 4px', borderRadius: '4px' },
}

const sug = {
  btn: { padding: '4px 12px', borderRadius: '20px', border: '1px solid #e7e5e4', background: '#fafaf9', fontSize: '12px', color: '#57534e', cursor: 'pointer' },
}

const ms = {
  overlay:     { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal:       { background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '400px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' },
  titulo:      { fontSize: '16px', fontWeight: '600', color: '#1c1917', marginBottom: '8px' },
  opcion:      { padding: '12px 14px', borderRadius: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e7e5e4', cursor: 'pointer', background: '#fafaf9' },
  opcionTitulo:{ fontSize: '14px', fontWeight: '500', color: '#1c1917', marginBottom: '2px' },
  opcionDesc:  { fontSize: '12px', color: '#78716c' },
  cancelar:    { padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', fontSize: '13px', color: '#78716c', cursor: 'pointer', marginTop: '4px' },
}