import { useRef, useState, useEffect } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import PlantillaModerna from '../../auth/components/plantillas/PlantillaModerna'
import PlantillaClinica from '../../auth/components/plantillas/PlantillaClinica'
import PlantillaSimple from '../../auth/components/plantillas/PlantillaSimple'
import PlantillaEsquinas from '../../auth/components/plantillas/PlantillaEsquinas'
import PlantillaOlaOscuro from '../../auth/components/plantillas/PlantillaOlaOscuro'
import PlantillaZigzag from '../../auth/components/plantillas/PlantillaZigzag'
import PlantillaTicket from '../../auth/components/plantillas/PlantillaTicket'
import PlantillaPastel from '../../auth/components/plantillas/PlantillaPastel'
import PlantillaFranja from '../../auth/components/plantillas/PlantillaFranja'
import PlantillaLateral from '../../auth/components/plantillas/PlantillaLateral'
import PlantillaBloques from '../../auth/components/plantillas/PlantillaBloques'
import PlantillaSello from '../../auth/components/plantillas/PlantillaSello'
import { COLORES_PDF } from '../../../config/plantillas.config'

const COMPONENTES = {
  moderna:     PlantillaModerna,
  clinica:     PlantillaClinica,
  minimalista: PlantillaSimple,
  esquinas:    PlantillaEsquinas,
  olaOscuro:   PlantillaOlaOscuro,
  zigzag:      PlantillaZigzag,
  ticket:      PlantillaTicket,
  pastel:      PlantillaPastel,
  franja:      PlantillaFranja,
  lateral:     PlantillaLateral,
  bloques:     PlantillaBloques,
  sello:       PlantillaSello,
}

// Altura aproximada en unidades SVG que ocupa cada sección
const ALTO_HEADER    = 110  // header + macros + resumen
const ALTO_TIEMPO    = 18   // título del tiempo de comida + tabla header
const ALTO_ALIMENTO  = 9    // cada fila de alimento
const ALTO_FOOTER    = 20   // footer
const ALTO_PAGINA    = 297  // viewBox height

// Divide los tiempos en páginas SVG según el espacio disponible
function dividirEnPaginas(tiempos) {
  const paginas = []
  let paginaActual = []
  let yUsado = ALTO_HEADER

  for (const tiempo of tiempos) {
    const altoTiempo = ALTO_TIEMPO + tiempo.alimentos.length * ALTO_ALIMENTO
    if (yUsado + altoTiempo + ALTO_FOOTER > ALTO_PAGINA && paginaActual.length > 0) {
      paginas.push(paginaActual)
      paginaActual = []
      yUsado = 30 // en páginas siguientes el header es más pequeño
    }
    // Si un solo tiempo no cabe, partimos sus alimentos
    if (altoTiempo + ALTO_FOOTER > ALTO_PAGINA - yUsado) {
      const alimentosPorPagina = Math.floor((ALTO_PAGINA - yUsado - ALTO_FOOTER - ALTO_TIEMPO) / ALTO_ALIMENTO)
      const partes = []
      for (let i = 0; i < tiempo.alimentos.length; i += Math.max(1, alimentosPorPagina)) {
        partes.push({ ...tiempo, alimentos: tiempo.alimentos.slice(i, i + alimentosPorPagina) })
      }
      for (const parte of partes) {
        const altoParte = ALTO_TIEMPO + parte.alimentos.length * ALTO_ALIMENTO
        if (yUsado + altoParte + ALTO_FOOTER > ALTO_PAGINA && paginaActual.length > 0) {
          paginas.push(paginaActual)
          paginaActual = []
          yUsado = 30
        }
        paginaActual.push(parte)
        yUsado += altoParte
      }
    } else {
      paginaActual.push(tiempo)
      yUsado += altoTiempo
    }
  }

  if (paginaActual.length > 0) paginas.push(paginaActual)
  return paginas.length > 0 ? paginas : [[]]
}

