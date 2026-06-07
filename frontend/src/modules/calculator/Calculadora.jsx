import { useState } from 'react'
import { FACTORES_ACTIVIDAD, PRESETS_MACROS } from '../../config/formulas.config'

const FORMULAS = [
  { id: 'mifflin', nombre: 'Mifflin-St Jeor', descripcion: 'Recomendada para población general' },
  { id: 'harris',  nombre: 'Harris-Benedict',  descripcion: 'Alternativa clásica para adultos sanos' },
  { id: 'katch',   nombre: 'Katch-McArdle',    descripcion: 'Requiere % de grasa — más precisa en atletas' },
]

const OBJETIVOS = [
  { valor: -500, label: 'Reducción',      desc: '−500 kcal/día' },
  { valor: -250, label: 'Reducción leve', desc: '−250 kcal/día' },
  { valor: 0,    label: 'Mantenimiento',  desc: 'GET exacto' },
  { valor: 250,  label: 'Ganancia leve',  desc: '+250 kcal/día' },
  { valor: 500,  label: 'Ganancia',       desc: '+500 kcal/día' },
]

function calcularTMB({ sexo, edad, peso, talla, pctGrasa, formula }) {
  const e = parseFloat(edad), p = parseFloat(peso), t = parseFloat(talla)
  if (!e || !p || !t) return null
  if (formula === 'mifflin') return sexo === 'M' ? 10*p + 6.25*t - 5*e + 5 : 10*p + 6.25*t - 5*e - 161
  if (formula === 'harris')  return sexo === 'M' ? 88.362 + 13.397*p + 4.799*t - 5.677*e : 447.593 + 9.247*p + 3.098*t - 4.330*e
  if (formula === 'katch') {
    const g = parseFloat(pctGrasa)
    if (!g) return null
    return 370 + 21.6 * (p * (1 - g / 100))
  }
  return null
}

function calcularIMC(peso, talla) {
  const p = parseFloat(peso), t = parseFloat(talla)
  if (!p || !t) return null
  const imc = p / Math.pow(t / 100, 2)
  let cat
  if (imc < 18.5)    cat = 'Bajo peso'
  else if (imc < 25) cat = 'Normal'
  else if (imc < 30) cat = 'Sobrepeso'
  else if (imc < 35) cat = 'Obesidad I'
  else               cat = 'Obesidad II+'
  return { valor: imc.toFixed(1), categoria: cat }
}

