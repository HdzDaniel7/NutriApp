import pandas as pd
import sqlite3
import os
import sys

# ─────────────────────────────────────────────
# CONFIGURACIÓN
# ─────────────────────────────────────────────
EXCEL_PATH = r"C:\Users\dany_\OneDrive\Desktop\Programas\Tabla de alimentos\Base de datos - Alimentos 3.0.xlsm"
DB_PATH = os.path.join(os.path.dirname(__file__), "nutriapp.sqlite")

# ─────────────────────────────────────────────
# MAPEO DE COLUMNAS
# Columna Excel → columna en la base de datos
# ─────────────────────────────────────────────
COLUMNAS = {
    'Tipo':                                        'tipo',
    'Descripción alimento':                        'descripcion',
    'Nombre Científico/Scientific name':           'nombre_cientifico',
    'Porción comestible(%)':                       'porcion_comestible',
    'Energía Energy (kJ)':                         'energia_kilojulios',
    'Energía Energy (kcal)':                       'energia_kcal',
    'Humedad(g)':                                  'humedad',
    'Cenizas Ashes (g)':                           'cenizas',
    'Extracto etéreo Ether extract (g)':           'grasa_total',
    'Ácidos Grasos Saturados (g)':                 'acidos_grasos_saturados',
    'Ácidos Grasos Monoinsaturados (g)':           'acidos_grasos_monoinsaturados',
    'Ácidos Grasos Poliinsaturados (g)':           'acidos_grasos_poliinsaturados',
    'Colesterol (mg)':                             'colesterol',
    'Proteína bruta Crude protein (g)':            'proteina',
    'Hidratos de carbono (g)':                     'carbohidratos',
    'Azúcares Sugars (g)':                         'azucares',
    'Fibra bruta Fiber (g)':                       'fibra_bruta',
    'Fibra D.T. Total D. Fiber (g)':               'fibra_dietetica_total',
    'Fibra D. Insol. Insol. D. Fiber (g)':         'fibra_dietetica_insoluble',
    'Ca (mg)':                                     'calcio',
    'P (mg)':                                      'fosforo',
    'Fe (mg)':                                     'hierro',
    'Na (mg)':                                     'sodio',
    'K (mg)':                                      'potasio',
    'Mg (mg)':                                     'magnesio',
    'Cu (mg)':                                     'cobre',
    'Zn (mg)':                                     'zinc',
    'Mn (mg)':                                     'manganeso',
    'Se (mg)':                                     'selenio',
    'Li (mg)':                                     'litio',
    'Vit. A Vit. A (U.I.)':                        'vitamina_a_ui',
    'Vit. A (ug RAE)':                             'vitamina_a_rae',
    'Carotenos (mg)':                              'carotenos',
    'B-carotenos (mg)':                            'beta_carotenos',
    'Vit. B1 (mg)':                                'vitamina_b1_tiamina',
    'Vit. B2 (mg)':                                'vitamina_b2_riboflavina',
    'Niacina (mg)':                                'vitamina_b3_niacina',
    'Ac. Ascórbico  (mg)':                         'vitamina_c',
    'Vit. B6 (mg)':                                'vitamina_b6',
    'Vit. B12 (ug)':                               'vitamina_b12',
    'Ácido fólico (ug)':                           'acido_folico',
    'Folato (ug DFE)':                             'folato_dfe',
    'Vit. D (ug)':                                 'vitamina_d',
}

def importar():
    print(f"Leyendo Excel: {EXCEL_PATH}")

    if not os.path.exists(EXCEL_PATH):
        print(f"ERROR: No se encontró el archivo: {EXCEL_PATH}")
        sys.exit(1)

    # Leer todas las hojas del Excel
    hojas = pd.read_excel(EXCEL_PATH, sheet_name=None, header=5)
    print(f"Hojas encontradas: {list(hojas.keys())}")

    todos = []
    for nombre_hoja, df in hojas.items():
        print(f"  Procesando hoja: {nombre_hoja} ({len(df)} filas)")
        todos.append(df)

    df_total = pd.concat(todos, ignore_index=True)
    print(f"Total de filas combinadas: {len(df_total)}")

    # Renombrar solo las columnas que existen en el Excel
    columnas_presentes = {k: v for k, v in COLUMNAS.items() if k in df_total.columns}
    columnas_faltantes = [k for k in COLUMNAS if k not in df_total.columns]

    if columnas_faltantes:
        print(f"Columnas no encontradas (se ignorarán): {columnas_faltantes}")

    df_total = df_total.rename(columns=columnas_presentes)
    df_total = df_total[[c for c in COLUMNAS.values() if c in df_total.columns]]

    # Conectar a SQLite e insertar
    conn = sqlite3.connect(DB_PATH)
    df_total.to_sql('alimentos', conn, if_exists='replace', index=True, index_label='id')
    conn.close()

    print(f"\nImportación completada: {len(df_total)} alimentos guardados en {DB_PATH}")

if __name__ == '__main__':
    importar()