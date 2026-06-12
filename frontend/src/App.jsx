import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import Calculadora from './modules/calculator/Calculadora'
import Alimentos from './modules/foods/Alimentos'
import PlanConstructor from './modules/plans/PlanConstructor'
import Pacientes from './modules/patients/Pacientes'
import Login from './modules/auth/Login'
import Perfil from './modules/auth/Perfil'
import Agenda from './modules/agenda/Agenda'
import Dashboard from './modules/dashboard/Dashboard'

const NavIcons = {
  dashboard: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  calc:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>,
  foods:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a9 9 0 0 1 9 9"/><circle cx="12" cy="12" r="4"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/></svg>,
  plan:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>,
  patients:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  agenda:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  logout:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
}

const NAV_ITEMS = [
  { to: '/',            label: 'Dashboard',   icon: NavIcons.dashboard },
  { to: '/calculadora', label: 'Calculadora', icon: NavIcons.calc },
  { to: '/alimentos',   label: 'Alimentos',   icon: NavIcons.foods },
  { to: '/plan',        label: 'Plan',        icon: NavIcons.plan },
  { to: '/pacientes',   label: 'Pacientes',   icon: NavIcons.patients },
  { to: '/agenda',      label: 'Agenda',      icon: NavIcons.agenda },
]

function LeafMark({ size = 30 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 7, flexShrink: 0,
      background: 'linear-gradient(140deg, var(--ui-green), var(--ui-green-light))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    }}>
      <svg viewBox="0 0 24 24" fill="none" style={{ width: size * 0.55, height: size * 0.55 }}>
        <path d="M12 20 Q9 16 8.5 13 Q8 10 10.5 7 Q11 9.5 11.5 11 Q11.5 8 13 5.5 Q14.5 8 14.5 11 Q15 9.5 15.5 7 Q18 10 17.5 13 Q17 16 14 20 Q13 20.4 12 20Z"
          fill="rgba(255,255,255,0.92)" />
        <path d="M12 20 L12 11" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" fill="none" />
      </svg>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--ui-bg-page)',
      flexDirection: 'column', gap: 12,
    }}>
      <LeafMark size={36} />
      <span style={{ fontSize: 13, color: 'var(--ui-txt-muted)', letterSpacing: '0.5px' }}>Cargando…</span>
    </div>
  )
}

function BotanicBg() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <svg viewBox="0 0 1400 900" preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
        <rect width="1400" height="900" fill="var(--ui-bg-page)" />
        <g stroke="var(--ui-grid-line)" strokeWidth="0.5" fill="none" opacity="0.7">
          {[150,300,450,600,750].map(y => <line key={`h${y}`} x1="0" y1={y} x2="1400" y2={y}/>)}
          {[175,350,525,700,875,1050,1225].map(x => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="900"/>)}
        </g>
        {[175,525,875,1225].map(x => [150,450,750].map(y =>
          <circle key={`d${x}${y}`} cx={x} cy={y} r="1.8" fill="var(--ui-green-light)" opacity="0.3"/>
        ))}
        <path d="M-15 880 Q25 780 15 680 Q35 570 95 440 Q98 510 90 570 Q115 490 130 420 Q122 510 100 590 Q118 530 132 510 Q116 610 85 700 Q100 650 112 635 Q90 730 50 810 Z"
          fill="var(--ui-green-light)" opacity="0.15"/>
        <path d="M60 820 Q75 720 90 570" stroke="var(--ui-green)" strokeWidth="0.8" fill="none" opacity="0.2"/>
        <circle cx="95" cy="440" r="4" fill="var(--ui-green)" opacity="0.3"/>
        <circle cx="95" cy="440" r="10" fill="none" stroke="var(--ui-green)" strokeWidth="0.6" opacity="0.15"/>
        <circle cx="95" cy="440" r="18" fill="none" stroke="var(--ui-green)" strokeWidth="0.4" opacity="0.09"/>
        <path d="M-15 420 Q12 360 6 300 Q20 235 55 170 Q57 215 51 255 Q65 218 72 178 Q69 228 56 268 Q66 242 74 230 Q63 278 48 330 Z"
          fill="var(--ui-green-light)" opacity="0.12"/>
        <circle cx="55" cy="170" r="3" fill="var(--ui-green)" opacity="0.25"/>
        <path d="M1415 880 Q1375 780 1385 680 Q1365 570 1305 440 Q1302 510 1310 570 Q1285 490 1270 420 Q1278 510 1300 590 Q1282 530 1268 510 Q1284 610 1315 700 Q1300 650 1288 635 Q1310 730 1350 810 Z"
          fill="var(--ui-green-light)" opacity="0.14"/>
        <circle cx="1305" cy="440" r="4" fill="var(--ui-green)" opacity="0.28"/>
        <circle cx="1305" cy="440" r="10" fill="none" stroke="var(--ui-green)" strokeWidth="0.6" opacity="0.13"/>
        <path d="M1415 350 Q1390 298 1395 248 Q1382 196 1352 148 Q1350 185 1355 215 Q1342 188 1336 158 Q1339 196 1351 224 Q1342 204 1335 195 Q1344 234 1358 272 Z"
          fill="var(--ui-green-light)" opacity="0.11"/>
        <circle cx="1352" cy="148" r="3" fill="var(--ui-green)" opacity="0.22"/>
        <defs>
          <radialGradient id="nd-day-vig" cx="50%" cy="50%" r="70%">
            <stop offset="20%" stopColor="transparent"/>
            <stop offset="100%" stopColor="var(--ui-bg-page)"/>
          </radialGradient>
        </defs>
        <rect width="1400" height="900" fill="url(#nd-day-vig)" opacity="0.45"/>
      </svg>
    </div>
  )
}

