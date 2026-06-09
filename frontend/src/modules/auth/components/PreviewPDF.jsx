import PlantillaModerna from "./plantillas/PlantillaModerna";
import PlantillaClinica from "./plantillas/PlantillaClinica";
import PlantillaSimple from "./plantillas/PlantillaSimple";
import PlantillaEsquinas from "./plantillas/PlantillaEsquinas";
import PlantillaOlaOscuro from "./plantillas/PlantillaOlaOscuro";
import PlantillaZigzag from "./plantillas/PlantillaZigzag";
import PlantillaTicket from "./plantillas/PlantillaTicket";
import PlantillaPastel from "./plantillas/PlantillaPastel";
import PlantillaFranja from "./plantillas/PlantillaFranja";
import PlantillaLateral from "./plantillas/PlantillaLateral";
import PlantillaBloques from "./plantillas/PlantillaBloques";
import PlantillaSello from "./plantillas/PlantillaSello";

const COMPONENTES = {
  moderna:     PlantillaModerna,
  clinica:     PlantillaClinica,
  minimalista: PlantillaSimple,
  esquinas:    PlantillaEsquinas,
  olaOscuro:   PlantillaOlaOscuro,
  zigzag:      PlantillaZigzag,
  ticket:      PlantillaTicket,
  pastel:      PlantillaPastel,
  franja:      PlantillaFranja,
  lateral:     PlantillaLateral,
  bloques:     PlantillaBloques,
  sello:       PlantillaSello
}

export default function PreviewPDF({ plantillaId, color, colorBg, colorBorder, logo, posicionLogo }) {
  const Componente = COMPONENTES[plantillaId] || PlantillaModerna
  const escala = 2.29  // ajusta este valor a tu gusto

  return (
    <div style={s.wrap}>
      <div style={s.titulo}>Vista previa</div>
      <div style={s.subtitulo}>Datos de ejemplo — se actualizará con tu información real</div>
      <div style={s.previewWrap}>
        <Componente
          color={color}
          colorBg={colorBg}
          colorBorder={colorBorder}
          logo={logo}
          posicionLogo={posicionLogo}
          escala={escala}
        />
      </div>
      <div style={s.plantillaNombre}>
        Plantilla: <strong>{plantillaId}</strong>
      </div>
    </div>
  )
}

const s = {
  wrap:            { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' },
  titulo:          { fontSize: '12px', fontWeight: '500', color: '#71717a', textTransform: 'uppercase', letterSpacing: '.06em', alignSelf: 'flex-start' },
  subtitulo:       { fontSize: '11px', color: '#a1a1aa', alignSelf: 'flex-start', marginBottom: '4px' },
  previewWrap:     { borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' },
  plantillaNombre: { fontSize: '11px', color: '#71717a', marginTop: '4px' },
}