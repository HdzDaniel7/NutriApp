// ─────────────────────────────────────────────
// FÓRMULAS PARA TMB
// Para agregar o modificar una fórmula, edita
// este archivo únicamente — no toques el resto.
// ─────────────────────────────────────────────

const FORMULAS_TMB = {
  mifflin: {
    nombre: 'Mifflin-St Jeor',
    descripcion: 'Fórmula recomendada para población general',
    calcular: ({ sexo, edad, peso, talla }) => {
      if (sexo === 'M') return 10 * peso + 6.25 * talla - 5 * edad + 5
      if (sexo === 'F') return 10 * peso + 6.25 * talla - 5 * edad - 161
      throw new Error('Sexo inválido. Usa M o F')
    }
  },
  harris: {
    nombre: 'Harris-Benedict revisada',
    descripcion: 'Alternativa clásica, válida para adultos sanos',
    calcular: ({ sexo, edad, peso, talla }) => {
      if (sexo === 'M') return 88.362 + 13.397 * peso + 4.799 * talla - 5.677 * edad
      if (sexo === 'F') return 447.593 + 9.247 * peso + 3.098 * talla - 4.330 * edad
      throw new Error('Sexo inválido. Usa M o F')
    }
  },
  katch: {
    nombre: 'Katch-McArdle',
    descripcion: 'Requiere % de grasa corporal. Más precisa en atletas',
    calcular: ({ peso, pctGrasa }) => {
      if (!pctGrasa) throw new Error('Katch-McArdle requiere % de grasa corporal')
      const masaMagra = peso * (1 - pctGrasa / 100)
      return 370 + 21.6 * masaMagra
    }
  }
}

// ─────────────────────────────────────────────
// FACTORES DE ACTIVIDAD
// ─────────────────────────────────────────────

const FACTORES_ACTIVIDAD = [
  { id: 'sedentario',      valor: 1.2,   label: 'Sedentario',              descripcion: 'Sin ejercicio o trabajo de escritorio' },
  { id: 'leve',            valor: 1.375, label: 'Levemente activo',        descripcion: 'Ejercicio ligero 1–3 días/semana' },
  { id: 'moderado',        valor: 1.55,  label: 'Moderadamente activo',    descripcion: 'Ejercicio moderado 3–5 días/semana' },
  { id: 'muy_activo',      valor: 1.725, label: 'Muy activo',              descripcion: 'Ejercicio intenso 6–7 días/semana' },
  { id: 'extra_activo',    valor: 1.9,   label: 'Extremadamente activo',   descripcion: 'Atleta de alto rendimiento o trabajo físico intenso' }
]

// ─────────────────────────────────────────────
// PRESETS DE DISTRIBUCIÓN DE MACROS
// ─────────────────────────────────────────────

const PRESETS_MACROS = {
  estandar:  { nombre: 'Estándar',       proteina: 20, carbohidratos: 50, grasa: 30 },
  hiperp:    { nombre: 'Hiperproteica',  proteina: 30, carbohidratos: 40, grasa: 30 },
  lowcarb:   { nombre: 'Low carb',       proteina: 25, carbohidratos: 25, grasa: 50 },
}

// ─────────────────────────────────────────────
// FUNCIONES DE CÁLCULO
// ─────────────────────────────────────────────

// Devuelve la TMB sin redondear: el redondeo se hace una sola vez al final
// de la cadena TMB → GET → VCT para no acumular error (igual que el frontend).
function calcularTMB({ sexo, edad, peso, talla, pctGrasa, formula = 'mifflin' }) {
  const f = FORMULAS_TMB[formula]
  if (!f) throw new Error(`Fórmula "${formula}" no existe`)
  return f.calcular({ sexo, edad, peso, talla, pctGrasa })
}

function calcularGET({ tmb, factorActividad }) {
  return Math.round(tmb * factorActividad)
}

function calcularMacros({ vct, distribucionMacros, peso }) {
  const dist = distribucionMacros || PRESETS_MACROS.estandar

  const protKcal = vct * (dist.proteina / 100)
  const carbKcal = vct * (dist.carbohidratos / 100)
  const grasaKcal = vct * (dist.grasa / 100)

  return {
    proteina:      { kcal: Math.round(protKcal),  gramos: Math.round(protKcal / 4),  gPorKg: peso ? parseFloat((protKcal / 4 / peso).toFixed(2)) : null },
    carbohidratos: { kcal: Math.round(carbKcal),  gramos: Math.round(carbKcal / 4),  gPorKg: peso ? parseFloat((carbKcal / 4 / peso).toFixed(2)) : null },
    grasa:         { kcal: Math.round(grasaKcal), gramos: Math.round(grasaKcal / 9), gPorKg: null }
  }
}

function calcularIMC({ peso, talla }) {
  const tallaMt = talla / 100
  const imc = peso / (tallaMt * tallaMt)
  let categoria
  if (imc < 18.5)      categoria = 'Bajo peso'
  else if (imc < 25)   categoria = 'Normal'
  else if (imc < 30)   categoria = 'Sobrepeso'
  else if (imc < 35)   categoria = 'Obesidad I'
  else if (imc < 40)   categoria = 'Obesidad II'
  else                 categoria = 'Obesidad III'

  return { valor: parseFloat(imc.toFixed(1)), categoria }
}

module.exports = {
  calcularTMB,
  calcularGET,
  calcularMacros,
  calcularIMC,
  FORMULAS_TMB,
  FACTORES_ACTIVIDAD,
  PRESETS_MACROS
}