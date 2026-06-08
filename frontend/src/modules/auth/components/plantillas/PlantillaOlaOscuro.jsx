import { DATOS_EJEMPLO as D } from '../datosEjemploPDF'

export default function PlantillaOlaOscuro({ color, colorBg, colorBorder, logo, posicionLogo, escala = 0.38 }) {
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

  // Derivar versión oscura del color principal para el header
  // Se usa el color tal cual para acentos, y un fondo oscuro fijo para el header
  const headerBg = '#3e3d3f'   // casi negro violeta
  const headerMid = '#4c4a4e'  // violeta oscuro medio

  return (
    <div style={{ width: W * escala, height: H * escala, overflow: 'hidden', borderRadius: 4, border: '1px solid #e4e4e7', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', background: '#fff' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W * escala} height={H * escala} style={{ display: 'block' }}>

        {/* ── HEADER ── */}
        <rect x="0" y="0" width={W} height="30" fill={headerBg} />

        {/* Nombre marca */}
        <text x="15" y="13" fontSize="11" fontWeight="bold" fill="#f3e8ff" fontFamily="helvetica">NutriDesk</text>
        <text x="15" y="20" fontSize="5" fill="#c084fc" fontFamily="helvetica" letterSpacing="1">{D.nutriologo.consultorio}</text>

        {/* Logo */}
        {logo && (
          <image href={logo} x={logoPos.x} y={logoPos.y} width="40" height="25" preserveAspectRatio="xMidYMid meet" />
        )}
        {!logo && (
          <rect x={logoPos.x} y={logoPos.y} width="40" height="18" rx="2" fill={headerMid} />
        )}

        {/* Datos paciente + plan en header */}
        <text x={W - 15} y="13" fontSize="7" fontWeight="bold" fill="#fff" fontFamily="helvetica" textAnchor="end">{D.paciente.nombre}</text>
        <text x={W - 15} y="20" fontSize="4.5" fill="#c084fc" fontFamily="helvetica" textAnchor="end">{D.plan.nombre} · {D.plan.fecha}</text>

        {/* ── MACROS BAR ── */}
        {[
          { label: 'Objetivo', val: `${D.plan.vct_objetivo} kcal`, x: 0 },
          { label: 'Proteína',     val: `${D.macros.proteina.g}g`,       x: 1 },
          { label: 'Carbohidratos',val: `${D.macros.carbohidratos.g}g`,  x: 2 },
          { label: 'Grasa',        val: `${D.macros.grasa.g}g`,          x: 3 },
        ].map(({ label, val, x: idx }) => {
          const bx = idx * (W / 4)
          return (
            <g key={label}>
              <rect x={bx} y="30" width={W / 4} height="14" fill={idx % 2 === 0 ? headerMid : headerBg} />
              <text x={bx + W / 8} y="35" fontSize="4.5" fill="#e9d5ff" fontFamily="helvetica" textAnchor="middle">{label}</text>
              <text x={bx + W / 8} y="41.5" fontSize="6" fontWeight="bold" fill="#fff" fontFamily="helvetica" textAnchor="middle">{val}</text>
            </g>
          )
        })}

        {/* ── DATOS CLÍNICOS (2 columnas) ── */}
        <text x="15" y="57" fontSize="5" fontWeight="bold" fill="#18181b" fontFamily="helvetica">DATOS DEL PACIENTE</text>
        <text x="15" y="63" fontSize="4.5" fill="#71717a" fontFamily="helvetica">Nombre: {D.paciente.nombre}</text>
        <text x="15" y="68" fontSize="4.5" fill="#71717a" fontFamily="helvetica">Fecha: {D.plan.fecha}</text>

        <text x="115" y="57" fontSize="5" fontWeight="bold" fill="#18181b" fontFamily="helvetica">MÉDICO RESPONSABLE</text>
        <text x="115" y="63" fontSize="4.5" fill="#71717a" fontFamily="helvetica">{D.nutriologo.nombre}</text>
        <text x="115" y="68" fontSize="4.5" fill="#71717a" fontFamily="helvetica">Cédula: {D.nutriologo.cedula}</text>

        {/* ── RESUMEN NUTRICIONAL ── */}
        <text x="15" y="77" fontSize="5" fontWeight="bold" fill="#18181b" fontFamily="helvetica">RESUMEN NUTRICIONAL</text>
        <rect x="15" y="79" width={W - 30} height="7" fill={color} rx="1" />
        {['Objetivo (kcal)', 'Proteína (g)', 'Carbohidratos (g)', 'Grasa (g)'].map((h, i) => (
          <text key={h} x={15 + i * 45} y="84.5" fontSize="4" fontWeight="bold" fill="white" fontFamily="helvetica">{h}</text>
        ))}
        <rect x="15" y="86" width={W - 30} height="8" fill="#fafafa" />
        {[D.plan.vct_objetivo, D.macros.proteina.g, D.macros.carbohidratos.g, D.macros.grasa.g].map((val, i) => (
          <text key={i} x={15 + i * 45 + 5} y="92" fontSize="5" fontWeight="bold" fill="#18181b" fontFamily="helvetica">{val}</text>
        ))}

        {/* ── TIEMPOS DE COMIDA ── */}
        {D.tiempos.map((tiempo, ti) => {
          const yBase = 101 + ti * 58
          return (
            <g key={tiempo.nombre}>
              {/* Título con acento izquierdo */}
              <rect x="15" y={yBase - 5} width="3" height="7" rx="1" fill={color} />
              <text x="21" y={yBase} fontSize="6" fontWeight="bold" fill={color} fontFamily="helvetica">
                {tiempo.nombre}
              </text>
              <text x={W - 15} y={yBase} fontSize="5.5" fill="#71717a" fontFamily="helvetica" textAnchor="end" fontWeight="bold">
                {tiempo.kcal} kcal
              </text>
              <line x1="21" y1={yBase + 2} x2={W - 15} y2={yBase + 2} stroke={colorBorder} strokeWidth="0.5" />

              {/* Cabecera tabla */}
              <rect x="15" y={yBase + 4} width={W - 30} height="7" fill={color} />
              {['Alimento', 'Porción', 'kcal', 'Prot.', 'Carbs', 'Grasa'].map((h, i) => (
                <text key={h} x={15 + [0, 65, 110, 135, 155, 173][i]} y={yBase + 9.5}
                  fontSize="4" fontWeight="bold" fill="white" fontFamily="helvetica">{h}</text>
              ))}

              {/* Filas */}
              {tiempo.alimentos.map((a, ai) => {
                const yRow = yBase + 11 + ai * 9
                return (
                  <g key={a.nombre}>
                    <rect x="15" y={yRow} width={W - 30} height="9" fill={ai % 2 === 0 ? colorBg : '#fff'} />
                    <line x1="15" y1={yRow + 9} x2={W - 15} y2={yRow + 9} stroke="#e4e4e7" strokeWidth="0.3" />
                    <text x="16" y={yRow + 6} fontSize="4" fill="#18181b" fontFamily="helvetica">{a.nombre}</text>
                    <text x="80" y={yRow + 6} fontSize="3.5" fill="#71717a" fontFamily="helvetica">{a.porcion}</text>
                    <text x="112" y={yRow + 6} fontSize="4" fill="#18181b" fontFamily="helvetica">{a.kcal}</text>
                    <text x="137" y={yRow + 6} fontSize="4" fill="#18181b" fontFamily="helvetica">{a.proteina}g</text>
                    <text x="157" y={yRow + 6} fontSize="4" fill="#18181b" fontFamily="helvetica">{a.carbs}g</text>
                    <text x="175" y={yRow + 6} fontSize="4" fill="#18181b" fontFamily="helvetica">{a.grasa}g</text>
                  </g>
                )
              })}
            </g>
          )
        })}

        {/* ── FOOTER CON OLA SVG ── */}
        {/* Ola cóncava que "sube" desde el fondo */}
        <path
          d={`M0,${H - 18} Q${W / 2},${H - 4} ${W},${H - 18} L${W},${H} L0,${H} Z`}
          fill={color}
        />
        <text x="15" y={H - 7} fontSize="4" fill="rgba(255,255,255,0.85)" fontFamily="helvetica">
          {D.nutriologo.nombre} · Cédula: {D.nutriologo.cedula}
        </text>
        <text x={W - 15} y={H - 7} fontSize="4" fill="rgba(255,255,255,0.85)" fontFamily="helvetica" textAnchor="end">
          Página 1
        </text>

      </svg>
    </div>
  )
}