export default function Calculadora() {
  const [form, setForm] = useState({
    sexo: 'M', edad: '', peso: '', talla: '', pctGrasa: '',
    formula: 'mifflin', factorActividad: 1.2, objetivo: 0,
    presetMacros: 'estandar',
    macrosPersonalizados: { proteina: 20, carbohidratos: 50, grasa: 30 }
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const tmb = calcularTMB(form)
  const get = tmb ? Math.round(tmb * form.factorActividad) : null
  const vct = get ? get + form.objetivo : null
  const imc = calcularIMC(form.peso, form.talla)

  const dist = form.presetMacros === 'personalizado'
    ? form.macrosPersonalizados
    : PRESETS_MACROS[form.presetMacros]

  const macros = vct ? {
    proteina:      { g: Math.round(vct * dist.proteina / 100 / 4),      kcal: Math.round(vct * dist.proteina / 100),      pct: dist.proteina },
    carbohidratos: { g: Math.round(vct * dist.carbohidratos / 100 / 4), kcal: Math.round(vct * dist.carbohidratos / 100), pct: dist.carbohidratos },
    grasa:         { g: Math.round(vct * dist.grasa / 100 / 9),         kcal: Math.round(vct * dist.grasa / 100),         pct: dist.grasa },
  } : null

  const listo = tmb !== null && vct !== null

  return (
    <div>
      <h1 style={s.h1}>Calculadora Nutrimental</h1>

      <div style={s.grid2}>

        {/* Datos del paciente */}
        <div style={s.card}>
          <div style={s.cardTitle}>Datos del paciente</div>

          <div style={s.fieldGroup}>
            <label style={s.label}>Sexo biológico</label>
            <div style={s.toggle}>
              {['M','F'].map(sx => (
                <button key={sx} onClick={() => set('sexo', sx)}
                  style={form.sexo === sx ? {...s.toggleBtn, ...s.toggleActive} : s.toggleBtn}>
                  {sx === 'M' ? 'Masculino' : 'Femenino'}
                </button>
              ))}
            </div>
          </div>

          {[
            { key: 'edad',     label: 'Edad (años)',         placeholder: 'ej. 30' },
            { key: 'peso',     label: 'Peso (kg)',           placeholder: 'ej. 70' },
            { key: 'talla',    label: 'Talla (cm)',          placeholder: 'ej. 170' },
            { key: 'pctGrasa', label: '% Grasa (opcional)',  placeholder: 'ej. 22' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} style={s.fieldGroup}>
              <label style={s.label}>{label}</label>
              <input style={s.input} type="number" placeholder={placeholder}
                value={form[key]} onChange={e => set(key, e.target.value)} />
            </div>
          ))}

          {imc && (
            <div style={s.imcBox}>
              <span style={s.imcVal}>IMC: {imc.valor}</span>
              <span style={s.imcCat}>{imc.categoria}</span>
            </div>
          )}
        </div>

        {/* Fórmula TMB */}
        <div style={s.card}>
          <div style={s.cardTitle}>Fórmula para TMB</div>
          {FORMULAS.map(f => (
            <label key={f.id} style={form.formula === f.id ? {...s.radioCard, ...s.radioActive} : s.radioCard}>
              <input type="radio" name="formula" value={f.id}
                checked={form.formula === f.id}
                onChange={() => set('formula', f.id)}
                disabled={f.id === 'katch' && !form.pctGrasa}
                style={{ marginTop: 2 }} />
              <div>
                <div style={s.radioTitle}>{f.nombre}</div>
                <div style={s.radioDesc}>{f.descripcion}</div>
              </div>
            </label>
          ))}

          <div style={s.cardTitle}>Factor de actividad</div>
          {FACTORES_ACTIVIDAD.map(f => (
            <label key={f.id} style={form.factorActividad === f.valor ? {...s.radioCard, ...s.radioActive} : s.radioCard}>
              <input type="radio" name="actividad" value={f.valor}
                checked={form.factorActividad === f.valor}
                onChange={() => set('factorActividad', f.valor)}
                style={{ marginTop: 2 }} />
              <div>
                <div style={s.radioTitle}>{f.label}</div>
                <div style={s.radioDesc}>{f.descripcion}</div>
              </div>
            </label>
          ))}
        </div>

      </div>

      {/* Objetivo */}
      <div style={s.card}>
        <div style={s.cardTitle}>Objetivo clínico</div>
        <div style={s.objGrid}>
          {OBJETIVOS.map(o => (
            <button key={o.valor} onClick={() => set('objetivo', o.valor)}
              style={form.objetivo === o.valor ? {...s.objBtn, ...s.objActive} : s.objBtn}>
              <div style={s.objLabel}>{o.label}</div>
              <div style={s.objDesc}>{o.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Distribución de macros */}
      <div style={s.card}>
        <div style={s.cardTitle}>Distribución de macros</div>
        <div style={s.pills}>
          {[...Object.entries(PRESETS_MACROS).map(([id, p]) => ({ id, nombre: p.nombre })),
            { id: 'personalizado', nombre: 'Personalizado' }].map(p => (
            <button key={p.id} onClick={() => set('presetMacros', p.id)}
              style={form.presetMacros === p.id ? {...s.pill, ...s.pillActive} : s.pill}>
              {p.nombre}
            </button>
          ))}
        </div>

        {form.presetMacros === 'personalizado' && (
          <div style={s.grid3}>
            {[
              { key: 'proteina',      label: '% Proteína' },
              { key: 'carbohidratos', label: '% Carbohidratos' },
              { key: 'grasa',         label: '% Grasa' },
            ].map(({ key, label }) => (
              <div key={key} style={s.fieldGroup}>
                <label style={s.label}>{label}</label>
                <input style={s.input} type="number" min="5" max="80"
                  value={form.macrosPersonalizados[key]}
                  onChange={e => setForm(f => ({
                    ...f, macrosPersonalizados: { ...f.macrosPersonalizados, [key]: parseInt(e.target.value) || 0 }
                  }))} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resultados */}
      {listo && (
        <div style={s.card}>
          <div style={s.cardTitle}>Resultados</div>
          <div style={s.metricsGrid}>
            {[
              { label: 'TMB',        valor: Math.round(tmb), unit: 'kcal/día' },
              { label: 'GET',        valor: get,             unit: 'kcal/día' },
              { label: 'VCT',        valor: vct,             unit: 'kcal/día' },
              { label: 'IMC',        valor: imc?.valor,      unit: imc?.categoria },
            ].map(m => (
              <div key={m.label} style={s.metric}>
                <div style={s.metricLabel}>{m.label}</div>
                <div style={s.metricVal}>{m.valor}</div>
                <div style={s.metricUnit}>{m.unit}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            {[
              { key: 'proteina',      nombre: 'Proteína',      color: '#2563eb' },
              { key: 'carbohidratos', nombre: 'Carbohidratos', color: '#16a34a' },
              { key: 'grasa',         nombre: 'Grasa',         color: '#d97706' },
            ].map(({ key, nombre, color }) => (
              <div key={key} style={s.macroRow}>
                <div style={{ ...s.macroName, color }}>{nombre}</div>
                <div style={s.macroBar}>
                  <div style={{ ...s.macroFill, width: `${macros[key].pct}%`, backgroundColor: color }} />
                </div>
                <div style={s.macroDetail}>
                  {macros[key].g} g &nbsp;·&nbsp; {macros[key].pct}% &nbsp;·&nbsp; {macros[key].kcal} kcal
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  h1:          { fontSize: '22px', fontWeight: '600', color: '#1c1917', marginBottom: '1.5rem' },
  grid2:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1rem' },
  grid3:       { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '0.75rem' },
  card:        { backgroundColor: '#fff', border: '1px solid #e7e5e4', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem' },
  cardTitle:   { fontSize: '12px', fontWeight: '500', color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem', marginTop: '0.75rem' },
  fieldGroup:  { marginBottom: '0.75rem' },
  label:       { display: 'block', fontSize: '13px', color: '#57534e', marginBottom: '4px' },
  input:       { width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #d6d3d1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  toggle:      { display: 'flex' },
  toggleBtn:   { flex: 1, padding: '7px', fontSize: '13px', cursor: 'pointer', borderWidth: '1px', borderStyle: 'solid', borderColor: '#d6d3d1', background: '#fafaf9', color: '#57534e' },
  toggleActive:{ background: 'var(--color-primario-bg)', borderColor: 'var(--color-primario-border)', color: 'var(--color-primario)', fontWeight: '500' },
  imcBox:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f5f5f4', borderRadius: '6px', padding: '8px 12px', marginTop: '0.5rem' },
  imcVal:      { fontSize: '14px', fontWeight: '500', color: '#1c1917' },
  imcCat:      { fontSize: '12px', color: '#57534e' },
  radioCard:   { display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '8px 10px', borderRadius: '6px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e7e5e4', marginBottom: '6px', cursor: 'pointer' },
  radioActive: { background: 'var(--color-primario-bg)', borderColor: 'var(--color-primario-border)' },
  radioTitle:  { fontSize: '13px', fontWeight: '500', color: '#1c1917' },
  radioDesc:   { fontSize: '11px', color: '#78716c', marginTop: '1px' },
  objGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' },
  objBtn:      { padding: '10px', borderRadius: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e7e5e4', background: '#fff', cursor: 'pointer', textAlign: 'center' },
  objActive:   { background: 'var(--color-primario-bg)', borderColor: 'var(--color-primario-border)' },
  objLabel:    { fontSize: '13px', fontWeight: '500', color: '#1c1917' },
  objDesc:     { fontSize: '11px', color: '#78716c', marginTop: '2px' },
  pills:       { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '0.5rem' },
  pill:        { padding: '5px 14px', borderRadius: '20px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e7e5e4', background: '#fafaf9', fontSize: '13px', color: '#57534e', cursor: 'pointer' },
  pillActive:  { background: 'var(--color-primario-bg)', borderColor: 'var(--color-primario-border)', color: 'var(--color-primario)', fontWeight: '500' },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' },
  metric:      { background: '#f5f5f4', borderRadius: '8px', padding: '12px 14px' },
  metricLabel: { fontSize: '11px', color: '#78716c', marginBottom: '4px' },
  metricVal:   { fontSize: '24px', fontWeight: '500', color: '#1c1917', lineHeight: 1 },
  metricUnit:  { fontSize: '11px', color: '#57534e', marginTop: '3px' },
  macroRow:    { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' },
  macroName:   { fontSize: '13px', fontWeight: '500', width: '100px', flexShrink: 0 },
  macroBar:    { flex: 1, height: '8px', borderRadius: '4px', background: '#e7e5e4', overflow: 'hidden' },
  macroFill:   { height: '100%', borderRadius: '4px', transition: 'width 0.3s' },
  macroDetail: { fontSize: '12px', color: '#78716c', width: '180px', textAlign: 'right', flexShrink: 0 },
}
