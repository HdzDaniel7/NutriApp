import { useState, useEffect } from 'react'
import { patientsAPI } from '../../services/api'

export default function BuscadorPaciente({ onSeleccionar, pacienteSeleccionado }) {
  const [busqueda, setBusqueda]     = useState('')
  const [resultados, setResultados] = useState([])
  const [cargando, setCargando]     = useState(false)
  const [error, setError]           = useState(null)
  const [pacienteNombre, setPacienteNombre] = useState('')

  useEffect(() => {
    if (!busqueda || busqueda.length < 1) { setResultados([]); setError(null); return }
    setCargando(true)
    setError(null)
    patientsAPI.list({ q: busqueda })
      .then(r => setResultados(r.data.data))
      .catch(() => setError('No se pudo buscar. Verifica tu conexión.'))
      .finally(() => setCargando(false))
  }, [busqueda])

  const handleSeleccionar = (paciente) => {
    onSeleccionar(paciente)
    setPacienteNombre(`${paciente.nombre} ${paciente.apellido || ''}`.trim())
    setBusqueda('')
    setResultados([])
  }

  return (
    <div style={s.wrap}>
      {pacienteSeleccionado ? (
        <div style={s.seleccionado}>
          <span style={s.seleccionadoNombre}>👤 {pacienteNombre}</span>
          <button style={s.cambiarBtn} onClick={() => { onSeleccionar(null); setPacienteNombre('') }}>
            Cambiar
          </button>
        </div>
      ) : (
        <div style={s.buscadorWrap}>
          <input
            style={s.input}
            type="text"
            placeholder="Buscar paciente por nombre..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            autoFocus
          />
          {cargando && <div style={s.msg}>Buscando...</div>}
          {error && <div style={s.msgError}>{error}</div>}
          {!cargando && !error && busqueda.length >= 2 && resultados.length === 0 && (
            <div style={s.msg}>No se encontraron pacientes</div>
          )}
          {resultados.length > 0 && (
            <div style={s.lista}>
              {resultados.map(p => (
                <div key={p.id} style={s.row} onClick={() => handleSeleccionar(p)}>
                  <div style={s.rowNombre}>{p.nombre} {p.apellido}</div>
                  {p.email && <div style={s.rowMeta}>{p.email}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const s = {
  wrap:               { marginBottom: '16px' },
  buscadorWrap:       { position: 'relative' },
  input:              { width: '100%', padding: '8px 12px', borderRadius: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#d6d3d1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  msg:                { fontSize: '13px', color: '#a8a29e', padding: '8px 12px' },
  msgError:           { fontSize: '13px', color: '#dc2626', padding: '8px 12px', background: '#fef2f2', borderRadius: '6px', marginTop: '4px' },
  lista:              { borderWidth: '1px', borderStyle: 'solid', borderColor: '#e7e5e4', borderRadius: '8px', marginTop: '4px', overflow: 'hidden' },
  row:                { padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #f5f5f4' },
  rowNombre:          { fontSize: '14px', fontWeight: '500', color: '#1c1917' },
  rowMeta:            { fontSize: '12px', color: '#78716c', marginTop: '2px' },
  seleccionado:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--color-primario-bg)', borderRadius: '8px', padding: '10px 14px' },
  seleccionadoNombre: { fontSize: '14px', fontWeight: '500', color: 'var(--color-primario)' },
  cambiarBtn:         { fontSize: '12px', color: '#57534e', background: 'none', border: 'none', cursor: 'pointer' },
}
