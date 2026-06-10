# Graph Report - .  (2026-06-10)

## Corpus Check
- 67 files · ~201,875 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 444 nodes · 688 edges · 31 communities (21 shown, 10 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 53 edges (avg confidence: 0.87)
- Token cost: 55,800 input · 10,970 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Express API Server|Express API Server]]
- [[_COMMUNITY_Plan & PDF Export|Plan & PDF Export]]
- [[_COMMUNITY_Appointment Scheduling|Appointment Scheduling]]
- [[_COMMUNITY_PDF Template Engine|PDF Template Engine]]
- [[_COMMUNITY_Patient Management|Patient Management]]
- [[_COMMUNITY_Frontend Auth & Routing|Frontend Auth & Routing]]
- [[_COMMUNITY_Frontend Dependencies|Frontend Dependencies]]
- [[_COMMUNITY_Nutritional Calculator|Nutritional Calculator]]
- [[_COMMUNITY_Backend Dependencies|Backend Dependencies]]
- [[_COMMUNITY_Meal Plan API Routes|Meal Plan API Routes]]
- [[_COMMUNITY_UI Assets & Icons|UI Assets & Icons]]
- [[_COMMUNITY_Schema Migration v3|Schema Migration v3]]
- [[_COMMUNITY_Database Setup|Database Setup]]
- [[_COMMUNITY_Schema Migration v2|Schema Migration v2]]
- [[_COMMUNITY_Schema Migration v4|Schema Migration v4]]
- [[_COMMUNITY_Schema Migration v5|Schema Migration v5]]
- [[_COMMUNITY_Schema Migration v6|Schema Migration v6]]
- [[_COMMUNITY_Brand Visual Assets|Brand Visual Assets]]
- [[_COMMUNITY_Portion Calculations|Portion Calculations]]
- [[_COMMUNITY_Frontend Formula Config|Frontend Formula Config]]
- [[_COMMUNITY_Root Package Config|Root Package Config]]
- [[_COMMUNITY_Build Entry Point|Build Entry Point]]
- [[_COMMUNITY_Activity Factors|Activity Factors]]
- [[_COMMUNITY_Macro Presets|Macro Presets]]
- [[_COMMUNITY_PDF Color Config|PDF Color Config]]
- [[_COMMUNITY_Template Selector|Template Selector]]
- [[_COMMUNITY_Default Meal Times|Default Meal Times]]
- [[_COMMUNITY_Frontend Package JSON|Frontend Package JSON]]
- [[_COMMUNITY_Frontend Documentation|Frontend Documentation]]

## God Nodes (most connected - your core abstractions)
1. `DATOS_EJEMPLO` - 23 edges
2. `PlanConstructor()` - 13 edges
3. `patientsAPI` - 13 edges
4. `PDF Template Interface (color, colorBg, colorBorder, logo, posicionLogo, escala, datos)` - 12 edges
5. `useAuth()` - 11 edges
6. `Dashboard()` - 8 edges
7. `ExpedientePaciente()` - 8 edges
8. `Table: usuarios` - 8 edges
9. `Database Setup Script` - 8 edges
10. `Table: planes` - 8 edges

## Surprising Connections (you probably didn't know these)
- `NutriApp Project README` --references--> `Nutritional Plan State Shape`  [INFERRED]
  README.md → frontend/src/modules/plans/planUtils.js
- `NutriApp Project README` --references--> `Axios Instance with Global Error Interceptor`  [INFERRED]
  README.md → frontend/src/services/api.js
- `Frontend HTML Entry Point` --references--> `Vite Frontend Build Config`  [INFERRED]
  frontend/index.html → frontend/vite.config.js
- `importar()` --semantically_similar_to--> `Seed Data: alimentos JSON`  [INFERRED] [semantically similar]
  backend/db/importar_excel.py → backend/db/seed_alimentos.json
- `TEMAS` --semantically_similar_to--> `COLORES_PDF Config`  [INFERRED] [semantically similar]
  frontend/src/context/AuthContext.jsx → frontend/src/config/plantillas.config.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Protected API Routes via JWT Middleware** — backend_index_express_app, middleware_auth_autenticar, routes_calculator_router, routes_patients_router, routes_agenda_router [EXTRACTED 1.00]
