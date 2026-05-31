import { calcularNutrientesPorPorcion, getMedidaPorGramos, TIEMPOS_DEFAULT } from '../../config/porciones.config'

// ─────────────────────────────────────────────
// ESTRUCTURA BASE DE UN PLAN NUEVO
// Formato limpio preparado para base de datos
// e impresión PDF en fases futuras.
// ─────────────────────────────────────────────

export function crearPlanVacio(vct = 0, distribucionMacros = null) {
  return {
    // Metadatos del plan
    id: null,                    // null hasta que se guarde en BD (fase 2)
    nombre: 'Plan nutricional',
    fecha_creacion: new Date().toISOString(),
    paciente_id: null,           // null hasta fase 2

    // Objetivos
    vct_objetivo: vct,
    distribucion_macros: distribucionMacros || { proteina: 20, carbohidratos: 50, grasa: 30 },

    // Modo del plan
    // PREPARADO PARA FASE FUTURA: modo 'semanal_unico' = mismo plan todos los días
    // modo 'por_dia' = plan diferente por día (fase 2+)
    modo: 'semanal_unico',

    // Tiempos de comida
    tiempos: TIEMPOS_DEFAULT.map(t => ({
      ...t,
      alimentos: [],
    })),
  }
}

// ─────────────────────────────────────────────
// AGREGAR ALIMENTO A UN TIEMPO DE COMIDA
// ─────────────────────────────────────────────

export function agregarAlimento(plan, tiempoId, alimento, gramos, modoPorcion = 'gramos') {
  const medida = getMedidaPorGramos(gramos)
  const nutrientes = calcularNutrientesPorPorcion(alimento, gramos)

  const entrada = {
    // Identificación
    id: generarId(),
    alimento_id: alimento.id,
    descripcion: alimento.descripcion,
    tipo: alimento.tipo,
    alimento_original: alimento,

    // Porción — guardamos ambos formatos para PDF futuro
    porcion_gramos: parseFloat(gramos),
    porcion_medida_id: medida?.id || null,
    porcion_medida_nombre: medida?.nombre || null,
    porcion_medida_emoji: medida?.emoji || null,
    modo_porcion: modoPorcion,   // 'gramos' o 'medida_casera'

    // Nutrientes calculados para esta porción
    nutrientes,
  }

  return {
    ...plan,
    tiempos: plan.tiempos.map(t =>
      t.id === tiempoId
        ? { ...t, alimentos: [...t.alimentos, entrada] }
        : t
    ),
  }
}

// ─────────────────────────────────────────────
// ACTUALIZAR GRAMOS DE UN ALIMENTO
// ─────────────────────────────────────────────

export function actualizarGramos(plan, tiempoId, alimentoEntradaId, nuevosGramos, alimentoOriginal) {
  const medida = getMedidaPorGramos(nuevosGramos)
  const nutrientes = calcularNutrientesPorPorcion(alimentoOriginal, nuevosGramos)

  return {
    ...plan,
    tiempos: plan.tiempos.map(t =>
      t.id === tiempoId
        ? {
            ...t,
            alimentos: t.alimentos.map(a =>
              a.id === alimentoEntradaId
                ? {
                    ...a,
                    porcion_gramos: parseFloat(nuevosGramos),
                    porcion_medida_id: medida?.id || null,
                    porcion_medida_nombre: medida?.nombre || null,
                    porcion_medida_emoji: medida?.emoji || null,
                    nutrientes,
                  }
                : a
            ),
          }
        : t
    ),
  }
}

// ─────────────────────────────────────────────
// ELIMINAR ALIMENTO DE UN TIEMPO
// ─────────────────────────────────────────────

export function eliminarAlimento(plan, tiempoId, alimentoEntradaId) {
  return {
    ...plan,
    tiempos: plan.tiempos.map(t =>
      t.id === tiempoId
        ? { ...t, alimentos: t.alimentos.filter(a => a.id !== alimentoEntradaId) }
        : t
    ),
  }
}

// ─────────────────────────────────────────────
// AGREGAR TIEMPO DE COMIDA
// ─────────────────────────────────────────────

export function agregarTiempo(plan, nombre, emoji = '🍴') {
  const nuevoTiempo = {
    id: generarId(),
    nombre,
    emoji,
    orden: plan.tiempos.length + 1,
    alimentos: [],
  }
  return { ...plan, tiempos: [...plan.tiempos, nuevoTiempo] }
}

// ─────────────────────────────────────────────
// ELIMINAR TIEMPO DE COMIDA
// ─────────────────────────────────────────────

export function eliminarTiempo(plan, tiempoId) {
  return {
    ...plan,
    tiempos: plan.tiempos
      .filter(t => t.id !== tiempoId)
      .map((t, i) => ({ ...t, orden: i + 1 })),
  }
}

// ─────────────────────────────────────────────
// RENOMBRAR TIEMPO DE COMIDA
// ─────────────────────────────────────────────

export function renombrarTiempo(plan, tiempoId, nuevoNombre) {
  return {
    ...plan,
    tiempos: plan.tiempos.map(t =>
      t.id === tiempoId ? { ...t, nombre: nuevoNombre } : t
    ),
  }
}

// ─────────────────────────────────────────────
// CALCULAR TOTALES DEL PLAN COMPLETO
// ─────────────────────────────────────────────

export function calcularTotales(plan, gramosEnEdicion = {}) {
  const totales = {
    energia_kcal: 0,
    proteina: 0,
    carbohidratos: 0,
    grasa_total: 0,
    fibra_dietetica_total: 0,
  }

  plan.tiempos.forEach(t => {
    t.alimentos.forEach(a => {
      const gramosActuales = gramosEnEdicion[a.id]
      const nutrientes = gramosActuales
        ? calcularNutrientesPorPorcion(a.alimento_original, gramosActuales)
        : a.nutrientes
      Object.keys(totales).forEach(key => {
        totales[key] += nutrientes[key] || 0
      })
    })
  })

  Object.keys(totales).forEach(k => {
    totales[k] = Math.round(totales[k] * 10) / 10
  })

  totales.pct_vct = plan.vct_objetivo > 0
    ? Math.round((totales.energia_kcal / plan.vct_objetivo) * 100)
    : 0

  return totales
}

// ─────────────────────────────────────────────
// CALCULAR TOTALES POR TIEMPO DE COMIDA
// ─────────────────────────────────────────────

export function calcularTotalesTiempo(tiempo, gramosEnEdicion = {}) {
  return tiempo.alimentos.reduce((acc, a) => {
    const gramosActuales = gramosEnEdicion[a.id]
    const nutrientes = gramosActuales
      ? calcularNutrientesPorPorcion(a.alimento_original, gramosActuales)
      : a.nutrientes
    return {
      energia_kcal:  Math.round((acc.energia_kcal  + (nutrientes.energia_kcal  || 0)) * 10) / 10,
      proteina:      Math.round((acc.proteina      + (nutrientes.proteina      || 0)) * 10) / 10,
      carbohidratos: Math.round((acc.carbohidratos + (nutrientes.carbohidratos || 0)) * 10) / 10,
      grasa_total:   Math.round((acc.grasa_total   + (nutrientes.grasa_total   || 0)) * 10) / 10,
    }
  }, { energia_kcal: 0, proteina: 0, carbohidratos: 0, grasa_total: 0 })
}

// ─────────────────────────────────────────────
// UTILIDAD INTERNA
// ─────────────────────────────────────────────

function generarId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
}
