import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Error en módulo:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={s.wrap}>
          <div style={s.icon}>⚠️</div>
          <div style={s.titulo}>Algo salió mal en este módulo</div>
          <div style={s.mensaje}>{this.state.error.message}</div>
          <button style={s.btn} onClick={() => this.setState({ error: null })}>
            Reintentar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const s = {
  wrap:    { padding: '3rem 2rem', textAlign: 'center', color: '#57534e' },
  icon:    { fontSize: '32px', marginBottom: '10px' },
  titulo:  { fontSize: '16px', fontWeight: '600', color: '#1c1917', marginBottom: '6px' },
  mensaje: { fontSize: '13px', color: '#78716c', marginBottom: '1.5rem' },
  btn:     { padding: '8px 24px', borderRadius: '20px', border: 'none', background: 'var(--color-primario)', color: '#fff', fontSize: '13px', cursor: 'pointer', fontWeight: '500' },
}