- **Incremental SQLite Schema Evolution (v2-v6)** — db_migrar_v2_pacientes_table, db_migrar_v3_usuarios_table, db_migrar_v4_citas_table, backend_migrar_v5_migrar_v5, backend_migrar_v6_migrar_v6 [INFERRED 0.95]
- **Nutritional Calculation Pipeline (TMB→GET→VCT→Macros)** — config_formulas_config_calcular_tmb, config_formulas_config_calcular_get, config_formulas_config_calcular_macros, routes_calculator_router [EXTRACTED 1.00]
- **PDF Template Rendering System** — auth_components_preview_pdf, auth_components_datos_ejemplo, plantillas_plantilla_bloques, plantillas_plantilla_clinica, config_plantillas_plantillas [EXTRACTED 0.95]
- **Auth + Theme Application Flow** — context_authcontext_login, context_authcontext_aplicar_tema, context_authcontext_temas [EXTRACTED 1.00]
- **SQLite Relational Schema Core Tables** — setup_tabla_usuarios, setup_tabla_pacientes, setup_tabla_consultas, setup_tabla_planes [EXTRACTED 0.95]
- **PDF Template Components — shared props interface (color, colorBg, colorBorder, logo, posicionLogo, escala, datos)** — plantillas_plantillaesquinas_plantillaesquinas, plantillas_plantillafranja_plantillafranja, plantillas_plantillalateral_plantillalateral, plantillas_plantillamoderna_plantillamoderna, plantillas_plantillaolaoscuro_plantillaolaoscuro, plantillas_plantillapastel_plantillapastel, plantillas_plantillasello_plantillasello, plantillas_plantillasimple_plantillasimple, plantillas_plantillaticket_plantillaticket, plantillas_plantillazigzag_plantillazigzag [EXTRACTED 1.00]
- **Patient Record Flow — Pacientes, ExpedientePaciente, FormPaciente form the patient CRUD and record management flow** — patients_pacientes_pacientes, patients_expedientepaciente_expedientepaciente, patients_formpaciente_formpaciente [EXTRACTED 1.00]
- **Dashboard aggregates patient and agenda data via patientsAPI and agendaAPI to display stats and calendar activity** — dashboard_dashboard_dashboard, services_api_patientsapi, services_api_agendaapi [EXTRACTED 1.00]
- **Nutritional Plan Construction Flow: PlanConstructor + planUtils + TiempoComida** — plans_planconstructor_planconstructor, plans_planutils_planstate, plans_tiempocomida_tiempocomida [EXTRACTED 1.00]
- **PDF Export Pipeline: useExportarPDF + PlantillaOffscreen + generarPaginas** — plans_exportadorpdf_useexportarpdf, plans_exportadorpdf_plantillaoffscreen, plans_exportadorpdf_generarpaginas [EXTRACTED 1.00]
- **Centralized API Services Layer: foodsAPI + patientsAPI + plansAPI** — services_api_foodsapi, services_api_patientsapi, services_api_plansapi [INFERRED 0.95]

## Communities (31 total, 10 thin omitted)

### Community 0 - "Express API Server"
Cohesion: 0.05
Nodes (48): agendaRouter, app, autenticar, authRouter, calculatorRouter, cors, express, Express Application (index.js) (+40 more)

### Community 1 - "Plan & PDF Export"
Cohesion: 0.08
Nodes (48): PlantillaOffscreen(), useExportarPDF(), calcularNutrientesPorPorcion(), getGramosPorMedida(), getMedidaPorGramos(), MEDIDAS_CASERAS, redondear(), TIEMPOS_DEFAULT (+40 more)

### Community 2 - "Appointment Scheduling"
Cohesion: 0.05
Nodes (22): COLORES_ESTADO, DIAS_SEMANA, m, MESES, s, FormCita Component, FormConfig Component, BotanicBg Decorative SVG Background (+14 more)

### Community 3 - "PDF Template Engine"
Cohesion: 0.13
Nodes (23): DATOS_EJEMPLO, adaptarDia(), adaptarSemanalUnico(), COMPONENTES, dividirEnPaginas(), generarPaginas(), COMPONENTES, s (+15 more)

### Community 4 - "Patient Management"
Cohesion: 0.09
Nodes (32): Card(), CitaRow(), Dashboard(), DIAS, ESTADO_STYLE, Ico, MESES, StatCard() (+24 more)

### Community 5 - "Frontend Auth & Routing"
Cohesion: 0.07
Nodes (33): AppRoutes Component, RutaProtegida Component, DATOS_EJEMPLO PDF Sample Data, PreviewPDF Component, COLORES_ENTORNO, Ico, inputStyle, COLORES_PDF Config (+25 more)

