/*
Consulta 2: Prima por regional

Calcula el número de pólizas vigentes y la suma de su
prima mensual para cada regional.
*/

SELECT
    regional,
    COUNT(DISTINCT id_poliza) AS polizas_vigentes,
    SUM(prima_mensual) AS prima_mensual_total
FROM polizas
WHERE estado = 'Vigente'
GROUP BY regional
ORDER BY
    prima_mensual_total DESC,
    regional;