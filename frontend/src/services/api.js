import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: BASE,
  timeout: 10000,
})

// ─────────────────────────────────────────────
// Interceptor global de errores
// Centraliza el manejo de errores de red
// ─────────────────────────────────────────────
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message)
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
// PACIENTES — fase 2
// ─────────────────────────────────────────────
export const patientsAPI = {
  list:     ()           => api.get('/patients'),
  create:   (data)       => api.post('/patients', data),
  getById:  (id)         => api.get(`/patients/${id}`),
  update:   (id, data)   => api.put(`/patients/${id}`, data),
  delete:   (id)         => api.delete(`/patients/${id}`),
}

// ─────────────────────────────────────────────
// CONSULTAS — fase 2
// ─────────────────────────────────────────────
export const consultasAPI = {
  list:   (patientId)        => api.get(`/patients/${patientId}/consultas`),
  create: (patientId, data)  => api.post(`/patients/${patientId}/consultas`, data),
}

// ─────────────────────────────────────────────
// PLANES — fase 2
// ─────────────────────────────────────────────
export const plansAPI = {
  save:         (patientId, plan) => api.post(`/patients/${patientId}/planes`, plan),
  getByPatient: (patientId)       => api.get(`/patients/${patientId}/planes`),
  getById:      (id)              => api.get(`/plans/${id}`),
}

export default api