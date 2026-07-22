/*
Análisis complementario 1:
Resultados comerciales y efectividad por regional.

Las pólizas y las gestiones se agregan por separado
antes de unirlas, evitando duplicar registros.
*/

WITH polizas_por_regional AS (
    SELECT
        regional,
        COUNT(DISTINCT id_poliza) FILTER (
            WHERE estado = 'Vigente'
        ) AS polizas_vigentes,

        COALESCE(
            SUM(prima_mensual) FILTER (
                WHERE estado = 'Vigente'
            ),
            0
        ) AS prima_total_vigente
    FROM polizas
    GROUP BY regional
),

gestiones_por_regional AS (
    SELECT
        regional,
        COUNT(*) AS gestiones_totales,

        COUNT(*) FILTER (
            WHERE resultado = 'Efectiva'
        ) AS gestiones_efectivas
    FROM gestiones
    GROUP BY regional
)

SELECT
    p.regional,
    p.polizas_vigentes,
    p.prima_total_vigente,
    g.gestiones_totales,
    g.gestiones_efectivas,

    ROUND(
        100.0 * g.gestiones_efectivas
        / NULLIF(g.gestiones_totales, 0),
        2
    ) AS tasa_efectividad_pct

FROM polizas_por_regional AS p

INNER JOIN gestiones_por_regional AS g
    ON p.regional = g.regional

ORDER BY
    tasa_efectividad_pct DESC,
    prima_total_vigente DESC;