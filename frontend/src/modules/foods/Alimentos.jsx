import { useState, useEffect } from 'react'
import { foodsAPI } from '../../services/api'
import { PageHeader } from '../../components/ui'

export default function Alimentos() {
  const [busqueda, setBusqueda] = useState('')
  const [tipoSeleccionado, setTipoSeleccionado] = useState('')
  const [tipos, setTipos] = useState([])
  const [alimentos, setAlimentos] = useState([])
  const [seleccionado, setSeleccionado] = useState(null)
  const [cargando, setCargando] = useState(false)

  // Cargar categorías al iniciar
  useEffect(() => {
    foodsAPI.tipos()
      .then(r => setTipos(r.data))
      .catch(err => console.error(err))
  }, [])

  // Buscar alimentos cuando cambia búsqueda o tipo
  useEffect(() => {
    if (!busqueda && !tipoSeleccionado) {
      const timer = setTimeout(() => setAlimentos([]), 0)
      return () => clearTimeout(timer)
    }
    setCargando(true)
    const params = {}
    if (busqueda) params.q = busqueda
    if (tipoSeleccionado) params.tipo = tipoSeleccionado

    foodsAPI.search(params)
      .then(r => setAlimentos(r.data.data))
      .catch(err => console.error(err))
      .finally(() => setCargando(false))
  }, [busqueda, tipoSeleccionado])

  return (
    <div className="nd-page" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <PageHeader titulo="Base de Alimentos" subtitulo="Consulta la información nutricional por cada 100 g" />

      {/* Filtros */}
      <div style={s.card}>
        <div style={s.filtros}>
          <div style={{ flex: 1 }}>
            <label style={s.label}>Buscar alimento</label>
            <input
              style={s.input}
              type="text"
              placeholder="ej. pollo, manzana, leche..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={s.label}>Filtrar por categoría</label>
            <select style={s.input} value={tipoSeleccionado}
              onChange={e => setTipoSeleccionado(e.target.value)}>
              <option value="">Todas las categorías</option>
              {tipos.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          {(busqueda || tipoSeleccionado) && (
            <button style={s.clearBtn} onClick={() => {
              setBusqueda('')
              setTipoSeleccionado('')
              setSeleccionado(null)
            }}>
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div style={s.grid2}>

        {/* Lista de alimentos */}
        <div style={s.card}>
          {cargando && <div style={s.msg}>Buscando...</div>}

          {!cargando && !busqueda && !tipoSeleccionado && (
            <div style={s.msg}>Escribe un alimento o selecciona una categoría para comenzar</div>
          )}

          {!cargando && alimentos.length === 0 && (busqueda || tipoSeleccionado) && (
            <div style={s.msg}>No se encontraron alimentos</div>
          )}

          {alimentos.map(a => (
            <div key={a.id}
              onClick={() => setSeleccionado(a)}
              style={seleccionado?.id === a.id ? {...s.alimentoRow, ...s.alimentoActive} : s.alimentoRow}>
              <div style={s.alimentoNombre}>{a.descripcion}</div>
              <div style={s.alimentoMeta}>
                <span style={s.badge}>{a.tipo}</span>
                <span style={s.kcal}>{a.energia_kcal ? `${a.energia_kcal} kcal` : '—'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Detalle del alimento */}
        {seleccionado ? (
          <div style={s.card}>
            <div style={s.detalleNombre}>{seleccionado.descripcion}</div>
            {seleccionado.nombre_cientifico && (
              <div style={s.detalleCientifico}>{seleccionado.nombre_cientifico}</div>
            )}
            <div style={s.detalleBadge}>{seleccionado.tipo}</div>

            <div style={s.seccion}>Macronutrientes <span style={s.seccionSub}>por 100 g</span></div>
            <div style={s.nutriGrid}>
              {[
                { label: 'Energía',       valor: seleccionado.energia_kcal,  unit: 'kcal', color: '#1c1917' },
                { label: 'Proteína',      valor: seleccionado.proteina,       unit: 'g',    color: '#2563eb' },
                { label: 'Carbohidratos', valor: seleccionado.carbohidratos,  unit: 'g',    color: '#16a34a' },
                { label: 'Grasa total',   valor: seleccionado.grasa_total,    unit: 'g',    color: '#d97706' },
                { label: 'Fibra',         valor: seleccionado.fibra_dietetica_total, unit: 'g', color: '#7c3aed' },
                { label: 'Azúcares',      valor: seleccionado.azucares,       unit: 'g',    color: '#db2777' },
              ].map(({ label, valor, unit, color }) => (
                <div key={label} style={s.nutriItem}>
                  <div style={{ ...s.nutriLabel, color }}>{label}</div>
                  <div style={s.nutriVal}>{valor != null ? `${valor} ${unit}` : '—'}</div>
                </div>
              ))}
            </div>

            <div style={s.seccion}>Grasas</div>
            <div style={s.nutriGrid}>
              {[
                { label: 'Saturadas',     valor: seleccionado.acidos_grasos_saturados },
                { label: 'Monoinsaturadas', valor: seleccionado.acidos_grasos_monoinsaturados },
                { label: 'Poliinsaturadas', valor: seleccionado.acidos_grasos_poliinsaturados },
                { label: 'Colesterol',    valor: seleccionado.colesterol, unit: 'mg' },
              ].map(({ label, valor, unit = 'g' }) => (
                <div key={label} style={s.nutriItem}>
                  <div style={s.nutriLabel}>{label}</div>
                  <div style={s.nutriVal}>{valor != null ? `${valor} ${unit}` : '—'}</div>
                </div>
              ))}
            </div>

            <div style={s.seccion}>Minerales</div>
            <div style={s.nutriGrid}>
              {[
                { label: 'Calcio',    valor: seleccionado.calcio },
                { label: 'Fósforo',   valor: seleccionado.fosforo },
                { label: 'Hierro',    valor: seleccionado.hierro },
                { label: 'Sodio',     valor: seleccionado.sodio },
                { label: 'Potasio',   valor: seleccionado.potasio },
                { label: 'Magnesio',  valor: seleccionado.magnesio },
                { label: 'Zinc',      valor: seleccionado.zinc },
                { label: 'Cobre',     valor: seleccionado.cobre },
              ].map(({ label, valor }) => (
                <div key={label} style={s.nutriItem}>
                  <div style={s.nutriLabel}>{label}</div>
                  <div style={s.nutriVal}>{valor != null ? `${valor} mg` : '—'}</div>
                </div>
              ))}
            </div>

            <div style={s.seccion}>Vitaminas</div>
            <div style={s.nutriGrid}>
              {[
                { label: 'Vitamina A',  valor: seleccionado.vitamina_a_rae, unit: 'µg RAE' },
                { label: 'Vitamina C',  valor: seleccionado.vitamina_c,     unit: 'mg' },
                { label: 'Vitamina D',  valor: seleccionado.vitamina_d,     unit: 'µg' },
                { label: 'Vitamina B1', valor: seleccionado.vitamina_b1_tiamina,    unit: 'mg' },
                { label: 'Vitamina B2', valor: seleccionado.vitamina_b2_riboflavina, unit: 'mg' },
                { label: 'Niacina B3',  valor: seleccionado.vitamina_b3_niacina,    unit: 'mg' },
                { label: 'Vitamina B6', valor: seleccionado.vitamina_b6,    unit: 'mg' },
                { label: 'Vitamina B12',valor: seleccionado.vitamina_b12,   unit: 'µg' },
                { label: 'Ácido fólico',valor: seleccionado.acido_folico,   unit: 'µg' },
              ].map(({ label, valor, unit }) => (
                <div key={label} style={s.nutriItem}>
                  <div style={s.nutriLabel}>{label}</div>
                  <div style={s.nutriVal}>{valor != null ? `${valor} ${unit}` : '—'}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ ...s.card, ...s.placeholder }}>
            Selecciona un alimento para ver su información nutricional completa
          </div>
        )}

      </div>
    </div>
  )
}

const s = {
  card:            { backgroundColor: '#fff', border: '1px solid var(--ui-border)', borderRadius: '14px', padding: '20px' },
  filtros:         { display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' },
  label:           { display: 'block', fontSize: '13px', color: 'var(--ui-txt-secondary)', marginBottom: '4px', fontWeight: '500' },
  input:           { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--ui-border)', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: 'var(--ui-txt-primary)', background: '#fff' },
  clearBtn:        { padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--ui-border)', background: '#fff', fontSize: '13px', color: 'var(--ui-txt-secondary)', cursor: 'pointer', alignSelf: 'flex-end' },
  grid2:           { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' },
  msg:             { fontSize: '13px', color: 'var(--ui-txt-muted)', textAlign: 'center', padding: '2rem 0' },
  alimentoRow:     { padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px', border: '1px solid transparent' },
  alimentoActive:  { background: 'var(--ui-green-bg)', border: '1px solid var(--ui-green-pale)' },
  alimentoNombre:  { fontSize: '14px', color: 'var(--ui-txt-primary)', marginBottom: '4px' },
  alimentoMeta:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  badge:           { fontSize: '11px', background: 'var(--ui-bg-page)', color: 'var(--ui-txt-muted)', padding: '2px 8px', borderRadius: '20px', border: '1px solid var(--ui-border-subtle)' },
  kcal:            { fontSize: '12px', color: 'var(--ui-txt-secondary)', fontWeight: '600' },
  detalleNombre:   { fontSize: '17px', fontWeight: '700', color: 'var(--ui-txt-primary)', marginBottom: '4px', letterSpacing: '-0.2px' },
  detalleCientifico: { fontSize: '12px', color: 'var(--ui-txt-muted)', fontStyle: 'italic', marginBottom: '8px' },
  detalleBadge:    { display: 'inline-block', fontSize: '11px', background: 'var(--ui-green-bg)', color: 'var(--ui-green)', padding: '2px 10px', borderRadius: '20px', marginBottom: '1rem', border: '1px solid var(--ui-green-pale)', fontWeight: '600' },
  seccion:         { fontSize: '12px', fontWeight: '600', color: 'var(--ui-txt-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '1rem 0 0.5rem', borderTop: '1px solid var(--ui-border-subtle)', paddingTop: '0.75rem' },
  seccionSub:      { fontWeight: '400', textTransform: 'none', letterSpacing: 0, marginLeft: '4px' },
  nutriGrid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px' },
  nutriItem:       { background: 'var(--ui-bg-page)', borderRadius: '8px', padding: '8px 10px', border: '1px solid var(--ui-border-subtle)' },
  nutriLabel:      { fontSize: '11px', color: 'var(--ui-txt-muted)', marginBottom: '2px' },
  nutriVal:        { fontSize: '13px', fontWeight: '600', color: 'var(--ui-txt-primary)' },
  placeholder:     { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', color: 'var(--ui-txt-muted)', fontSize: '13px', textAlign: 'center' },
}