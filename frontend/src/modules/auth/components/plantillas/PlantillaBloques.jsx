import { DATOS_EJEMPLO } from '../datosEjemploPDF'

export default function PlantillaBloques({color, colorBg, colorBorder, logo, posicionLogo, escala = 0.38, datos = null,}) {
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

  // Cada tiempo de comida tiene su propio tono del color principal.
  // Se aplica opacidad creciente sobre el mismo color para variar los bloques.
  const tiempoOpacity = [1, 0.78, 0.58]

  return (
    <div style={{ width: W * escala, height: H * escala, overflow: 'hidden', borderRadius: 4, border: '1px solid #e4e4e7', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', background: '#fff' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W * escala} height={H * escala} style={{ display: 'block' }}>

        {/* ── HEADER OSCURO ── */}
        <rect x="0" y="0" width={W} height="36" fill={color} />

        {/* Patrón de líneas diagonales sutiles en el header */}
        {[...Array(14)].map((_, i) => (
          <line
            key={i}
            x1={-10 + i * 18}
            y1="0"
            x2={-10 + i * 18 - 36}
            y2="36"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
          />
        ))}

        {/* Nombre y subtítulo */}
        <text x="15" y="15" fontSize="11" fontWeight="bold" fill="white" fontFamily="helvetica">NutriDesk</text>
        <text x="15" y="23" fontSize="4.5" fill="rgba(255,255,255,0.65)" fontFamily="helvetica" letterSpacing="1">PLAN NUTRICIONAL PERSONALIZADO</text>

        {/* Datos paciente en header (derecha) */}
        <text x={W - 12} y="13" fontSize="7" fontWeight="bold" fill="white" fontFamily="helvetica" textAnchor="end">{D.paciente.nombre}</text>
        <text x={W - 12} y="20" fontSize="4.5" fill="rgba(255,255,255,0.65)" fontFamily="helvetica" textAnchor="end">{D.plan.nombre}</text>
        <text x={W - 12} y="27" fontSize="4" fill="rgba(255,255,255,0.5)" fontFamily="helvetica" textAnchor="end">{D.plan.fecha}</text>

        {/* Logo */}
        {logo && (
          <image href={logo} x={Math.max(logoPos.x, 15)} y={Math.min(logoPos.y, H - 30)} width="40" height="22" preserveAspectRatio="xMidYMid meet" />
        )}

        {/* ── TARJETAS MACRO ── */}
        {[
          { label: 'Objetivo', val: `${D.plan.vct_objetivo}`, unit: 'kcal' },
          { label: 'Proteína',      val: `${D.macros.proteina.g}`,      unit: 'g' },
          { label: 'Carbohidratos', val: `${D.macros.carbohidratos.g}`, unit: 'g' },
          { label: 'Grasa',         val: `${D.macros.grasa.g}`,         unit: 'g' },
        ].map(({ label, val, unit }, i) => {
          const bx = 15 + i * 45
          return (
            <g key={label}>
              <rect x={bx} y="38" width="43" height="20" rx="2" fill={colorBg} />
              {/* Borde inferior de acento */}
              <rect x={bx} y="56" width="43" height="2" rx="1" fill={color} opacity="0.5" />
              <text x={bx + 21.5} y="46" fontSize="4" fill="#71717a" fontFamily="helvetica" textAnchor="middle">{label}</text>
              <text x={bx + 21.5} y="55" fontSize="7" fontWeight="bold" fill="#18181b" fontFamily="helvetica" textAnchor="middle">{val}<tspan fontSize="4" fill="#71717a"> {unit}</tspan></text>
            </g>
          )
        })}

        {/* Médico responsable */}
        <text x="15" y="68" fontSize="4.5" fill="#71717a" fontFamily="helvetica">
          Médico: <tspan fontWeight="bold" fill="#18181b">{D.nutriologo.nombre}</tspan>
          {'  '}·{'  '}
          Cédula: <tspan fontWeight="bold" fill="#18181b">{D.nutriologo.cedula}</tspan>
          {'  '}·{'  '}
          <tspan fill="#71717a">{D.nutriologo.consultorio}</tspan>
        </text>

        <line x1="15" y1="71" x2={W - 15} y2="71" stroke={colorBorder} strokeWidth="0.5" />

        {/* ── TIEMPOS — CADA UNO ES UN BLOQUE CON SU PROPIO COLOR ── */}
        {D.tiempos.map((tiempo, ti) => {
          const yBase = 78 + ti * 70
          const op = tiempoOpacity[ti] ?? 0.5

          return (
            <g key={tiempo.nombre}>
              {/* Bloque contenedor con borde redondeado */}
              <rect x="15" y={yBase - 2} width={W - 30} height="66" rx="3"
                fill={colorBg} stroke={colorBorder} strokeWidth="0.4" />

              {/* Cabecera del bloque con color de opacidad variable */}
              <rect x="15" y={yBase - 2} width={W - 30} height="10" rx="3" fill={color} opacity={op} />
              {/* Tapa las esquinas inferiores redondeadas de la cabecera */}
              <rect x="15" y={yBase + 4} width={W - 30} height="4" fill={color} opacity={op} />

              <text x="20" y={yBase + 5.5} fontSize="6.5" fontWeight="bold" fill="white" fontFamily="helvetica">
                {tiempo.nombre}
              </text>
              <text x={W - 18} y={yBase + 5.5} fontSize="5.5" fill="rgba(255,255,255,0.9)" fontFamily="helvetica" textAnchor="end" fontWeight="bold">
                {tiempo.kcal} kcal
              </text>

              {/* Sub-cabecera de columnas */}
              <rect x="15" y={yBase + 8} width={W - 30} height="7" fill="rgba(0,0,0,0.04)" />
              {['Alimento', 'Porción', 'kcal', 'Prot.', 'Carbs', 'Grasa'].map((h, i) => (
                <text key={h} x={15 + [1, 55, 96, 118, 136, 153][i]} y={yBase + 13.5}
                  fontSize="3.8" fontWeight="bold" fill="#71717a" fontFamily="helvetica">{h}</text>
              ))}

              {/* Filas */}
              {tiempo.alimentos.map((a, ai) => {
                const yRow = yBase + 15 + ai * 10
                return (
                  <g key={a.nombre}>
                    {ai > 0 && (
                      <line x1="16" y1={yRow} x2={W - 16} y2={yRow} stroke="#e4e4e7" strokeWidth="0.3" />
                    )}
                    <text x="16" y={yRow + 6} fontSize="4" fill="#18181b" fontFamily="helvetica">{a.nombre}</text>
                    <text x="70" y={yRow + 6} fontSize="3.5" fill="#71717a" fontFamily="helvetica">{a.porcion}</text>
                    <text x="97" y={yRow + 6} fontSize="4" fill="#18181b" fontFamily="helvetica">{a.kcal}</text>
                    <text x="119" y={yRow + 6} fontSize="4" fill="#18181b" fontFamily="helvetica">{a.proteina}g</text>
                    <text x="137" y={yRow + 6} fontSize="4" fill="#18181b" fontFamily="helvetica">{a.carbs}g</text>
                    <text x="154" y={yRow + 6} fontSize="4" fill="#18181b" fontFamily="helvetica">{a.grasa}g</text>
                    {/* Macros en línea extra */}
                  </g>
                )
              })}
            </g>
          )
        })}

        {/* ── FOOTER ── */}
        <rect x="0" y={H - 12} width={W} height="12" fill={color} />
        <text x="15" y={H - 5} fontSize="4" fill="rgba(255,255,255,0.8)" fontFamily="helvetica">
          {D.nutriologo.nombre} · Cédula: {D.nutriologo.cedula}
        </text>
        <text x={W - 15} y={H - 5} fontSize="4" fill="rgba(255,255,255,0.8)" fontFamily="helvetica" textAnchor="end">
          Página 1
        </text>

      </svg>
    </div>
  )
}