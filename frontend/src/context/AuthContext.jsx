import { createContext, useContext, useState, useEffect, useLayoutEffect, useCallback } from 'react'
import api, { setLogoutHandler } from '../services/api'
import { aplicarTema } from '../utils/theme'

const AuthContext = createContext(null)

function leerSesion() {
  try {
    const token   = sessionStorage.getItem('nutriapp_token')
    const rawUser = sessionStorage.getItem('nutriapp_usuario')
    const usuario = rawUser ? JSON.parse(rawUser) : null
    return { token, usuario }
  } catch {
    return { token: null, usuario: null }
  }
}

export function AuthProvider({ children }) {
  // sessionStorage es síncrono: no hay loading real que esperar
  const [token,    setToken]    = useState(() => leerSesion().token)
  const [usuario,  setUsuario]  = useState(() => leerSesion().usuario)
  const cargando = false

  // Aplica header de axios y tema en el primer paint — sin actualizar estado
  useLayoutEffect(() => {
    const { token: t, usuario: u } = leerSesion()
    if (t && u) {
      api.defaults.headers.common['Authorization'] = `Bearer ${t}`
      aplicarTema(u.color_pdf || 'verde')
    }
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { usuario: u, token: t } = res.data
    setUsuario(u)
    setToken(t)
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`
    sessionStorage.setItem('nutriapp_token',   t)
    sessionStorage.setItem('nutriapp_usuario', JSON.stringify(u))
    aplicarTema(u.color_pdf || 'verde')
    return u
  }

  const register = async (nombre, email, password, codigo) => {
    const res = await api.post('/auth/register', { nombre, email, password, codigo })
    const { usuario: u, token: t } = res.data
    setUsuario(u)
    setToken(t)
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`
    sessionStorage.setItem('nutriapp_token',   t)
    sessionStorage.setItem('nutriapp_usuario', JSON.stringify(u))
    aplicarTema(u.color_pdf || 'verde')
    return u
  }

  const actualizarUsuario = (nuevoUsuario) => {
    setUsuario(nuevoUsuario)
    sessionStorage.setItem('nutriapp_usuario', JSON.stringify(nuevoUsuario))
    aplicarTema(nuevoUsuario.color_pdf || 'verde')
  }

  const logout = useCallback(() => {
    setUsuario(null)
    setToken(null)
    delete api.defaults.headers.common['Authorization']
    sessionStorage.removeItem('nutriapp_token')
    sessionStorage.removeItem('nutriapp_usuario')
    aplicarTema('verde')
  }, [])

  useEffect(() => {
    setLogoutHandler(logout)
    return () => setLogoutHandler(null)
  }, [logout])

  return (
    <AuthContext.Provider value={{ usuario, token, cargando, login, register, logout, actualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
