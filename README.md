# 🥗 NutriApp

Aplicación para nutriólogos — gestión de pacientes, planes nutricionales, agenda y más.

## Requisitos

- [Node.js](https://nodejs.org) v18 o superior
- [Python](https://python.org) 3.10 o superior (solo para reimportar el Excel)

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/nutriapp.git
cd nutriapp
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3. Configurar la base de datos

```bash
node setup.js
```

Este comando crea todas las tablas e importa automáticamente los 1,669 alimentos.

### 4. Instalar dependencias del frontend

```bash
cd ../frontend
npm install
```

### 5. Arrancar la aplicación

Abre dos terminales:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Abre tu navegador en `http://localhost:5173`

---

## Estructura del proyecto
nutriapp/
├── backend/
│   ├── config/         ← fórmulas nutrimentales
│   ├── db/
│   │   ├── seed_alimentos.json  ← 1,669 alimentos (incluido en repo)
│   │   └── nutriapp.sqlite      ← base de datos local (NO en repo)
│   ├── middleware/     ← autenticación JWT
│   ├── routes/         ← API REST
│   ├── setup.js        ← script de instalación inicial
│   └── index.js        ← servidor Express
└── frontend/
└── src/
├── modules/
│   ├── auth/       ← login y perfil
│   ├── calculator/ ← calculadora nutrimental
│   ├── foods/      ← buscador de alimentos
│   ├── plans/      ← constructor de planes
│   ├── patients/   ← gestión de pacientes
│   ├── agenda/     ← calendario y citas
│   └── dashboard/  ← resumen de actividad
├── config/         ← fórmulas y porciones
├── context/        ← autenticación global
└── services/       ← API centralizada

---

## Notas importantes

- La base de datos `nutriapp.sqlite` es **local** — nunca se sube al repositorio
- Los datos de pacientes, usuarios y planes se guardan **solo en tu equipo**
- El banco de alimentos (`seed_alimentos.json`) siempre está disponible en el repo
- Para reimportar el Excel original corre: `cd backend/db && python importar_excel.py`

---

## Variables de entorno

Crea un archivo `backend/.env` con:

PORT=3001
JWT_SECRET=tu_secreto_aqui