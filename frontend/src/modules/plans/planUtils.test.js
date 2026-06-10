import { describe, it, expect } from 'vitest'
import {
  crearPlanVacio,
  agregarTiempo,
  eliminarTiempo,
  renombrarTiempo,
  calcularTotales,
  activarModoSemanalUnico,
  activarModoPorDia,
  agregarDia,
  eliminarAlimento,
} from './planUtils'

// ── crearPlanVacio ───────────────────────────────────────────────────────────

describe('crearPlanVacio', () => {
  it('almacena el VCT objetivo', () => {
    expect(crearPlanVacio(2000).vct_objetivo).toBe(2000)
  })

  it('crea tiempos de comida por defecto (array no vacío)', () => {
    const { tiempos } = crearPlanVacio(2000)
    expect(Array.isArray(tiempos)).toBe(true)
    expect(tiempos.length).toBeGreaterThan(0)
  })

  it('todos los tiempos inician sin alimentos', () => {
    crearPlanVacio(2000).tiempos.forEach(t =>
      expect(t.alimentos).toHaveLength(0)
    )
  })

  it('modo por defecto es semanal_unico', () => {
    expect(crearPlanVacio(2000).modo).toBe('semanal_unico')
  })

  it('cada tiempo tiene id único', () => {
    const ids = crearPlanVacio(2000).tiempos.map(t => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

// ── agregarTiempo / eliminarTiempo / renombrarTiempo ─────────────────────────

describe('agregarTiempo', () => {
  it('incrementa el conteo de tiempos', () => {
    const plan = crearPlanVacio(2000)
    const prev = plan.tiempos.length
    expect(agregarTiempo(plan, 'Merienda').tiempos).toHaveLength(prev + 1)
  })

  it('el nuevo tiempo tiene el nombre indicado', () => {
    const plan = crearPlanVacio(2000)
    const nuevo = agregarTiempo(plan, 'Merienda').tiempos.at(-1)
    expect(nuevo.nombre).toBe('Merienda')
  })

  it('no muta el plan original', () => {
    const plan = crearPlanVacio(2000)
    const original = plan.tiempos.length
    agregarTiempo(plan, 'Merienda')
    expect(plan.tiempos.length).toBe(original)
  })
})

describe('eliminarTiempo', () => {
  it('reduce el conteo de tiempos', () => {
    const plan = crearPlanVacio(2000)
    const id = plan.tiempos[0].id
    expect(eliminarTiempo(plan, id).tiempos).toHaveLength(plan.tiempos.length - 1)
  })

  it('el tiempo eliminado ya no aparece', () => {
    const plan = crearPlanVacio(2000)
    const id = plan.tiempos[0].id
    const resultado = eliminarTiempo(plan, id)
    expect(resultado.tiempos.find(t => t.id === id)).toBeUndefined()
  })
})

describe('renombrarTiempo', () => {
  it('actualiza el nombre del tiempo indicado', () => {
    const plan = crearPlanVacio(2000)
    const id = plan.tiempos[0].id
    const resultado = renombrarTiempo(plan, id, 'Nuevo nombre')
    expect(resultado.tiempos.find(t => t.id === id).nombre).toBe('Nuevo nombre')
  })

  it('no afecta los demás tiempos', () => {
    const plan = crearPlanVacio(2000)
    const id = plan.tiempos[0].id
    const otrosAntes = plan.tiempos.slice(1).map(t => t.nombre)
    const otrosDespues = renombrarTiempo(plan, id, 'Nuevo').tiempos.slice(1).map(t => t.nombre)
    expect(otrosDespues).toEqual(otrosAntes)
  })
})

// ── calcularTotales ──────────────────────────────────────────────────────────

const planConAlimentos = {
  vct_objetivo: 2000,
  modo: 'semanal_unico',
  tiempos: [
    {
      id: 'desayuno',
      nombre: 'Desayuno',
      alimentos: [
        {
          id: 'food1',
          alimento_original: {},
          nutrientes: { energia_kcal: 350, proteina: 25, carbohidratos: 40, grasa_total: 10, fibra_dietetica_total: 3 },
        },
        {
          id: 'food2',
          alimento_original: {},
          nutrientes: { energia_kcal: 150, proteina: 5, carbohidratos: 25, grasa_total: 3, fibra_dietetica_total: 1 },
        },
      ],
    },
    {
      id: 'comida',
      nombre: 'Comida',
      alimentos: [
        {
          id: 'food3',
          alimento_original: {},
          nutrientes: { energia_kcal: 600, proteina: 45, carbohidratos: 60, grasa_total: 15, fibra_dietetica_total: 6 },
        },
      ],
    },
  ],
}

describe('calcularTotales', () => {
  it('suma correcta de kilocalorías entre tiempos', () => {
    expect(calcularTotales(planConAlimentos).energia_kcal).toBeCloseTo(1100)
  })

  it('suma correcta de proteína', () => {
    expect(calcularTotales(planConAlimentos).proteina).toBeCloseTo(75)
  })

  it('suma correcta de carbohidratos', () => {
    expect(calcularTotales(planConAlimentos).carbohidratos).toBeCloseTo(125)
  })

  it('suma correcta de grasa total', () => {
    expect(calcularTotales(planConAlimentos).grasa_total).toBeCloseTo(28)
  })

  it('calcula el % del VCT', () => {
    expect(calcularTotales(planConAlimentos).pct_vct).toBe(55)  // 1100/2000*100
  })

  it('plan vacío da ceros', () => {
    const plan = crearPlanVacio(2000)
    const t = calcularTotales(plan)
    expect(t.energia_kcal).toBe(0)
    expect(t.proteina).toBe(0)
  })
})

// ── modos del plan ────────────────────────────────────────────────────────────

describe('activarModoPorDia', () => {
  it('cambia el modo a por_dia', () => {
    const plan = crearPlanVacio(2000)
    expect(activarModoPorDia(plan).modo).toBe('por_dia')
  })

  it('crea al menos un día', () => {
    const plan = crearPlanVacio(2000)
    expect(activarModoPorDia(plan).dias.length).toBeGreaterThan(0)
  })

  it('el primer día tiene los tiempos del plan', () => {
    const plan = crearPlanVacio(2000)
    const planPorDia = activarModoPorDia(plan)
    expect(planPorDia.dias[0].tiempos.length).toBeGreaterThan(0)
  })
})

describe('activarModoSemanalUnico', () => {
  it('cambia el modo a semanal_unico', () => {
    const plan = activarModoPorDia(crearPlanVacio(2000))
    expect(activarModoSemanalUnico(plan).modo).toBe('semanal_unico')
  })

  it('no muta el plan original', () => {
    const plan = activarModoPorDia(crearPlanVacio(2000))
    activarModoSemanalUnico(plan)
    expect(plan.modo).toBe('por_dia')
  })
})

// ── agregarDia ────────────────────────────────────────────────────────────────

describe('agregarDia', () => {
  it('incrementa el conteo de días', () => {
    const plan = activarModoPorDia(crearPlanVacio(2000))
    expect(agregarDia(plan, null).dias.length).toBe(plan.dias.length + 1)
  })

  it('copiando desde otro día tiene los mismos nombres de tiempos', () => {
    const plan = activarModoPorDia(crearPlanVacio(2000))
    const diaIdOrigen = plan.dias[0].id
    const planCon2Dias = agregarDia(plan, diaIdOrigen)
    const nombresTiemposDia1 = planCon2Dias.dias[0].tiempos.map(t => t.nombre)
    const nombresTiemposDia2 = planCon2Dias.dias[1].tiempos.map(t => t.nombre)
    expect(nombresTiemposDia2).toEqual(nombresTiemposDia1)
  })
})

// ── eliminarAlimento ──────────────────────────────────────────────────────────

describe('eliminarAlimento', () => {
  it('elimina el alimento del tiempo correcto', () => {
    const result = eliminarAlimento(planConAlimentos, 'desayuno', 'food1')
    const desayuno = result.tiempos.find(t => t.id === 'desayuno')
    expect(desayuno.alimentos.find(a => a.id === 'food1')).toBeUndefined()
  })

  it('no afecta otros tiempos', () => {
    const result = eliminarAlimento(planConAlimentos, 'desayuno', 'food1')
    const comida = result.tiempos.find(t => t.id === 'comida')
    expect(comida.alimentos).toHaveLength(1)
  })
})
