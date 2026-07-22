/*
Consulta 1: Pólizas vigentes recientes

Se toma como fecha de corte la fecha máxima disponible
en el archivo de pólizas. Esto hace que el resultado sea
reproducible, aunque la consulta se ejecute en otro momento.
*/

WITH parametros AS (
    SELECT
        MAX(fecha_emision) AS fecha_corte
    FROM polizas
)

SELECT
    p.id_poliza,
    p.fecha_emision,
    p.asesor,
    p.regional,
    p.canal,
    p.producto,
    p.prima_mensual,
    p.estado,
    p.dias_mora
FROM polizas AS p
CROSS JOIN parametros AS prm
WHERE p.estado = 'Vigente'
  AND p.fecha_emision >= prm.fecha_corte - INTERVAL '3 months'
  AND p.fecha_emision <= prm.fecha_corte
ORDER BY
    p.prima_mensual DESC,
    p.fecha_emision DESC,
    p.id_poliza;