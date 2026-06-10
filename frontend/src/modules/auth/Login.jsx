import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'

/* ================================================
   NUTRIDESK — DESIGN TOKENS
   Para cambiar paleta edita solo este objeto
   ================================================ */
const THEME = {
  brandPrimary:      '#7C3AED',
  brandPrimaryLight: '#9D5FF5',
  brandPrimaryDark:  '#4C1D95',
  brandAccent:       '#84CC16',
  brandAccentLight:  '#A3E635',
  bgPage:            '#0C0D18',
  bgLeafDark:        '#1B3A2A',
  bgLeafMid:         '#2D6A4F',
  bgLeafLight:       '#40916C',
  bgLeafPale:        '#52B788',
  bgCard:            'rgba(18,16,32,0.75)',
  bgInput:           'rgba(255,255,255,0.05)',
  bgInputFocus:      'rgba(124,58,237,0.1)',
  textPrimary:       '#F0EEF8',
  textSecondary:     '#A99EC6',
  textMuted:         '#6B5F8A',
  borderCard:        'rgba(255,255,255,0.07)',
  borderInput:       'rgba(255,255,255,0.08)',
  borderFocus:       'rgba(124,58,237,0.55)',
}

/* ---- Luciernagas animadas ---- */
function Fireflies() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Crear luciernagas: cuerpo pequeño hexagonal + halo de luz
    const flies = Array.from({ length: 28 }, () => ({
      x:     Math.random() * window.innerWidth,
      y:     Math.random() * window.innerHeight,
      vx:    (Math.random() - 0.5) * 0.4,
      vy:    (Math.random() - 0.5) * 0.4,
      phase: Math.random() * Math.PI * 2,
      speed: 0.008 + Math.random() * 0.012,
      size:  1.2 + Math.random() * 1.4,
      // alterna entre verde lima y morado
      color: Math.random() > 0.4
        ? { r: 132, g: 204, b: 22  }
        : { r: 157, g: 95,  b: 245 },
    }))

    const draw = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      flies.forEach(f => {
        // movimiento suave con oscilación
        f.x += f.vx + Math.sin(t * f.speed + f.phase) * 0.25
        f.y += f.vy + Math.cos(t * f.speed * 0.7 + f.phase) * 0.2

        // rebote suave en bordes
        if (f.x < -20)  f.x = canvas.width  + 20
        if (f.x > canvas.width  + 20) f.x = -20
        if (f.y < -20)  f.y = canvas.height + 20
        if (f.y > canvas.height + 20) f.y = -20

        // pulso de brillo
        const pulse = (Math.sin(t * f.speed * 3 + f.phase) + 1) / 2
        const alpha = 0.15 + pulse * 0.55
        const halo  = f.size * (6 + pulse * 5)

        const { r, g, b } = f.color

        // halo exterior difuso
        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, halo)
        grad.addColorStop(0,   `rgba(${r},${g},${b},${alpha * 0.35})`)
        grad.addColorStop(0.4, `rgba(${r},${g},${b},${alpha * 0.12})`)
        grad.addColorStop(1,   `rgba(${r},${g},${b},0)`)
        ctx.beginPath()
        ctx.arc(f.x, f.y, halo, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        // cuerpo hexagonal geométrico pequeño
        ctx.save()
        ctx.translate(f.x, f.y)
        ctx.rotate(t * f.speed * 0.5)
        ctx.beginPath()
        for (let i = 0; i < 6; i++) {
          const ang = (i / 6) * Math.PI * 2 - Math.PI / 6
          const px = Math.cos(ang) * f.size
          const py = Math.sin(ang) * f.size
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.fillStyle = `rgba(${r},${g},${b},${0.55 + pulse * 0.4})`
        ctx.fill()
        ctx.restore()

        // punto central brillante
        ctx.beginPath()
        ctx.arc(f.x, f.y, f.size * 0.4, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${0.5 + pulse * 0.45})`
        ctx.fill()
      })

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  )
}

/* ---- Mural botánico SVG de fondo ---- */
function BotanicMural() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
      <svg
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="1200" height="800" fill={THEME.bgPage} />

        {/* Grid geométrico */}
        <g stroke={THEME.brandPrimary} strokeWidth="0.4" fill="none" opacity="0.07">
          {[133,266,400,533,666].map(y => <line key={y} x1="0" y1={y} x2="1200" y2={y} />)}
          {[200,400,600,800,1000].map(x => <line key={x} x1={x} y1="0" x2={x} y2="800" />)}
        </g>

        {/* Hoja grande izquierda */}
        <path d="M-20 780 Q60 640 40 480 Q70 300 160 120 Q170 240 148 380 Q190 260 220 140 Q212 300 175 440 Q200 340 230 280 Q215 420 178 520 Q195 460 210 440 Q188 560 140 660 Z"
          fill={THEME.bgLeafDark} opacity="0.95" />
        <path d="M90 700 Q110 560 148 380" stroke={THEME.bgLeafMid} strokeWidth="1" fill="none" opacity="0.6" />
        <path d="M90 700 Q140 580 175 440" stroke={THEME.bgLeafMid} strokeWidth="0.8" fill="none" opacity="0.45" />
        <path d="M90 700 Q155 620 188 520" stroke={THEME.bgLeafDark} strokeWidth="0.6" fill="none" opacity="0.4" />
        <path d="M148 380 Q180 360 220 340" stroke={THEME.bgLeafLight} strokeWidth="0.5" fill="none" opacity="0.4" />
        <path d="M175 440 Q200 425 225 415" stroke={THEME.bgLeafLight} strokeWidth="0.5" fill="none" opacity="0.35" />
        <circle cx="160" cy="120" r="5"  fill={THEME.brandAccent} opacity="0.9" />
        <circle cx="160" cy="120" r="12" fill="none" stroke={THEME.brandAccent} strokeWidth="0.6" opacity="0.35" />
        <circle cx="160" cy="120" r="22" fill="none" stroke={THEME.brandAccent} strokeWidth="0.35" opacity="0.18" />

        {/* Hoja media izquierda */}
        <path d="M-20 500 Q30 420 25 340 Q45 260 90 180 Q95 250 82 310 Q105 255 118 195 Q112 270 92 340 Q108 290 120 265 Q108 345 88 410 Z"
          fill={THEME.bgLeafDark} opacity="0.75" />
        <path d="M40 470 Q55 390 82 310" stroke={THEME.bgLeafMid} strokeWidth="0.7" fill="none" opacity="0.5" />
        <circle cx="90" cy="180" r="3" fill={THEME.brandAccent} opacity="0.65" />
        <circle cx="90" cy="180" r="8" fill="none" stroke={THEME.brandAccent} strokeWidth="0.4" opacity="0.25" />

        {/* Hoja grande derecha */}
        <path d="M1220 780 Q1140 640 1155 470 Q1130 290 1040 100 Q1028 230 1052 380 Q1010 255 980 130 Q990 300 1025 440 Q1000 340 972 280 Q990 420 1022 520 Q1005 460 992 445 Q1014 565 1060 660 Z"
          fill={THEME.bgLeafDark} opacity="0.9" />
        <path d="M1110 700 Q1088 555 1052 380" stroke={THEME.bgLeafMid} strokeWidth="1" fill="none" opacity="0.55" />
        <path d="M1110 700 Q1062 578 1025 440" stroke={THEME.bgLeafMid} strokeWidth="0.8" fill="none" opacity="0.4" />
        <path d="M1110 700 Q1048 615 1022 520" stroke={THEME.bgLeafDark} strokeWidth="0.6" fill="none" opacity="0.38" />
        <path d="M1052 380 Q1020 362 980 345" stroke={THEME.bgLeafLight} strokeWidth="0.5" fill="none" opacity="0.38" />
        <circle cx="1040" cy="100" r="5"  fill={THEME.brandAccent} opacity="0.85" />
        <circle cx="1040" cy="100" r="12" fill="none" stroke={THEME.brandAccent} strokeWidth="0.6" opacity="0.3" />
        <circle cx="1040" cy="100" r="22" fill="none" stroke={THEME.brandAccent} strokeWidth="0.3" opacity="0.15" />

        {/* Hoja pequeña derecha alta */}
        <path d="M1220 320 Q1168 258 1172 195 Q1155 130 1110 70 Q1104 138 1116 195 Q1092 138 1078 80 Q1083 150 1100 210 Q1082 170 1068 150 Q1082 230 1103 285 Z"
          fill={THEME.bgLeafDark} opacity="0.7" />
        <path d="M1148 305 Q1134 235 1116 175" stroke={THEME.bgLeafMid} strokeWidth="0.6" fill="none" opacity="0.45" />
        <circle cx="1110" cy="70" r="3" fill={THEME.brandAccent} opacity="0.6" />

        {/* Tallos base izquierda */}
        <path d="M300 800 Q320 700 310 600 Q330 520 360 460" stroke={THEME.bgLeafMid} strokeWidth="1.2" fill="none" opacity="0.4" />
        <path d="M360 460 Q380 440 400 455 Q375 465 360 460Z" fill={THEME.bgLeafLight} opacity="0.5" />
        <path d="M360 460 Q342 438 330 452 Q348 462 360 460Z" fill={THEME.bgLeafLight} opacity="0.45" />
        <path d="M318 560 Q295 548 290 562 Q306 568 318 560Z" fill={THEME.bgLeafMid} opacity="0.45" />

        {/* Tallos base derecha */}
        <path d="M900 800 Q882 700 888 600 Q870 520 842 455" stroke={THEME.bgLeafDark} strokeWidth="1.2" fill="none" opacity="0.38" />
        <path d="M842 455 Q822 437 802 450 Q825 462 842 455Z" fill={THEME.bgLeafLight} opacity="0.45" />
        <path d="M842 455 Q860 436 872 450 Q855 462 842 455Z" fill={THEME.bgLeafLight} opacity="0.4" />

        {/* Puntos en intersecciones de grid */}
        <circle cx="400" cy="266" r="1.5" fill={THEME.brandAccent} opacity="0.22" />
        <circle cx="800" cy="133" r="1.5" fill={THEME.brandAccent} opacity="0.18" />
        <circle cx="200" cy="533" r="1.2" fill={THEME.brandPrimary} opacity="0.28" />
        <circle cx="1000" cy="400" r="1.5" fill={THEME.brandPrimary} opacity="0.22" />
        <circle cx="600" cy="666" r="1.2" fill={THEME.brandAccent} opacity="0.18" />

        {/* Viñeta */}
        <defs>
          <radialGradient id="nd-vig" cx="50%" cy="50%" r="75%">
            <stop offset="10%" stopColor="transparent" />
            <stop offset="100%" stopColor={THEME.bgPage} />
          </radialGradient>
        </defs>
        <rect width="1200" height="800" fill="url(#nd-vig)" opacity="0.65" />
      </svg>
    </div>
  )
}

/* ---- Ícono hoja para brand ---- */
function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: 22, height: 22, position: 'relative', zIndex: 1 }}>
      <path d="M12 21 Q8 17 7 13 Q6 9 9 6 Q10 9 11 11 Q11 7 13 4 Q15 7 15 11 Q16 9 17 6 Q20 9 19 13 Q18 17 14 21 Q13 21.5 12 21Z"
        fill={THEME.brandAccent} opacity="0.95" />
      <path d="M12 21 L12 11" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" fill="none" />
      <path d="M12 15 Q10 13 9 11" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" fill="none" />
      <path d="M12 13 Q14 11 15 9" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" fill="none" />
    </svg>
  )
}

/* ---- Input con ícono ---- */
function Field({ label, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11.5, fontWeight: 500, color: THEME.textSecondary, letterSpacing: '0.25px' }}>
        {label}
      </label>
      {children}
      {hint && <span style={{ fontSize: 11, color: THEME.textMuted }}>{hint}</span>}
    </div>
  )
}

function TextInput({ icon, type = 'text', placeholder, value, onChange, onKeyDown, rightSlot }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <span style={{
        position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
        color: focused ? THEME.brandPrimaryLight : THEME.textMuted,
        pointerEvents: 'none', display: 'flex', alignItems: 'center',
        transition: 'color 0.2s',
      }}>
        {icon}
      </span>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={onChange} onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', height: 48,
          background: focused ? THEME.bgInputFocus : THEME.bgInput,
          border: `1px solid ${focused ? THEME.borderFocus : THEME.borderInput}`,
          borderRadius: 11,
          color: THEME.textPrimary,
          fontSize: 14, padding: '0 42px',
          outline: 'none',
          boxShadow: focused ? `0 0 0 3px rgba(124,58,237,0.1)` : 'none',
          transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
        }}
      />
      {rightSlot && (
        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
          {rightSlot}
        </span>
      )}
    </div>
  )
}

/* ---- Íconos SVG inline ---- */
const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="3" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)
const IconLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
)
const IconKey = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5" /><path d="m21 2-9.6 9.6M15.5 7.5l3 3" />
  </svg>
)
const IconEnter = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
  </svg>
)
const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconSpin = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    style={{ animation: 'nd-spin 0.7s linear infinite' }}>
    <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
)

/* ==================================================
   COMPONENTE PRINCIPAL — Login
   Lógica idéntica al original, solo visual nuevo
   ================================================== */
export default function Login() {
  const { login, register } = useAuth()
  const [modo, setModo] = useState('login')
  const [form, setForm] = useState({ nombre: '', email: '', password: '', codigo: '' })
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [btnOk, setBtnOk] = useState(false)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async () => {
    setError(null)
    if (!form.email || !form.password) { setError('Email y contraseña son requeridos'); return }
    if (modo === 'register' && !form.nombre) { setError('El nombre es requerido'); return }

    setCargando(true)
    try {
      if (modo === 'login') {
        await login(form.email, form.password)
      } else {
        await register(form.nombre, form.email, form.password, form.codigo)
      }
      setBtnOk(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setCargando(false)
    }
  }

  const onEnter = e => e.key === 'Enter' && handleSubmit()

  /* ---- Estilos de la card ---- */
  const card = {
    position: 'relative',
    background: THEME.bgCard,
    border: `1px solid ${THEME.borderCard}`,
    borderRadius: 22,
    backdropFilter: 'blur(28px)',
    WebkitBackdropFilter: 'blur(28px)',
    padding: '44px 38px 38px',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    overflow: 'hidden',
  }

  const btnStyle = {
    height: 50,
    background: btnOk
      ? 'linear-gradient(135deg,#166534,#16a34a)'
      : `linear-gradient(135deg,${THEME.brandPrimary},${THEME.brandPrimaryLight})`,
    border: 'none',
    borderRadius: 11,
    color: '#fff',
    fontSize: 14.5,
    fontWeight: 600,
    cursor: cargando ? 'default' : 'pointer',
    boxShadow: btnOk
      ? '0 4px 24px rgba(22,163,74,0.45)'
      : `0 4px 28px rgba(124,58,237,0.5)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'transform 0.15s, box-shadow 0.15s, background 0.3s',
    marginTop: 4,
  }

  const EyeIcon = () => showPwd
    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>

  return (
    <>
      {/* Keyframes globales */}
      <style>{`
        @keyframes nd-spin { to { transform: rotate(360deg); } }
        body { margin: 0; }
      `}</style>

      {/* Fondo mural */}
      <BotanicMural />

      {/* Luciernagas */}
      <Fireflies />

      {/* Página */}
      <div style={{
        position: 'relative', zIndex: 2,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 16,
        background: 'transparent',
      }}>
        <div style={card}>

          {/* Brillo borde superior */}
          <div style={{
            position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
            background: `linear-gradient(90deg, transparent, rgba(132,204,22,0.45) 35%, rgba(157,95,245,0.3) 65%, transparent)`,
          }} />

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 8 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 11, flexShrink: 0,
              background: `linear-gradient(140deg,${THEME.brandPrimary},${THEME.brandPrimaryLight})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 18px rgba(124,58,237,0.38)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                background: 'rgba(255,255,255,0.08)',
              }} />
              <LeafIcon />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: THEME.textPrimary, letterSpacing: '-0.4px' }}>
                NutriDesk
              </div>
              <div style={{ fontSize: 10.5, color: THEME.brandAccent, fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase', marginTop: 2 }}>
                Plataforma clínica
              </div>
            </div>
          </div>

          {/* Headline */}
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: THEME.textPrimary, letterSpacing: '-0.5px', margin: 0, lineHeight: 1.2 }}>
              {modo === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
            </h1>
            <p style={{ fontSize: 13.5, color: THEME.textSecondary, margin: '5px 0 0' }}>
              {modo === 'login' ? 'Accede a tu espacio de trabajo' : 'Cuenta de nutriólogo'}
            </p>
          </div>

          {/* Toggle modo */}
          <div style={{
            display: 'flex', borderRadius: 10, overflow: 'hidden',
            border: `1px solid ${THEME.borderInput}`,
          }}>
            {[{ id: 'login', label: 'Iniciar sesión' }, { id: 'register', label: 'Registrarse' }].map(m => (
              <button
                key={m.id}
                onClick={() => { setModo(m.id); setError(null); setBtnOk(false) }}
                style={{
                  flex: 1, padding: '9px 8px', fontSize: 13,
                  cursor: 'pointer', border: 'none',
                  background: modo === m.id
                    ? `rgba(124,58,237,0.18)`
                    : 'rgba(255,255,255,0.03)',
                  color: modo === m.id ? THEME.brandPrimaryLight : THEME.textMuted,
                  fontWeight: modo === m.id ? 600 : 400,
                  transition: 'all 0.2s',
                  borderRight: m.id === 'login' ? `1px solid ${THEME.borderInput}` : 'none',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Campos solo registro */}
          {modo === 'register' && (
            <>
              <Field label="Nombre completo">
                <TextInput
                  icon={<IconUser />} type="text"
                  placeholder="Tu nombre completo"
                  value={form.nombre}
                  onChange={e => set('nombre', e.target.value)}
                  onKeyDown={onEnter}
                />
              </Field>
              <Field label="Código de registro" hint="Solicita el código al administrador">
                <TextInput
                  icon={<IconKey />} type="text"
                  placeholder="Código de acceso"
                  value={form.codigo}
                  onChange={e => set('codigo', e.target.value)}
                  onKeyDown={onEnter}
                />
              </Field>
            </>
          )}

          {/* Email */}
          <Field label="Correo electrónico">
            <TextInput
              icon={<IconMail />} type="email"
              placeholder="tu@correo.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              onKeyDown={onEnter}
            />
          </Field>

          {/* Password */}
          <Field label="Contraseña">
            <TextInput
              icon={<IconLock />}
              type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              onKeyDown={onEnter}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: THEME.textMuted, display: 'flex', alignItems: 'center',
                    padding: 4,
                  }}
                >
                  <EyeIcon />
                </button>
              }
            />
          </Field>

          {/* Olvidé contraseña — solo login */}
          {modo === 'login' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -6 }}>
              <a href="#" style={{ fontSize: 12.5, color: THEME.brandAccent, textDecoration: 'none', fontWeight: 500 }}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 10, padding: '10px 14px',
              fontSize: 13, color: '#FCA5A5',
            }}>
              {error}
            </div>
          )}

          {/* Botón principal */}
          <button style={btnStyle} onClick={handleSubmit} disabled={cargando}>
            {cargando ? <><IconSpin /> Verificando...</>
              : btnOk    ? <><IconCheck /> ¡Acceso concedido!</>
              : modo === 'login' ? <><IconEnter /> Iniciar sesión</>
              : <><IconCheck /> Crear cuenta</>}
          </button>

          {/* Info bar */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '11px 14px',
            background: 'rgba(132,204,22,0.05)',
            border: '1px solid rgba(132,204,22,0.1)',
            borderRadius: 11, marginTop: 2,
          }}>
            <svg viewBox="0 0 18 18" fill="none" style={{ width: 18, height: 18, flexShrink: 0, marginTop: 1 }}>
              <path d="M9 17 Q6 14 5.5 11 Q5 8 7.5 5.5 Q8 7.5 8.5 9 Q8.5 6.5 10 4 Q11.5 6.5 11.5 9 Q12 7.5 12.5 5.5 Q15 8 14.5 11 Q14 14 11 17 Q10 17.4 9 17Z"
                fill={THEME.brandAccent} opacity="0.85" />
              <path d="M9 17 L9 9" stroke="rgba(255,255,255,0.35)" strokeWidth="0.7" fill="none" />
            </svg>
            <p style={{ fontSize: 12, color: THEME.textSecondary, lineHeight: 1.5, margin: 0 }}>
              {modo === 'login'
                ? <>¿Primera vez? Solicita tu acceso con <strong style={{ color: THEME.brandAccent, fontWeight: 600 }}>tu administrador de clínica</strong></>
                : <>Necesitas un <strong style={{ color: THEME.brandAccent, fontWeight: 600 }}>código de registro</strong> para crear tu cuenta</>
              }
            </p>
          </div>

        </div>

        <p style={{ marginTop: 14, fontSize: 12, color: THEME.textMuted, textAlign: 'center' }}>
          ¿Problemas para acceder?{' '}
          <a href="#" style={{ color: THEME.brandAccent, textDecoration: 'none', fontWeight: 500 }}>
            Contactar soporte
          </a>
        </p>
      </div>
    </>
  )
}


