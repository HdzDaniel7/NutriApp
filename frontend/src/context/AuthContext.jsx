import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

/* ═══════════════════════════════════════════════════════
   PALETAS DE TEMA
   Cada color tiene dos capas:
   · pdf   → vibrante, para PDF e impresión
   · ui    → opaco/botánico, para el entorno de la app
═══════════════════════════════════════════════════════ */
const TEMAS = {
  verde: {
    pdf: { p: '#16a34a', dark: '#15803d', light: '#22c55e', bg: '#f0fdf4', border: '#86efac' },
    ui:  {
      bgPage: '#F4F7F1', bgNav: 'rgba(255,255,255,0.88)',
      green: '#3A7D52', greenLight: '#5A9E6F', greenPale: '#C8E0CC', greenBg: '#EBF4ED',
      txtPrimary: '#1E3A2A', txtSecondary: '#4A6B55', txtMuted: '#8AA896',
      border: '#D8E8D2', borderSubtle: '#EAF2E6',
      gridLine: '#D0E0C8',
    },
  },
  azul: {
    pdf: { p: '#2563eb', dark: '#1d4ed8', light: '#3b82f6', bg: '#eff6ff', border: '#93c5fd' },
    ui:  {
      bgPage: '#F1F5FA', bgNav: 'rgba(255,255,255,0.88)',
      green: '#2A5E8C', greenLight: '#4A82B4', greenPale: '#B8D4E8', greenBg: '#E8F2FA',
      txtPrimary: '#1A2E3D', txtSecondary: '#3A5A72', txtMuted: '#7A9DB8',
      border: '#C8DCF0', borderSubtle: '#E0EEF8',
      gridLine: '#C0D8EC',
    },
  },
  marino: {
    pdf: { p: '#1e3a8a', dark: '#1e3a8a', light: '#2563eb', bg: '#eff6ff', border: '#93c5fd' },
    ui:  {
      bgPage: '#F0F3F8', bgNav: 'rgba(255,255,255,0.88)',
      green: '#1E3A6A', greenLight: '#3A5E9E', greenPale: '#A8C0E0', greenBg: '#E4EAF6',
      txtPrimary: '#141E38', txtSecondary: '#2E4268', txtMuted: '#6A82A8',
      border: '#C0CEEA', borderSubtle: '#DAE4F4',
      gridLine: '#B8C8E4',
    },
  },
  morado: {
    pdf: { p: '#7c3aed', dark: '#6d28d9', light: '#8b5cf6', bg: '#f5f3ff', border: '#c4b5fd' },
    ui:  {
      bgPage: '#F5F3FA', bgNav: 'rgba(255,255,255,0.88)',
      green: '#5A3A8C', greenLight: '#7A5AB4', greenPale: '#C8B8E8', greenBg: '#EEE8F8',
      txtPrimary: '#2A1A3D', txtSecondary: '#4A3A6A', txtMuted: '#8A78A8',
      border: '#D8C8F0', borderSubtle: '#EAE4F8',
      gridLine: '#D0C0EC',
    },
  },
  rosa: {
    pdf: { p: '#db2777', dark: '#be185d', light: '#ec4899', bg: '#fdf2f8', border: '#f9a8d4' },
    ui:  {
      bgPage: '#FAF2F6', bgNav: 'rgba(255,255,255,0.88)',
      green: '#8C2A5A', greenLight: '#B44A7A', greenPale: '#E8B8CE', greenBg: '#F8E4EE',
      txtPrimary: '#3D1A28', txtSecondary: '#6A3A4E', txtMuted: '#A87888',
      border: '#F0C8DA', borderSubtle: '#F8E0EC',
      gridLine: '#ECC0D4',
    },
  },
  rojo: {
    pdf: { p: '#dc2626', dark: '#b91c1c', light: '#ef4444', bg: '#fef2f2', border: '#fca5a5' },
    ui:  {
      bgPage: '#FAF2F2', bgNav: 'rgba(255,255,255,0.88)',
      green: '#8C2A2A', greenLight: '#B44A4A', greenPale: '#E8B8B8', greenBg: '#F8E4E4',
      txtPrimary: '#3D1A1A', txtSecondary: '#6A3A3A', txtMuted: '#A87878',
      border: '#F0C8C8', borderSubtle: '#F8E0E0',
      gridLine: '#ECC0C0',
    },
  },
  naranja: {
    pdf: { p: '#ea580c', dark: '#c2410c', light: '#f97316', bg: '#fff7ed', border: '#fdba74' },
    ui:  {
      bgPage: '#FAF5EF', bgNav: 'rgba(255,255,255,0.88)',
      green: '#8C4A1A', greenLight: '#B47040', greenPale: '#E8C8A0', greenBg: '#F8EEE0',
      txtPrimary: '#3D2010', txtSecondary: '#6A4020', txtMuted: '#A88060',
      border: '#F0D0A8', borderSubtle: '#F8E8D0',
      gridLine: '#ECC89A',
    },
  },
  amarillo: {
    pdf: { p: '#ca8a04', dark: '#a16207', light: '#eab308', bg: '#fefce8', border: '#fde047' },
    ui:  {
      bgPage: '#FAFAF0', bgNav: 'rgba(255,255,255,0.88)',
      green: '#8C7010', greenLight: '#B49830', greenPale: '#E8DC90', greenBg: '#F8F4D8',
      txtPrimary: '#3D3408', txtSecondary: '#6A5818', txtMuted: '#A89848',
      border: '#F0E098', borderSubtle: '#F8F0C8',
      gridLine: '#ECD880',
    },
  },
  gris: {
    pdf: { p: '#374151', dark: '#1f2937', light: '#6b7280', bg: '#f9fafb', border: '#d1d5db' },
    ui:  {
      bgPage: '#F4F5F6', bgNav: 'rgba(255,255,255,0.88)',
      green: '#374151', greenLight: '#5A6472', greenPale: '#C0C8D0', greenBg: '#EAEcF0',
      txtPrimary: '#1A2028', txtSecondary: '#3A4452', txtMuted: '#7A8490',
      border: '#D0D8E0', borderSubtle: '#E4E8EC',
      gridLine: '#C8D0D8',
    },
  },
  negro: {
    pdf: { p: '#18181b', dark: '#09090b', light: '#3f3f46', bg: '#fafafa', border: '#d4d4d8' },
    ui:  {
      bgPage: '#F4F4F5', bgNav: 'rgba(255,255,255,0.88)',
      green: '#2C2C30', greenLight: '#4A4A50', greenPale: '#B8B8C0', greenBg: '#EAEAEC',
      txtPrimary: '#18181B', txtSecondary: '#3A3A40', txtMuted: '#787880',
      border: '#D0D0D8', borderSubtle: '#E4E4E8',
      gridLine: '#C8C8D0',
    },
  },
}

