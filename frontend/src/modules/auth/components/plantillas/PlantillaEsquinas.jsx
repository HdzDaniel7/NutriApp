import { DATOS_EJEMPLO } from '../datosEjemploPDF'

export default function PlantillaEsquinas({color, colorBg, colorBorder, logo, posicionLogo, escala = 0.38, datos = null,}) {
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

  // Tamaño del brazo de esquina en unidades SVG
  const C = 18  // largo del brazo
  const T = 1.5 // grosor del trazo

  return (
    <div style={{ width: W * escala, height: H * escala, overflow: 'hidden', borderRadius: 4, border: '1px solid #e4e4e7', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', background: '#fff' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W * escala} height={H * escala} style={{ display: 'block' }}>

        {/* ── ESQUINAS DECORATIVAS (4 L-shapes) ── */}
        {/* Superior-izquierda */}
        <line x1="4" y1="4" x2={4 + C} y2="4" stroke={color} strokeWidth={T} />
        <line x1="4" y1="4" x2="4" y2={4 + C} stroke={color} strokeWidth={T} />
        {/* Superior-derecha */}
        <line x1={W - 4} y1="4" x2={W - 4 - C} y2="4" stroke={color} strokeWidth={T} />
        <line x1={W - 4} y1="4" x2={W - 4} y2={4 + C} stroke={color} strokeWidth={T} />
        {/* Inferior-izquierda */}
        <line x1="4" y1={H - 4} x2={4 + C} y2={H - 4} stroke={color} strokeWidth={T} />
        <line x1="4" y1={H - 4} x2="4" y2={H - 4 - C} stroke={color} strokeWidth={T} />
        {/* Inferior-derecha */}
        <line x1={W - 4} y1={H - 4} x2={W - 4 - C} y2={H - 4} stroke={color} strokeWidth={T} />
        <line x1={W - 4} y1={H - 4} x2={W - 4} y2={H - 4 - C} stroke={color} strokeWidth={T} />

        {/* ── HEADER CENTRADO ── */}
        <text x={W / 2} y="18" fontSize="12" fontWeight="bold" fill={color} fontFamily="helvetica" textAnchor="middle">NutriDesk</text>
        <text x={W / 2} y="24" fontSize="4.5" fill="#71717a" fontFamily="helvetica" textAnchor="middle" letterSpacing="1.5">PLAN NUTRICIONAL</text>
        {/* Línea ornamental doble centrada */}
        <line x1={W / 2 - 25} y1="27" x2={W / 2 + 25} y2="27" stroke={color} strokeWidth="0.8" />
        <line x1={W / 2 - 18} y1="29" x2={W / 2 + 18} y2="29" stroke={color} strokeWidth="0.3" />

        {/* Logo */}
        {logo && (
          <image href={logo} x={logoPos.x} y={logoPos.y} width="40" height="25" preserveAspectRatio="xMidYMid meet" />
        )}

        {/* ── DATOS (2 columnas) ── */}
        <text x="15" y="38" fontSize="5" fill="#71717a" fontFamily="helvetica">Paciente: <tspan fontWeight="bold" fill="#18181b">{D.paciente.nombre}</tspan></text>
        <text x={W - 15} y="38" fontSize="5" fill="#71717a" fontFamily="helvetica" textAnchor="end">Fecha: <tspan fontWeight="bold" fill="#18181b">{D.plan.fecha}</tspan></text>
        <text x="15" y="44" fontSize="5" fill="#71717a" fontFamily="helvetica">Médico: <tspan fontWeight="bold" fill="#18181b">{D.nutriologo.nombre}</tspan></text>
        <text x={W - 15} y="44" fontSize="5" fill="#71717a" fontFamily="helvetica" textAnchor="end">Cédula: <tspan fontWeight="bold" fill="#18181b">{D.nutriologo.cedula}</tspan></text>

        {/* Banner nombre del plan */}
        <rect x="15" y="48" width={W - 30} height="10" fill={colorBg} rx="1" />
        <text x={W / 2} y="55.5" fontSize="6.5" fontWeight="bold" fill={color} fontFamily="helvetica" textAnchor="middle">
          {D.plan.nombre}
        </text>

        {/* ── RESUMEN CALÓRICO ── */}
        <text x="15" y="66" fontSize="5" fontWeight="bold" fill="#18181b" fontFamily="helvetica">RESUMEN NUTRICIONAL</text>
        <rect x="15" y="68" width={W - 30} height="7" fill={color} rx="1" />
        {['Objetivo (kcal)', 'Proteína (g)', 'Carbohidratos (g)', 'Grasa (g)'].map((h, i) => (
          <text key={h} x={15 + i * 45} y="73.5" fontSize="4" fontWeight="bold" fill="white" fontFamily="helvetica">{h}</text>
        ))}
        <rect x="15" y="75" width={W - 30} height="8" fill="#fafafa" />
        {[D.plan.vct_objetivo, D.macros.proteina.g, D.macros.carbohidratos.g, D.macros.grasa.g].map((val, i) => (
          <text key={i} x={15 + i * 45 + 5} y="81" fontSize="5" fontWeight="bold" fill="#18181b" fontFamily="helvetica">{val}</text>
        ))}

        {/* ── TIEMPOS DE COMIDA ── */}
        {D.tiempos.map((tiempo, ti) => {
          const yBase = 92 + ti * 62
          return (
            <g key={tiempo.nombre}>
              <text x="15" y={yBase} fontSize="6" fontWeight="bold" fill={color} fontFamily="helvetica">
                {tiempo.nombre} — {tiempo.kcal} kcal
              </text>
              <line x1="15" y1={yBase + 2} x2={W - 15} y2={yBase + 2} stroke={colorBorder} strokeWidth="0.5" strokeDasharray="2,2" />

              {/* Cabecera */}
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
                    {/* separador punteado entre filas */}
                    <line x1="15" y1={yRow + 9} x2={W - 15} y2={yRow + 9} stroke="#e4e4e7" strokeWidth="0.3" strokeDasharray="2,2" />
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

        {/* ── FOOTER CENTRADO ── */}
        <line x1={W / 2 - 18} y1={H - 12} x2={W / 2 + 18} y2={H - 12} stroke={color} strokeWidth="0.3" />
        <line x1={W / 2 - 25} y1={H - 10} x2={W / 2 + 25} y2={H - 10} stroke={color} strokeWidth="0.8" />
        <text x={W / 2} y={H - 5} fontSize="4" fill="#71717a" fontFamily="helvetica" textAnchor="middle">
          {D.nutriologo.nombre} · Cédula: {D.nutriologo.cedula} · {D.nutriologo.consultorio}
        </text>

      </svg>
    </div>
  )
}