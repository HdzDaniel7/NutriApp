import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const METRICAS = [
  { key: 'Peso',      color: '#2563eb', unit: 'kg',  defaultActiva: true },
  { key: 'IMC',       color: '#16a34a', unit: '',    defaultActiva: false },
  { key: '% Grasa',   color: '#d97706', unit: '%',   defaultActiva: false },
  { key: 'Cintura',   color: '#7c3aed', unit: 'cm',  defaultActiva: false },
  { key: 'Cadera',    color: '#db2777', unit: 'cm',  defaultActiva: false },
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

  // Ordenar de más antigua a más reciente
  let consultasOrdenadas = [...consultas].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

  // Aplicar filtro de rango
  if (rangoConsultas !== 'todas') {
    const n = parseInt(rangoConsultas)
    consultasOrdenadas = consultasOrdenadas.slice(-n)
  }

  const datos = consultasOrdenadas.map(c => ({
    fecha:     new Date(c.fecha).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }),
    'Peso':    c.peso      ? parseFloat(c.peso)      : null,
    'IMC':     c.imc       ? parseFloat(c.imc)       : null,
    '% Grasa': c.pct_grasa ? parseFloat(c.pct_grasa) : null,
    'Cintura': c.cintura   ? parseFloat(c.cintura)   : null,
    'Cadera':  c.cadera    ? parseFloat(c.cadera)    : null,
  }))

  // Solo métricas que tienen datos Y están activas
  const metricasConDatos = METRICAS.filter(m =>
    metricasActivas[m.key] && datos.some(d => d[m.key] !== null)
  )

  const toggleMetrica = (key) => {
    setMetricasActivas(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div style={s.wrap}>
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

      {/* Filtros de métricas */}
      <div style={s.filtros}>
        {METRICAS.filter(m => datos.some(d => d[m.key] !== null)).map(m => (
          <button key={m.key}
            onClick={() => toggleMetrica(m.key)}
            style={metricasActivas[m.key]
              ? { ...s.filtroBtn, background: m.color + '20', borderColor: m.color, color: m.color }
              : s.filtroBtn}>
            <span style={{ ...s.filtroDot, background: metricasActivas[m.key] ? m.color : '#d6d3d1' }} />
            {m.key} {m.unit && `(${m.unit})`}
          </button>
        ))}
      </div>

      {metricasConDatos.length === 0 ? (
        <div style={s.sinDatos}>Selecciona al menos una métrica para ver la gráfica</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={datos} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
            <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#78716c' }} />
            <YAxis tick={{ fontSize: 11, fill: '#78716c' }} />
            <Tooltip
              contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e7e5e4' }}
              formatter={(val, name) => {
                const m = METRICAS.find(m => m.key === name)
                return [`${val} ${m?.unit || ''}`, name]
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            {metricasConDatos.map(m => (
              <Line
                key={m.key}
                type="monotone"
                dataKey={m.key}
                stroke={m.color}
                strokeWidth={2}
                dot={{ r: 4, fill: m.color }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

const s = {
  wrap:        { background: '#fff', border: '1px solid #e7e5e4', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  titulo:      { fontSize: '12px', fontWeight: '500', color: '#78716c', textTransform: 'uppercase', letterSpacing: '.06em' },
  rangoSelect: { fontSize: '12px', padding: '4px 8px', borderRadius: '6px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#d6d3d1', outline: 'none', color: '#57534e', background: '#fff' },
  filtros:     { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' },
  filtroBtn:   { display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e7e5e4', background: '#fafaf9', fontSize: '12px', color: '#78716c', cursor: 'pointer' },
  filtroDot:   { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  sinDatos:    { fontSize: '13px', color: '#a8a29e', textAlign: 'center', padding: '2rem 0' },
  empty:       { fontSize: '13px', color: '#a8a29e', textAlign: 'center', padding: '2rem', background: '#fff', borderRadius: '10px', border: '1px solid #e7e5e4' },
}