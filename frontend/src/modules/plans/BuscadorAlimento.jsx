import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const API = 'http://localhost:3001/api'

export default function BuscadorAlimento({ onSeleccionar, onCerrar }) {
  const [busqueda, setBusqueda] = useState('')
  const [tipo, setTipo] = useState('')
  const [tipos, setTipos] = useState([])
  const [resultados, setResultados] = useState([])
  const [cargando, setCargando] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    axios.get(`${API}/foods/meta/tipos`)
      .then(r => setTipos(r.data))
      .catch(err => console.error(err))
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  useEffect(() => {
    if (!busqueda && !tipo) { setResultados([]); return }
    setCargando(true)
    const params = {}
    if (busqueda) params.q = busqueda
    if (tipo) params.tipo = tipo
    axios.get(`${API}/foods/search`, { params })
      .then(r => setResultados(r.data.data))
      .catch(err => console.error(err))
      .finally(() => setCargando(false))
  }, [busqueda, tipo])

  return (
    <div style={s.overlay} onClick={onCerrar}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>

        <div style={s.header}>
          <span style={s.titulo}>Agregar alimento</span>
          <button style={s.cerrarBtn} onClick={onCerrar}>✕</button>
        </div>

        <div style={s.filtros}>
          <input
            ref={inputRef}
            style={s.input}
            type="text"
            placeholder="Buscar alimento..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <select style={s.select} value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="">Todas las categorías</option>
            {tipos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div style={s.lista}>
          {cargando && <div style={s.msg}>Buscando...</div>}

          {!cargando && !busqueda && !tipo && (
            <div style={s.msg}>Escribe un alimento o selecciona una categoría</div>
          )}

          {!cargando && resultados.length === 0 && (busqueda || tipo) && (
            <div style={s.msg}>No se encontraron alimentos</div>
          )}

          {resultados.map(a => (
            <div key={a.id} style={s.row} onClick={() => onSeleccionar(a)}>
              <div style={s.rowNombre}>{a.descripcion}</div>
              <div style={s.rowMeta}>
                <span style={s.badge}>{a.tipo}</span>
                <span style={s.kcal}>{a.energia_kcal ? `${a.energia_kcal} kcal/100g` : '—'}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

const s = {
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal:      { background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '560px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid #e7e5e4' },
  titulo:     { fontSize: '15px', fontWeight: '600', color: '#1c1917' },
  cerrarBtn:  { background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#78716c', padding: '4px 8px', borderRadius: '4px' },
  filtros:    { padding: '1rem 1.25rem', borderBottom: '1px solid #f5f5f4', display: 'flex', gap: '8px', flexWrap: 'wrap' },
  input:      { flex: 1, minWidth: '160px', padding: '7px 10px', borderRadius: '6px', border: '1px solid #d6d3d1', fontSize: '14px', outline: 'none' },
  select:     { flex: 1, minWidth: '160px', padding: '7px 10px', borderRadius: '6px', border: '1px solid #d6d3d1', fontSize: '14px', outline: 'none', background: '#fff' },
  lista:      { overflowY: 'auto', flex: 1, padding: '0.5rem 0' },
  msg:        { fontSize: '13px', color: '#a8a29e', textAlign: 'center', padding: '2rem 0' },
  row:        { padding: '10px 1.25rem', cursor: 'pointer', borderBottom: '0.5px solid #f5f5f4', transition: 'background .1s' },
  rowNombre:  { fontSize: '14px', color: '#1c1917', marginBottom: '3px' },
  rowMeta:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  badge:      { fontSize: '11px', background: '#f5f5f4', color: '#78716c', padding: '2px 8px', borderRadius: '20px' },
  kcal:       { fontSize: '12px', color: '#57534e', fontWeight: '500' },
}
