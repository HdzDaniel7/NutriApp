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
  {
    id: 'esquinas',
    nombre: 'Esquinas',
    descripcion: 'Estilo moderno con acentos en morado',
    colores: {
      primario:    [124, 58, 237],
      secundario:  [245, 243, 255],
      texto:       [15, 10, 30],
      gris:        [109, 99, 125],
    },
    fuente: 'helvetica',
  },
  {
    id: 'olaOscuro',
    nombre: 'OlaOscuro',
    descripcion: 'Tonos cálidos en naranja y ámbar',
    colores: {
      primario:    [234, 88, 12],
      secundario:  [255, 247, 237],
      texto:       [28, 18, 8],
      gris:        [120, 100, 80],
    },
    fuente: 'helvetica',
  },
  {
    id: 'zigzag',
    nombre: 'Zigzag',
    descripcion: 'Azules profundos estilo marino',
    colores: {
      primario:    [6, 182, 212],
      secundario:  [236, 254, 255],
      texto:       [8, 51, 68],
      gris:        [71, 130, 148],
    },
    fuente: 'helvetica',
  },
  {
    id: 'terra',
    nombre: 'Terra',
    descripcion: 'Tonos tierra y naturales',
    colores: {
      primario:    [120, 72, 40],
      secundario:  [253, 246, 236],
      texto:       [40, 24, 12],
      gris:        [130, 100, 80],
    },
    fuente: 'helvetica',
  },
  {
    id: 'rosa',
    nombre: 'Rosa',
    descripcion: 'Estilo fresco con tonos rosados',
    colores: {
      primario:    [219, 39, 119],
      secundario:  [253, 242, 248],
      texto:       [40, 10, 25],
      gris:        [130, 90, 110],
    },
    fuente: 'helvetica',
  },
]

export const PLANTILLA_DEFAULT = 'moderna'

export function getPlantilla(id) {
  return PLANTILLAS.find(p => p.id === id) || PLANTILLAS[0]
}

// ─────────────────────────────────────────────
// COLORES DISPONIBLES PARA PDF
// ─────────────────────────────────────────────
export const COLORES_PDF = [
  { id: 'verde',     nombre: 'Verde',       hex: '#16a34a', rgb: [22, 163, 74] },
  { id: 'azul',      nombre: 'Azul',        hex: '#2563eb', rgb: [37, 99, 235] },
  { id: 'marino',    nombre: 'Azul marino', hex: '#1e3a8a', rgb: [30, 58, 138] },
  { id: 'morado',    nombre: 'Morado',      hex: '#7c3aed', rgb: [124, 58, 237] },
  { id: 'rosa',      nombre: 'Rosa',        hex: '#db2777', rgb: [219, 39, 119] },
  { id: 'rojo',      nombre: 'Rojo',        hex: '#dc2626', rgb: [220, 38, 38] },
  { id: 'naranja',   nombre: 'Naranja',     hex: '#ea580c', rgb: [234, 88, 12] },
  { id: 'amarillo',  nombre: 'Amarillo',    hex: '#ca8a04', rgb: [202, 138, 4] },
  { id: 'gris',      nombre: 'Gris',        hex: '#374151', rgb: [55, 65, 81] },
  { id: 'negro',     nombre: 'Negro',       hex: '#18181b', rgb: [24, 24, 27] },
]

export const POSICIONES_LOGO = [
  { id: 'superior_derecha',   nombre: 'Superior derecha' },
  { id: 'superior_izquierda', nombre: 'Superior izquierda' },
  { id: 'inferior_derecha',   nombre: 'Inferior derecha' },
  { id: 'inferior_izquierda', nombre: 'Inferior izquierda' },
]

export function getColorPDF(id) {
  return COLORES_PDF.find(c => c.id === id) || COLORES_PDF[0]
}