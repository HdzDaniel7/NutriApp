import { DATOS_EJEMPLO } from '../datosEjemploPDF'

export default function PlantillaFranja({color, colorBg, colorBorder, logo, posicionLogo, escala = 0.38, datos = null,}) {
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

  // Altura del header
  const HH = 32

  // Los tres bloques diagonales se generan como polígonos con skew visual.
  // Bloque base (cubre todo el header)
  // Bloque medio (más claro, desplazado a la derecha)
  // Bloque claro (aún más a la derecha)
  // Cada bloque es un trapecio: arriba ancho completo, abajo recortado en diagonal

  // skew en px (cuánto se "corre" el corte diagonal)
  const sk = 22

  return (
    <div style={{ width: W * escala, height: H * escala, overflow: 'hidden', borderRadius: 4, border: '1px solid #e4e4e7', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', background: '#fff' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W * escala} height={H * escala} style={{ display: 'block' }}>

        {/* ── HEADER CON FRANJAS DIAGONALES ── */}

        {/* Bloque base: color oscuro, cubre toda la banda */}
        <rect x="0" y="0" width={W} height={HH} fill={color} />

        {/* Bloque medio: ligeramente más claro (overlay semitransparente) */}
        <polygon
          points={`
            ${W * 0.38},0
            ${W},0
            ${W},${HH}
            ${W * 0.38 + sk},${HH}
          `}
          fill="rgba(255,255,255,0.12)"
        />

        {/* Bloque claro: aún más a la derecha */}
        <polygon
          points={`
            ${W * 0.62},0
            ${W},0
            ${W},${HH}
            ${W * 0.62 + sk},${HH}
          `}
          fill="rgba(255,255,255,0.15)"
        />

        {/* Marca / nombre */}
        <text x="15" y="14" fontSize="11" fontWeight="bold" fill="white" fontFamily="helvetica">NutriDesk</text>
        <text x="15" y="22" fontSize="4.5" fill="rgba(255,255,255,0.75)" fontFamily="helvetica" letterSpacing="1">PLAN NUTRICIONAL</text>

        {/* Logo en el header */}
        {logo
          ? <image href={logo} x={logoPos.x} y={Math.min(logoPos.y, HH - 20)} width="40" height="20" preserveAspectRatio="xMidYMid meet" />
          : <rect x={W - 55} y="7" width="40" height="18" rx="2" fill="rgba(255,255,255,0.15)" />
        }

        {/* ── DATOS PACIENTE (debajo del header, con fondo colorBg) ── */}
        <rect x="0" y={HH} width={W} height="18" fill={colorBg} />

        <text x="15" y={HH + 7} fontSize="5" fill="#71717a" fontFamily="helvetica">
          Paciente: <tspan fontWeight="bold" fill="#18181b">{D.paciente.nombre}</tspan>
        </text>
        <text x="15" y={HH + 13} fontSize="4.5" fill="#71717a" fontFamily="helvetica">
          Fecha: <tspan fontWeight="bold" fill="#18181b">{D.plan.fecha}</tspan>
          {'   '}Médico: <tspan fontWeight="bold" fill="#18181b">{D.nutriologo.nombre}</tspan>
          {'   '}Cédula: <tspan fill="#71717a">{D.nutriologo.cedula}</tspan>
        </text>

        {/* ── BANNER NOMBRE DEL PLAN ── */}
        {/* Parallelogram-like shape usando polygon */}
        <polygon
          points={`
            15,${HH + 20}
            ${W - 15},${HH + 20}
            ${W - 15 - 4},${HH + 30}
            15,${HH + 30}
          `}
          fill={color}
        />
        <text x={W / 2 - 2} y={HH + 27} fontSize="6.5" fontWeight="bold" fill="white" fontFamily="helvetica" textAnchor="middle">
          {D.plan.nombre}
        </text>

        {/* ── RESUMEN CALÓRICO — 4 tarjetas con acento diagonal izquierdo ── */}
        <text x="15" y={HH + 40} fontSize="5" fontWeight="bold" fill="#18181b" fontFamily="helvetica">RESUMEN NUTRICIONAL</text>

        {[
          { label: 'Objetivo (kcal)', val: D.plan.vct_objetivo },
          { label: 'Proteína (g)',    val: D.macros.proteina.g },
          { label: 'Carbohi. (g)',    val: D.macros.carbohidratos.g },
          { label: 'Grasa (g)',       val: D.macros.grasa.g },
        ].map(({ label, val }, i) => {
          const bx = 15 + i * 45
          return (
            <g key={label}>
              <rect x={bx} y={HH + 42} width="43" height="18" rx="1" fill={colorBg} />
              {/* Acento diagonal izquierdo */}
              <polygon
                points={`${bx},${HH + 42} ${bx + 5},${HH + 42} ${bx},${HH + 60}`}
                fill={color}
              />
              <text x={bx + 22} y={HH + 50} fontSize="4" fill="#71717a" fontFamily="helvetica" textAnchor="middle">{label}</text>
              <text x={bx + 22} y={HH + 57} fontSize="6.5" fontWeight="bold" fill="#18181b" fontFamily="helvetica" textAnchor="middle">{val}</text>
            </g>
          )
        })}

        {/* Separador */}
        <line x1="15" y1={HH + 63} x2={W - 15} y2={HH + 63} stroke={colorBorder} strokeWidth="0.5" />

        {/* ── TIEMPOS DE COMIDA ── */}
        {D.tiempos.map((tiempo, ti) => {
          const yBase = HH + 72 + ti * 62
          return (
            <g key={tiempo.nombre}>

              {/* Título con forma de paralelograma */}
              <polygon
                points={`
                  15,${yBase - 7}
                  85,${yBase - 7}
                  81,${yBase + 1}
                  15,${yBase + 1}
                `}
                fill={color}
              />
              <text x="30" y={yBase - 1} fontSize="5.5" fontWeight="bold" fill="white" fontFamily="helvetica">
                {tiempo.nombre}
              </text>

              {/* Kcal del tiempo alineadas a la derecha */}
              <text x={W - 15} y={yBase - 1} fontSize="5.5" fontWeight="bold" fill={color} fontFamily="helvetica" textAnchor="end">
                {tiempo.kcal} kcal
              </text>

              <line x1="85" y1={yBase - 3} x2={W - 60} y2={yBase - 3} stroke={colorBorder} strokeWidth="0.4" strokeDasharray="2,2" />

              {/* Cabecera tabla */}
              <rect x="15" y={yBase + 3} width={W - 30} height="7" fill={color} />
              {['Alimento', 'Porción', 'kcal', 'Prot.', 'Carbs', 'Grasa'].map((h, i) => (
                <text key={h} x={15 + [0, 65, 110, 135, 155, 173][i]} y={yBase + 8.5}
                  fontSize="4" fontWeight="bold" fill="white" fontFamily="helvetica">{h}</text>
              ))}

              {/* Filas de alimentos */}
              {tiempo.alimentos.map((a, ai) => {
                const yRow = yBase + 10 + ai * 9
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

        {/* ── FOOTER CON FRANJA DIAGONAL ── */}
        {/* Franja base */}
        <rect x="0" y={H - 14} width={W} height="14" fill={color} />
        {/* Bloque diagonal encima para dar profundidad */}
        <polygon
          points={`
            ${W * 0.5 - sk},${H - 14}
            ${W},${H - 14}
            ${W},${H}
            ${W * 0.5},${H}
          `}
          fill="rgba(255,255,255,0.1)"
        />

        <text x="15" y={H - 6} fontSize="4" fill="rgba(255,255,255,0.85)" fontFamily="helvetica">
          {D.nutriologo.nombre} · Cédula: {D.nutriologo.cedula}
        </text>
        <text x={W - 15} y={H - 6} fontSize="4" fill="rgba(255,255,255,0.85)" fontFamily="helvetica" textAnchor="end">
          Página 1
        </text>

      </svg>
    </div>
  )
}