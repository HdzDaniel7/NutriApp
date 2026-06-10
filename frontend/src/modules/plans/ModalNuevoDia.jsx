import { ClipboardList, Copy } from 'lucide-react'
export default function ModalNuevoDia({ dias, onAgregar, onClose }) {
  return (
    <div style={ms.overlay} onClick={onClose}>
      <div style={ms.modal} onClick={e => e.stopPropagation()}>
        <div style={ms.titulo}>Agregar nuevo día</div>
        <div style={ms.opcion} onClick={() => { onAgregar(null); onClose() }}>
          <div style={ms.opcionTitulo}><ClipboardList size={14} style={{verticalAlign:"middle",marginRight:5}}/>Empezar desde cero</div>
          <div style={ms.opcionDesc}>Día vacío con los tiempos de comida por defecto</div>
        </div>
        {dias.map(dia => (
          <div key={dia.id} style={ms.opcion} onClick={() => { onAgregar(dia.id); onClose() }}>
            <div style={ms.opcionTitulo}><Copy size={14} style={{verticalAlign:"middle",marginRight:5}}/>Copiar {dia.nombre}</div>
            <div style={ms.opcionDesc}>Mismos tiempos y alimentos que {dia.nombre}</div>
          </div>
        ))}
        <button style={ms.cancelar} onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}

const ms = {
  overlay:      { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal:        { background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '400px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' },
  titulo:       { fontSize: '16px', fontWeight: '600', color: '#1c1917', marginBottom: '8px' },
  opcion:       { padding: '12px 14px', borderRadius: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e7e5e4', cursor: 'pointer', background: '#fafaf9' },
  opcionTitulo: { fontSize: '14px', fontWeight: '500', color: '#1c1917', marginBottom: '2px' },
  opcionDesc:   { fontSize: '12px', color: '#78716c' },
  cancelar:     { padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', fontSize: '13px', color: '#78716c', cursor: 'pointer', marginTop: '4px' },
}
