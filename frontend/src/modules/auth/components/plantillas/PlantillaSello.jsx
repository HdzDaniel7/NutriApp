import { DATOS_EJEMPLO } from '../datosEjemploPDF'

const LAYOUT = {
  yHeader:       109,
  altoTiempoHdr: 18,
  altoFila:       9,
  espacioEntre:   8,
}

const F = .7 // factor de fuente — 1 = base, 0.8 = 20% menor, 1.2 = 20% mayor

function calcularPosiciones(tiempos) {
  let y = LAYOUT.yHeader
  return tiempos.map(tiempo => {
    const pos = y
    y += LAYOUT.altoTiempoHdr + tiempo.alimentos.length * LAYOUT.altoFila + LAYOUT.espacioEntre
    return pos
  })
}

export default function PlantillaSello({color, colorBg, colorBorder, logo, posicionLogo, escala = 0.38, datos = null,}) {
  const D = datos || DATOS_EJEMPLO
  const W = 210, H = 297

  const posiciones = calcularPosiciones(D.tiempos)

  const getPosLogo = () => {
    const lw = 40, lh = 25
    if (posicionLogo === 'superior_derecha')   return { x: W - 20 - lw, y: 4 }
    if (posicionLogo === 'superior_izquierda') return { x: 15, y: 4 }
    if (posicionLogo === 'inferior_derecha')   return { x: W - 20 - lw, y: H - lh - 4 }
    if (posicionLogo === 'inferior_izquierda') return { x: 15, y: H - lh - 4 }
    return { x: W - 20 - lw, y: 4 }
  }

  const logoPos = getPosLogo()

  const SX = W - 32
  const SY = 22
  const SR = 19
  const TR = SR - 3
  const circleId = 'selloCircle'
  const bgDoc = '#fafaf9'

  return (
    <div style={{ width: W * escala, height: H * escala, overflow: 'hidden', borderRadius: 4, border: '1px solid #e4e4e7', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', background: bgDoc }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W * escala} height={H * escala} style={{ display: 'block' }}>

        <defs>
          <path
            id={circleId}
            d={`
              M ${SX - TR},${SY}
              a ${TR},${TR} 0 1,1 ${TR * 2},0
              a ${TR},${TR} 0 1,1 ${-TR * 2},0
            `}
          />
        </defs>

        <rect x="0" y="0" width={W} height={H} fill={bgDoc} />

        <rect x="0" y="0" width={W} height="3" fill={color} />
        <text x="15" y="16" fontSize={12 * F} fontWeight="bold" fill={color} fontFamily="helvetica">NutriDesk</text>
        <text x="15" y="23" fontSize={4.5 * F} fill="#78716c" fontFamily="helvetica">{D.nutriologo.consultorio}</text>
        <line x1="15" y1="27" x2={SX - SR - 4} y2="27" stroke={color} strokeWidth="0.8" />

        <circle cx={SX} cy={SY} r={SR} fill={colorBg} stroke={color} strokeWidth="1" />
        <circle cx={SX} cy={SY} r={SR - 5} fill="none" stroke={color} strokeWidth="0.4" strokeDasharray="1.5,1.5" />
        {logo
          ? <image href={logo} x={SX - 10} y={SY - 8} width="20" height="14" preserveAspectRatio="xMidYMid meet" />
          : (
            <>
              <text x={SX} y={SY + 1} fontSize={7 * F} fontWeight="bold" fill={color} fontFamily="helvetica" textAnchor="middle">ND</text>
              <text x={SX} y={SY + 6.5} fontSize={3 * F} fill={color} fontFamily="helvetica" textAnchor="middle" opacity="0.7">NUTRICIÓN</text>
            </>
          )
        }
        <text fontSize={3.2 * F} fill={color} fontFamily="helvetica" letterSpacing="1.8">
          <textPath href={`#${circleId}`} startOffset="5%">
            {D.nutriologo.nombre.toUpperCase()} · CÉDULA {D.nutriologo.cedula} ·
          </textPath>
        </text>

        <rect x="15" y="32" width={W - 30} height="1" fill={colorBorder} />
        <text x="15" y="41" fontSize={5 * F} fontWeight="bold" fill="#1c1917" fontFamily="helvetica">DATOS DEL PACIENTE</text>
        <text x="15" y="47" fontSize={4.5 * F} fill="#78716c" fontFamily="helvetica">Nombre: <tspan fontWeight="bold" fill="#1c1917">{D.paciente.nombre}</tspan></text>
        <text x="15" y="53" fontSize={4.5 * F} fill="#78716c" fontFamily="helvetica">Fecha: <tspan fontWeight="bold" fill="#1c1917">{D.plan.fecha}</tspan></text>
        <text x="115" y="41" fontSize={5 * F} fontWeight="bold" fill="#1c1917" fontFamily="helvetica">MÉDICO RESPONSABLE</text>
        <text x="115" y="47" fontSize={4.5 * F} fill="#78716c" fontFamily="helvetica">{D.nutriologo.nombre}</text>
        <text x="115" y="53" fontSize={4.5 * F} fill="#78716c" fontFamily="helvetica">Cédula: {D.nutriologo.cedula}</text>

        <polygon
          points={`21,57  ${W - 21},57  ${W - 15},63  ${W - 15},68  ${W - 21},74  21,74  15,68  15,63`}
          fill={colorBg}
          stroke={colorBorder}
          strokeWidth="0.5"
        />
        <text x={W / 2} y="68" fontSize={6.5 * F} fontWeight="bold" fill={color} fontFamily="helvetica" textAnchor="middle">
          {D.plan.nombre}
        </text>

        <text x="15" y="83" fontSize={5 * F} fontWeight="bold" fill="#1c1917" fontFamily="helvetica">RESUMEN NUTRICIONAL</text>
        <rect x="15" y="85" width={W - 30} height="7" fill={color} rx="1" />
        {['Objetivo (kcal)', 'Proteína (g)', 'Carbohidratos (g)', 'Grasa (g)'].map((h, i) => (
          <text key={h} x={15 + i * 45} y="90.5" fontSize={4 * F} fontWeight="bold" fill="white" fontFamily="helvetica">{h}</text>
        ))}
        <rect x="15" y="92" width={W - 30} height="8" fill="white" stroke={colorBorder} strokeWidth="0.3" />
        {[D.plan.vct_objetivo, D.macros.proteina.g, D.macros.carbohidratos.g, D.macros.grasa.g].map((val, i) => (
          <text key={i} x={15 + i * 45 + 5} y="98" fontSize={5 * F} fontWeight="bold" fill="#1c1917" fontFamily="helvetica">{val}</text>
        ))}

        {D.tiempos.map((tiempo, ti) => {
          const yBase = posiciones[ti]
          return (
            <g key={tiempo.nombre}>
              <rect
                x="15" y={yBase - 5.5}
                width="5" height="5"
                fill={color}
                transform={`rotate(45, 17.5, ${yBase - 3})`}
              />
              <text x="24" y={yBase} fontSize={6 * F} fontWeight="bold" fill={color} fontFamily="helvetica">
                {tiempo.nombre}
              </text>
              <text x={W - 15} y={yBase} fontSize={5.5 * F} fill="#78716c" fontFamily="helvetica" textAnchor="end" fontWeight="bold">
                {tiempo.kcal} kcal
              </text>
              <line x1="15" y1={yBase + 2} x2={W - 15} y2={yBase + 2} stroke={colorBorder} strokeWidth="0.4" />

              <rect x="15" y={yBase + 4} width={W - 30} height="7" fill={color} />
              {['Alimento', 'Porción', 'kcal', 'Prot.', 'Carbs', 'Grasa'].map((h, i) => (
                <text key={h} x={15 + [0, 65, 110, 135, 155, 173][i]} y={yBase + 9.5}
                  fontSize={4 * F} fontWeight="bold" fill="white" fontFamily="helvetica">{h}</text>
              ))}

              {tiempo.alimentos.map((a, ai) => {
                const yRow = yBase + 11 + ai * LAYOUT.altoFila
                return (
                  <g key={a.nombre}>
                    <rect x="15" y={yRow} width={W - 30} height={LAYOUT.altoFila}
                      fill={ai % 2 === 0 ? colorBg : 'white'} />
                    <line x1="15" y1={yRow + LAYOUT.altoFila} x2={W - 15} y2={yRow + LAYOUT.altoFila}
                      stroke="#e7e5e4" strokeWidth="0.3" />
                    <text x="16" y={yRow + 6} fontSize={3 } fill="#1c1917" fontFamily="helvetica">{a.nombre}</text>
                    <text x="80" y={yRow + 6} fontSize={3 } fill="#78716c" fontFamily="helvetica">{a.porcion}</text>
                    <text x="112" y={yRow + 6} fontSize={3 } fill="#1c1917" fontFamily="helvetica">{a.kcal}</text>
                    <text x="137" y={yRow + 6} fontSize={3 } fill="#1c1917" fontFamily="helvetica">{a.proteina}g</text>
                    <text x="157" y={yRow + 6} fontSize={3 } fill="#1c1917" fontFamily="helvetica">{a.carbs}g</text>
                    <text x="175" y={yRow + 6} fontSize={3 } fill="#1c1917" fontFamily="helvetica">{a.grasa}g</text>
                  </g>
                )
              })}
            </g>
          )
        })}

        <rect x="0" y={H - 3} width={W} height="3" fill={color} />
        <line x1="15" y1={H - 13} x2={W - 15} y2={H - 13} stroke={color} strokeWidth="0.6" />
        <text x="15" y={H - 7} fontSize={4 * F} fill="#78716c" fontFamily="helvetica">
          {D.nutriologo.nombre} · Cédula: {D.nutriologo.cedula} · {D.nutriologo.consultorio}
        </text>
        <text x={W - 15} y={H - 7} fontSize={4 * F} fill="#78716c" fontFamily="helvetica" textAnchor="end">
          Página 1
        </text>

      </svg>
    </div>
  )
}