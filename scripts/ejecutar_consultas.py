from pathlib import Path

import duckdb


# ---------------------------------------------------------
# Rutas principales
# ---------------------------------------------------------

ROOT_DIR = Path(__file__).resolve().parents[1]

DATA_DIR = ROOT_DIR / "data" / "raw"
SQL_DIR = ROOT_DIR / "sql"
RESULTADOS_DIR = ROOT_DIR / "resultados"
PROCESSED_DIR = ROOT_DIR / "data" / "processed"

POLIZAS_CSV = DATA_DIR / "polizas.csv"
GESTIONES_CSV = DATA_DIR / "gestiones.csv"


# ---------------------------------------------------------
# Consultas que se ejecutarán
# ---------------------------------------------------------

CONSULTAS = [
    {
        "archivo_sql": "01_polizas_vigentes_recientes.sql",
        "archivo_salida": "consulta_01.csv",
        "titulo": "CONSULTA 1 — PÓLIZAS VIGENTES RECIENTES",
    },
    {
        "archivo_sql": "02_prima_por_regional.sql",
        "archivo_salida": "consulta_02.csv",
        "titulo": "CONSULTA 2 — PRIMA POR REGIONAL",
    },
    {
        "archivo_sql": "03_efectividad_por_asesor.sql",
        "archivo_salida": "consulta_03.csv",
        "titulo": (
            "CONSULTA 3 — EFECTIVIDAD POR ASESOR: "
            "TOP 5 Y BOTTOM 5"
        ),
    },
    {
        "archivo_sql": "04_ranking_regional.sql",
        "archivo_salida": "consulta_04.csv",
        "titulo": (
            "CONSULTA 4 — RANKING DE EFECTIVIDAD "
            "POR REGIONAL"
        ),
    },
    {
        "archivo_sql": "05_cartera_en_mora.sql",
        "archivo_salida": "consulta_05.csv",
        "titulo": "CONSULTA 5 — CARTERA EN MORA",
    },
    {
        "archivo_sql": "06_consulta_maestra.sql",
        "archivo_salida": "consulta_06.csv",
        "titulo": "CONSULTA 6 — CONSULTA MAESTRA POR ASESOR",
    },
    {
        "archivo_sql": "07_analisis_por_regional.sql",
        "archivo_salida": "analisis_07_regionales.csv",
        "titulo": (
            "ANÁLISIS COMPLEMENTARIO — "
            "RESULTADOS POR REGIONAL"
        ),
    },
    {
        "archivo_sql": "08_efectividad_tipo_gestion.sql",
        "archivo_salida": "analisis_08_tipo_gestion.csv",
        "titulo": (
            "ANÁLISIS COMPLEMENTARIO — "
            "EFECTIVIDAD POR TIPO DE GESTIÓN"
        ),
    },
]


# ---------------------------------------------------------
# Validaciones
# ---------------------------------------------------------

def validar_archivos() -> None:
    """Verifica que todos los archivos necesarios existan."""

    archivos_requeridos = [
        POLIZAS_CSV,
        GESTIONES_CSV,
    ]

    for consulta in CONSULTAS:
        archivos_requeridos.append(
            SQL_DIR / consulta["archivo_sql"]
        )

    for archivo in archivos_requeridos:
        if not archivo.exists():
            raise FileNotFoundError(
                f"No se encontró el archivo requerido: {archivo}"
            )

    print("✓ Los archivos necesarios fueron encontrados.")


# ---------------------------------------------------------
# Vistas de datos
# ---------------------------------------------------------

def crear_vistas(
    conexion: duckdb.DuckDBPyConnection,
) -> None:
    """Crea vistas temporales sobre los archivos CSV."""

    ruta_polizas = POLIZAS_CSV.as_posix()
    ruta_gestiones = GESTIONES_CSV.as_posix()

    conexion.execute(
        f"""
        CREATE OR REPLACE VIEW polizas AS
        SELECT
            id_poliza,
            CAST(fecha_emision AS DATE) AS fecha_emision,
            asesor,
            regional,
            canal,
            producto,
            CAST(prima_mensual AS BIGINT) AS prima_mensual,
            estado,
            CAST(dias_mora AS BIGINT) AS dias_mora
        FROM read_csv_auto(
            '{ruta_polizas}',
            HEADER = TRUE
        );
        """
    )

    conexion.execute(
        f"""
        CREATE OR REPLACE VIEW gestiones AS
        SELECT
            id_gestion,
            CAST(fecha_gestion AS DATE) AS fecha_gestion,
            asesor,
            regional,
            tipo_gestion,
            resultado
        FROM read_csv_auto(
            '{ruta_gestiones}',
            HEADER = TRUE
        );
        """
    )

    print("✓ Las vistas de pólizas y gestiones fueron creadas.")


# ---------------------------------------------------------
# Ejecución de consultas
# ---------------------------------------------------------

def ejecutar_consulta(
    conexion: duckdb.DuckDBPyConnection,
    archivo_sql: str,
    archivo_salida: str,
    titulo: str,
) -> None:
    """Ejecuta una consulta SQL y exporta el resultado."""

    ruta_sql = SQL_DIR / archivo_sql
    ruta_salida = RESULTADOS_DIR / archivo_salida

    sql = ruta_sql.read_text(encoding="utf-8")

    resultado = conexion.execute(sql).fetchdf()

    RESULTADOS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    resultado.to_csv(
        ruta_salida,
        index=False,
        encoding="utf-8-sig",
    )

    # La consulta maestra también se exporta como JSON
    # porque será la fuente de datos del dashboard.
    if archivo_sql == "06_consulta_maestra.sql":
        PROCESSED_DIR.mkdir(
            parents=True,
            exist_ok=True,
        )

        ruta_json = (
            PROCESSED_DIR
            / "consulta_maestra.json"
        )

        resultado.to_json(
            ruta_json,
            orient="records",
            force_ascii=False,
            indent=2,
        )

        print(
            f"✓ JSON del dashboard exportado en: "
            f"{ruta_json}"
        )

    print("\n" + "=" * 75)
    print(titulo)
    print("=" * 75)

    if resultado.empty:
        print("La consulta no devolvió registros.")
    else:
        print(
            resultado.head(20).to_string(
                index=False
            )
        )

        if len(resultado) > 20:
            print(
                f"\nSe muestran 20 de "
                f"{len(resultado)} registros."
            )

    print(f"\nTotal de registros: {len(resultado)}")
    print(f"✓ Resultado exportado en: {ruta_salida}")


# ---------------------------------------------------------
# Programa principal
# ---------------------------------------------------------

def main() -> None:
    """Ejecuta todas las consultas registradas."""

    conexion = None

    try:
        validar_archivos()

        conexion = duckdb.connect(
            database=":memory:"
        )

        crear_vistas(conexion)

        for consulta in CONSULTAS:
            ejecutar_consulta(
                conexion=conexion,
                archivo_sql=consulta["archivo_sql"],
                archivo_salida=consulta["archivo_salida"],
                titulo=consulta["titulo"],
            )

        print("\n✓ Todas las consultas terminaron sin errores.")

    except Exception as error:
        print("\n✗ Ocurrió un error durante la ejecución:")
        print(error)

    finally:
        if conexion is not None:
            conexion.close()


if __name__ == "__main__":
    main()