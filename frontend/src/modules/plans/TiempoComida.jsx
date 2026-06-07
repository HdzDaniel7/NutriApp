import { useState, useEffect } from 'react'
import { MEDIDAS_CASERAS, getMedidaPorGramos, getGramosPorMedida, calcularNutrientesPorPorcion } from '../../config/porciones.config'
import { calcularTotalesTiempo } from './planUtils'

export default function TiempoComida({ tiempo, ultimoAgregadoId, onAgregarAlimento, onEliminarAlimento, onActualizarGramos, onEliminar, onRenombrar, onGramosChangeGlobal, onGuardarGlobal }) {
  const [editandoNombre, setEditandoNombre] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState(tiempo.nombre)
  const [editandoPorcion, setEditandoPorcion] = useState(null)
  const [gramosEnEdicion, setGramosEnEdicion] = useState({})

  useEffect(() => {
    if (!ultimoAgregadoId) return
    const existe = tiempo.alimentos.find(a => a.id === ultimoAgregadoId)
    if (!existe) return
    const timer = setTimeout(() => setEditandoPorcion(ultimoAgregadoId), 0)
    return () => clearTimeout(timer)
  }, [ultimoAgregadoId])

  const totales = calcularTotalesTiempo(tiempo, gramosEnEdicion)

  const handleRenombrar = () => {
    if (nuevoNombre.trim()) onRenombrar(tiempo.id, nuevoNombre.trim())
    setEditandoNombre(false)
  }

  return (
    <div style={s.card}>

      {/* Header del tiempo de comida */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.emoji}>{tiempo.emoji}</span>
          {editandoNombre ? (
            <input
              style={s.nombreInput}
              value={nuevoNombre}
              onChange={e => setNuevoNombre(e.target.value)}
              onBlur={handleRenombrar}
              onKeyDown={e => e.key === 'Enter' && handleRenombrar()}
              autoFocus
            />
          ) : (
            <span style={s.nombre} onClick={() => setEditandoNombre(true)} title="Clic para editar">
              {tiempo.nombre}
            </span>
          )}
          <span style={s.kcalTiempo}>{totales.energia_kcal} kcal</span>
        </div>
        <div style={s.headerRight}>
          <button style={s.addBtn} onClick={() => onAgregarAlimento(tiempo.id)}>
            + Agregar
          </button>
          <button style={s.deleteBtn} onClick={() => onEliminar(tiempo.id)} title="Eliminar tiempo">
            🗑
          </button>
        </div>
      </div>

      {/* Macros del tiempo */}
      {tiempo.alimentos.length > 0 && (
        <div style={s.macroRow}>
          {[
            { label: 'Proteína',  val: totales.proteina,      color: '#2563eb' },
            { label: 'Carbs',     val: totales.carbohidratos, color: '#16a34a' },
            { label: 'Grasa',     val: totales.grasa_total,   color: '#d97706' },
          ].map(({ label, val, color }) => (
            <span key={label} style={{ ...s.macroBadge, color, background: color + '14' }}>
              {label}: {val}g
            </span>
          ))}
        </div>
      )}

      {/* Lista de alimentos */}
      {tiempo.alimentos.length === 0 ? (
        <div style={s.empty}>Sin alimentos — presiona "+ Agregar"</div>
      ) : (
        <div style={s.alimentosList}>
          {tiempo.alimentos.map(a => (
            <AlimentoFila
              key={a.id}
              entrada={a}
              editando={editandoPorcion === a.id}
              onEditar={() => setEditandoPorcion(editandoPorcion === a.id ? null : a.id)}
              onActualizar={(gramos, alimentoOriginal) => {
                onActualizarGramos(tiempo.id, a.id, gramos, alimentoOriginal)
                setEditandoPorcion(null)
                setGramosEnEdicion(prev => { const n = {...prev}; delete n[a.id]; return n })
              }}
              onEliminar={() => onEliminarAlimento(tiempo.id, a.id)}
              onGramosChange={(alimentoId, g) => {
                setGramosEnEdicion(prev => ({...prev, [alimentoId]: g}))
                if (onGramosChangeGlobal) onGramosChangeGlobal(alimentoId, g)
              }}
              onGuardar={(alimentoId) => {
                if (onGuardarGlobal) onGuardarGlobal(alimentoId)
              }}
            />
          ))}
        </div>
      )}

    </div>
  )
}

// ─────────────────────────────────────────────
// Componente interno: fila de un alimento
// ─────────────────────────────────────────────

