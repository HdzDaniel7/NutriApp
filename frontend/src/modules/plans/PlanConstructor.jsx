import { useState } from 'react'
import { crearPlanVacio, agregarAlimento, eliminarAlimento, actualizarGramos, agregarTiempo, eliminarTiempo, renombrarTiempo, calcularTotales } from './planUtils'
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
    const nuevoPlan = agregarAlimento(plan, tiempoActivo, alimento, gramos)
    setPlan(nuevoPlan)

    // Obtener el id del alimento recién agregado para abrir su editor
    const tiempo = nuevoPlan.tiempos.find(t => t.id === tiempoActivo)
    const ultimoAlimento = tiempo?.alimentos[tiempo.alimentos.length - 1]
    if (ultimoAlimento) setUltimoAgregadoId(ultimoAlimento.id)

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

  const totales = plan ? calcularTotales(plan) : null

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
        {/* PREPARADO FASE FUTURA: aquí irá el toggle semanal_unico / por_día */}
        <button style={s.resetBtn} onClick={() => setPlan(null)}>
          Nuevo plan
        </button>
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
        />
      ))}

      {/* Agregar tiempo de comida */}
      {agregandoTiempo ? (
        <div style={s.nuevoTiempoCard}>
          <input
            style={s.nuevoTiempoInput}
            type="text"
            placeholder="Nombre del tiempo de comida"
            value={nuevoTiempoNombre}
            onChange={e => setNuevoTiempoNombre(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAgregarTiempo(nuevoTiempoNombre)}
            autoFocus
          />
          <div style={s.sugeridos}>
            {TIEMPOS_SUGERIDOS.map(s => (
              <button key={s} style={sug.btn} onClick={() => handleAgregarTiempo(s)}>
                {s}
              </button>
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
}

const sug = {
  btn: { padding: '4px 12px', borderRadius: '20px', border: '1px solid #e7e5e4', background: '#fafaf9', fontSize: '12px', color: '#57534e', cursor: 'pointer' },
}