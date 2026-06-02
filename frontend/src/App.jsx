import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Calculadora from './modules/calculator/Calculadora'
import Alimentos from './modules/foods/Alimentos'
import PlanConstructor from './modules/plans/PlanConstructor'
import Pacientes from './modules/patients/Pacientes'
import Login from './modules/auth/Login'
import Agenda from './modules/agenda/Agenda'

function PlanWrapper() {
  const location = useLocation()
  const state = location.state || {}
  return (
    <PlanConstructor
      planInicial={state.planInicial || null}
      planId={state.planId || null}
      pacienteIdInicial={state.pacienteId || null}
      pacienteNombreInicial={state.pacienteNombre || null}
    />
  )
}

function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return <div style={{ textAlign: 'center', padding: '4rem', color: '#a8a29e' }}>Cargando...</div>
  if (!usuario) return <Navigate to="/login" replace />
  return children
}

function Layout() {
  const { usuario, logout } = useAuth()

  return (
    <div style={styles.app}>
      <nav style={styles.nav}>
        <span style={styles.logo}>🥗 NutriApp</span>
        <div style={styles.navLinks}>
          <NavLink to="/"
            style={({ isActive }) => isActive ? {...styles.link, ...styles.linkActive} : styles.link}>
            Calculadora
          </NavLink>
          <NavLink to="/alimentos"
            style={({ isActive }) => isActive ? {...styles.link, ...styles.linkActive} : styles.link}>
            Alimentos
          </NavLink>
          <NavLink to="/plan"
            style={({ isActive }) => isActive ? {...styles.link, ...styles.linkActive} : styles.link}>
            Constructor de Plan
          </NavLink>
          <NavLink to="/pacientes"
            style={({ isActive }) => isActive ? {...styles.link, ...styles.linkActive} : styles.link}>
            Pacientes
          </NavLink>
          <NavLink to="/agenda"
            style={({ isActive }) => isActive ? {...styles.link, ...styles.linkActive} : styles.link}>
            Agenda
          </NavLink>
        </div>
        <div style={styles.navRight}>
          <span style={styles.usuarioNombre}>👤 {usuario?.nombre}</span>
          <button style={styles.logoutBtn} onClick={logout}>Cerrar sesión</button>
        </div>
      </nav>
      <main style={styles.main}>
        <Routes>
          <Route path="/"          element={<Calculadora />} />
          <Route path="/alimentos" element={<Alimentos />} />
          <Route path="/plan"      element={<PlanWrapper />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/agenda" element={<Agenda />} />
        </Routes>
      </main>
    </div>
  )
}

function AppRoutes() {
  const { usuario, cargando } = useAuth()
  if (cargando) return <div style={{ textAlign: 'center', padding: '4rem', color: '#a8a29e' }}>Cargando...</div>

  return (
    <Routes>
      <Route path="/login" element={usuario ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/*" element={
        <RutaProtegida>
          <Layout />
        </RutaProtegida>
      } />
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

const styles = {
  app:           { minHeight: '100vh', backgroundColor: '#f5f5f4', fontFamily: 'system-ui, -apple-system, sans-serif' },
  nav:           { backgroundColor: '#ffffff', borderBottom: '1px solid #e7e5e4', padding: '0 2rem', height: '56px', display: 'flex', alignItems: 'center', gap: '2rem' },
  logo:          { fontWeight: '600', fontSize: '18px', color: '#1c1917', flexShrink: 0 },
  navLinks:      { display: 'flex', gap: '0.5rem', flex: 1 },
  link:          { padding: '6px 14px', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', color: '#57534e', transition: 'all 0.15s' },
  linkActive:    { backgroundColor: '#f0fdf4', color: '#16a34a', fontWeight: '500' },
  main:          { padding: '2rem', maxWidth: '1100px', margin: '0 auto' },
  navRight:      { display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 },
  usuarioNombre: { fontSize: '13px', color: '#57534e' },
  logoutBtn:     { padding: '6px 14px', borderRadius: '6px', border: '1px solid #e7e5e4', background: '#fff', fontSize: '13px', color: '#57534e', cursor: 'pointer' },
}