function AlimentoFila({ entrada, editando, onEditar, onActualizar, onEliminar, onGramosChange }) {
  const [gramos, setGramos] = useState(entrada.porcion_gramos || 100)
  const [modoPorcion, setModoPorcion] = useState(entrada.modo_porcion || 'gramos')
  const [medidaSeleccionadaId, setMedidaSeleccionadaId] = useState(
    getMedidaPorGramos(entrada.porcion_gramos)?.id || null
  )

  const medidaActual = MEDIDAS_CASERAS.find(m => m.id === medidaSeleccionadaId)

  const handleGramosChange = (val) => {
    const g = parseFloat(val)
    if (isNaN(g) || g <= 0) return
    setGramos(g)
    const medida = getMedidaPorGramos(g)
    setMedidaSeleccionadaId(medida?.id || null)
    if (onGramosChange) onGramosChange(entrada.id, g)
  }

  const handleMedidaChange = (medidaId) => {
    const g = getGramosPorMedida(medidaId)
    if (g) {
        setGramos(g)
        setMedidaSeleccionadaId(medidaId)
        if (onGramosChange) onGramosChange(entrada.id, g)
    }
  }

  const handleGuardar = () => {
    const g = parseFloat(gramos)
    if (!g || isNaN(g) || g <= 0) return
    onActualizar(g, entrada.alimento_original)
  }

  return (
    <div style={s.alimentoRow}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={s.alimentoInfo}>
          <div style={s.alimentoNombre}>{entrada.descripcion}</div>
          <div style={s.alimentoPorcion}>
          {medidaActual && (
            <span style={s.porcionEmoji}>{medidaActual.emoji}</span>
          )}
          <span style={s.porcionTexto}>
            {medidaActual
                ? `${medidaActual.nombre} · ${editando ? gramos : entrada.porcion_gramos}g`
                : `${editando ? gramos : entrada.porcion_gramos}g`}
            </span>
            <span style={s.kcalPorcion}>
            {editando
                ? calcularNutrientesPorPorcion(entrada.alimento_original, gramos).energia_kcal
                : entrada.nutrientes.energia_kcal} kcal
          </span>
        </div>

        <div style={s.microMacros}>
            {[
                { label: 'Proteina', val: editando ? calcularNutrientesPorPorcion(entrada.alimento_original, gramos).proteina      : entrada.nutrientes.proteina,      color: '#2563eb' },
                { label: 'Carbohidratos', val: editando ? calcularNutrientesPorPorcion(entrada.alimento_original, gramos).carbohidratos : entrada.nutrientes.carbohidratos, color: '#16a34a' },
                { label: 'Grasa', val: editando ? calcularNutrientesPorPorcion(entrada.alimento_original, gramos).grasa_total   : entrada.nutrientes.grasa_total,   color: '#d97706' },
            ].map(({ label, val, color }) => (
                <span key={label} style={{ ...s.microBadge, color }}>
                {label}: {val ?? 0}g
                </span>
            ))}
        </div>
      </div>
      <div style={s.alimentoAcciones}>
        <button style={s.editBtn} onClick={onEditar}>✏️</button>
        <button style={s.elimBtn} onClick={onEliminar}>✕</button>
      </div>
    </div>

      {editando && (
        <div style={s.editorPorcion}>
          <div style={s.modoToggle}>
            {['gramos', 'medida_casera'].map(m => (
              <button key={m} onClick={() => setModoPorcion(m)}
                style={modoPorcion === m
                  ? { ...s.modoBtn, background: '#f0fdf4', borderColor: 'var(--color-primario-border)', color: 'var(--color-primario)', fontWeight: '500' }
                  : s.modoBtn}>
                {m === 'gramos' ? 'Gramos' : 'Medida casera'}
              </button>
            ))}
          </div>

          {modoPorcion === 'gramos' ? (
            <div style={s.gramosEditor}>
              <input style={s.gramosInput} type="number" min="1" max="2000"
                value={gramos}
                onChange={e => handleGramosChange(e.target.value)} />
              <span style={s.gramosLabel}>g</span>
              {medidaActual && (
                <span style={{ fontSize: '12px', color: '#16a34a', background: '#f0fdf4', padding: '3px 8px', borderRadius: '20px' }}>
                  {medidaActual.emoji} {medidaActual.nombre}
                </span>
              )}
            </div>
          ) : (
            <div style={s.medidaEditor}>
              <div style={s.medidaGrid}>
                {MEDIDAS_CASERAS.map(m => (
                  <button key={m.id} onClick={() => handleMedidaChange(m.id)}
                    title={m.uso_tipico}
                    style={medidaSeleccionadaId === m.id
                      ? { ...s.medidaBtn, background: '#f0fdf4', borderColor: 'var(--color-primario-border)' }
                      : s.medidaBtn}>
                    <span style={s.medidaEmoji}>{m.emoji}</span>
                    <span style={s.medidaNombre}>{m.nombre}</span>
                    <span style={s.medidaGramos}>~{m.gramos_referencia}g</span>
                  </button>
                ))}
              </div>
              <div style={s.gramosEditor}>
                <span style={s.gramosLabel}>Gramos resultantes:</span>
                <input style={s.gramosInput} type="number" min="1"
                  value={gramos}
                  onChange={e => handleGramosChange(e.target.value)} />
                <span style={s.gramosLabel}>g</span>
              </div>
            </div>
          )}

          <button style={s.guardarBtn} onClick={handleGuardar}>
            Guardar porción
          </button>
        </div>
      )}
    </div>
  )
}

