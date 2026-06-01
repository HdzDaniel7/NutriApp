import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function GraficaEvolucion({ consultas }) {
  if (!consultas || consultas.length < 2) {
    return (
      <div style={s.empty}>
        Se necesitan al menos 2 consultas para mostrar la evolución
      </div>
    )
  }

  // Ordenar consultas de más antigua a más reciente
  const datos = [...consultas]
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .map(c => ({
      fecha: new Date(c.fecha).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }),
      Peso:      c.peso      ? parseFloat(c.peso)      : null,
      IMC:       c.imc       ? parseFloat(c.imc)       : null,
      '% Grasa': c.pct_grasa ? parseFloat(c.pct_grasa) : null,
      Cintura:   c.cintura   ? parseFloat(c.cintura)   : null,
      Cadera:    c.cadera    ? parseFloat(c.cadera)    : null,
    }))

  const metricas = [
    { key: 'Peso',      color: '#2563eb', unit: 'kg' },
    { key: 'IMC',       color: '#16a34a', unit: '' },
    { key: '% Grasa',   color: '#d97706', unit: '%' },
    { key: 'Cintura',   color: '#7c3aed', unit: 'cm' },
    { key: 'Cadera',    color: '#db2777', unit: 'cm' },
  ]

  // Solo mostrar métricas que tienen al menos un valor
  const metricasConDatos = metricas.filter(m =>
    datos.some(d => d[m.key] !== null)
  )

  return (
    <div style={s.wrap}>
      <div style={s.titulo}>Evolución del paciente</div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={datos} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
          <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#78716c' }} />
          <YAxis tick={{ fontSize: 11, fill: '#78716c' }} />
          <Tooltip
            contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e7e5e4' }}
            formatter={(val, name) => {
              const m = metricas.find(m => m.key === name)
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
    </div>
  )
}

const s = {
  wrap:   { background: '#fff', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem' },
  titulo: { fontSize: '12px', fontWeight: '500', color: '#78716c', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '1rem' },
  empty:  { fontSize: '13px', color: '#a8a29e', textAlign: 'center', padding: '2rem', background: '#fff', borderRadius: '10px', border: '1px solid #e7e5e4' },
}