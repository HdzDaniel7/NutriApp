import { DATOS_EJEMPLO as D } from '../datosEjemploPDF'

export default function PlantillaClinica({ color, colorBg, colorBorder, logo, posicionLogo, escala = 0.38 }) {
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

  return (
    <div style={{ width: W * escala, height: H * escala, overflow: 'hidden', borderRadius: 4, border: '1px solid #e4e4e7', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', background: '#fff' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W * escala} height={H * escala} style={{ display: 'block' }}>

        {/* Header clínico — sin banda, solo línea */}
        <text x="15" y="12" fontSize="10" fontWeight="bold" fill={color} fontFamily="helvetica">NutriDesk</text>
        <text x="15" y="19" fontSize="5" fill="#71717a" fontFamily="helvetica">{D.nutriologo.consultorio}</text>
        <line x1="15" y1="23" x2={W - 15} y2="23" stroke={color} strokeWidth="1" />

        {/* Logo */}
        {logo && (
          <image href={logo} x={logoPos.x} y={logoPos.y} width="40" height="25" preserveAspectRatio="xMidYMid meet" />
        )}

        {/* Datos en dos columnas */}
        <text x="15" y="33" fontSize="5.5" fontWeight="bold" fill="#18181b" fontFamily="helvetica">DATOS DEL PACIENTE</text>
        <text x="15" y="40" fontSize="5" fill="#71717a" fontFamily="helvetica">Nombre: {D.paciente.nombre}</text>
        <text x="15" y="46" fontSize="5" fill="#71717a" fontFamily="helvetica">Fecha: {D.plan.fecha}</text>

        <text x="115" y="33" fontSize="5.5" fontWeight="bold" fill="#18181b" fontFamily="helvetica">MÉDICO RESPONSABLE</text>
        <text x="115" y="40" fontSize="5" fill="#71717a" fontFamily="helvetica">{D.nutriologo.nombre}</text>
        <text x="115" y="46" fontSize="5" fill="#71717a" fontFamily="helvetica">Cédula: {D.nutriologo.cedula}</text>

        {/* Nombre del plan */}
        <rect x="15" y="51" width={W - 30} height="10" fill={colorBg} rx="1" />
        <text x={W / 2} y="58" fontSize="6.5" fontWeight="bold" fill={color} fontFamily="helvetica" textAnchor="middle">
          {D.plan.nombre}
        </text>

        {/* Resumen calórico tabla formal */}
        <text x="15" y="70" fontSize="5.5" fontWeight="bold" fill="#18181b" fontFamily="helvetica">RESUMEN NUTRICIONAL</text>
        <rect x="15" y="73" width={W - 30} height="7" fill={color} rx="1" />
        {['Objetivo (kcal)', 'Proteína (g)', 'Carbohidratos (g)', 'Grasa (g)'].map((h, i) => (
          <text key={h} x={15 + i * 45} y="78.5" fontSize="4" fontWeight="bold" fill="white" fontFamily="helvetica">{h}</text>
        ))}
        <rect x="15" y="80" width={W - 30} height="8" fill="#fafafa" />
        {[D.plan.vct_objetivo, D.macros.proteina.g, D.macros.carbohidratos.g, D.macros.grasa.g].map((val, i) => (
          <text key={i} x={15 + i * 45 + 5} y="86" fontSize="5" fontWeight="bold" fill="#18181b" fontFamily="helvetica">{val}</text>
        ))}

        {/* Tiempos de comida */}
        {D.tiempos.map((tiempo, ti) => {
          const yBase = 96 + ti * 62
          return (
            <g key={tiempo.nombre}>
              <text x="15" y={yBase} fontSize="6" fontWeight="bold" fill={color} fontFamily="helvetica">
                {tiempo.nombre} — {tiempo.kcal} kcal
              </text>
              <line x1="15" y1={yBase + 2} x2={W - 15} y2={yBase + 2} stroke={colorBorder} strokeWidth="0.5" />

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

        {/* Footer clínico */}
        <line x1="15" y1={H - 14} x2={W - 15} y2={H - 14} stroke={color} strokeWidth="0.8" />
        <text x="15" y={H - 8} fontSize="4" fill="#71717a" fontFamily="helvetica">
          {D.nutriologo.nombre} · Cédula: {D.nutriologo.cedula}
        </text>
        <text x={W - 15} y={H - 8} fontSize="4" fill="#71717a" fontFamily="helvetica" textAnchor="end">
          Página 1
        </text>

      </svg>
    </div>
  )
}