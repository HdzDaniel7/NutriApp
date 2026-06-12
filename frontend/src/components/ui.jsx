/* ═══════════════════════════════════════════════════════
   KIT UI COMPARTIDO — NutriDesk
   Tokens y componentes base del diseño (estilo Dashboard).
   Todos los colores del entorno salen de las variables CSS
   que inyecta aplicarTema(), así el color principal del
   usuario tiñe todas las pestañas por igual.
═══════════════════════════════════════════════════════ */

/* ── Tokens de tema (variables CSS dinámicas) ── */
export const T = {
  green:        'var(--ui-green)',
  greenLight:   'var(--ui-green-light)',
  greenPale:    'var(--ui-green-pale)',
  greenBg:      'var(--ui-green-bg)',
  txtPrimary:   'var(--ui-txt-primary)',
  txtSecondary: 'var(--ui-txt-secondary)',
  txtMuted:     'var(--ui-txt-muted)',
  border:       'var(--ui-border)',
  borderSubtle: 'var(--ui-border-subtle)',
  bgCard:       '#FFFFFF',
  bgPage:       'var(--ui-bg-page)',
  /* Acentos vibrantes (independientes del tema) */
  primario:       'var(--color-primario)',
  primarioLight:  'var(--color-primario-light)',
  primarioBg:     'var(--color-primario-bg)',
  primarioBorder: 'var(--color-primario-border)',
  blue:   '#2563EB', blueBg:   '#EFF6FF', blueBorder:   '#BFDBFE',
  amber:  '#B45309', amberBg:  '#FFFBEB', amberBorder:  '#FDE68A',
  purple: '#6D28D9', purpleBg: '#F5F3FF', purpleBorder: '#DDD6FE',
  danger: '#DC2626', dangerBg: '#FEF2F2', dangerBorder: '#FECACA',
}

/* ── Hoja decorativa ── */
export function Leaf({ size = 13, color = T.green }) {
  return (
    <svg viewBox="0 0 18 18" fill="none" style={{ width: size, height: size, flexShrink: 0 }}>
      <path d="M9 16 Q7 13 6.5 10.5 Q6 8 8 6 Q8.5 8 9 9.5 Q9 7.5 10.5 5.5 Q12 7.5 12 9.5 Q12.5 8 13 6 Q15 8 14.5 10.5 Q14 13 11 16 Q10 16.3 9 16Z"
        fill={color} />
    </svg>
  )
}

/* ── Adorno simétrico de hojas (header de página) ── */
export function LeafRow() {
  return (
    <div style={{ display: 'flex', gap: 5, opacity: 0.35 }}>
      {[0, 1, 2, 1, 0].map((s, i) => (
        <svg key={i} viewBox="0 0 18 18" fill="none"
          style={{ width: 12 + s * 5, height: 12 + s * 5, transform: i > 2 ? 'scaleX(-1)' : 'none' }}>
          <path d="M9 16 Q7 13 6.5 10.5 Q6 8 8 6 Q8.5 8 9 9.5 Q9 7.5 10.5 5.5 Q12 7.5 12 9.5 Q12.5 8 13 6 Q15 8 14.5 10.5 Q14 13 11 16 Q10 16.3 9 16Z"
            fill={T.green} />
        </svg>
      ))}
    </div>
  )
}

/* ── Header de página (título + subtítulo + acciones) ── */
export function PageHeader({ titulo, subtitulo, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: T.txtPrimary, margin: 0, letterSpacing: '-0.4px' }}>
          {titulo}
        </h1>
        {subtitulo && (
          <p style={{ fontSize: 13.5, color: T.txtMuted, margin: '4px 0 0' }}>{subtitulo}</p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {children || <LeafRow />}
      </div>
    </div>
  )
}

