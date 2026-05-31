// ─────────────────────────────────────────────
// CONFIGURACIÓN DE MEDIDAS CASERAS Y PORCIONES
// Para agregar, quitar o ajustar una medida,
// edita este archivo únicamente.
//
// Cada medida tiene un rango de gramos (min, max)
// La app selecciona automáticamente la medida
// que corresponde al valor en gramos ingresado.
// ─────────────────────────────────────────────

export const MEDIDAS_CASERAS = [
  {
    id: 'punta_dedo',
    nombre: 'Punta del dedo',
    descripcion: 'Yema del pulgar',
    emoji: '👆',
    gramos_referencia: 5,
    rango: { min: 1, max: 8 },
    uso_tipico: 'Mantequilla, mermelada, aceite',
  },
  {
    id: 'cucharadita',
    nombre: 'Cucharadita',
    descripcion: '5 ml aproximadamente',
    emoji: '🥄',
    gramos_referencia: 5,
    rango: { min: 3, max: 8 },
    uso_tipico: 'Aceites, sal, condimentos',
  },
  {
    id: 'punito',
    nombre: 'Puñito / pellizco',
    descripcion: '3 dedos juntos',
    emoji: '🤏',
    gramos_referencia: 12,
    rango: { min: 8, max: 18 },
    uso_tipico: 'Semillas, especias, azúcar',
  },
  {
    id: 'pulgar',
    nombre: 'Pulgar completo',
    descripcion: 'Todo el dedo pulgar',
    emoji: '👍',
    gramos_referencia: 18,
    rango: { min: 12, max: 25 },
    uso_tipico: 'Quesos duros, crema de cacahuate',
  },
  {
    id: 'cucharada',
    nombre: 'Cucharada',
    descripcion: '15 ml aproximadamente',
    emoji: '🥄',
    gramos_referencia: 15,
    rango: { min: 10, max: 20 },
    uso_tipico: 'Cremas, aderezos, cereales',
  },
  {
    id: 'palma',
    nombre: 'Palma abierta',
    descripcion: 'Sin los dedos',
    emoji: '✋',
    gramos_referencia: 90,
    rango: { min: 60, max: 120 },
    uso_tipico: 'Proteínas: carne, pollo, pescado',
  },
  {
    id: 'punio',
    nombre: 'Puño cerrado',
    descripcion: 'Mano cerrada',
    emoji: '🤜',
    gramos_referencia: 120,
    rango: { min: 90, max: 160 },
    uso_tipico: 'Verduras, frutas, arroz cocido',
  },
  {
    id: 'dos_palmas',
    nombre: 'Dos palmas',
    descripcion: 'Ambas manos abiertas',
    emoji: '🤲',
    gramos_referencia: 180,
    rango: { min: 150, max: 220 },
    uso_tipico: 'Ensaladas, verduras de hoja',
  },
  {
    id: 'taza',
    nombre: 'Taza',
    descripcion: '240 ml aproximadamente',
    emoji: '🥣',
    gramos_referencia: 240,
    rango: { min: 200, max: 280 },
    uso_tipico: 'Líquidos, cereales, legumbres cocidas',
  },
]

// ─────────────────────────────────────────────
// TIEMPOS DE COMIDA POR DEFECTO
// Nombres preconfigurados pero modificables.
// El nutriólogo puede agregar, quitar y renombrar.
// Preparado para modo "por día" en fase futura.
// ─────────────────────────────────────────────

export const TIEMPOS_DEFAULT = [
  { id: 'desayuno',          nombre: 'Desayuno',            emoji: '☀️',  orden: 1 },
  { id: 'colacion_matutina', nombre: 'Colación matutina',   emoji: '🍎',  orden: 2 },
  { id: 'comida',            nombre: 'Comida',              emoji: '🍽️', orden: 3 },
  { id: 'merienda',          nombre: 'Merienda',            emoji: '🥤',  orden: 4 },
  { id: 'cena',              nombre: 'Cena',                emoji: '🌙',  orden: 5 },
]

// Nombres sugeridos para tiempos adicionales
export const TIEMPOS_SUGERIDOS = [
  'Colación vespertina',
  'Pre-entreno',
  'Post-entreno',
  'Snack nocturno',
  'Segunda cena',
  'Hidratación',
]
// ─────────────────────────────────────────────
// UTILIDADES DE PORCIONES
// ─────────────────────────────────────────────

export function getMedidaPorGramos(gramos) {
  const g = parseFloat(gramos)
  if (!g || isNaN(g) || g <= 0) return null
  const enRango = MEDIDAS_CASERAS.find(m => g >= m.rango.min && g <= m.rango.max)
  if (enRango) return enRango
  return MEDIDAS_CASERAS.reduce((prev, curr) =>
    Math.abs(curr.gramos_referencia - g) < Math.abs(prev.gramos_referencia - g) ? curr : prev
  )
}

export function getGramosPorMedida(medidaId) {
  const medida = MEDIDAS_CASERAS.find(m => m.id === medidaId)
  return medida ? medida.gramos_referencia : null
}

export function calcularNutrientesPorPorcion(alimento, gramos) {
  const g = parseFloat(gramos)
  if (!g || isNaN(g) || g <= 0) return {
    energia_kcal: 0, proteina: 0, carbohidratos: 0,
    grasa_total: 0, fibra_dietetica_total: 0, azucares: 0,
    acidos_grasos_saturados: 0, sodio: 0, calcio: 0,
    hierro: 0, vitamina_c: 0,
  }
  const factor = g / 100
  return {
    energia_kcal:            redondear(alimento.energia_kcal * factor),
    proteina:                redondear(alimento.proteina * factor),
    carbohidratos:           redondear(alimento.carbohidratos * factor),
    grasa_total:             redondear(alimento.grasa_total * factor),
    fibra_dietetica_total:   redondear(alimento.fibra_dietetica_total * factor),
    azucares:                redondear(alimento.azucares * factor),
    acidos_grasos_saturados: redondear(alimento.acidos_grasos_saturados * factor),
    sodio:                   redondear(alimento.sodio * factor),
    calcio:                  redondear(alimento.calcio * factor),
    hierro:                  redondear(alimento.hierro * factor),
    vitamina_c:              redondear(alimento.vitamina_c * factor),
  }
}

function redondear(val) {
  if (val == null || isNaN(val) || val === undefined) return 0
  return Math.round(val * 10) / 10
}