import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: BASE,
  timeout: 10000,
})

// ─────────────────────────────────────────────
// Auto-logout cuando el token expira (401)
// ─────────────────────────────────────────────
let _logoutHandler = null
export const setLogoutHandler = (fn) => { _logoutHandler = fn }

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/me']

api.interceptors.response.use(
  response => response,
  error => {
    const url = error.config?.url || ''
    const esEndpointAuth = AUTH_ENDPOINTS.some(e => url.includes(e))
    if (error.response?.status === 401 && !esEndpointAuth && _logoutHandler) {
      _logoutHandler()
    }
    return Promise.reject(error)
  }
)

// ─────────────────────────────────────────────
// ALIMENTOS
// ─────────────────────────────────────────────
export const foodsAPI = {
  search:  (params) => api.get('/foods/search', { params }),
  tipos:   ()       => api.get('/foods/meta/tipos'),
  getById: (id)     => api.get(`/foods/${id}`),
}

// ─────────────────────────────────────────────
// CALCULADORA
// ─────────────────────────────────────────────
export const calculatorAPI = {
  calcular: (datos) => api.post('/calculator/calcular', datos),
}

// ─────────────────────────────────────────────
// PACIENTES
// ─────────────────────────────────────────────
export const patientsAPI = {
  list:     (params)      => api.get('/patients', { params }),
  create:   (data)        => api.post('/patients', data),
  getById:  (id)          => api.get(`/patients/${id}`),
  update:   (id, data)    => api.put(`/patients/${id}`, data),
  delete:   (id)          => api.delete(`/patients/${id}`),
}

// ─────────────────────────────────────────────
// CONSULTAS
// ─────────────────────────────────────────────
export const consultasAPI = {
  list:   (patientId)        => api.get(`/patients/${patientId}/consultas`),
  create: (patientId, data)  => api.post(`/patients/${patientId}/consultas`, data),
}

// ─────────────────────────────────────────────
// PLANES
// ─────────────────────────────────────────────
export const plansAPI = {
  save:         (patientId, plan) => api.post(`/patients/${patientId}/planes`, plan),
  getByPatient: (patientId)       => api.get(`/patients/${patientId}/planes`),
  getById:      (id)              => api.get(`/plans/${id}`),
  update:       (id, plan)        => api.put(`/plans/${id}`, plan),
  delete:       (id)              => api.delete(`/plans/${id}`),
  duplicar:     (id)              => api.post(`/plans/${id}/duplicar`),
  renombrar:    (id, nombre)      => api.patch(`/plans/${id}/renombrar`, { nombre }),
}

// ─────────────────────────────────────────────
// AGENDA
// ─────────────────────────────────────────────
export const agendaAPI = {
  getConfig:    ()               => api.get('/agenda/config'),
  updateConfig: (data)           => api.put('/agenda/config', data),
  getCitas:     (params)         => api.get('/agenda/citas', { params }),
  getCitasMes:  (año, mes)       => api.get('/agenda/citas/mes', { params: { año, mes } }),
  createCita:   (data)           => api.post('/agenda/citas', data),
  updateCita:   (id, data)       => api.put(`/agenda/citas/${id}`, data),
  deleteCita:   (id)             => api.delete(`/agenda/citas/${id}`),
  updateEstado: (id, estado)     => api.patch(`/agenda/citas/${id}/estado`, { estado }),
}

export default api
