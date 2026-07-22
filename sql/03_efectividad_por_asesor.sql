/*
Consulta 3: Efectividad por asesor

La tasa de efectividad se calcula como:

gestiones efectivas / gestiones totales

El resultado muestra los 5 asesores con mayor efectividad
y los 5 con menor efectividad.
*/

WITH efectividad AS (
    SELECT
        asesor,
        regional,
        COUNT(*) AS gestiones_totales,
        SUM(
            CASE
                WHEN resultado = 'Efectiva' THEN 1
                ELSE 0
            END
        ) AS gestiones_efectivas,
        1.0 * SUM(
            CASE
                WHEN resultado = 'Efectiva' THEN 1
                ELSE 0
            END
        ) / NULLIF(COUNT(*), 0) AS tasa_efectividad
    FROM gestiones
    GROUP BY
        asesor,
        regional
),

top_5 AS (
    SELECT
        1 AS orden_grupo,
        'Top 5' AS grupo,
        ROW_NUMBER() OVER (
            ORDER BY
                tasa_efectividad DESC,
                gestiones_totales DESC,
                asesor
        ) AS posicion,
        asesor,
        regional,
        gestiones_totales,
        gestiones_efectivas,
        tasa_efectividad
    FROM efectividad
    ORDER BY
        tasa_efectividad DESC,
        gestiones_totales DESC,
        asesor
    LIMIT 5
),

bottom_5 AS (
    SELECT
        2 AS orden_grupo,
        'Bottom 5' AS grupo,
        ROW_NUMBER() OVER (
            ORDER BY
                tasa_efectividad ASC,
                gestiones_totales DESC,
                asesor
        ) AS posicion,
        asesor,
        regional,
        gestiones_totales,
        gestiones_efectivas,
        tasa_efectividad
    FROM efectividad
    ORDER BY
        tasa_efectividad ASC,
        gestiones_totales DESC,
        asesor
    LIMIT 5
),

resultado AS (
    SELECT * FROM top_5

    UNION ALL

    SELECT * FROM bottom_5
)

SELECT
    grupo,
    posicion,
    asesor,
    regional,
    gestiones_totales,
    gestiones_efectivas,
    ROUND(tasa_efectividad * 100, 2)
        AS tasa_efectividad_pct
FROM resultado
ORDER BY
    orden_grupo,
    posicion;