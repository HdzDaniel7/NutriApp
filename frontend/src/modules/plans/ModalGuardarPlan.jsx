import { useState } from 'react'
import { Check, Pencil, User } from 'lucide-react'
import { plansAPI } from '../../services/api'
import BuscadorPaciente from './BuscadorPaciente'

export default function ModalGuardarPlan({ editandoPlanId, plan, nombrePlan, pacienteIdInicial, pacienteNombreInicial, onGuardado, onClose }) {
  const [guardado, setGuardado]         = useState(false)
  const [guardando, setGuardando]       = useState(false)
  const [error, setError]               = useState(null)
  const [pacienteId, setPacienteId]     = useState(pacienteIdInicial || '')
  const [pacienteNombre, setPacienteNombre] = useState(pacienteNombreInicial || '')

  const handleClose = () => {
    onClose()
    setGuardado(false)
    setError(null)
    setPacienteId('')
    setPacienteNombre('')
  }

  const handleGuardar = async () => {
    if (!editandoPlanId && !pacienteId) {
      setError('Selecciona un paciente antes de guardar')
      return
    }
    setError(null)
    setGuardando(true)
    const datos = {
      nombre: nombrePlan,
      vct_objetivo: plan.vct_objetivo,
      distribucion_macros: plan.distribucion_macros,
      modo: plan.modo,
      contenido: plan,
    }
    try {
      if (editandoPlanId) {
        await plansAPI.update(editandoPlanId, datos)
      } else {
        await plansAPI.save(pacienteId, datos)
      }
      setGuardado(true)
      setTimeout(() => {
        handleClose()
        if (onGuardado) onGuardado()
      }, 900)
    } catch {
      setError('No se pudo guardar el plan. Intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  const puedeGuardar = editandoPlanId || !!pacienteId

  return (
    <div style={ms.overlay} onClick={handleClose}>
      <div style={ms.modal} onClick={e => e.stopPropagation()}>
        <div style={ms.titulo}>Guardar plan</div>

        {guardado ? (
          <div style={{ ...s.msg, background: '#dcfce7', color: '#15803d', textAlign: 'center', padding: '1rem' }}>
            <Check size={14} style={{verticalAlign:"middle",marginRight:4}}/>Plan guardado correctamente
          </div>
        ) : editandoPlanId ? (
          <div style={{ ...s.msg, background: '#f5f5f4', color: '#57534e' }}>
            <Pencil size={13} style={{verticalAlign:"middle",marginRight:4}}/>Editando plan existente — se actualizará al guardar
          </div>
        ) : pacienteNombre ? (
          <div style={s.seleccionado}>
            <span style={s.seleccionadoNombre}><User size={13} style={{verticalAlign:"middle",marginRight:4}}/>{pacienteNombre}</span>
            <button style={s.cambiarBtn} onClick={() => { setPacienteId(''); setPacienteNombre('') }}>
              Cambiar
            </button>
          </div>
        ) : (
          <BuscadorPaciente
            onSeleccionar={(p) => {
              setPacienteId(p?.id || null)
              setPacienteNombre(p ? `${p.nombre} ${p.apellido || ''}`.trim() : '')
            }}
            pacienteSeleccionado={pacienteId}
          />
        )}

        {error && <div style={s.msgError}>{error}</div>}

        <div style={ms.acciones}>
          <button style={s.cancelarBtn} onClick={handleClose} disabled={guardando}>
            Cancelar
          </button>
          <button
            style={{ ...s.confirmarBtn, opacity: puedeGuardar ? 1 : 0.4, cursor: puedeGuardar ? 'pointer' : 'not-allowed' }}
            onClick={handleGuardar}
            disabled={!puedeGuardar || guardando}
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

const ms = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal:   { background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '400px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' },
  titulo:  { fontSize: '16px', fontWeight: '600', color: '#1c1917', marginBottom: '8px' },
  acciones:{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' },
}

const s = {
  msg:                { borderRadius: '8px', padding: '8px 12px', fontSize: '13px', marginBottom: '4px' },
  msgError:           { borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#dc2626', background: '#fef2f2', marginTop: '4px' },
  seleccionado:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--color-primario-bg)', borderRadius: '8px', padding: '10px 14px' },
  seleccionadoNombre: { fontSize: '14px', fontWeight: '500', color: 'var(--color-primario)' },
  cambiarBtn:         { fontSize: '12px', color: '#57534e', background: 'none', border: 'none', cursor: 'pointer' },
  cancelarBtn:        { padding: '6px 14px', borderRadius: '20px', border: '1px solid #e4e4e7', background: '#fff', fontSize: '13px', color: '#3f3f46', cursor: 'pointer' },
  confirmarBtn:       { padding: '6px 14px', borderRadius: '20px', border: 'none', background: 'linear-gradient(135deg, var(--color-primario-light), var(--color-primario))', color: '#fff', fontSize: '13px', fontWeight: '500' },
}
