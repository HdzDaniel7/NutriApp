import { DATOS_EJEMPLO } from '../datosEjemploPDF'

export default function PlantillaTicket({color, colorBg, colorBorder, logo, posicionLogo, escala = 0.38, datos = null,}) {
  const D = datos || DATOS_EJEMPLO
  const W = 210, H = 297

  const getPosLogo = () => {
    const lw = 40, lh = 25
    if (posicionLogo === 'superior_derecha')   return { x: W - 20 - lw, y: 4 }
    if (posicionLogo === 'superior_izquierda') return { x: 15, y: 4 }
    if (posicionLogo === 'inferior_derecha')   return { x: W - 20 - lw, y: H - lh - 4 }
    if (posicionLogo === 'inferior_izquierda') return { x: 15, y: H - lh - 4 }
    return { x: W - 20 - lw, y: 4 }
  }

  const logoPos = getPosLogo()

  // Margen interior del "ticket" (bordes punteados laterales)
  const MX = 10  // margen lateral del borde punteado
  const IW = W - MX * 2  // ancho interior del ticket

  // Genera una línea punteada horizontal
  const DashedLine = ({ y, x1 = MX, x2 = W - MX }) => (
    <line x1={x1} y1={y} x2={x2} y2={y} stroke={colorBorder} strokeWidth="0.6" strokeDasharray="3,2" />
  )

  // Genera los bordes punteados verticales (izquierdo y derecho)
  const VerticalDashes = () => {
    const dashes = []
    for (let y = 24; y < H - 10; y += 5) {
      dashes.push(<line key={`l${y}`} x1={MX} y1={y} x2={MX} y2={y + 3} stroke={colorBorder} strokeWidth="0.6" />)
      dashes.push(<line key={`r${y}`} x1={W - MX} y1={y} x2={W - MX} y2={y + 3} stroke={colorBorder} strokeWidth="0.6" />)
    }
    return <>{dashes}</>
  }

  // Semicírculos de perforación (izquierdo y derecho) en una posición Y dada
  const Perforacion = ({ y }) => (
    <>
      <path d={`M ${MX} ${y - 4} A 4 4 0 0 1 ${MX} ${y + 4}`} fill="white" stroke={colorBorder} strokeWidth="0.6" />
      <path d={`M ${W - MX} ${y - 4} A 4 4 0 0 0 ${W - MX} ${y + 4}`} fill="white" stroke={colorBorder} strokeWidth="0.6" />
    </>
  )

  // Ola de sierra en el footer (dientes de sierra)
  const FooterWave = ({ y }) => {
    const pts = []
    for (let x = 0; x <= W; x += 6) {
      pts.push(`${x},${y}`)
      pts.push(`${x + 3},${y + 5}`)
    }
    pts.push(`${W},${H}`, `0,${H}`)
    return <polygon points={pts.join(' ')} fill={color} />
  }

  return (
    <div style={{ width: W * escala, height: H * escala, overflow: 'hidden', borderRadius: 4, border: '1px solid #e4e4e7', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', background: '#fff' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W * escala} height={H * escala} style={{ display: 'block' }}>

        {/* ── HEADER SÓLIDO ── */}
        <rect x="0" y="0" width={W} height="24" fill={color} />
        <text x={W / 2} y="11" fontSize="11" fontWeight="bold" fill="white" fontFamily="helvetica" textAnchor="middle">NutriDesk</text>
        <text x={W / 2} y="18" fontSize="4.5" fill="rgba(255,255,255,0.75)" fontFamily="helvetica" textAnchor="middle" letterSpacing="1.5">PLAN NUTRICIONAL</text>

        {/* Logo */}
        {logo && (
          <image href={logo} x={logoPos.x} y={Math.min(logoPos.y, H - 30)} width="40" height="25" preserveAspectRatio="xMidYMid meet" />
        )}

        {/* ── BORDES PUNTEADOS VERTICALES ── */}
        <VerticalDashes />

        {/* ── BLOQUE DATOS PACIENTE ── */}
        <text x={W / 2} y="33" fontSize="4.5" fill="#71717a" fontFamily="helvetica" textAnchor="middle" letterSpacing="0.8">PACIENTE</text>
        <text x={W / 2} y="40" fontSize="8" fontWeight="bold" fill="#18181b" fontFamily="helvetica" textAnchor="middle">{D.paciente.nombre}</text>
        <text x={W / 2} y="46" fontSize="4.5" fill="#71717a" fontFamily="helvetica" textAnchor="middle">{D.plan.nombre} · {D.plan.fecha}</text>

        {/* Médico */}
        <text x={W / 2} y="52" fontSize="4" fill="#71717a" fontFamily="helvetica" textAnchor="middle">{D.nutriologo.nombre} · Cédula: {D.nutriologo.cedula}</text>

        {/* Perforación + divisor */}
        <Perforacion y={57} />
        <DashedLine y={57} x1={MX + 4} x2={W - MX - 4} />

        {/* ── RESUMEN CALÓRICO ── */}
        <text x={W / 2} y="65" fontSize="4.5" fill="#71717a" fontFamily="helvetica" textAnchor="middle" letterSpacing="0.8">RESUMEN CALÓRICO</text>

        {[
          { label: 'Objetivo', val: `${D.plan.vct_objetivo}`, unit: 'kcal' },
          { label: 'Proteína',      val: `${D.macros.proteina.g}`,      unit: 'g' },
          { label: 'Carbohidratos', val: `${D.macros.carbohidratos.g}`, unit: 'g' },
          { label: 'Grasa',         val: `${D.macros.grasa.g}`,         unit: 'g' },
        ].map(({ label, val, unit }, i) => {
          const bx = MX + 2 + i * (IW / 4)
          const bw = IW / 4 - 2
          return (
            <g key={label}>
              <rect x={bx} y="67" width={bw} height="18" rx="2" fill={colorBg} />
              <text x={bx + bw / 2} y="73" fontSize="4" fill="#71717a" fontFamily="helvetica" textAnchor="middle">{label}</text>
              <text x={bx + bw / 2} y="80" fontSize="7" fontWeight="bold" fill="#18181b" fontFamily="helvetica" textAnchor="middle">{val}</text>
              <text x={bx + bw / 2} y="83.5" fontSize="3.5" fill="#71717a" fontFamily="helvetica" textAnchor="middle">{unit}</text>
            </g>
          )
        })}

        {/* Perforación + divisor */}
        <Perforacion y={90} />
        <DashedLine y={90} x1={MX + 4} x2={W - MX - 4} />

        {/* ── DETALLE ALIMENTOS (tabla tipo ticket) ── */}
        {/* Encabezado de columnas */}
        <text x={MX + 3} y="98" fontSize="4.5" fontWeight="bold" fill="#71717a" fontFamily="helvetica" letterSpacing="0.5">ALIMENTO</text>
        <text x={W - MX - 3} y="98" fontSize="4.5" fontWeight="bold" fill="#71717a" fontFamily="helvetica" textAnchor="end" letterSpacing="0.5">KCAL</text>
        <line x1={MX + 2} y1="100" x2={W - MX - 2} y2="100" stroke="#e4e4e7" strokeWidth="0.5" />

        {(() => {
          let currentY = 102
          const rows = []

          D.tiempos.forEach((tiempo) => {
            // Cabecera de tiempo
            rows.push(
              <g key={`header-${tiempo.nombre}`}>
                <rect x={MX + 2} y={currentY} width={IW - 4} height="9" fill={color} rx="1" />
                <text x={MX + 5} y={currentY + 6.5} fontSize="5" fontWeight="bold" fill="white" fontFamily="helvetica">
                  {tiempo.nombre}
                </text>
                <text x={W - MX - 4} y={currentY + 6.5} fontSize="5" fill="rgba(255,255,255,0.85)" fontFamily="helvetica" textAnchor="end">
                  {tiempo.kcal} kcal
                </text>
              </g>
            )
            currentY += 9

            // Filas de alimentos
            tiempo.alimentos.forEach((a, ai) => {
              rows.push(
                <g key={`${tiempo.nombre}-${a.nombre}`}>
                  <rect x={MX + 2} y={currentY} width={IW - 4} height="10" fill={ai % 2 === 0 ? colorBg : '#fff'} />
                  <text x={MX + 5} y={currentY + 6} fontSize="4" fill="#18181b" fontFamily="helvetica">{a.nombre}</text>
                  <text x={MX + 5} y={currentY + 9.5} fontSize="3.5" fill="#71717a" fontFamily="helvetica">{a.porcion} · P:{a.proteina}g C:{a.carbs}g G:{a.grasa}g</text>
                  <text x={W - MX - 4} y={currentY + 6.5} fontSize="5" fontWeight="bold" fill="#18181b" fontFamily="helvetica" textAnchor="end">{a.kcal}</text>
                </g>
              )
              currentY += 10
            })
          })

          // Total general
          const totalKcal = D.tiempos.reduce((sum, t) => sum + t.kcal, 0)
          rows.push(
            <g key="total">
              <line x1={MX + 2} y1={currentY + 1} x2={W - MX - 2} y2={currentY + 1} stroke={color} strokeWidth="0.8" strokeDasharray="2,1.5" />
              <text x={MX + 5} y={currentY + 8} fontSize="5.5" fontWeight="bold" fill="#18181b" fontFamily="helvetica">TOTAL</text>
              <text x={W - MX - 4} y={currentY + 8} fontSize="6" fontWeight="bold" fill={color} fontFamily="helvetica" textAnchor="end">{totalKcal} kcal</text>
            </g>
          )

          return rows
        })()}

        {/* ── FOOTER OLA DE SIERRA ── */}
        <FooterWave y={H - 13} />
        <text x={W / 2} y={H - 4} fontSize="4" fill="rgba(255,255,255,0.85)" fontFamily="helvetica" textAnchor="middle">
          {D.nutriologo.consultorio} · Página 1
        </text>

      </svg>
    </div>
  )
}