/* Aplica ambas capas al :root */
export function aplicarTema(colorId) {
  const tema = TEMAS[colorId] || TEMAS.verde
  const { pdf, ui } = tema
  const r = document.documentElement

  /* ── Variables PDF (compatibilidad con código existente) ── */
  r.style.setProperty('--color-primario',        pdf.p)
  r.style.setProperty('--color-primario-dark',   pdf.dark)
  r.style.setProperty('--color-primario-light',  pdf.light)
  r.style.setProperty('--color-primario-bg',     pdf.bg)
  r.style.setProperty('--color-primario-border', pdf.border)
  r.style.setProperty('--color-primario-text',   pdf.dark)
  r.style.setProperty('--color-primario-pale',   pdf.border)

  /* ── Variables UI (entorno opaco/botánico) ── */
  r.style.setProperty('--ui-bg-page',        ui.bgPage)
  r.style.setProperty('--ui-bg-nav',         ui.bgNav)
  r.style.setProperty('--ui-green',          ui.green)
  r.style.setProperty('--ui-green-light',    ui.greenLight)
  r.style.setProperty('--ui-green-pale',     ui.greenPale)
  r.style.setProperty('--ui-green-bg',       ui.greenBg)
  r.style.setProperty('--ui-txt-primary',    ui.txtPrimary)
  r.style.setProperty('--ui-txt-secondary',  ui.txtSecondary)
  r.style.setProperty('--ui-txt-muted',      ui.txtMuted)
  r.style.setProperty('--ui-border',         ui.border)
  r.style.setProperty('--ui-border-subtle',  ui.borderSubtle)
  r.style.setProperty('--ui-grid-line',      ui.gridLine)
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [token, setToken]     = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const tokenGuardado   = sessionStorage.getItem('nutriapp_token')
    const usuarioGuardado = sessionStorage.getItem('nutriapp_usuario')
    if (tokenGuardado && usuarioGuardado) {
      const u = JSON.parse(usuarioGuardado)
      setToken(tokenGuardado)
      setUsuario(u)
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenGuardado}`
      aplicarTema(u.color_pdf || 'verde')
    }
    setCargando(false)
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { usuario, token } = res.data
    setUsuario(usuario)
    setToken(token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    sessionStorage.setItem('nutriapp_token', token)
    sessionStorage.setItem('nutriapp_usuario', JSON.stringify(usuario))
    aplicarTema(usuario.color_pdf || 'verde')
    return usuario
  }

  const register = async (nombre, email, password, codigo) => {
    const res = await api.post('/auth/register', { nombre, email, password, codigo })
    const { usuario, token } = res.data
    setUsuario(usuario)
    setToken(token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    sessionStorage.setItem('nutriapp_token', token)
    sessionStorage.setItem('nutriapp_usuario', JSON.stringify(usuario))
    aplicarTema(usuario.color_pdf || 'verde')
    return usuario
  }

  const actualizarUsuario = (nuevoUsuario) => {
    setUsuario(nuevoUsuario)
    sessionStorage.setItem('nutriapp_usuario', JSON.stringify(nuevoUsuario))
    aplicarTema(nuevoUsuario.color_pdf || 'verde')
  }

  const logout = () => {
    setUsuario(null)
    setToken(null)
    delete api.defaults.headers.common['Authorization']
    sessionStorage.removeItem('nutriapp_token')
    sessionStorage.removeItem('nutriapp_usuario')
    aplicarTema('verde')
  }

  return (
    <AuthContext.Provider value={{ usuario, token, cargando, login, register, logout, actualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}