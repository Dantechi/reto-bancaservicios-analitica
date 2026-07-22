/*
Consulta 4: Ranking de efectividad dentro de cada regional

Primero se calcula la tasa de efectividad por asesor.
Después se utiliza DENSE_RANK para ordenar a los asesores
dentro de su propia regional.

DENSE_RANK permite que dos asesores con la misma tasa
compartan la misma posición.
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

ranking_asesores AS (
    SELECT
        regional,
        asesor,
        gestiones_totales,
        gestiones_efectivas,
        tasa_efectividad,
        DENSE_RANK() OVER (
            PARTITION BY regional
            ORDER BY tasa_efectividad DESC
        ) AS ranking_regional
    FROM efectividad
)

SELECT
    regional,
    ranking_regional,
    asesor,
    gestiones_totales,
    gestiones_efectivas,
    ROUND(
        tasa_efectividad * 100,
        2
    ) AS tasa_efectividad_pct
FROM ranking_asesores
ORDER BY
    regional,
    ranking_regional,
    asesor;