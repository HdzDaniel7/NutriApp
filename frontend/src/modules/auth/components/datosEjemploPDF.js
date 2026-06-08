// ─────────────────────────────────────────────
// DATOS DE EJEMPLO PARA PREVIEW DE PLANTILLAS PDF
// Modificar aquí para cambiar los datos de muestra
// ─────────────────────────────────────────────

export const DATOS_EJEMPLO = {
  paciente: {
    nombre: 'María García',
    edad: 32,
    email: 'maria@ejemplo.com',
  },
  nutriologo: {
    nombre: 'Dr. Juan Pérez',
    cedula: '12345678',
    consultorio: 'Consultorio Nutrición Integral',
  },
  plan: {
    nombre: 'Plan Nutricional Semanal',
    vct_objetivo: 1800,
    fecha: new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }),
  },
  macros: {
    proteina:      { g: 90,  kcal: 360, pct: 20 },
    carbohidratos: { g: 225, kcal: 900, pct: 50 },
    grasa:         { g: 60,  kcal: 540, pct: 30 },
  },
  tiempos: [
    {
      nombre: 'Desayuno',
      kcal: 355,
      alimentos: [
        { nombre: 'Huevo entero',  porcion: 'Palma (90g)',  kcal: 135, proteina: 11, carbs: 1,  grasa: 9 },
        { nombre: 'Avena cocida',  porcion: 'Puño (150g)',  kcal: 148, proteina: 5,  carbs: 27, grasa: 2 },
        { nombre: 'Plátano',       porcion: 'Puño (100g)',  kcal: 72,  proteina: 1,  carbs: 19, grasa: 0 },
      ],
    },
    {
      nombre: 'Comida',
      kcal: 580,
      alimentos: [
        { nombre: 'Pechuga de pollo', porcion: 'Palma (120g)', kcal: 198, proteina: 37, carbs: 0,  grasa: 4  },
        { nombre: 'Arroz cocido',     porcion: 'Puño (100g)',  kcal: 130, proteina: 3,  carbs: 28, grasa: 0  },
        { nombre: 'Brócoli al vapor', porcion: '2 palmas (160g)', kcal: 54, proteina: 4, carbs: 10, grasa: 1 },
      ],
    },
    {
      nombre: 'Cena',
      kcal: 344,
      alimentos: [
        { nombre: 'Salmón al horno',    porcion: 'Palma (100g)', kcal: 208, proteina: 20, carbs: 0, grasa: 13 },
        { nombre: 'Espinaca salteada',  porcion: 'Puño (80g)',   kcal: 18,  proteina: 2,  carbs: 1, grasa: 0  },
        { nombre: 'Tortilla de maíz',   porcion: '30g',          kcal: 118, proteina: 3,  carbs: 24, grasa: 1 },
      ],
    },
  ],
}