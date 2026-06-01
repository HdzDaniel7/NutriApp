import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import Calculadora from './modules/calculator/Calculadora'
import Alimentos from './modules/foods/Alimentos'
import PlanConstructor from './modules/plans/PlanConstructor'
import Pacientes from './modules/patients/Pacientes'

function App() {
  return (
    <BrowserRouter>
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
          </div>
        </nav>

        <main style={styles.main}>
          <Routes>
            <Route path="/" element={<Calculadora />} />
            <Route path="/alimentos" element={<Alimentos />} />
            <Route path="/plan" element={<PlanWrapper />} />
            <Route path="/pacientes" element={<Pacientes />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  )
}

const styles = {
  app:        { minHeight: '100vh', backgroundColor: '#f5f5f4', fontFamily: 'system-ui, -apple-system, sans-serif' },
  nav:        { backgroundColor: '#ffffff', borderBottom: '1px solid #e7e5e4', padding: '0 2rem', height: '56px', display: 'flex', alignItems: 'center', gap: '2rem' },
  logo:       { fontWeight: '600', fontSize: '18px', color: '#1c1917' },
  navLinks:   { display: 'flex', gap: '0.5rem' },
  link:       { padding: '6px 14px', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', color: '#57534e', transition: 'all 0.15s' },
  linkActive: { backgroundColor: '#f0fdf4', color: '#16a34a', fontWeight: '500' },
  main:       { padding: '2rem', maxWidth: '1100px', margin: '0 auto' },
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
    />
  )
}

export default App