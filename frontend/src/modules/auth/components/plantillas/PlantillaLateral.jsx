import { DATOS_EJEMPLO } from '../datosEjemploPDF'

export default function PlantillaLateral({color, colorBg, colorBorder, logo, posicionLogo, escala = 0.38, datos = null,}) {
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

  // Ancho de la franja lateral izquierda
  const SW = 22
  // Margen izquierdo del contenido (después de la franja)
  const CX = SW + 6

  return (
    <div style={{ width: W * escala, height: H * escala, overflow: 'hidden', borderRadius: 4, border: '1px solid #e4e4e7', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', background: '#fff' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W * escala} height={H * escala} style={{ display: 'block' }}>

        {/* ── FRANJA LATERAL IZQUIERDA ── */}
        <rect x="0" y="0" width={SW} height={H} fill={color} />

        {/* Círculo decorativo superior */}
        <circle cx={SW / 2} cy="16" r="7" fill="rgba(255,255,255,0.15)" />
        <circle cx={SW / 2} cy="16" r="4" fill="rgba(255,255,255,0.2)" />

        {/* Texto vertical rotado "NutriDesk" */}
        <text
          x={SW / 2}
          y={H / 2}
          fontSize="6"
          fontWeight="bold"
          fill="rgba(255,255,255,0.85)"
          fontFamily="helvetica"
          textAnchor="middle"
          transform={`rotate(-90, ${SW / 2}, ${H / 2})`}
          letterSpacing="1.5"
        >
          NutriDesk
        </text>

        {/* Línea separadora interna */}
        <line x1={SW - 3} y1="30" x2={SW - 3} y2={H - 30} stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />

        {/* Texto vertical rotado "Plan Nutricional" */}
        <text
          x={SW / 2 - 5}
          y={H / 2}
          fontSize="4"
          fill="rgba(255,255,255,0.5)"
          fontFamily="helvetica"
          textAnchor="middle"
          transform={`rotate(-90, ${SW / 2 - 5}, ${H / 2})`}
          letterSpacing="1"
        >
          Plan Nutricional
        </text>

        {/* Rombo decorativo inferior */}
        <rect
          x={SW / 2 - 4}
          y={H - 18}
          width="8"
          height="8"
          rx="1"
          fill="rgba(255,255,255,0.2)"
          transform={`rotate(45, ${SW / 2}, ${H - 14})`}
        />

        {/* ── HEADER DEL CONTENIDO ── */}
        <rect x={SW} y="0" width={W - SW} height="32" fill={colorBg} />

        <text x={CX} y="13" fontSize="10" fontWeight="bold" fill={color} fontFamily="helvetica">NutriDesk</text>
        <text x={CX} y="20" fontSize="4.5" fill="#71717a" fontFamily="helvetica">{D.nutriologo.consultorio}</text>

        {/* Logo */}
        {logo
          ? <image href={logo} x={Math.max(logoPos.x, SW + 2)} y={Math.min(logoPos.y, 4)} width="40" height="22" preserveAspectRatio="xMidYMid meet" />
          : <rect x={W - 55} y="7" width="40" height="18" rx="2" fill="rgba(0,0,0,0.06)" />
        }

        {/* Línea separadora del header */}
        <line x1={CX} y1="25" x2={W - 12} y2="25" stroke={color} strokeWidth="0.8" />

        {/* ── DATOS PACIENTE + MÉDICO ── */}
        <text x={CX} y="34" fontSize="5" fontWeight="bold" fill="#18181b" fontFamily="helvetica">DATOS DEL PACIENTE</text>
        <text x={CX} y="40" fontSize="4.5" fill="#71717a" fontFamily="helvetica">Nombre: <tspan fontWeight="bold" fill="#18181b">{D.paciente.nombre}</tspan></text>
        <text x={CX} y="46" fontSize="4.5" fill="#71717a" fontFamily="helvetica">Fecha: <tspan fontWeight="bold" fill="#18181b">{D.plan.fecha}</tspan></text>

        <text x="125" y="34" fontSize="5" fontWeight="bold" fill="#18181b" fontFamily="helvetica">MÉDICO RESPONSABLE</text>
        <text x="125" y="40" fontSize="4.5" fill="#71717a" fontFamily="helvetica">{D.nutriologo.nombre}</text>
        <text x="125" y="46" fontSize="4.5" fill="#71717a" fontFamily="helvetica">Cédula: {D.nutriologo.cedula}</text>

        {/* Banner nombre del plan */}
        <rect x={CX} y="50" width={W - CX - 12} height="10" fill={colorBg} rx="1" />
        <text x={(CX + W - 12) / 2} y="57.5" fontSize="6.5" fontWeight="bold" fill={color} fontFamily="helvetica" textAnchor="middle">
          {D.plan.nombre}
        </text>

        {/* ── RESUMEN NUTRICIONAL ── */}
        <text x={CX} y="68" fontSize="5" fontWeight="bold" fill="#18181b" fontFamily="helvetica">RESUMEN NUTRICIONAL</text>
        <rect x={CX} y="70" width={W - CX - 12} height="7" fill={color} rx="1" />
        {['Objetivo (kcal)', 'Proteína (g)', 'Carbohidratos (g)', 'Grasa (g)'].map((h, i) => (
          <text key={h} x={CX + i * 43} y="75.5" fontSize="4" fontWeight="bold" fill="white" fontFamily="helvetica">{h}</text>
        ))}
        <rect x={CX} y="77" width={W - CX - 12} height="8" fill="#fafafa" />
        {[D.plan.vct_objetivo, D.macros.proteina.g, D.macros.carbohidratos.g, D.macros.grasa.g].map((val, i) => (
          <text key={i} x={CX + i * 43 + 3} y="83" fontSize="5" fontWeight="bold" fill="#18181b" fontFamily="helvetica">{val}</text>
        ))}

        {/* ── TIEMPOS DE COMIDA ── */}
        {D.tiempos.map((tiempo, ti) => {
          const yBase = 94 + ti * 62
          return (
            <g key={tiempo.nombre}>
              {/* Indicador lateral: pequeño rect pegado a la franja */}
              <rect x={SW} y={yBase - 7} width="4" height="9" fill={color} opacity="0.5" />

              <text x={CX} y={yBase} fontSize="6" fontWeight="bold" fill={color} fontFamily="helvetica">
                {tiempo.nombre} — {tiempo.kcal} kcal
              </text>
              <line x1={CX} y1={yBase + 2} x2={W - 12} y2={yBase + 2} stroke={colorBorder} strokeWidth="0.5" />

              {/* Cabecera tabla */}
              <rect x={CX} y={yBase + 4} width={W - CX - 12} height="7" fill={color} />
              {['Alimento', 'Porción', 'kcal', 'Prot.', 'Carbs', 'Grasa'].map((h, i) => (
                <text
                  key={h}
                  x={CX + [0, 55, 96, 118, 136, 153][i]}
                  y={yBase + 9.5}
                  fontSize="4"
                  fontWeight="bold"
                  fill="white"
                  fontFamily="helvetica"
                >
                  {h}
                </text>
              ))}

              {/* Filas */}
              {tiempo.alimentos.map((a, ai) => {
                const yRow = yBase + 11 + ai * 9
                return (
                  <g key={a.nombre}>
                    <rect x={CX} y={yRow} width={W - CX - 12} height="9" fill={ai % 2 === 0 ? colorBg : '#fff'} />
                    <line x1={CX} y1={yRow + 9} x2={W - 12} y2={yRow + 9} stroke="#e4e4e7" strokeWidth="0.3" />
                    <text x={CX + 1} y={yRow + 6} fontSize="4" fill="#18181b" fontFamily="helvetica">{a.nombre}</text>
                    <text x={CX + 56} y={yRow + 6} fontSize="3.5" fill="#71717a" fontFamily="helvetica">{a.porcion}</text>
                    <text x={CX + 97} y={yRow + 6} fontSize="4" fill="#18181b" fontFamily="helvetica">{a.kcal}</text>
                    <text x={CX + 119} y={yRow + 6} fontSize="4" fill="#18181b" fontFamily="helvetica">{a.proteina}g</text>
                    <text x={CX + 137} y={yRow + 6} fontSize="4" fill="#18181b" fontFamily="helvetica">{a.carbs}g</text>
                    <text x={CX + 154} y={yRow + 6} fontSize="4" fill="#18181b" fontFamily="helvetica">{a.grasa}g</text>
                  </g>
                )
              })}
            </g>
          )
        })}

        {/* ── FOOTER ── */}
        <line x1={CX} y1={H - 14} x2={W - 12} y2={H - 14} stroke={color} strokeWidth="0.8" />
        <text x={CX} y={H - 8} fontSize="4" fill="#71717a" fontFamily="helvetica">
          {D.nutriologo.nombre} · Cédula: {D.nutriologo.cedula}
        </text>
        <text x={W - 12} y={H - 8} fontSize="4" fill="#71717a" fontFamily="helvetica" textAnchor="end">
          Página 1
        </text>

      </svg>
    </div>
  )
}