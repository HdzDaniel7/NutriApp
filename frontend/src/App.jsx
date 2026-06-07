import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Calculadora from './modules/calculator/Calculadora'
import Alimentos from './modules/foods/Alimentos'
import PlanConstructor from './modules/plans/PlanConstructor'
import Pacientes from './modules/patients/Pacientes'
import Login from './modules/auth/Login'
import Perfil from './modules/auth/Perfil'
import Agenda from './modules/agenda/Agenda'
import Dashboard from './modules/dashboard/Dashboard'

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
          <NavLink to="/calculadora"
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
          <NavLink to="/"
            style={({ isActive }) => isActive ? {...styles.link, ...styles.linkActive} : styles.link}>
            Dashboard
          </NavLink>
        </div>
        <div style={styles.navRight}>
          <NavLink to="/perfil" style={{ ...styles.usuarioNombre, textDecoration: 'none' }}>
            👤 {usuario?.nombre}
          </NavLink>
          <button style={styles.logoutBtn} onClick={logout}>Cerrar sesión</button>
        </div>
      </nav>
      <main style={styles.main}>
        <Routes>
          <Route path="/"            element={<Dashboard />} />
          <Route path="/calculadora" element={<Calculadora />} />
          <Route path="/alimentos" element={<Alimentos />} />
          <Route path="/plan"      element={<PlanWrapper />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/perfil" element={<Perfil />} />
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
  app: { minHeight: '100vh', backgroundColor: '#ececec', fontFamily: 'system-ui, -apple-system, sans-serif' },
  nav:           { backgroundColor: '#ffffff', borderBottom: '1px solid #e4e4e7', padding: '0 1.5rem', height: '52px', display: 'flex', alignItems: 'center', gap: '6px' },
  logo:          { fontWeight: '600', fontSize: '16px', color: '#18181b', marginRight: '8px', flexShrink: 0 },
  navLinks:      { display: 'flex', gap: '4px', flex: 1 },
  link:          { padding: '5px 13px', borderRadius: '20px', textDecoration: 'none', fontSize: '12px', color: '#3f3f46', background: '#f4f4f5', transition: 'all 0.15s' },
  linkActive:    { background: 'linear-gradient(135deg, var(--color-primario-light), var(--color-primario))', color: '#fff', fontWeight: '500' },
  main:          { padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' },
  navRight:      { display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 },
  usuarioNombre: { fontSize: '12px', color: '#71717a', textDecoration: 'none' },
  logoutBtn:     { padding: '5px 13px', borderRadius: '20px', border: '1px solid #e4e4e7', background: '#fff', fontSize: '12px', color: '#3f3f46', cursor: 'pointer' },
}