function adaptarDia(dia, planBase, nombrePlan) {
  const tiempos = (dia.tiempos || []).filter(t => t.alimentos?.length > 0)
  const totales = tiempos.flatMap(t => t.alimentos).reduce(
    (acc, a) => {
      acc.proteina      += a.nutrientes?.proteina      || 0
      acc.carbohidratos += a.nutrientes?.carbohidratos || 0
      acc.grasa         += a.nutrientes?.grasa_total   || 0
      return acc
    },
    { proteina: 0, carbohidratos: 0, grasa: 0 }
  )

  return {
    nutriologo: { nombre: '', consultorio: '', cedula: '' },
    paciente:   { nombre: '' },
    plan: {
      nombre:       `${nombrePlan || planBase.nombre || 'Plan'} — ${dia.nombre}`,
      fecha:        new Date().toLocaleDateString('es-MX'),
      vct_objetivo: planBase.vct_objetivo || 0,
    },
    macros: {
      proteina:      { g: totales.proteina.toFixed(1) },
      carbohidratos: { g: totales.carbohidratos.toFixed(1) },
      grasa:         { g: totales.grasa.toFixed(1) },
    },
    tiempos: tiempos.map(t => ({
      nombre: t.nombre,
      kcal:   t.alimentos.reduce((s, a) => s + (a.nutrientes?.energia_kcal || 0), 0).toFixed(0),
      alimentos: t.alimentos.map(a => ({
        nombre:   a.descripcion || '',
        porcion:  a.porcion_medida_nombre
          ? `${a.porcion_medida_nombre} (${a.porcion_gramos}g)`
          : `${a.porcion_gramos}g`,
        kcal:     a.nutrientes?.energia_kcal?.toFixed(0)  || '0',
        proteina: a.nutrientes?.proteina?.toFixed(1)      || '0',
        carbs:    a.nutrientes?.carbohidratos?.toFixed(1) || '0',
        grasa:    a.nutrientes?.grasa_total?.toFixed(1)   || '0',
      })),
    })),
  }
}

function adaptarSemanalUnico(plan, nombrePlan) {
  const contenido = plan.contenido || plan
  const tiempos = (contenido.tiempos || []).filter(t => t.alimentos?.length > 0)
  const totales = tiempos.flatMap(t => t.alimentos).reduce(
    (acc, a) => {
      acc.proteina      += a.nutrientes?.proteina      || 0
      acc.carbohidratos += a.nutrientes?.carbohidratos || 0
      acc.grasa         += a.nutrientes?.grasa_total   || 0
      return acc
    },
    { proteina: 0, carbohidratos: 0, grasa: 0 }
  )

  return {
    nutriologo: { nombre: '', consultorio: '', cedula: '' },
    paciente:   { nombre: '' },
    plan: {
      nombre:       nombrePlan || contenido.nombre || 'Plan Nutricional',
      fecha:        new Date().toLocaleDateString('es-MX'),
      vct_objetivo: contenido.vct_objetivo || plan.vct_objetivo || 0,
    },
    macros: {
      proteina:      { g: totales.proteina.toFixed(1) },
      carbohidratos: { g: totales.carbohidratos.toFixed(1) },
      grasa:         { g: totales.grasa.toFixed(1) },
    },
    tiempos: tiempos.map(t => ({
      nombre: t.nombre,
      kcal:   t.alimentos.reduce((s, a) => s + (a.nutrientes?.energia_kcal || 0), 0).toFixed(0),
      alimentos: t.alimentos.map(a => ({
        nombre:   a.descripcion || '',
        porcion:  a.porcion_medida_nombre
          ? `${a.porcion_medida_nombre} (${a.porcion_gramos}g)`
          : `${a.porcion_gramos}g`,
        kcal:     a.nutrientes?.energia_kcal?.toFixed(0)  || '0',
        proteina: a.nutrientes?.proteina?.toFixed(1)      || '0',
        carbs:    a.nutrientes?.carbohidratos?.toFixed(1) || '0',
        grasa:    a.nutrientes?.grasa_total?.toFixed(1)   || '0',
      })),
    })),
  }
}

