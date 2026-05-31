export const FACTORES_ACTIVIDAD = [
  { id: 'sedentario',    valor: 1.2,   label: 'Sedentario',            descripcion: 'Sin ejercicio o trabajo de escritorio' },
  { id: 'leve',          valor: 1.375, label: 'Levemente activo',      descripcion: 'Ejercicio ligero 1–3 días/semana' },
  { id: 'moderado',      valor: 1.55,  label: 'Moderadamente activo',  descripcion: 'Ejercicio moderado 3–5 días/semana' },
  { id: 'muy_activo',    valor: 1.725, label: 'Muy activo',            descripcion: 'Ejercicio intenso 6–7 días/semana' },
  { id: 'extra_activo',  valor: 1.9,   label: 'Extremadamente activo', descripcion: 'Atleta de alto rendimiento o trabajo físico intenso' },
]

export const PRESETS_MACROS = {
  estandar: { nombre: 'Estándar',      proteina: 20, carbohidratos: 50, grasa: 30 },
  hiperp:   { nombre: 'Hiperproteica', proteina: 30, carbohidratos: 40, grasa: 30 },
  lowcarb:  { nombre: 'Low carb',      proteina: 25, carbohidratos: 25, grasa: 50 },
}