function PlanWrapper() {
  const location = useLocation()
  const state = location.state || {}
  return (
    <PlanConstructor
      planInicial={state.planInicial || null}
      planId={state.planId || null}
      pacienteIdInicial={state.pacienteId || null}
      pacienteNombreInicial={state.pacienteNombre || null}
      vctInicial={state.vctInicial || null}
      distribucionInicial={state.distribucionInicial || null}
      consultaIdInicial={state.consultaId || null}
    />
  )
}

function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return <LoadingScreen />
  if (!usuario) return <Navigate to="/login" replace />
  return children
}

function Layout() {
  const { usuario, logout } = useAuth()
  const location = useLocation()
  const pageTitle = NAV_ITEMS.find(n =>
    n.to === '/' ? location.pathname === '/' : location.pathname.startsWith(n.to)
  )?.label || 'NutriDesk'

  return (
    <div style={{ minHeight: '100vh', position: 'relative', background: 'var(--ui-bg-page)' }}>
      <BotanicBg />
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 64,
        background: 'var(--ui-bg-nav)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--ui-border)',
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: 6,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginRight: 16, flexShrink: 0 }}>
          <LeafMark size={30} />
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--ui-txt-primary)', letterSpacing: '-0.3px' }}>
            NutriDesk
          </span>
        </div>
        <div style={{ width: 1, height: 22, background: 'var(--ui-border)', marginRight: 10, flexShrink: 0 }} />
        <div style={{ display: 'flex', gap: 2, flex: 1, alignItems: 'center' }}>
          {NAV_ITEMS.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 16px', borderRadius: 10,
                textDecoration: 'none', fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--ui-green)' : 'var(--ui-txt-secondary)',
                background: isActive ? 'var(--ui-green-bg)' : 'transparent',
                border: isActive ? '1px solid var(--ui-green-pale)' : '1px solid transparent',
                transition: 'all 0.15s',
              })}
            >
              <span style={{ opacity: 0.8 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <NavLink to="/perfil" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--ui-green-bg)',
              border: '1.5px solid var(--ui-green-pale)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: 'var(--ui-green)',
            }}>
              {usuario?.nombre?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <span style={{ fontSize: 13.5, color: 'var(--ui-txt-secondary)', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {usuario?.nombre}
            </span>
          </NavLink>
          <button onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 14px', borderRadius: 10,
              border: '1px solid var(--ui-border)',
              background: 'transparent', fontSize: 13.5,
              color: 'var(--ui-txt-muted)', cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='#FEF2F2'; e.currentTarget.style.color='#DC2626'; e.currentTarget.style.borderColor='#FECACA' }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--ui-txt-muted)'; e.currentTarget.style.borderColor='var(--ui-border)' }}
          >
            {NavIcons.logout} Salir
          </button>
        </div>
      </nav>
      <main style={{ position: 'relative', zIndex: 1, paddingTop: 64, minHeight: '100vh' }}>
        <div style={{
          borderBottom: '1px solid var(--ui-border)',
          background: 'rgba(255,255,255,0.55)',
          padding: '10px 28px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{
            width: 4, height: 16, borderRadius: 2,
            background: 'linear-gradient(180deg, var(--ui-green), var(--ui-green-light))',
            display: 'inline-block', flexShrink: 0,
          }} />
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ui-txt-primary)' }}>{pageTitle}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, opacity: 0.3 }}>
            {[0,1,2,1,0].map((s,i) => (
              <svg key={i} viewBox="0 0 18 18" fill="none"
                style={{ width: 12+s*5, height: 12+s*5, transform: i>2?'scaleX(-1)':'none' }}>
                <path d="M9 16 Q7 13 6.5 10.5 Q6 8 8 6 Q8.5 8 9 9.5 Q9 7.5 10.5 5.5 Q12 7.5 12 9.5 Q12.5 8 13 6 Q15 8 14.5 10.5 Q14 13 11 16 Q10 16.3 9 16Z"
                  fill="var(--ui-green)"/>
              </svg>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 28px' }}>
          <Routes>
            <Route path="/"            element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
            <Route path="/calculadora" element={<ErrorBoundary><Calculadora /></ErrorBoundary>} />
            <Route path="/alimentos"   element={<ErrorBoundary><Alimentos /></ErrorBoundary>} />
            <Route path="/plan"        element={<ErrorBoundary><PlanWrapper /></ErrorBoundary>} />
            <Route path="/pacientes"   element={<ErrorBoundary><Pacientes /></ErrorBoundary>} />
            <Route path="/agenda"      element={<ErrorBoundary><Agenda /></ErrorBoundary>} />
            <Route path="/perfil"      element={<ErrorBoundary><Perfil /></ErrorBoundary>} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

function AppRoutes() {
  const { usuario, cargando } = useAuth()
  if (cargando) return <LoadingScreen />
  return (
    <Routes>
      <Route path="/login" element={usuario ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/*" element={<RutaProtegida><Layout /></RutaProtegida>} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}