// Genera la lista de { datos, etiqueta } a renderizar — una entrada por página SVG
function generarPaginas(plan, nombrePlan) {
  const contenido = plan.contenido || plan

  if (contenido.modo === 'por_dia') {
    const paginas = []
    for (const dia of contenido.dias || []) {
      const datosDia = adaptarDia(dia, contenido, nombrePlan)
      const subpaginas = dividirEnPaginas(datosDia.tiempos)
      subpaginas.forEach((tiemposPagina, i) => {
        paginas.push({
          datos: { ...datosDia, tiempos: tiemposPagina },
          etiqueta: i === 0 ? dia.nombre : `${dia.nombre} (cont.)`,
        })
      })
    }
    return paginas
  } else {
    const datos = adaptarSemanalUnico(plan, nombrePlan)
    const subpaginas = dividirEnPaginas(datos.tiempos)
    return subpaginas.map((tiemposPagina, i) => ({
      datos: { ...datos, tiempos: tiemposPagina },
      etiqueta: i === 0 ? 'Plan' : `Plan (cont. ${i + 1})`,
    }))
  }
}

export function useExportarPDF() {
  const ref = useRef(null)
  const [config, setConfig] = useState(null)
  const [paginaActual, setPaginaActual] = useState(0)
  const pdfRef = useRef(null)
  const paginasRef = useRef([])
  const resolverRef = useRef(null)

  const exportar = ({ plan, nombrePlan, plantillaId, colorId, logoBase64, posicionLogo }) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve
      const paginas = generarPaginas(plan, nombrePlan)
      paginasRef.current = paginas
      pdfRef.current = null
      setPaginaActual(0)
      setConfig({ plan, nombrePlan, plantillaId, colorId, logoBase64, posicionLogo, paginas })
    })
  }

    const capturar = async () => {
    if (!ref.current || !config) return

    const canvas = await html2canvas(ref.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.85)

    if (!pdfRef.current) {
        pdfRef.current = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    } else {
        pdfRef.current.addPage()
    }

    pdfRef.current.addImage(imgData, 'JPEG', 0, 0, 210, 297)

    const siguientePagina = paginaActual + 1
    if (siguientePagina < paginasRef.current.length) {
        setPaginaActual(siguientePagina)
    } else {
        const nombre = (config.nombrePlan || config.plan?.nombre || 'plan').replace(/\s+/g, '_')
        pdfRef.current.save(`${nombre}_${new Date().toISOString().split('T')[0]}.pdf`)
        setConfig(null)
        setPaginaActual(0)
        pdfRef.current = null
        resolverRef.current?.()
    }
    }

  return { ref, config, paginaActual, exportar, capturar }
}

export function PlantillaOffscreen({ containerRef, config, paginaActual, onListo }) {
  useEffect(() => {
    if (config) {
      const id = setTimeout(() => onListo(), 200)
      return () => clearTimeout(id)
    }
  }, [config, paginaActual])

  if (!config) return null

  const paginas = config.paginas || []
  const paginaData = paginas[paginaActual]
  if (!paginaData) return null

  const Componente = COMPONENTES[config.plantillaId] || PlantillaModerna
  const colorObj   = COLORES_PDF.find(c => c.id === config.colorId) || COLORES_PDF[0]

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1, pointerEvents: 'none' }}
    >
      <Componente
        escala={4}
        color={colorObj.hex}
        colorBg={colorObj.hex + '18'}
        colorBorder={colorObj.hex + '60'}
        logo={config.logoBase64}
        posicionLogo={config.posicionLogo}
        datos={paginaData.datos}
      />
    </div>
  )
}