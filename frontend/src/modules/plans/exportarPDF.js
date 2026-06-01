import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ─────────────────────────────────────────────
// EXPORTAR PLAN NUTRICIONAL A PDF
// Recibe el objeto plan completo y datos del paciente
// ─────────────────────────────────────────────

export function exportarPlanPDF({ plan, paciente = null }) {
  const doc = new jsPDF()
  const margen = 15
  let y = margen

  // ── Colores ──────────────────────────────────
  const verde = [22, 163, 74]
  const gris  = [120, 113, 108]
  const negro = [28, 25, 23]

  // ── Header ───────────────────────────────────
  doc.setFillColor(...verde)
  doc.rect(0, 0, 210, 22, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('NutriApp', margen, 14)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Plan Nutricional', 210 - margen, 14, { align: 'right' })

  y = 32

  // ── Nombre del plan ───────────────────────────
  doc.setTextColor(...negro)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(plan.nombre || 'Plan Nutricional', margen, y)
  y += 8

  // ── Datos del paciente ────────────────────────
  if (paciente) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...gris)
    const nombreCompleto = `${paciente.nombre} ${paciente.apellido || ''}`.trim()
    doc.text(`Paciente: ${nombreCompleto}`, margen, y)
    y += 6

    const infoExtra = []
    if (paciente.email)    infoExtra.push(`Email: ${paciente.email}`)
    if (paciente.telefono) infoExtra.push(`Tel: ${paciente.telefono}`)
    if (paciente.sexo)     infoExtra.push(paciente.sexo === 'M' ? 'Masculino' : 'Femenino')
    if (paciente.fecha_nacimiento) {
        const edad = Math.floor((new Date() - new Date(paciente.fecha_nacimiento)) / (1000 * 60 * 60 * 24 * 365.25))
        infoExtra.push(`${edad} años`)
    }

    if (infoExtra.length > 0) {
        doc.setFontSize(9)
        doc.text(infoExtra.join('  ·  '), margen, y)
        y += 6
    }
  }

  // ── Fecha ─────────────────────────────────────
  doc.setFontSize(10)
  doc.setTextColor(...gris)
  const fechaExport = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
  const fechaCreacion = plan.fecha_creacion
    ? new Date(plan.fecha_creacion).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

    if (fechaCreacion) {
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}`, margen, y)
  y += 10

  // ── Resumen calórico ──────────────────────────
  doc.setDrawColor(...verde)
  doc.setLineWidth(0.5)
  doc.line(margen, y, 210 - margen, y)
  y += 6

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...negro)
  doc.text('Resumen Calórico', margen, y)
  y += 6

  const contenido = plan.contenido || plan
  const tiempos = contenido.tiempos || []

  // Calcular totales
  let totalKcal = 0, totalProt = 0, totalCarb = 0, totalGrasa = 0, totalFibra = 0
  tiempos.forEach(t => {
    t.alimentos?.forEach(a => {
      totalKcal  += a.nutrientes?.energia_kcal  || 0
      totalProt  += a.nutrientes?.proteina       || 0
      totalCarb  += a.nutrientes?.carbohidratos  || 0
      totalGrasa += a.nutrientes?.grasa_total    || 0
      totalFibra += a.nutrientes?.fibra_dietetica_total || 0
    })
  })

  const vct = contenido.vct_objetivo || plan.vct_objetivo || 0

  autoTable(doc, {
    startY: y,
    head: [['Objetivo (kcal)', 'Total Plan (kcal)', 'Proteína (g)', 'Carbohidratos (g)', 'Grasa (g)', 'Fibra (g)']],
    body: [[
      Math.round(vct),
      Math.round(totalKcal),
      Math.round(totalProt),
      Math.round(totalCarb),
      Math.round(totalGrasa),
      Math.round(totalFibra),
    ]],
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: verde, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 244] },
    margin: { left: margen, right: margen },
  })

  y = doc.lastAutoTable.finalY + 10

  // ── Tiempos de comida ─────────────────────────
  tiempos.forEach(tiempo => {
    if (!tiempo.alimentos || tiempo.alimentos.length === 0) return

    // Verificar espacio en página
    if (y > 250) {
      doc.addPage()
      y = margen
    }

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...verde)
    doc.text(tiempo.nombre, margen, y)
    y += 4

    // Calcular kcal del tiempo
    const kcalTiempo = tiempo.alimentos.reduce((acc, a) => acc + (a.nutrientes?.energia_kcal || 0), 0)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...gris)
    doc.text(`${Math.round(kcalTiempo)} kcal`, margen, y)
    y += 4

    const filas = tiempo.alimentos.map(a => [
      a.descripcion || '',
      a.porcion_medida_nombre
        ? `${a.porcion_medida_nombre} (${a.porcion_gramos}g)`
        : `${a.porcion_gramos}g`,
      a.nutrientes?.energia_kcal  != null ? `${a.nutrientes.energia_kcal} kcal` : '—',
      a.nutrientes?.proteina       != null ? `${a.nutrientes.proteina}g`        : '—',
      a.nutrientes?.carbohidratos  != null ? `${a.nutrientes.carbohidratos}g`   : '—',
      a.nutrientes?.grasa_total    != null ? `${a.nutrientes.grasa_total}g`     : '—',
    ])

    autoTable(doc, {
      startY: y,
      head: [['Alimento', 'Porción', 'Energía', 'Proteína', 'Carbohidratos', 'Grasa']],
      body: filas,
      styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
      headStyles: { fillColor: [240, 253, 244], textColor: negro, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [250, 250, 249] },

      margin: { left: 14, right: 14 },
      tableWidth: 'auto',
    })

    y = doc.lastAutoTable.finalY + 8
  })

  // ── Footer ────────────────────────────────────
  const totalPaginas = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(...gris)
    doc.text(
      `NutriApp · Página ${i} de ${totalPaginas}`,
      210 / 2, 290,
      { align: 'center' }
    )
  }

  // ── Guardar ───────────────────────────────────
  const nombreArchivo = `${(plan.nombre || 'plan').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(nombreArchivo)
}}