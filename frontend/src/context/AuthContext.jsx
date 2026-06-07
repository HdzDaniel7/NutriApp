import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [token, setToken] = useState(null)
  const [cargando, setCargando] = useState(true)

  // Al iniciar verificar si hay sesión guardada
  useEffect(() => {
    const tokenGuardado = sessionStorage.getItem('nutriapp_token')
    const usuarioGuardado = sessionStorage.getItem('nutriapp_usuario')
    if (tokenGuardado && usuarioGuardado) {
      const u = JSON.parse(usuarioGuardado)
      setToken(tokenGuardado)
      setUsuario(u)
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenGuardado}`
      if (u.color_pdf) aplicarTema(u.color_pdf)
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
    if (usuario.color_pdf) aplicarTema(usuario.color_pdf)
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
    return usuario
  }

  const aplicarTema = (colorId) => {
    const colores = {
      verde:    { p: '#16a34a', dark: '#15803d', light: '#22c55e', bg: '#f0fdf4', border: '#86efac' },
      azul:     { p: '#2563eb', dark: '#1d4ed8', light: '#3b82f6', bg: '#eff6ff', border: '#93c5fd' },
      marino:   { p: '#1e3a8a', dark: '#1e3a8a', light: '#2563eb', bg: '#eff6ff', border: '#93c5fd' },
      morado:   { p: '#7c3aed', dark: '#6d28d9', light: '#8b5cf6', bg: '#f5f3ff', border: '#c4b5fd' },
      rosa:     { p: '#db2777', dark: '#be185d', light: '#ec4899', bg: '#fdf2f8', border: '#f9a8d4' },
      rojo:     { p: '#dc2626', dark: '#b91c1c', light: '#ef4444', bg: '#fef2f2', border: '#fca5a5' },
      naranja:  { p: '#ea580c', dark: '#c2410c', light: '#f97316', bg: '#fff7ed', border: '#fdba74' },
      amarillo: { p: '#ca8a04', dark: '#a16207', light: '#eab308', bg: '#fefce8', border: '#fde047' },
      gris:     { p: '#374151', dark: '#1f2937', light: '#6b7280', bg: '#f9fafb', border: '#d1d5db' },
      negro:    { p: '#18181b', dark: '#09090b', light: '#3f3f46', bg: '#fafafa', border: '#d4d4d8' },
    }
    const c = colores[colorId] || colores.verde
    const root = document.documentElement
    root.style.setProperty('--color-primario',        c.p)
    root.style.setProperty('--color-primario-dark',   c.dark)
    root.style.setProperty('--color-primario-light',  c.light)
    root.style.setProperty('--color-primario-bg',     c.bg)
    root.style.setProperty('--color-primario-border', c.border)
  }

  const actualizarUsuario = (nuevoUsuario) => {
    setUsuario(nuevoUsuario)
    sessionStorage.setItem('nutriapp_usuario', JSON.stringify(nuevoUsuario))
    if (nuevoUsuario.color_pdf) aplicarTema(nuevoUsuario.color_pdf)
  }

  const logout = () => {
    setUsuario(null)
    setToken(null)
    delete api.defaults.headers.common['Authorization']
    sessionStorage.removeItem('nutriapp_token')
    sessionStorage.removeItem('nutriapp_usuario')
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