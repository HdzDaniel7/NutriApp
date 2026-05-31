import { useState } from 'react'
import { MEDIDAS_CASERAS, getMedidaPorGramos, getGramosPorMedida, calcularNutrientesPorPorcion } from '../../config/porciones.config'
import { calcularTotalesTiempo } from './planUtils'

export default function TiempoComida({ tiempo, onAgregarAlimento, onEliminarAlimento, onActualizarGramos, onEliminar, onRenombrar }) {
  const [editandoNombre, setEditandoNombre] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState(tiempo.nombre)
  const [editandoPorcion, setEditandoPorcion] = useState(null) // id del alimento que se está editando

  const totales = calcularTotalesTiempo(tiempo)

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
              }}
              onEliminar={() => onEliminarAlimento(tiempo.id, a.id)}
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

function AlimentoFila({ entrada, editando, onEditar, onActualizar, onEliminar }) {
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
  }

  const handleMedidaChange = (medidaId) => {
    const g = getGramosPorMedida(medidaId)
    if (g) {
      setGramos(g)
      setMedidaSeleccionadaId(medidaId)
    }
  }

  const handleGuardar = () => {
    const g = parseFloat(gramos)
    if (!g || isNaN(g) || g <= 0) return
    onActualizar(g, entrada.alimento_original)
  }

  return (
    <div style={s.alimentoRow}>
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
                { label: 'P', val: editando ? calcularNutrientesPorPorcion(entrada.alimento_original, gramos).proteina      : entrada.nutrientes.proteina,      color: '#2563eb' },
                { label: 'C', val: editando ? calcularNutrientesPorPorcion(entrada.alimento_original, gramos).carbohidratos : entrada.nutrientes.carbohidratos, color: '#16a34a' },
                { label: 'G', val: editando ? calcularNutrientesPorPorcion(entrada.alimento_original, gramos).grasa_total   : entrada.nutrientes.grasa_total,   color: '#d97706' },
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

      {editando && (
        <div style={s.editorPorcion}>
          <div style={s.modoToggle}>
            {['gramos', 'medida_casera'].map(m => (
              <button key={m} onClick={() => setModoPorcion(m)}
                style={modoPorcion === m
                  ? { ...s.modoBtn, background: '#f0fdf4', borderColor: '#86efac', color: '#16a34a', fontWeight: '500' }
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
                      ? { ...s.medidaBtn, background: '#f0fdf4', borderColor: '#86efac' }
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
  card:           { background: '#fff', border: '1px solid #e7e5e4', borderRadius: '10px', padding: '1rem', marginBottom: '0.75rem' },
  header:         { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  headerLeft:     { display: 'flex', alignItems: 'center', gap: '8px' },
  headerRight:    { display: 'flex', gap: '6px', alignItems: 'center' },
  emoji:          { fontSize: '18px' },
  nombre:         { fontSize: '15px', fontWeight: '600', color: '#1c1917', cursor: 'pointer', borderBottom: '1px dashed transparent' },
  nombreInput:    { fontSize: '15px', fontWeight: '600', color: '#1c1917', border: 'none', borderBottom: '1px solid #86efac', outline: 'none', background: 'transparent', width: '180px' },
  kcalTiempo:     { fontSize: '12px', color: '#57534e', background: '#f5f5f4', padding: '2px 8px', borderRadius: '20px' },
  addBtn:         { padding: '5px 12px', borderRadius: '6px', border: '1px solid #86efac', background: '#f0fdf4', color: '#16a34a', fontSize: '13px', cursor: 'pointer', fontWeight: '500' },
  deleteBtn:      { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '4px', borderRadius: '4px', color: '#a8a29e' },
  macroRow:       { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' },
  macroBadge:     { fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '500' },
  empty:          { fontSize: '12px', color: '#a8a29e', textAlign: 'center', padding: '1rem 0' },
  alimentosList:  { display: 'flex', flexDirection: 'column', gap: '4px' },
  alimentoRow:    { background: '#fafaf9', borderRadius: '8px', padding: '8px 10px' },
  alimentoInfo:   { display: 'flex', flexDirection: 'column', gap: '3px' },
  alimentoNombre: { fontSize: '13px', fontWeight: '500', color: '#1c1917' },
  alimentoPorcion:{ display: 'flex', alignItems: 'center', gap: '6px' },
  porcionEmoji:   { fontSize: '14px' },
  porcionTexto:   { fontSize: '12px', color: '#57534e' },
  kcalPorcion:    { fontSize: '12px', color: '#57534e', fontWeight: '500', marginLeft: 'auto' },
  microMacros:    { display: 'flex', gap: '8px' },
  microBadge:     { fontSize: '11px', fontWeight: '500' },
  alimentoAcciones: { display: 'flex', gap: '4px', justifyContent: 'flex-end', marginTop: '4px' },
  editBtn:        { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: '2px 6px', borderRadius: '4px' },
  elimBtn:        { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: '2px 6px', borderRadius: '4px', color: '#ef4444' },
  editorPorcion:  { marginTop: '10px', padding: '10px', background: '#f5f5f4', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' },
  modoToggle:     { display: 'flex', gap: '0' },
  modoBtn:        { flex: 1, padding: '6px', fontSize: '12px', cursor: 'pointer', border: '1px solid #d6d3d1', background: '#fff', color: '#57534e' },
  modoBtnActive:  { background: '#f0fdf4', borderColor: '#86efac', color: '#16a34a', fontWeight: '500' },
  gramosEditor:   { display: 'flex', alignItems: 'center', gap: '8px' },
  gramosInput:    { width: '80px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #d6d3d1', fontSize: '14px', outline: 'none' },
  gramosLabel:    { fontSize: '13px', color: '#57534e' },
  medidaSugerida: { fontSize: '12px', color: '#16a34a', background: '#f0fdf4', padding: '3px 8px', borderRadius: '20px' },
  medidaEditor:   { display: 'flex', flexDirection: 'column', gap: '8px' },
  medidaGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '6px' },
  medidaBtn:      { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '8px 4px', borderRadius: '8px', border: '1px solid #e7e5e4', background: '#fff', cursor: 'pointer' },
  medidaBtnActive:{ background: '#f0fdf4', borderColor: '#86efac' },
  medidaEmoji:    { fontSize: '18px' },
  medidaNombre:   { fontSize: '10px', color: '#57534e', textAlign: 'center', lineHeight: 1.2 },
  medidaGramos:   { fontSize: '10px', color: '#a8a29e' },
  guardarBtn:     { padding: '7px 16px', borderRadius: '6px', border: 'none', background: '#16a34a', color: '#fff', fontSize: '13px', cursor: 'pointer', fontWeight: '500', alignSelf: 'flex-end' },
}