import { DATOS_EJEMPLO as D } from './datosEjemploPDF'

export default function PlantillaSimple({ color, colorBg, colorBorder, logo, posicionLogo }) {
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

        {/* Header simple */}
        <text x="15" y="14" fontSize="11" fontWeight="bold" fill="#18181b" fontFamily="helvetica">{D.plan.nombre}</text>
        <text x="15" y="21" fontSize="5" fill="#71717a" fontFamily="helvetica">
          {D.paciente.nombre} · {D.plan.fecha}
        </text>

        {/* Logo */}
        {logo && (
          <image href={logo} x={logoPos.x} y={logoPos.y} width="40" height="25" preserveAspectRatio="xMidYMid meet" />
        )}

        {/* Línea con color */}
        <rect x="15" y="25" width="30" height="2" rx="1" fill={color} />
        <line x1="47" y1="26" x2={W - 15} y2="26" stroke="#e4e4e7" strokeWidth="0.5" />

        {/* Resumen simple */}
        <text x="15" y="35" fontSize="5" fill="#71717a" fontFamily="helvetica">
          Objetivo: {D.plan.vct_objetivo} kcal · P: {D.macros.proteina.g}g · C: {D.macros.carbohidratos.g}g · G: {D.macros.grasa.g}g
        </text>

        {/* Tiempos — formato lista */}
        {D.tiempos.map((tiempo, ti) => {
          const yBase = 43 + ti * 78
          return (
            <g key={tiempo.nombre}>
              {/* Título tiempo con punto de color */}
              <rect x="15" y={yBase - 4} width="4" height="4" rx="1" fill={color} />
              <text x="22" y={yBase} fontSize="7" fontWeight="bold" fill="#18181b" fontFamily="helvetica">
                {tiempo.nombre}
              </text>
              <text x={W - 15} y={yBase} fontSize="5.5" fill={color} fontFamily="helvetica" textAnchor="end" fontWeight="bold">
                {tiempo.kcal} kcal
              </text>

              {/* Lista de alimentos */}
              {tiempo.alimentos.map((a, ai) => {
                const yRow = yBase + 8 + ai * 18
                return (
                  <g key={a.nombre}>
                    {/* Separador ligero */}
                    <line x1="22" y1={yRow - 1} x2={W - 15} y2={yRow - 1} stroke="#f4f4f5" strokeWidth="0.5" />

                    {/* Nombre alimento */}
                    <text x="22" y={yRow + 5} fontSize="5.5" fontWeight="bold" fill="#18181b" fontFamily="helvetica">
                      {a.nombre}
                    </text>

                    {/* Porción */}
                    <text x="22" y={yRow + 11} fontSize="4.5" fill="#71717a" fontFamily="helvetica">
                      {a.porcion}
                    </text>

                    {/* Kcal */}
                    <text x={W - 15} y={yRow + 5} fontSize="5.5" fill="#18181b" fontFamily="helvetica" textAnchor="end">
                      {a.kcal} kcal
                    </text>

                    {/* Macros pequeños */}
                    <text x={W - 15} y={yRow + 11} fontSize="4" fill="#a1a1aa" fontFamily="helvetica" textAnchor="end">
                      P:{a.proteina}g C:{a.carbs}g G:{a.grasa}g
                    </text>
                  </g>
                )
              })}

              {/* Línea final del tiempo */}
              <line x1="15" y1={yBase + 62} x2={W - 15} y2={yBase + 62} stroke={colorBorder} strokeWidth="0.3" />
            </g>
          )
        })}

        {/* Footer */}
        <text x={W / 2} y={H - 4} fontSize="4" fill="#a1a1aa" fontFamily="helvetica" textAnchor="middle">
          {D.nutriologo.consultorio} · {D.nutriologo.nombre}
        </text>

      </svg>
    </div>
  )
}