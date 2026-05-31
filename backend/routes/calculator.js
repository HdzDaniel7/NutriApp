const express = require('express')
const router = express.Router()
const { calcularTMB, calcularGET, calcularMacros, calcularIMC } = require('../config/formulas.config')

// Calcular requerimientos completos
router.post('/calcular', (req, res) => {
  const { sexo, edad, peso, talla, pctGrasa, factorActividad, objetivo, distribucionMacros } = req.body

  if (!sexo || !edad || !peso || !talla || !factorActividad) {
    return res.status(400).json({ error: 'Faltan datos requeridos: sexo, edad, peso, talla, factorActividad' })
  }

  try {
    const tmb = calcularTMB({ sexo, edad, peso, talla, pctGrasa })
    const get = calcularGET({ tmb, factorActividad })
    const vct = get + (objetivo || 0)
    const macros = calcularMacros({ vct, distribucionMacros, peso })
    const imc = calcularIMC({ peso, talla })

    res.json({ tmb, get, vct, macros, imc })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router