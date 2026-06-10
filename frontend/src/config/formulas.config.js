export const FACTORES_ACTIVIDAD = [
  { id: 'sedentario',    valor: 1.2,   label: 'Sedentario',            descripcion: 'Sin ejercicio o trabajo de escritorio' },
  { id: 'leve',          valor: 1.375, label: 'Levemente activo',      descripcion: 'Ejercicio ligero 1–3 días/semana' },
  { id: 'moderado',      valor: 1.55,  label: 'Moderadamente activo',  descripcion: 'Ejercicio moderado 3–5 días/semana' },
  { id: 'muy_activo',    valor: 1.725, label: 'Muy activo',            descripcion: 'Ejercicio intenso 6–7 días/semana' },
  { id: 'extra_activo',  valor: 1.9,   label: 'Extremadamente activo', descripcion: 'Atleta de alto rendimiento o trabajo físico intenso' },
]

export const PRESETS_MACROS = {
  estandar: { nombre: 'Estándar',      proteina: 20, carbohidratos: 50, grasa: 30 },
  hiperp:   { nombre: 'Hiperproteica', proteina: 30, carbohidratos: 40, grasa: 30 },
  lowcarb:  { nombre: 'Low carb',      proteina: 25, carbohidratos: 25, grasa: 50 },
}

// ─────────────────────────────────────────────
// Funciones de cálculo — fuente de verdad del frontend.
// Deben mantenerse sincronizadas con backend/config/formulas.config.js
// ─────────────────────────────────────────────

export function calcularTMB({ sexo, edad, peso, talla, pctGrasa, formula = 'mifflin' }) {
  const e = parseFloat(edad), p = parseFloat(peso), t = parseFloat(talla)
  if (!e || !p || !t) return null
  if (formula === 'mifflin')
    return sexo === 'M' ? 10*p + 6.25*t - 5*e + 5 : 10*p + 6.25*t - 5*e - 161
  if (formula === 'harris')
    return sexo === 'M' ? 88.362 + 13.397*p + 4.799*t - 5.677*e : 447.593 + 9.247*p + 3.098*t - 4.330*e
  if (formula === 'katch') {
    const g = parseFloat(pctGrasa)
    if (!g) return null
    return 370 + 21.6 * (p * (1 - g / 100))
  }
  return null
}

export function calcularIMC(peso, talla) {
  const p = parseFloat(peso), t = parseFloat(talla)
  if (!p || !t) return null
  const imc = p / Math.pow(t / 100, 2)
  let categoria
  if (imc < 18.5)    categoria = 'Bajo peso'
  else if (imc < 25) categoria = 'Normal'
  else if (imc < 30) categoria = 'Sobrepeso'
  else if (imc < 35) categoria = 'Obesidad I'
  else               categoria = 'Obesidad II+'
  return { valor: parseFloat(imc.toFixed(1)), categoria }
}