const s = {
  card: { background: '#f9f9f9', border: '0.5px solid #e0e0e0', borderRadius: '12px', padding: '12px 14px', marginBottom: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  header:         { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  headerLeft:     { display: 'flex', alignItems: 'center', gap: '8px' },
  headerRight:    { display: 'flex', gap: '6px', alignItems: 'center' },
  emoji:          { fontSize: '16px' },
  nombre:         { fontSize: '13px', fontWeight: '500', color: '#18181b', cursor: 'pointer' },
  nombreInput:    { fontSize: '13px', fontWeight: '500', color: '#18181b', border: 'none', borderBottom: '1px solid var(--color-primario-light)', outline: 'none', background: 'transparent', width: '180px' },
  kcalTiempo:     { fontSize: '11px', color: '#71717a', background: '#f4f4f5', padding: '2px 8px', borderRadius: '20px' },
  addBtn:         { padding: '4px 12px', borderRadius: '20px', border: 'none', background: 'linear-gradient(135deg, var(--color-primario-light), var(--color-primario))', color: '#fff', fontSize: '11px', cursor: 'pointer', fontWeight: '500' },
  deleteBtn:      { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: '4px', borderRadius: '4px', color: '#d4d4d8' },
  macroRow:       { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' },
  macroBadge:     { fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '500' },
  empty:          { fontSize: '12px', color: '#a1a1aa', textAlign: 'center', padding: '1rem 0' },
  alimentosList:  { display: 'flex', flexDirection: 'column', gap: '4px' },
  alimentoRow:    { background: '#ffffff', borderRadius: '8px', padding: '8px 10px', marginBottom: '4px', border: '0.5px solid #e4e4e7', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  alimentoInfo:   { display: 'flex', alignItems: 'flex-start', flexDirection: 'column', gap: '5px', flex: 1 },
  alimentoNombre: { fontSize: '12px', fontWeight: '500', color: '#18181b', flex: 1 },
  alimentoPorcion:{ display: 'flex', alignItems: 'center', gap: '6px' },
  porcionEmoji:   { fontSize: '13px' },
  porcionTexto:   { fontSize: '11px', color: '#71717a' },
  kcalPorcion:    { fontSize: '11px', color: '#18181b', fontWeight: '500' },
  microMacros:    { display: 'flex', gap: '10px' },
  microBadge:     { fontSize: '10px', fontWeight: '500' },
  alimentoAcciones: { display: 'flex', gap: '4px', justifyContent: 'flex-end', marginTop: '4px' },
  editBtn:        { background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', padding: '2px 6px', borderRadius: '4px', color: '#a1a1aa' },
  elimBtn:        { background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', padding: '2px 6px', borderRadius: '4px', color: '#ef4444' },
  editorPorcion:  { marginTop: '10px', padding: '10px', background: '#fff', borderRadius: '8px', border: '0.5px solid #e4e4e7', display: 'flex', flexDirection: 'column', gap: '10px' },
  modoToggle:     { display: 'flex', gap: '0' },
  modoBtn:        { flex: 1, padding: '6px', fontSize: '12px', cursor: 'pointer', borderWidth: '1px', borderStyle: 'solid', borderColor: '#d4d4d8', background: '#fff', color: '#3f3f46' },
  gramosEditor:   { display: 'flex', alignItems: 'center', gap: '8px' },
  gramosInput:    { width: '80px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '14px', outline: 'none' },
  gramosLabel:    { fontSize: '13px', color: '#71717a' },
  medidaEditor:   { display: 'flex', flexDirection: 'column', gap: '8px' },
  medidaGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '6px' },
  medidaBtn:      { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '8px 4px', borderRadius: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e4e4e7', background: '#fff', cursor: 'pointer' },
  medidaEmoji:    { fontSize: '18px' },
  medidaNombre:   { fontSize: '10px', color: '#71717a', textAlign: 'center', lineHeight: 1.2 },
  medidaGramos:   { fontSize: '10px', color: '#a1a1aa' },
  guardarBtn:     { padding: '7px 16px', borderRadius: '20px', border: 'none', background: 'linear-gradient(135deg, var(--color-primario-light), var(--color-primario))', color: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: '500', alignSelf: 'flex-end' },
}