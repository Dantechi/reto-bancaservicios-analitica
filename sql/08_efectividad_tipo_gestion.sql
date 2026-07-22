/*
Análisis complementario 2:
Efectividad según el tipo de gestión comercial.
*/

SELECT
    tipo_gestion,
    COUNT(*) AS gestiones_totales,

    COUNT(*) FILTER (
        WHERE resultado = 'Efectiva'
    ) AS gestiones_efectivas,

    ROUND(
        100.0
        * COUNT(*) FILTER (
            WHERE resultado = 'Efectiva'
        )
        / NULLIF(COUNT(*), 0),
        2
    ) AS tasa_efectividad_pct

FROM gestiones

GROUP BY tipo_gestion

ORDER BY
    tasa_efectividad_pct DESC,
    gestiones_totales DESC;