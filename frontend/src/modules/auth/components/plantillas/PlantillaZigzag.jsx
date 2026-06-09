import { DATOS_EJEMPLO } from '../datosEjemploPDF'

export default function PlantillaZigzag({color, colorBg, colorBorder, logo, posicionLogo, escala = 0.38, datos = null,}) {
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

  // Generar puntos del zigzag en la franja derecha
  // Franja de 10px de ancho en x = W-10 a W
  const zigW = 10
  const step = 18  // altura de cada diente
  const zigPoints = () => {
    const pts = []
    let y = 0
    while (y <= H) {
      pts.push(`${W - zigW},${y}`)
      pts.push(`${W},${y + step / 2}`)
      y += step
    }
    pts.push(`${W - zigW},${H}`)
    pts.push(`${W},${H}`)
    pts.push(`${W},0`)
    return pts.join(' ')
  }

  return (
    <div style={{ width: W * escala, height: H * escala, overflow: 'hidden', borderRadius: 4, border: '1px solid #e4e4e7', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', background: '#fff' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W * escala} height={H * escala} style={{ display: 'block' }}>

        {/* ── FRANJA ZIGZAG LATERAL DERECHA ── */}
        <polygon points={zigPoints()} fill={color} />

        {/* Texto vertical en franja */}
        <text
          x={W - 3}
          y={H / 2}
          fontSize="5"
          fontWeight="bold"
          fill="white"
          fontFamily="helvetica"
          textAnchor="middle"
          transform={`rotate(-90, ${W - 3}, ${H / 2})`}
          opacity="0.7"
        >
          NutriDesk · Plan Nutricional
        </text>

        {/* ── HEADER ── */}
        <text x="15" y="14" fontSize="11" fontWeight="bold" fill={color} fontFamily="helvetica">NutriDesk</text>
        <text x="15" y="21" fontSize="5" fill="#71717a" fontFamily="helvetica">{D.nutriologo.consultorio}</text>

        {/* Logo */}
        {logo && (
          <image href={logo} x={logoPos.x} y={Math.min(logoPos.y, 4)} width="40" height="25" preserveAspectRatio="xMidYMid meet" />
        )}

        {/* Línea acento */}
        <rect x="15" y="24" width="28" height="2" rx="1" fill={color} />
        <line x1="45" y1="25" x2={W - zigW - 4} y2="25" stroke="#e4e4e7" strokeWidth="0.5" />

        {/* ── DATOS PACIENTE ── */}
        <text x="15" y="33" fontSize="5" fill="#71717a" fontFamily="helvetica">
          Paciente: <tspan fontWeight="bold" fill="#18181b">{D.paciente.nombre}</tspan>
        </text>
        <text x="15" y="39" fontSize="5" fill="#71717a" fontFamily="helvetica">
          Fecha: <tspan fontWeight="bold" fill="#18181b">{D.plan.fecha}</tspan>
        </text>
        <text x="15" y="45" fontSize="5" fill="#71717a" fontFamily="helvetica">
          Médico: <tspan fontWeight="bold" fill="#18181b">{D.nutriologo.nombre}</tspan>
        </text>

        {/* Banner nombre plan */}
        <rect x="15" y="49" width={W - zigW - 20} height="10" fill={colorBg} rx="1" />
        <text x={(W - zigW) / 2 + 7} y="56.5" fontSize="6.5" fontWeight="bold" fill={color} fontFamily="helvetica" textAnchor="middle">
          {D.plan.nombre}
        </text>

        {/* ── RESUMEN (tarjetas 3 cols) ── */}
        <text x="15" y="67" fontSize="5" fontWeight="bold" fill="#18181b" fontFamily="helvetica">RESUMEN NUTRICIONAL</text>
        {[
          { label: 'Objetivo', val: `${D.plan.vct_objetivo} kcal` },
          { label: 'Proteína',      val: `${D.macros.proteina.g}g` },
          { label: 'Carbohidratos', val: `${D.macros.carbohidratos.g}g` },
          { label: 'Grasa',         val: `${D.macros.grasa.g}g` },
        ].map(({ label, val }, i) => {
          const bx = 15 + i * 43
          return (
            <g key={label}>
              <rect x={bx} y="69" width="41" height="16" rx="2" fill={colorBg} />
              <text x={bx + 20.5} y="75" fontSize="4" fill="#71717a" fontFamily="helvetica" textAnchor="middle">{label}</text>
              <text x={bx + 20.5} y="82" fontSize="6" fontWeight="bold" fill="#18181b" fontFamily="helvetica" textAnchor="middle">{val}</text>
            </g>
          )
        })}

        {/* ── TIEMPOS DE COMIDA ── */}
        {D.tiempos.map((tiempo, ti) => {
          const yBase = 94 + ti * 62
          return (
            <g key={tiempo.nombre}>
              <text x="15" y={yBase} fontSize="6" fontWeight="bold" fill={color} fontFamily="helvetica">
                {tiempo.nombre} — {tiempo.kcal} kcal
              </text>
              <line x1="15" y1={yBase + 2} x2={W - zigW - 5} y2={yBase + 2} stroke={colorBorder} strokeWidth="0.5" />

              {/* Cabecera tabla */}
              <rect x="15" y={yBase + 4} width={W - zigW - 20} height="7" fill={color} />
              {['Alimento', 'Porción', 'kcal', 'Prot.', 'C', 'G'].map((h, i) => (
                <text key={h} x={15 + [0, 55, 95, 118, 135, 148][i]} y={yBase + 9.5}
                  fontSize="4" fontWeight="bold" fill="white" fontFamily="helvetica">{h}</text>
              ))}

              {/* Filas */}
              {tiempo.alimentos.map((a, ai) => {
                const yRow = yBase + 11 + ai * 9
                return (
                  <g key={a.nombre}>
                    <rect x="15" y={yRow} width={W - zigW - 20} height="9" fill={ai % 2 === 0 ? colorBg : '#fff'} />
                    <line x1="15" y1={yRow + 9} x2={W - zigW - 5} y2={yRow + 9} stroke="#e4e4e7" strokeWidth="0.3" />
                    <text x="16" y={yRow + 6} fontSize="4" fill="#18181b" fontFamily="helvetica">{a.nombre}</text>
                    <text x="70" y={yRow + 6} fontSize="3.5" fill="#71717a" fontFamily="helvetica">{a.porcion}</text>
                    <text x="97" y={yRow + 6} fontSize="4" fill="#18181b" fontFamily="helvetica">{a.kcal}</text>
                    <text x="120" y={yRow + 6} fontSize="4" fill="#18181b" fontFamily="helvetica">{a.proteina}g</text>
                    <text x="137" y={yRow + 6} fontSize="4" fill="#18181b" fontFamily="helvetica">{a.carbs}g</text>
                    <text x="150" y={yRow + 6} fontSize="4" fill="#18181b" fontFamily="helvetica">{a.grasa}g</text>
                  </g>
                )
              })}
            </g>
          )
        })}

        {/* ── FOOTER ── */}
        <line x1="15" y1={H - 14} x2={W - zigW - 5} y2={H - 14} stroke={color} strokeWidth="0.8" />
        <text x="15" y={H - 8} fontSize="4" fill="#71717a" fontFamily="helvetica">
          {D.nutriologo.nombre} · Cédula: {D.nutriologo.cedula}
        </text>
        <text x={W - zigW - 5} y={H - 8} fontSize="4" fill="#71717a" fontFamily="helvetica" textAnchor="end">
          Página 1
        </text>

      </svg>
    </div>
  )
}