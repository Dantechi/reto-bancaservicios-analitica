/*
Consulta 6: Consulta maestra por asesor

Combina pólizas y gestiones para obtener:

- Número de pólizas vigentes.
- Prima mensual total vigente.
- Gestiones totales.
- Gestiones efectivas.
- Tasa de efectividad.

Importante:
Las tablas se agregan por separado antes de unirlas para
evitar una relación muchos a muchos que duplique los datos.
*/

WITH asesores AS (
    /*
    Crea una lista única de asesores para conservar aquellos
    que puedan aparecer solamente en una de las dos tablas.
    */
    SELECT
        asesor,
        regional
    FROM polizas

    UNION

    SELECT
        asesor,
        regional
    FROM gestiones
),

resumen_polizas AS (
    SELECT
        asesor,
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
    GROUP BY
        asesor,
        regional
),

resumen_gestiones AS (
    SELECT
        asesor,
        regional,
        COUNT(*) AS gestiones_totales,

        COUNT(*) FILTER (
            WHERE resultado = 'Efectiva'
        ) AS gestiones_efectivas
    FROM gestiones
    GROUP BY
        asesor,
        regional
)

SELECT
    a.asesor,
    a.regional,

    COALESCE(
        p.polizas_vigentes,
        0
    ) AS polizas_vigentes,

    COALESCE(
        p.prima_total_vigente,
        0
    ) AS prima_total_vigente,

    COALESCE(
        g.gestiones_totales,
        0
    ) AS gestiones_totales,

    COALESCE(
        g.gestiones_efectivas,
        0
    ) AS gestiones_efectivas,

    COALESCE(
        ROUND(
            1.0 * g.gestiones_efectivas
            / NULLIF(g.gestiones_totales, 0),
            4
        ),
        0
    ) AS tasa_efectividad,

    COALESCE(
        ROUND(
            100.0 * g.gestiones_efectivas
            / NULLIF(g.gestiones_totales, 0),
            2
        ),
        0
    ) AS tasa_efectividad_pct

FROM asesores AS a

LEFT JOIN resumen_polizas AS p
    ON a.asesor = p.asesor
    AND a.regional = p.regional

LEFT JOIN resumen_gestiones AS g
    ON a.asesor = g.asesor
    AND a.regional = g.regional

ORDER BY
    prima_total_vigente DESC,
    tasa_efectividad DESC,
    a.asesor;