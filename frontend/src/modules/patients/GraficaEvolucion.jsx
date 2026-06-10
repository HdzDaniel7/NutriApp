import { useState, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'

const METRICAS = [
  { key: 'Peso',      campo: 'peso',      color: '#2563eb', unit: 'kg',  defaultActiva: true  },
  { key: 'IMC',       campo: 'imc',       color: '#16a34a', unit: '',    defaultActiva: false },
  { key: '% Grasa',   campo: 'pct_grasa', color: '#d97706', unit: '%',   defaultActiva: false },
  { key: 'Cintura',   campo: 'cintura',   color: '#7c3aed', unit: 'cm',  defaultActiva: false },
  { key: 'Cadera',    campo: 'cadera',    color: '#db2777', unit: 'cm',  defaultActiva: false },
]

export default function GraficaEvolucion({ consultas }) {
  const [metricasActivas, setMetricasActivas] = useState(
    METRICAS.reduce((acc, m) => ({ ...acc, [m.key]: m.defaultActiva }), {})
  )
  const [rangoConsultas, setRangoConsultas] = useState('todas')

  if (!consultas || consultas.length < 2) {
    return (
      <div style={s.empty}>
        Se necesitan al menos 2 consultas para mostrar la evolución
      </div>
    )
  }

  let ordenadas = [...consultas].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  if (rangoConsultas !== 'todas') {
    ordenadas = ordenadas.slice(-parseInt(rangoConsultas))
  }

  const datos = ordenadas.map(c => ({
    fecha:     new Date(c.fecha).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }),
    'Peso':    c.peso      ? +parseFloat(c.peso).toFixed(1)      : null,
    'IMC':     c.imc       ? +parseFloat(c.imc).toFixed(1)       : null,
    '% Grasa': c.pct_grasa ? +parseFloat(c.pct_grasa).toFixed(1) : null,
    'Cintura': c.cintura   ? +parseFloat(c.cintura).toFixed(1)   : null,
    'Cadera':  c.cadera    ? +parseFloat(c.cadera).toFixed(1)    : null,
  }))

  const metricasConDatos = METRICAS.filter(m =>
    datos.some(d => d[m.key] !== null)
  )

  const metricasVisibles = metricasConDatos.filter(m => metricasActivas[m.key])

  // Calcular cambio inicial → final para cada métrica
  const resumen = useMemo(() => metricasConDatos.map(m => {
    const vals = datos.map(d => d[m.key]).filter(v => v !== null)
    if (vals.length < 2) return null
    const diff = +(vals[vals.length - 1] - vals[0]).toFixed(1)
    return { ...m, inicio: vals[0], fin: vals[vals.length - 1], diff }
  }).filter(Boolean), [datos, metricasConDatos])

  const option = {
    animation: true,
    animationDuration: 600,
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#e7e5e4',
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { fontSize: 12, color: '#1c1917' },
      formatter(params) {
        const fecha = params[0]?.axisValue
        let html = `<div style="font-weight:600;margin-bottom:6px;color:#57534e">${fecha}</div>`
        params.forEach(p => {
          if (p.value == null) return
          const m = METRICAS.find(x => x.key === p.seriesName)
          html += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
            <span style="width:8px;height:8px;border-radius:50%;background:${p.color};flex-shrink:0;display:inline-block"></span>
            <span style="color:#78716c">${p.seriesName}:</span>
            <span style="font-weight:600">${p.value}${m?.unit ? ' ' + m.unit : ''}</span>
          </div>`
        })
        return html
      }
    },
    grid: { left: 44, right: 16, top: 16, bottom: datos.length > 6 ? 56 : 28 },
    xAxis: {
      type: 'category',
      data: datos.map(d => d.fecha),
      axisLine: { lineStyle: { color: '#e7e5e4' } },
      axisTick: { show: false },
      axisLabel: { color: '#78716c', fontSize: 11 },
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#78716c', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f5f5f4', type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    ...(datos.length > 6 ? {
      dataZoom: [
        { type: 'inside', start: 0, end: 100 },
        { type: 'slider', height: 18, bottom: 4, borderColor: '#e7e5e4', fillerColor: 'rgba(37,99,235,0.08)', handleStyle: { color: '#94a3b8', borderColor: '#cbd5e1' }, textStyle: { fontSize: 10, color: '#94a3b8' }, showDetail: false },
      ]
    } : {}),
    series: metricasVisibles.map(m => ({
      name: m.key,
      type: 'line',
      smooth: true,
      data: datos.map(d => d[m.key]),
      connectNulls: true,
      lineStyle: { color: m.color, width: 2.5 },
      itemStyle: { color: m.color, borderWidth: 2, borderColor: '#fff' },
      symbol: 'circle',
      symbolSize: 7,
      emphasis: { itemStyle: { symbolSize: 10 } },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: m.color + '30' },
            { offset: 1, color: m.color + '00' },
          ],
        },
      },
    })),
  }

  return (
    <div style={s.wrap}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.titulo}>Evolución del paciente</div>
        <select style={s.rangoSelect} value={rangoConsultas}
          onChange={e => setRangoConsultas(e.target.value)}>
          <option value="todas">Todas las consultas</option>
          <option value="3">Últimas 3</option>
          <option value="5">Últimas 5</option>
          <option value="10">Últimas 10</option>
        </select>
      </div>

      {/* Chips de resumen */}
      {resumen.length > 0 && (
        <div style={s.resumen}>
          {resumen.map(m => (
            <div key={m.key} style={s.resumenChip}>
              <span style={{ ...s.resumenDot, background: m.color }} />
              <span style={s.resumenLabel}>{m.key}</span>
              <span style={s.resumenVals}>{m.inicio} → {m.fin}{m.unit ? ' ' + m.unit : ''}</span>
              <span style={{
                ...s.resumenDiff,
                color:      m.diff < 0 ? '#16a34a' : m.diff > 0 ? '#dc2626' : '#78716c',
                background: m.diff < 0 ? '#dcfce7' : m.diff > 0 ? '#fee2e2' : '#f5f5f4',
              }}>
                {m.diff > 0 ? '+' : ''}{m.diff}{m.unit ? m.unit : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Filtros de métricas */}
      <div style={s.filtros}>
        {metricasConDatos.map(m => (
          <button key={m.key}
            onClick={() => setMetricasActivas(prev => ({ ...prev, [m.key]: !prev[m.key] }))}
            style={metricasActivas[m.key]
              ? { ...s.filtroBtn, background: m.color + '15', borderColor: m.color, color: m.color }
              : s.filtroBtn}>
            <span style={{ ...s.filtroDot, background: metricasActivas[m.key] ? m.color : '#d6d3d1' }} />
            {m.key}{m.unit ? ` (${m.unit})` : ''}
          </button>
        ))}
      </div>

      {/* Gráfica */}
      {metricasVisibles.length === 0 ? (
        <div style={s.sinDatos}>Selecciona al menos una métrica para ver la gráfica</div>
      ) : (
        <ReactECharts
          option={option}
          style={{ height: 280 }}
          opts={{ renderer: 'svg' }}
        />
      )}
    </div>
  )
}

const s = {
  wrap:        { background: '#fff', border: '1px solid #e7e5e4', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  titulo:      { fontSize: '12px', fontWeight: '500', color: '#78716c', textTransform: 'uppercase', letterSpacing: '.06em' },
  rangoSelect: { fontSize: '12px', padding: '4px 8px', borderRadius: '6px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#d6d3d1', outline: 'none', color: '#57534e', background: '#fff' },
  resumen:     { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' },
  resumenChip: { display: 'flex', alignItems: 'center', gap: '5px', background: '#fafaf9', border: '1px solid #e7e5e4', borderRadius: '8px', padding: '4px 10px', fontSize: '11px' },
  resumenDot:  { width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0 },
  resumenLabel:{ color: '#78716c', fontWeight: '500' },
  resumenVals: { color: '#57534e' },
  resumenDiff: { padding: '1px 6px', borderRadius: '20px', fontWeight: '600' },
  filtros:     { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' },
  filtroBtn:   { display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e7e5e4', background: '#fafaf9', fontSize: '12px', color: '#78716c', cursor: 'pointer' },
  filtroDot:   { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  sinDatos:    { fontSize: '13px', color: '#a8a29e', textAlign: 'center', padding: '2rem 0' },
  empty:       { fontSize: '13px', color: '#a8a29e', textAlign: 'center', padding: '2rem', background: '#fff', borderRadius: '10px', border: '1px solid #e7e5e4' },
}
