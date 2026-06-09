import { DATOS_EJEMPLO } from '../datosEjemploPDF'

export default function PlantillaPastel({color, colorBg, colorBorder, logo, posicionLogo, escala = 0.38, datos = null,}) {
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

  // Genera círculos decorativos de fondo (confetti suave)
  const Confetti = () => {
    const circles = [
      { cx: 8,       cy: 8,       r: 5,   opacity: 0.25 },
      { cx: W - 8,   cy: 8,       r: 4,   opacity: 0.2  },
      { cx: 4,       cy: 60,      r: 3,   opacity: 0.15 },
      { cx: W - 5,   cy: 55,      r: 3.5, opacity: 0.18 },
      { cx: W - 6,   cy: H - 30, r: 4,   opacity: 0.15 },
      { cx: 6,       cy: H - 20, r: 3,   opacity: 0.18 },
    ]
    return (
      <>
        {circles.map((c, i) => (
          <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill={color} opacity={c.opacity} />
        ))}
      </>
    )
  }

  // Pequeños rombos decorativos
  const Rombos = () => {
    const items = [
      { x: W - 12, y: 36 },
      { x: W - 18, y: 44 },
      { x: W - 12, y: 52 },
    ]
    return (
      <>
        {items.map((it, i) => (
          <rect key={i} x={it.x} y={it.y} width="4" height="4" rx="0.5"
            fill={color} opacity={0.3} transform={`rotate(45, ${it.x + 2}, ${it.y + 2})`} />
        ))}
      </>
    )
  }

  return (
    <div style={{ width: W * escala, height: H * escala, overflow: 'hidden', borderRadius: 4, border: '1px solid #e4e4e7', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', background: '#fff' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W * escala} height={H * escala} style={{ display: 'block' }}>

        {/* ── FONDO DECORATIVO ── */}
        <Confetti />

        {/* ── BORDE SUPERIOR GRUESO CON PUNTOS ── */}
        <rect x="0" y="0" width={W} height="5" fill={color} />
        {/* Pequeños círculos sobre el borde */}
        {[15, 35, 55, 75, 95, 115, 135, 155, 175, 195].map(x => (
          <circle key={x} cx={x} cy="2.5" r="1.8" fill="white" opacity="0.6" />
        ))}

        {/* ── HEADER ── */}
        <rect x="0" y="5" width={W} height="28" fill={colorBg} />

        {/* Burbujas decorativas header */}
        <circle cx="10" cy="19" r="5" fill={color} opacity="0.15" />
        <circle cx="18" cy="14" r="3.5" fill={color} opacity="0.12" />
        <circle cx={W - 10} cy="19" r="5" fill={color} opacity="0.15" />
        <circle cx={W - 18} cy="14" r="3.5" fill={color} opacity="0.12" />

        {/* Texto header centrado */}
        <text x={W / 2} y="17" fontSize="11" fontWeight="bold" fill={color} fontFamily="helvetica" textAnchor="middle">NutriDesk</text>
        <text x={W / 2} y="24" fontSize="4.5" fill={color} fontFamily="helvetica" textAnchor="middle" opacity="0.75">Plan Nutricional</text>

        {/* Logo */}
        {logo && (
          <image href={logo} x={logoPos.x} y={logoPos.y} width="40" height="25" preserveAspectRatio="xMidYMid meet" />
        )}

        {/* Rombos decorativos lado derecho */}
        <Rombos />

        {/* ── BORDE INFERIOR DEL HEADER (ola suave) ── */}
        <path d={`M0,33 Q${W / 4},39 ${W / 2},33 Q${W * 3 / 4},27 ${W},33 L${W},33 L0,33 Z`} fill={colorBg} />

        {/* ── DATOS PACIENTE (cápsula/pill) ── */}
        <rect x="15" y="42" width={W - 30} height="14" rx="7" fill={colorBg} />
        <text x={W / 2} y="48" fontSize="4" fill={color} fontFamily="helvetica" textAnchor="middle" opacity="0.8">PACIENTE</text>
        <text x={W / 2} y="54" fontSize="7" fontWeight="bold" fill={color} fontFamily="helvetica" textAnchor="middle">{D.paciente.nombre}</text>

        {/* Sub-datos */}
        <text x="15" y="62" fontSize="4.5" fill="#71717a" fontFamily="helvetica">Plan: <tspan fontWeight="bold" fill="#18181b">{D.plan.nombre}</tspan></text>
        <text x={W - 15} y="62" fontSize="4.5" fill="#71717a" fontFamily="helvetica" textAnchor="end">Fecha: <tspan fontWeight="bold" fill="#18181b">{D.plan.fecha}</tspan></text>
        <text x="15" y="68" fontSize="4.5" fill="#71717a" fontFamily="helvetica">Médico: <tspan fontWeight="bold" fill="#18181b">{D.nutriologo.nombre}</tspan> · Cédula: {D.nutriologo.cedula}</text>

        {/* Separador con ola pequeña */}
        <path d={`M15,72 Q${W / 4},76 ${W / 2},72 Q${W * 3 / 4},68 ${W - 15},72`}
          fill="none" stroke={colorBorder} strokeWidth="0.7" />

        {/* ── TARJETAS MACRO (redondeadas, con icono circular) ── */}
        {[
          { label: 'Objetivo', val: D.plan.vct_objetivo, unit: 'kcal' },
          { label: 'Proteína',      val: D.macros.proteina.g,      unit: 'g' },
          { label: 'Carbohidratos', val: D.macros.carbohidratos.g, unit: 'g' },
          { label: 'Grasa',         val: D.macros.grasa.g,         unit: 'g' },
        ].map(({ label, val, unit }, i) => {
          const bx = 15 + i * 45
          return (
            <g key={label}>
              <rect x={bx} y="76" width="43" height="20" rx="5" fill={colorBg} />
              {/* Bolita decorativa */}
              <circle cx={bx + 6} cy="82" r="3.5" fill={color} opacity="0.4" />
              <text x={bx + 22} y="83" fontSize="4" fill="#71717a" fontFamily="helvetica" textAnchor="middle">{label}</text>
              <text x={bx + 22} y="91" fontSize="7" fontWeight="bold" fill={color} fontFamily="helvetica" textAnchor="middle">{val}{unit}</text>
            </g>
          )
        })}

        {/* ── TIEMPOS DE COMIDA ── */}
        {D.tiempos.map((tiempo, ti) => {
          const yBase = 103 + ti * 62
          return (
            <g key={tiempo.nombre}>
              {/* Pastilla del título del tiempo */}
              <rect x="15" y={yBase - 6} width="60" height="9" rx="4.5" fill={color} />
              <text x="45" y={yBase} fontSize="5.5" fontWeight="bold" fill="white" fontFamily="helvetica" textAnchor="middle">
                {tiempo.nombre}
              </text>
              <text x={W - 15} y={yBase} fontSize="5.5" fontWeight="bold" fill={color} fontFamily="helvetica" textAnchor="end">
                {tiempo.kcal} kcal
              </text>

              {/* Línea guía punteada */}
              <line x1="77" y1={yBase - 1.5} x2={W - 60} y2={yBase - 1.5}
                stroke={colorBorder} strokeWidth="0.5" strokeDasharray="2,2" />

              {/* Cabecera tabla redondeada */}
              <rect x="15" y={yBase + 4} width={W - 30} height="7" rx="2" fill={color} />
              {['Alimento', 'Porción', 'kcal', 'Prot.', 'Carbs', 'Grasa'].map((h, i) => (
                <text key={h} x={15 + [0, 65, 110, 135, 155, 173][i]} y={yBase + 9.5}
                  fontSize="4" fontWeight="bold" fill="white" fontFamily="helvetica">{h}</text>
              ))}

              {/* Filas */}
              {tiempo.alimentos.map((a, ai) => {
                const yRow = yBase + 11 + ai * 9
                return (
                  <g key={a.nombre}>
                    <rect x="15" y={yRow} width={W - 30} height="9"
                      rx={ai === tiempo.alimentos.length - 1 ? 2 : 0}
                      fill={ai % 2 === 0 ? colorBg : '#fff'} />
                    <line x1="15" y1={yRow + 9} x2={W - 15} y2={yRow + 9} stroke={colorBorder} strokeWidth="0.3" />
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

        {/* ── BORDE INFERIOR CON PUNTOS ── */}
        <rect x="0" y={H - 5} width={W} height="5" fill={color} />
        {[15, 35, 55, 75, 95, 115, 135, 155, 175, 195].map(x => (
          <circle key={x} cx={x} cy={H - 2.5} r="1.8" fill="white" opacity="0.6" />
        ))}

        {/* Footer texto */}
        <text x={W / 2} y={H - 8} fontSize="4" fill="#71717a" fontFamily="helvetica" textAnchor="middle">
          {D.nutriologo.nombre} · Cédula: {D.nutriologo.cedula} · {D.nutriologo.consultorio}
        </text>

      </svg>
    </div>
  )
}