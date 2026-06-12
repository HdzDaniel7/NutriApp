import { describe, it, expect } from 'vitest'
import { calcularTMB, calcularIMC } from './formulas.config'

// ── calcularTMB ──────────────────────────────────────────────────────────────

describe('calcularTMB — Mifflin-St Jeor', () => {
  it('hombre 30 años 75 kg 175 cm', () => {
    // 10*75 + 6.25*175 - 5*30 + 5 = 1698.75
    expect(calcularTMB({ sexo: 'M', edad: 30, peso: 75, talla: 175 })).toBeCloseTo(1698.75)
  })

  it('mujer 30 años 65 kg 162 cm', () => {
    // 10*65 + 6.25*162 - 5*30 - 161 = 1351.5
    expect(calcularTMB({ sexo: 'F', edad: 30, peso: 65, talla: 162 })).toBeCloseTo(1351.5)
  })

  it('hombre y mujer difieren en 166 kcal con mismos datos', () => {
    const base = { edad: 40, peso: 70, talla: 170 }
    const m = calcularTMB({ ...base, sexo: 'M' })
    const f = calcularTMB({ ...base, sexo: 'F' })
    expect(m - f).toBeCloseTo(166)
  })
})

describe('calcularTMB — Harris-Benedict', () => {
  it('hombre 35 años 80 kg 178 cm', () => {
    // 88.362 + 13.397*80 + 4.799*178 - 5.677*35
    const esperado = 88.362 + 13.397 * 80 + 4.799 * 178 - 5.677 * 35
    expect(calcularTMB({ sexo: 'M', edad: 35, peso: 80, talla: 178, formula: 'harris' })).toBeCloseTo(esperado)
  })

  it('mujer 35 años 65 kg 165 cm', () => {
    const esperado = 447.593 + 9.247 * 65 + 3.098 * 165 - 4.330 * 35
    expect(calcularTMB({ sexo: 'F', edad: 35, peso: 65, talla: 165, formula: 'harris' })).toBeCloseTo(esperado)
  })
})

describe('calcularTMB — Katch-McArdle', () => {
  it('80 kg con 15% grasa corporal', () => {
    // 370 + 21.6 * (80 * 0.85) = 370 + 1468.8 = 1838.8
    expect(calcularTMB({ sexo: 'M', edad: 30, peso: 80, talla: 175, pctGrasa: 15, formula: 'katch' })).toBeCloseTo(1838.8)
  })

  it('retorna null si no hay porcentaje de grasa', () => {
    expect(calcularTMB({ sexo: 'M', edad: 30, peso: 80, talla: 175, formula: 'katch' })).toBeNull()
  })
})

describe('calcularTMB — validación de entrada', () => {
  it('retorna null si falta edad', () => {
    expect(calcularTMB({ sexo: 'M', peso: 70, talla: 170 })).toBeNull()
  })

  it('retorna null si falta peso', () => {
    expect(calcularTMB({ sexo: 'M', edad: 30, talla: 170 })).toBeNull()
  })

  it('retorna null si falta talla', () => {
    expect(calcularTMB({ sexo: 'M', edad: 30, peso: 70 })).toBeNull()
  })

  it('acepta valores como string (inputs de formulario)', () => {
    const resultado = calcularTMB({ sexo: 'M', edad: '30', peso: '75', talla: '175' })
    expect(resultado).toBeCloseTo(1698.75)
  })
})

// ── calcularIMC ──────────────────────────────────────────────────────────────

describe('calcularIMC — categorías', () => {
  it('24.5 → Normal (75 kg, 175 cm)', () => {
    const r = calcularIMC(75, 175)
    expect(r.valor).toBeCloseTo(24.5, 0)
    expect(r.categoria).toBe('Normal')
  })

  it('17.3 → Bajo peso (50 kg, 170 cm)', () => {
    const r = calcularIMC(50, 170)
    expect(r.categoria).toBe('Bajo peso')
  })

  it('27.6 → Sobrepeso (80 kg, 170 cm)', () => {
    const r = calcularIMC(80, 170)
    expect(r.categoria).toBe('Sobrepeso')
  })

  it('34.2 → Obesidad I (98 kg, 169 cm)', () => {
    const r = calcularIMC(98, 169)
    expect(r.categoria).toBe('Obesidad I')
  })

  it('38+ → Obesidad II (112 kg, 170 cm)', () => {
    const r = calcularIMC(112, 170)   // IMC ≈ 38.8
    expect(r.categoria).toBe('Obesidad II')
  })

  it('40+ → Obesidad III (120 kg, 170 cm)', () => {
    const r = calcularIMC(120, 170)   // IMC ≈ 41.5
    expect(r.categoria).toBe('Obesidad III')
  })
})

describe('calcularIMC — validación de entrada', () => {
  it('retorna null si falta peso', () => {
    expect(calcularIMC(null, 170)).toBeNull()
  })

  it('retorna null si falta talla', () => {
    expect(calcularIMC(75, null)).toBeNull()
  })

  it('retorna null con ceros', () => {
    expect(calcularIMC(0, 170)).toBeNull()
  })

  it('acepta string (inputs de formulario)', () => {
    const r = calcularIMC('75', '175')
    expect(r).not.toBeNull()
    expect(r.valor).toBeCloseTo(24.5, 0)
  })

  it('valor tiene exactamente 1 decimal', () => {
    const r = calcularIMC(75, 175)
    const decimals = r.valor.toString().split('.')[1]?.length ?? 0
    expect(decimals).toBeLessThanOrEqual(1)
  })
})