/* ── Card con título de hoja (estilo Dashboard) ── */
export function Card({ title, accion, children, style = {} }) {
  return (
    <div style={{
      background: T.bgCard,
      border: `1px solid ${T.border}`,
      borderRadius: 14,
      padding: 20,
      ...style,
    }}>
      {title && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          marginBottom: 14, paddingBottom: 12,
          borderBottom: `1px solid ${T.borderSubtle}`,
        }}>
          <Leaf />
          <span style={{ fontSize: 12, fontWeight: 600, color: T.txtMuted, textTransform: 'uppercase', letterSpacing: '0.5px', flex: 1 }}>
            {title}
          </span>
          {accion}
        </div>
      )}
      {children}
    </div>
  )
}

/* ── Tarjeta de estadística con franja lateral ── */
export function StatCard({ label, valor, unidad, accent = T.green, bgAccent = T.greenBg, borderAccent = T.greenPale, renderIcon }) {
  return (
    <div style={{
      background: T.bgCard,
      border: `1px solid ${T.border}`,
      borderRadius: 14,
      padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 10,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: accent, borderRadius: '14px 0 0 14px',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: T.txtMuted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </span>
        {renderIcon && (
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: bgAccent, border: `1px solid ${borderAccent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {renderIcon(accent)}
          </div>
        )}
      </div>
      <div style={{ fontSize: 36, fontWeight: 700, color: T.txtPrimary, lineHeight: 1 }}>
        {valor}
        {unidad && <span style={{ fontSize: 13, fontWeight: 500, color: T.txtMuted, marginLeft: 6 }}>{unidad}</span>}
      </div>
    </div>
  )
}

/* ── Estado vacío ── */
export function Empty({ text, icon }) {
  return (
    <div style={{
      textAlign: 'center', padding: '28px 0',
      fontSize: 13, color: T.txtMuted,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    }}>
      {icon || (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={T.greenPale} strokeWidth="1.5" strokeLinecap="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>
        </svg>
      )}
      {text}
    </div>
  )
}

/* ── Estilos base compartidos (objetos para style={}) ── */
export const base = {
  btnPrimario: {
    padding: '8px 18px', borderRadius: 10, border: 'none',
    background: `linear-gradient(135deg, var(--ui-green-light), var(--ui-green))`,
    color: '#fff', fontSize: 13.5, cursor: 'pointer', fontWeight: 600,
    display: 'inline-flex', alignItems: 'center', gap: 6,
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  },
  btnGhost: {
    padding: '7px 14px', borderRadius: 10,
    border: `1px solid ${T.border}`, background: '#fff',
    fontSize: 13, color: T.txtSecondary, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 5,
  },
  btnPeligro: {
    padding: '7px 14px', borderRadius: 10, border: `1px solid ${T.dangerBorder}`,
    background: T.dangerBg, fontSize: 13, color: T.danger, cursor: 'pointer',
  },
  input: {
    width: '100%', padding: '8px 12px', borderRadius: 8,
    border: `1px solid ${T.border}`, fontSize: 14,
    color: T.txtPrimary, outline: 'none', boxSizing: 'border-box',
    background: '#fff',
  },
  label: { display: 'block', fontSize: 13, color: T.txtSecondary, marginBottom: 4, fontWeight: 500 },
  badge: {
    fontSize: 11, background: T.greenBg, color: T.txtSecondary,
    padding: '3px 10px', borderRadius: 20, border: `1px solid ${T.borderSubtle}`,
  },
  cardTitle: {
    fontSize: 12, fontWeight: 600, color: T.txtMuted,
    textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  warnBox: {
    background: T.amberBg, border: `1px solid ${T.amberBorder}`,
    borderRadius: 8, padding: '8px 12px', fontSize: 13, color: T.amber,
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(20,40,28,0.45)', zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    backdropFilter: 'blur(2px)',
  },
  modal: {
    background: '#fff', borderRadius: 14, width: '100%', maxWidth: 600,
    maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
    border: `1px solid ${T.border}`,
  },
}
