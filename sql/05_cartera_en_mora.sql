/*
Consulta 5: Cartera en mora

Identifica las pólizas con estado de mora y más de
30 días de atraso, incluyendo el asesor y la regional
responsables.

Se ordenan primero las pólizas con mayor número de días
en mora y, en caso de empate, por mayor prima mensual.
*/

SELECT
    id_poliza,
    fecha_emision,
    asesor,
    regional,
    canal,
    producto,
    prima_mensual,
    dias_mora
FROM polizas
WHERE estado = 'Mora'
  AND dias_mora > 30
ORDER BY
    dias_mora DESC,
    prima_mensual DESC,
    id_poliza;