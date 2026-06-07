// ─────────────────────────────────────────────
// PLANTILLAS DE PDF
// Para agregar una plantilla nueva, agrega un
// objeto a este array siguiendo la misma estructura
// ─────────────────────────────────────────────

export const PLANTILLAS = [
  {
    id: 'moderna',
    nombre: 'Moderna',
    descripcion: 'Diseño limpio con acentos verdes y gradientes',
    colores: {
      primario:    [22, 163, 74],
      secundario:  [240, 253, 244],
      texto:       [28, 25, 23],
      gris:        [120, 113, 108],
    },
    fuente: 'helvetica',
  },
  {
    id: 'clinica',
    nombre: 'Clínica',
    descripcion: 'Estilo médico formal con tonos azules',
    colores: {
      primario:    [30, 58, 138],
      secundario:  [239, 246, 255],
      texto:       [15, 23, 42],
      gris:        [100, 116, 139],
    },
    fuente: 'helvetica',
  },
  {
    id: 'minimalista',
    nombre: 'Minimalista',
    descripcion: 'Diseño sobrio en blanco y negro',
    colores: {
      primario:    [24, 24, 27],
      secundario:  [244, 244, 245],
      texto:       [24, 24, 27],
      gris:        [113, 113, 122],
    },
    fuente: 'helvetica',
  },
]

export const PLANTILLA_DEFAULT = 'moderna'

export function getPlantilla(id) {
  return PLANTILLAS.find(p => p.id === id) || PLANTILLAS[0]
}