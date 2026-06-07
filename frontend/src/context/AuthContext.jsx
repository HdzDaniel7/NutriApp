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
      setToken(tokenGuardado)
      setUsuario(JSON.parse(usuarioGuardado))
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenGuardado}`
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

  const actualizarUsuario = (nuevoUsuario) => {
    setUsuario(nuevoUsuario)
    sessionStorage.setItem('nutriapp_usuario', JSON.stringify(nuevoUsuario))
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