import { DATOS_EJEMPLO as D } from './datosEjemploPDF'

export default function PlantillaModerna({ color, colorBg, colorBorder, logo, posicionLogo }) {
  const escala = 0.38
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

        {/* Header banda */}
        <rect x="0" y="0" width={W} height="22" fill={color} />
        <text x="15" y="15" fontSize="9" fontWeight="bold" fill="white" fontFamily="helvetica">NutriDesk</text>
        <text x={W - 15} y="15" fontSize="6" fill="white" fontFamily="helvetica" textAnchor="end">Plan Nutricional</text>

        {/* Logo */}
        {logo && (
          <image href={logo} x={logoPos.x} y={logoPos.y} width="40" height="25" preserveAspectRatio="xMidYMid meet" />
        )}

        {/* Nombre del plan */}
        <text x="15" y="34" fontSize="8" fontWeight="bold" fill="#18181b" fontFamily="helvetica">{D.plan.nombre}</text>

        {/* Datos paciente */}
        <text x="15" y="43" fontSize="5.5" fill="#71717a" fontFamily="helvetica">Paciente: {D.paciente.nombre}</text>
        <text x="15" y="50" fontSize="5.5" fill="#71717a" fontFamily="helvetica">Fecha: {D.plan.fecha}</text>

        {/* Línea divisora */}
        <line x1="15" y1="55" x2={W - 15} y2="55" stroke={colorBorder} strokeWidth="0.5" />

        {/* Resumen calórico - título */}
        <text x="15" y="63" fontSize="6" fontWeight="bold" fill="#71717a" fontFamily="helvetica">RESUMEN CALÓRICO</text>

        {/* Tarjetas de resumen */}
        {[
          { label: 'Objetivo', val: `${D.plan.vct_objetivo} kcal`, x: 15 },
          { label: 'Proteína', val: `${D.macros.proteina.g}g`, x: 65 },
          { label: 'Carbohidratos', val: `${D.macros.carbohidratos.g}g`, x: 115 },
          { label: 'Grasa', val: `${D.macros.grasa.g}g`, x: 165 },
        ].map(({ label, val, x }) => (
          <g key={label}>
            <rect x={x} y="66" width="42" height="18" rx="2" fill={colorBg} />
            <text x={x + 21} y="73" fontSize="4.5" fill="#71717a" fontFamily="helvetica" textAnchor="middle">{label}</text>
            <text x={x + 21} y="80" fontSize="6" fontWeight="bold" fill="#18181b" fontFamily="helvetica" textAnchor="middle">{val}</text>
          </g>
        ))}

        {/* Barra de progreso */}
        <rect x="15" y="87" width={W - 30} height="2.5" rx="1.25" fill="#e4e4e7" />
        <rect x="15" y="87" width={(W - 30) * 0.8} height="2.5" rx="1.25" fill={color} />

        {/* Tiempos de comida */}
        {D.tiempos.map((tiempo, ti) => {
          const yBase = 96 + ti * 60
          return (
            <g key={tiempo.nombre}>
              {/* Título tiempo */}
              <text x="15" y={yBase} fontSize="6.5" fontWeight="bold" fill={color} fontFamily="helvetica">
                {tiempo.nombre}
              </text>
              <text x="15" y={yBase + 7} fontSize="4.5" fill="#71717a" fontFamily="helvetica">
                {tiempo.kcal} kcal
              </text>

              {/* Cabecera tabla */}
              <rect x="15" y={yBase + 10} width={W - 30} height="7" fill={colorBg} />
              {['Alimento', 'Porción', 'Energía', 'P', 'C', 'G'].map((h, i) => (
                <text key={h} x={15 + [0, 65, 110, 140, 158, 173][i]} y={yBase + 15}
                  fontSize="4" fontWeight="bold" fill="#18181b" fontFamily="helvetica">{h}</text>
              ))}

              {/* Filas alimentos */}
              {tiempo.alimentos.map((a, ai) => {
                const yRow = yBase + 17 + ai * 9
                return (
                  <g key={a.nombre}>
                    <rect x="15" y={yRow} width={W - 30} height="9"
                      fill={ai % 2 === 0 ? '#fafafa' : '#fff'} />
                    <text x="16" y={yRow + 6} fontSize="4" fill="#18181b" fontFamily="helvetica">{a.nombre}</text>
                    <text x="80" y={yRow + 6} fontSize="3.5" fill="#71717a" fontFamily="helvetica">{a.porcion}</text>
                    <text x="112" y={yRow + 6} fontSize="4" fill="#18181b" fontFamily="helvetica">{a.kcal}</text>
                    <text x="142" y={yRow + 6} fontSize="4" fill="#2563eb" fontFamily="helvetica">{a.proteina}g</text>
                    <text x="160" y={yRow + 6} fontSize="4" fill="#16a34a" fontFamily="helvetica">{a.carbs}g</text>
                    <text x="175" y={yRow + 6} fontSize="4" fill="#d97706" fontFamily="helvetica">{a.grasa}g</text>
                  </g>
                )
              })}
            </g>
          )
        })}

        {/* Footer */}
        <line x1="15" y1={H - 10} x2={W - 15} y2={H - 10} stroke="#e4e4e7" strokeWidth="0.5" />
        <text x={W / 2} y={H - 4} fontSize="4" fill="#a1a1aa" fontFamily="helvetica" textAnchor="middle">
          NutriDesk · {D.nutriologo.consultorio}
        </text>

      </svg>
    </div>
  )
}