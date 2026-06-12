import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import CalculadoraForm from './CalculadoraForm'
import { PageHeader, base } from '../../components/ui'

export default function Calculadora() {
  const navigate = useNavigate()
  const [resultado, setResultado] = useState(null)

  const usarEnPlan = () => {
    if (!resultado?.vct) return
    navigate('/plan', {
      state: {
        vctInicial: resultado.vct,
        distribucionInicial: resultado.dist,
      },
    })
  }

  return (
    <div className="nd-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        titulo="Calculadora Nutrimental"
        subtitulo="Herramienta rápida — para guardar el cálculo en el expediente, regístralo desde la consulta del paciente">
        {resultado?.vct && resultado.distValida && (
          <button style={base.btnPrimario} onClick={usarEnPlan}>
            Usar {resultado.vct} kcal en un plan <ArrowRight size={14} />
          </button>
        )}
      </PageHeader>

      <CalculadoraForm onResultado={setResultado} />
    </div>
  )
}
