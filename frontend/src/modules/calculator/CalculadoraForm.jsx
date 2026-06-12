import { useState, useEffect } from 'react'
import { FACTORES_ACTIVIDAD, PRESETS_MACROS, calcularTMB, calcularIMC } from '../../config/formulas.config'
import { T, Card, base } from '../../components/ui'

export const FORMULAS = [
  { id: 'mifflin', nombre: 'Mifflin-St Jeor', descripcion: 'Recomendada para población general' },
  { id: 'harris',  nombre: 'Harris-Benedict revisada', descripcion: 'Alternativa clásica para adultos sanos (Roza-Shizgal 1984)' },
  { id: 'katch',   nombre: 'Katch-McArdle', descripcion: 'Requiere % de grasa — más precisa en atletas' },
]

export const OBJETIVOS = [
  { valor: -500, label: 'Reducción',      desc: '−500 kcal/día' },
  { valor: -250, label: 'Reducción leve', desc: '−250 kcal/día' },
  { valor: 0,    label: 'Mantenimiento',  desc: 'GET exacto' },
  { valor: 250,  label: 'Ganancia leve',  desc: '+250 kcal/día' },
  { valor: 500,  label: 'Ganancia',       desc: '+500 kcal/día' },
]

/* ─────────────────────────────────────────────
   Calculadora nutrimental reutilizable.
   · datosIniciales: { sexo, edad, peso, talla, pctGrasa } pre-llenados
   · sincronizar:    si true, los datosIniciales actualizan el form al cambiar
                     (modo embebido: los datos vienen de otro formulario)
   · ocultarDatos:   oculta la tarjeta "Datos del paciente" (modo embebido)
   · onResultado:    callback con { tmb, get, vct, imc, formula, factorActividad,
                     objetivo, dist, distValida } cada vez que cambia el cálculo
───────────────────────────────────────────── */
export default function CalculadoraForm({ datosIniciales = {}, sincronizar = false, ocultarDatos = false, onResultado }) {
  const [form, setForm] = useState({
    sexo: datosIniciales.sexo || 'M',
    edad: datosIniciales.edad ?? '',
    peso: datosIniciales.peso ?? '',
    talla: datosIniciales.talla ?? '',
    pctGrasa: datosIniciales.pctGrasa ?? '',
    formula: 'mifflin', factorActividad: 1.2, objetivo: 0,
    presetMacros: 'estandar',
    macrosPersonalizados: { proteina: 20, carbohidratos: 50, grasa: 30 },
  })

  // Modo embebido: los datos del paciente viven en el formulario padre
  useEffect(() => {
    if (!sincronizar) return
    setForm(f => ({
      ...f,
      sexo: datosIniciales.sexo || f.sexo,
      edad: datosIniciales.edad ?? f.edad,
      peso: datosIniciales.peso ?? f.peso,
      talla: datosIniciales.talla ?? f.talla,
      pctGrasa: datosIniciales.pctGrasa ?? f.pctGrasa,
      formula: f.formula === 'katch' && !parseFloat(datosIniciales.pctGrasa) ? 'mifflin' : f.formula,
    }))
  }, [sincronizar, datosIniciales.sexo, datosIniciales.edad, datosIniciales.peso, datosIniciales.talla, datosIniciales.pctGrasa])

  const set = (key, val) => setForm(f => {
    // Si se borra el % de grasa estando en Katch-McArdle, regresar a Mifflin
    if (key === 'pctGrasa' && !parseFloat(val) && f.formula === 'katch')
      return { ...f, pctGrasa: val, formula: 'mifflin' }
    return { ...f, [key]: val }
  })

  const tmb = calcularTMB(form)
  const get = tmb ? Math.round(tmb * form.factorActividad) : null
  const vct = get ? get + form.objetivo : null
  const imc = calcularIMC(form.peso, form.talla)

  const dist = form.presetMacros === 'personalizado'
    ? form.macrosPersonalizados
    : PRESETS_MACROS[form.presetMacros]
  const sumaDist = dist.proteina + dist.carbohidratos + dist.grasa
  const distValida = sumaDist === 100

  const pesoNum = parseFloat(form.peso)
  const macros = vct ? {
    proteina:      { g: Math.round(vct * dist.proteina / 100 / 4),      kcal: Math.round(vct * dist.proteina / 100),      pct: dist.proteina,
                     gPorKg: pesoNum ? (vct * dist.proteina / 100 / 4 / pesoNum).toFixed(2) : null },
    carbohidratos: { g: Math.round(vct * dist.carbohidratos / 100 / 4), kcal: Math.round(vct * dist.carbohidratos / 100), pct: dist.carbohidratos },
    grasa:         { g: Math.round(vct * dist.grasa / 100 / 9),         kcal: Math.round(vct * dist.grasa / 100),         pct: dist.grasa },
  } : null

  const listo = tmb !== null && vct !== null
  const edadNum = parseFloat(form.edad)
  const avisos = []
  if (listo && vct < Math.round(tmb))
    avisos.push(`El VCT (${vct} kcal) queda por debajo de la TMB (${Math.round(tmb)} kcal). Considera un déficit menor o aumentar actividad.`)
  if (edadNum && edadNum < 18)
    avisos.push('Las fórmulas de TMB están validadas en adultos; en menores de 18 años los resultados son solo orientativos.')

  // Avisar al padre cada vez que cambia el resultado
  useEffect(() => {
    if (!onResultado) return
    onResultado(listo ? {
      tmb: Math.round(tmb), get, vct, imc,
      formula: form.formula, factorActividad: form.factorActividad,
      objetivo: form.objetivo, dist, distValida,
    } : null)
  }, [tmb, get, vct, form.formula, form.factorActividad, form.objetivo, dist.proteina, dist.carbohidratos, dist.grasa])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      <div style={ocultarDatos ? undefined : s.grid2}>

        {/* Datos del paciente */}
        {!ocultarDatos && (
          <Card title="Datos del paciente">
            <div style={s.fieldGroup}>
              <label style={base.label}>Sexo biológico</label>
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
              { key: 'edad',     label: 'Edad (años)',        placeholder: 'ej. 30' },
              { key: 'peso',     label: 'Peso (kg)',          placeholder: 'ej. 70' },
              { key: 'talla',    label: 'Talla (cm)',         placeholder: 'ej. 170' },
              { key: 'pctGrasa', label: '% Grasa (opcional)', placeholder: 'ej. 22' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} style={s.fieldGroup}>
                <label style={base.label}>{label}</label>
                <input style={base.input} type="number" placeholder={placeholder}
                  value={form[key]} onChange={e => set(key, e.target.value)} />
              </div>
            ))}

            {imc && (
              <div style={s.imcBox}>
                <span style={s.imcVal}>IMC: {imc.valor}</span>
                <span style={s.imcCat}>{imc.categoria}</span>
              </div>
            )}
          </Card>
        )}

        {/* Fórmula TMB + actividad */}
        <Card title="Fórmula y actividad">
          {FORMULAS.map(f => (
            <label key={f.id} style={form.formula === f.id ? {...s.radioCard, ...s.radioActive} : s.radioCard}>
              <input type="radio" name="formula" value={f.id}
                checked={form.formula === f.id}
                onChange={() => set('formula', f.id)}
                disabled={f.id === 'katch' && !parseFloat(form.pctGrasa)}
                style={{ marginTop: 2, accentColor: 'var(--ui-green)' }} />
              <div>
                <div style={s.radioTitle}>{f.nombre}</div>
                <div style={s.radioDesc}>{f.descripcion}</div>
              </div>
            </label>
          ))}

          <div style={{ ...base.cardTitle, margin: '14px 0 8px' }}>Factor de actividad</div>
          {FACTORES_ACTIVIDAD.map(f => (
            <label key={f.id} style={form.factorActividad === f.valor ? {...s.radioCard, ...s.radioActive} : s.radioCard}>
              <input type="radio" name="actividad" value={f.valor}
                checked={form.factorActividad === f.valor}
                onChange={() => set('factorActividad', f.valor)}
                style={{ marginTop: 2, accentColor: 'var(--ui-green)' }} />
              <div>
                <div style={s.radioTitle}>{f.label} <span style={s.radioFactor}>×{f.valor}</span></div>
                <div style={s.radioDesc}>{f.descripcion}</div>
              </div>
            </label>
          ))}
        </Card>

      </div>

      {/* Objetivo */}
      <Card title="Objetivo clínico">
        <div style={s.objGrid}>
          {OBJETIVOS.map(o => (
            <button key={o.valor} onClick={() => set('objetivo', o.valor)}
              style={form.objetivo === o.valor ? {...s.objBtn, ...s.objActive} : s.objBtn}>
              <div style={s.objLabel}>{o.label}</div>
              <div style={s.objDesc}>{o.desc}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Distribución de macros */}
      <Card title="Distribución de macros">
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
                <label style={base.label}>{label}</label>
                <input style={base.input} type="number" min="5" max="80"
                  value={form.macrosPersonalizados[key]}
                  onChange={e => setForm(f => ({
                    ...f, macrosPersonalizados: { ...f.macrosPersonalizados, [key]: parseInt(e.target.value) || 0 }
                  }))} />
              </div>
            ))}
          </div>
        )}

        {!distValida && (
          <div style={{ ...base.warnBox, marginTop: 10 }}>
            La distribución suma {sumaDist}% — debe sumar exactamente 100% para repartir el VCT correctamente.
          </div>
        )}
      </Card>

      {/* Resultados */}
      {listo && (
        <Card title="Resultados">
          {avisos.map(aviso => (
            <div key={aviso} style={{ ...base.warnBox, marginBottom: 8 }}>{aviso}</div>
          ))}

          <div style={s.metricsGrid}>
            {[
              { label: 'TMB', valor: Math.round(tmb), unit: 'kcal/día' },
              { label: 'GET', valor: get,             unit: 'kcal/día' },
              { label: 'VCT', valor: vct,             unit: 'kcal/día', destacado: true },
              { label: 'IMC', valor: imc?.valor,      unit: imc?.categoria },
            ].map(m => (
              <div key={m.label} style={m.destacado ? { ...s.metric, ...s.metricDestacado } : s.metric}>
                <div style={s.metricLabel}>{m.label}</div>
                <div style={s.metricVal}>{m.valor}</div>
                <div style={s.metricUnit}>{m.unit}</div>
              </div>
            ))}
          </div>

          {distValida ? (
            <div style={{ marginTop: '1.25rem' }}>
              {[
                { key: 'proteina',      nombre: 'Proteína',      color: T.blue },
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
                    {macros[key].gPorKg && <span> &nbsp;·&nbsp; {macros[key].gPorKg} g/kg</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ ...base.warnBox, marginTop: '1.25rem' }}>
              Ajusta la distribución de macros a 100% para ver el reparto en gramos.
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

const s = {
  grid2:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 },
  grid3:       { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 10 },
  fieldGroup:  { marginBottom: 10 },
  toggle:      { display: 'flex', borderRadius: 8, overflow: 'hidden', border: `1px solid ${T.border}` },
  toggleBtn:   { flex: 1, padding: 8, fontSize: 13, cursor: 'pointer', border: 'none', background: '#fff', color: T.txtSecondary },
  toggleActive:{ background: T.greenBg, color: T.green, fontWeight: 600 },
  imcBox:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: T.greenBg, border: `1px solid ${T.borderSubtle}`, borderRadius: 8, padding: '8px 12px', marginTop: 6 },
  imcVal:      { fontSize: 14, fontWeight: 600, color: T.txtPrimary },
  imcCat:      { fontSize: 12, color: T.txtSecondary },
  radioCard:   { display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 10px', borderRadius: 8, border: `1px solid ${T.borderSubtle}`, marginBottom: 6, cursor: 'pointer', background: '#fff' },
  radioActive: { background: T.greenBg, borderColor: T.greenPale },
  radioTitle:  { fontSize: 13, fontWeight: 500, color: T.txtPrimary },
  radioFactor: { fontSize: 11, color: T.txtMuted, fontWeight: 400 },
  radioDesc:   { fontSize: 11, color: T.txtMuted, marginTop: 1 },
  objGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 },
  objBtn:      { padding: 10, borderRadius: 10, border: `1px solid ${T.border}`, background: '#fff', cursor: 'pointer', textAlign: 'center' },
  objActive:   { background: T.greenBg, borderColor: T.greenPale },
  objLabel:    { fontSize: 13, fontWeight: 500, color: T.txtPrimary },
  objDesc:     { fontSize: 11, color: T.txtMuted, marginTop: 2 },
  pills:       { display: 'flex', gap: 6, flexWrap: 'wrap' },
  pill:        { padding: '5px 14px', borderRadius: 20, border: `1px solid ${T.border}`, background: '#fff', fontSize: 13, color: T.txtSecondary, cursor: 'pointer' },
  pillActive:  { background: T.greenBg, borderColor: T.greenPale, color: T.green, fontWeight: 600 },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 },
  metric:      { background: T.bgPage, borderRadius: 10, padding: '12px 14px', border: `1px solid ${T.borderSubtle}` },
  metricDestacado: { background: T.greenBg, borderColor: T.greenPale },
  metricLabel: { fontSize: 11, color: T.txtMuted, marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' },
  metricVal:   { fontSize: 24, fontWeight: 700, color: T.txtPrimary, lineHeight: 1 },
  metricUnit:  { fontSize: 11, color: T.txtSecondary, marginTop: 3 },
  macroRow:    { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
  macroName:   { fontSize: 13, fontWeight: 500, width: 100, flexShrink: 0 },
  macroBar:    { flex: 1, height: 8, borderRadius: 4, background: T.borderSubtle, overflow: 'hidden' },
  macroFill:   { height: '100%', borderRadius: 4, transition: 'width 0.3s' },
  macroDetail: { fontSize: 12, color: T.txtMuted, width: 240, textAlign: 'right', flexShrink: 0 },
}