### Community 6 - "Frontend Dependencies"
Cohesion: 0.07
Nodes (27): dependencies, axios, jspdf, jspdf-autotable, react, react-dom, react-router-dom, recharts (+19 more)

### Community 7 - "Nutritional Calculator"
Cohesion: 0.10
Nodes (24): FACTORES_ACTIVIDAD, PRESETS_MACROS, Calculadora(), calcularIMC(), calcularIMC (Calculadora), calcularTMB(), FORMULAS, OBJETIVOS (+16 more)

### Community 8 - "Backend Dependencies"
Cohesion: 0.09
Nodes (21): author, dependencies, axios, bcryptjs, better-sqlite3, cors, dotenv, express (+13 more)

### Community 9 - "Meal Plan API Routes"
Cohesion: 0.24
Nodes (15): DELETE /api/plans/:id — Eliminar Plan, POST /api/plans/:id/duplicar — Duplicar Plan, GET /api/plans/:id — Obtener Plan, PUT /api/plans/:id — Actualizar Plan, PATCH /api/plans/:id/renombrar — Renombrar Plan, router, Database Setup Script, Seed: Importar alimentos desde JSON (+7 more)

### Community 10 - "UI Assets & Icons"
Cohesion: 0.16
Nodes (14): Vite Build Tool Official Logo, Vite Logo Gaussian Blur Glow Filter Effects, Vite Logo Lightning Bolt / Zigzag Path Shape, Vite Logo Parenthesis Bracket Shapes, NutriApp Favicon - Brand Logo Icon, Favicon Gaussian Blur Glow Filter Effects, Favicon Lightning Bolt / Zigzag Path Shape, Bluesky Social Media Icon Symbol (+6 more)

### Community 11 - "Schema Migration v3"
Cohesion: 0.25
Nodes (7): columnasPacientes, columnasPlanes, Database, db, dbPath, path, tablas

### Community 12 - "Database Setup"
Cohesion: 0.29
Nodes (6): Database, db, dbPath, fs, path, seedPath

### Community 13 - "Schema Migration v2"
Cohesion: 0.33
Nodes (5): Database, db, dbPath, path, tablas

### Community 14 - "Schema Migration v4"
Cohesion: 0.33
Nodes (5): Database, db, dbPath, path, tablas

### Community 15 - "Schema Migration v5"
Cohesion: 0.40
Nodes (4): cols, Database, db, path

### Community 16 - "Schema Migration v6"
Cohesion: 0.40
Nodes (4): cols, Database, db, path

### Community 17 - "Brand Visual Assets"
Cohesion: 0.83
Nodes (4): Hero Banner Image, Isometric Card/Layer UI Element, Layered/Stacked Visual Design Pattern, Purple Brand Accent Color

### Community 18 - "Portion Calculations"
Cohesion: 0.67
Nodes (3): calcularNutrientesPorPorcion() Function, getMedidaPorGramos() Function, MEDIDAS_CASERAS Config

## Knowledge Gaps
- **185 isolated node(s):** `FACTORES_ACTIVIDAD`, `PRESETS_MACROS`, `Database`, `path`, `dbPath` (+180 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `router` connect `Nutritional Calculator` to `Express API Server`?**
  _High betweenness centrality (0.208) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `PDF Template Interface (color, colorBg, colorBorder, logo, posicionLogo, escala, datos)` (e.g. with `ModalVerPlan()` and `GraficaEvolucion()`) actually correct?**
  _`PDF Template Interface (color, colorBg, colorBorder, logo, posicionLogo, escala, datos)` has 12 INFERRED edges - model-reasoned connections that need verification._
- **What connects `FACTORES_ACTIVIDAD`, `PRESETS_MACROS`, `Database` to the rest of the system?**
  _186 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Express API Server` be split into smaller, more focused modules?**
  _Cohesion score 0.05137844611528822 - nodes in this community are weakly interconnected._
- **Should `Plan & PDF Export` be split into smaller, more focused modules?**
  _Cohesion score 0.08069381598793364 - nodes in this community are weakly interconnected._
- **Should `Appointment Scheduling` be split into smaller, more focused modules?**
  _Cohesion score 0.05053191489361702 - nodes in this community are weakly interconnected._
- **Should `PDF Template Engine` be split into smaller, more focused modules?**
  _Cohesion score 0.12560975609756098 - nodes in this community are weakly interconnected._