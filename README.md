# Reto técnico — Analítica Comercial Bancaservicios

Solución desarrollada para identificar oportunidades de mejora en la productividad y las ventas de una fuerza comercial, utilizando datos simulados de pólizas y gestiones comerciales.

## Dashboard público

El dashboard se encuentra publicado y disponible sin inicio de sesión:

**https://dantechi.github.io/reto-bancaservicios-analitica/**

## Objetivo

El reto busca responder la siguiente pregunta:

> ¿Cómo puede un Director Regional aumentar la productividad y las ventas de sus asesores sin incrementar el presupuesto ni contratar personal adicional?

Para responderla se desarrollaron:

- Seis consultas SQL obligatorias.
- Dos consultas exploratorias complementarias.
- Resultados exportados en formato CSV.
- Un documento ejecutivo con hallazgos y recomendación.
- Un dashboard comercial público.
- Una propuesta adicional de producto.

## Tecnologías utilizadas

- **DuckDB:** ejecución de consultas SQL directamente sobre archivos CSV.
- **Python:** automatización de consultas y exportación de resultados.
- **Pandas:** generación de archivos CSV y JSON.
- **HTML, CSS y JavaScript:** desarrollo del dashboard.
- **GitHub Pages:** publicación del dashboard.
- **Visual Studio Code:** entorno de desarrollo.

## Estructura del proyecto

```text
reto-bancaservicios-analitica/
│
├── css/
│   └── style.css
│
├── data/
│   ├── processed/
│   │   └── consulta_maestra.json
│   │
│   └── raw/
│       ├── gestiones.csv
│       └── polizas.csv
│
├── documentos/
│   ├── Hallazgos_Recomendacion_Bancaservicios.pdf
│   └── vision_producto.md
│
├── js/
│   └── dashboard.js
│
├── resultados/
│   ├── consulta_01.csv
│   ├── consulta_02.csv
│   ├── consulta_03.csv
│   ├── consulta_04.csv
│   ├── consulta_05.csv
│   ├── consulta_06.csv
│   ├── analisis_07_regionales.csv
│   └── analisis_08_tipo_gestion.csv
│
├── scripts/
│   └── ejecutar_consultas.py
│
├── sql/
│   ├── 01_polizas_vigentes_recientes.sql
│   ├── 02_prima_por_regional.sql
│   ├── 03_efectividad_por_asesor.sql
│   ├── 04_ranking_regional.sql
│   ├── 05_cartera_en_mora.sql
│   ├── 06_consulta_maestra.sql
│   ├── 07_analisis_por_regional.sql
│   └── 08_efectividad_tipo_gestion.sql
│
├── .gitignore
├── index.html
├── README.md
└── requirements.txt
```

## Datos utilizados

El análisis utiliza dos archivos:

### `polizas.csv`

Contiene una fila por póliza con información como:

- Identificador de la póliza.
- Fecha de emisión.
- Asesor responsable.
- Regional.
- Canal.
- Producto.
- Prima mensual.
- Estado.
- Días de mora.

### `gestiones.csv`

Contiene una fila por gestión comercial con información como:

- Identificador de la gestión.
- Fecha de gestión.
- Asesor.
- Regional.
- Tipo de gestión.
- Resultado efectivo o no efectivo.

## Consultas SQL

### 1. Pólizas vigentes recientes

Lista las pólizas vigentes emitidas durante los tres meses anteriores a la fecha máxima disponible en los datos.

La fecha máxima del archivo se utiliza como fecha de corte para que el resultado sea reproducible.

El resultado se ordena por prima mensual de mayor a menor.

### 2. Prima por regional

Calcula para cada regional:

- Número de pólizas vigentes.
- Prima mensual vigente total.

### 3. Efectividad por asesor

Calcula la tasa de efectividad comercial de cada asesor:

```text
Tasa de efectividad =
Gestiones efectivas / Gestiones totales
```

La consulta presenta:

- Los cinco asesores con mayor efectividad.
- Los cinco asesores con menor efectividad.

### 4. Ranking dentro de cada regional

Utiliza la función de ventana `DENSE_RANK()` para ordenar a cada asesor dentro de su propia regional según su tasa de efectividad.

Los asesores con la misma tasa pueden compartir la misma posición.

### 5. Cartera en mora

Identifica las pólizas que cumplen las siguientes condiciones:

- Estado igual a `Mora`.
- Más de 30 días de mora.

También presenta el asesor y la regional responsables.

### 6. Consulta maestra

Combina los resultados de pólizas y gestiones para mostrar por asesor:

- Regional.
- Pólizas vigentes.
- Prima total vigente.
- Gestiones totales.
- Gestiones efectivas.
- Tasa de efectividad.

Las tablas de pólizas y gestiones se agregan por separado antes de realizar la unión.

Esta decisión evita duplicaciones causadas por una relación muchos a muchos entre pólizas y gestiones.

El resultado de esta consulta se utiliza como fuente de datos del dashboard.

## Análisis complementario

También se desarrollaron dos consultas exploratorias:

### Resultados por regional

Compara entre regionales:

- Pólizas vigentes.
- Prima mensual vigente.
- Gestiones totales.
- Gestiones efectivas.
- Tasa de efectividad.

### Efectividad por tipo de gestión

Compara la efectividad de los diferentes tipos de gestión:

- Llamada.
- WhatsApp.
- Email.
- Visita.

Este análisis se utiliza como señal exploratoria y no como evidencia causal.

## Indicadores principales

Los resultados consolidados utilizados en el dashboard son:

| Indicador | Resultado |
|---|---:|
| Pólizas vigentes | 484 |
| Prima mensual vigente | $211.701.700 |
| Tasa global de efectividad | 48,90 % |

La tasa global se calcula de manera ponderada:

```text
Total de gestiones efectivas / Total de gestiones
```

No se utiliza un promedio simple de los porcentajes individuales de los asesores.

## Principales hallazgos

### 1. Existe una diferencia importante de efectividad entre asesores

La tasa más alta es de **76,47 %**, mientras que la más baja es de **21,21 %**.

Esta diferencia indica que existe una oportunidad para identificar y replicar las prácticas de los asesores de mayor desempeño.

### 2. Valle lidera en cartera vigente, pero no en efectividad

Valle registra:

- 98 pólizas vigentes.
- $43,23 millones de prima mensual vigente.
- 48,68 % de efectividad.

Aunque lidera en volumen de cartera, todavía tiene espacio para mejorar la productividad comercial.

### 3. Existen asesores con carteras de alto valor y baja efectividad

Algunos asesores administran una prima vigente alta, pero presentan tasas de efectividad inferiores al promedio.

Estos casos representan una oportunidad prioritaria de acompañamiento comercial.

## Recomendación

Se propone implementar un **sprint de productividad comercial de cinco días**.

### Lunes

- Identificar al asesor con mayor efectividad de cada regional.
- Seleccionar uno o dos asesores con una brecha importante.
- Comparar sus métodos de priorización, contacto y seguimiento.

### Martes a jueves

- Aplicar las prácticas acordadas sobre la cartera actual.
- Realizar una reunión diaria de 15 minutos.
- Monitorear:
  - Gestiones totales.
  - Gestiones efectivas.
  - Tasa de efectividad.

### Viernes

- Comparar los resultados contra la línea base.
- Documentar las prácticas que generaron mejoras.
- Extender durante dos semanas las prácticas más efectivas.

La recomendación busca aumentar la productividad utilizando los mismos asesores, el mismo presupuesto y el volumen actual de gestiones.

## Dashboard

El dashboard incluye:

- Tres tarjetas de indicadores.
- Total de pólizas vigentes.
- Prima mensual vigente.
- Tasa global de efectividad.
- Filtro por regional.
- Gráfico de prima vigente por regional.
- Gráfico de efectividad por regional.
- Tabla con los diez asesores de mayor prima vigente.
- Hallazgo ejecutivo generado dinámicamente.

El dashboard fue construido sin backend y utiliza como fuente el archivo:

```text
data/processed/consulta_maestra.json
```

## Ejecución local

### 1. Clonar el repositorio

```bash
git clone https://github.com/Dantechi/reto-bancaservicios-analitica.git
```

### 2. Entrar a la carpeta

```bash
cd reto-bancaservicios-analitica
```

### 3. Crear el entorno virtual

En Windows:

```powershell
python -m venv .venv
```

### 4. Activar el entorno virtual

```powershell
.\.venv\Scripts\Activate.ps1
```

### 5. Instalar las dependencias

```powershell
pip install -r requirements.txt
```

### 6. Ejecutar las consultas

```powershell
python scripts/ejecutar_consultas.py
```

El programa realiza las siguientes tareas:

1. Lee los archivos CSV.
2. Crea vistas temporales en DuckDB.
3. Ejecuta los archivos SQL.
4. Exporta los resultados a la carpeta `resultados`.
5. Genera el archivo JSON utilizado por el dashboard.

### 7. Ejecutar el dashboard localmente

Abrir `index.html` mediante una extensión como **Live Server** en Visual Studio Code.

No se recomienda abrir el archivo directamente con doble clic, porque algunos navegadores bloquean la lectura local del archivo JSON.

## Consideraciones metodológicas

- Los datos permiten identificar asociaciones, pero no demostrar causalidad.
- No existe un identificador que relacione directamente una gestión con una póliza específica.
- La efectividad comercial se calcula a partir de las gestiones registradas.
- La fecha de corte de la consulta de pólizas recientes corresponde a la fecha máxima del conjunto de datos.
- Las tablas se agregan antes de combinarlas para evitar duplicaciones.
- La efectividad global se calcula de manera ponderada.
- Los resultados por tipo de gestión deben interpretarse como señales exploratorias.

## Bonus — Visión de producto

Se propone un **copiloto semanal de productividad comercial** para Directores Regionales y Asesores Comerciales.

La herramienta podría:

- Identificar asesores que requieren acompañamiento.
- Detectar carteras de alto valor con baja efectividad.
- Priorizar oportunidades de seguimiento.
- Mostrar prácticas utilizadas por los mejores asesores.
- Generar alertas cuando disminuya la efectividad.
- Recomendar acciones para la siguiente semana.

El éxito se mediría mediante:

- Incremento de la tasa de efectividad.
- Aumento de las gestiones efectivas.
- Crecimiento de pólizas vigentes.
- Incremento de la prima mensual vigente.
- Reducción de la diferencia entre los asesores de mayor y menor desempeño.

## Autor

**Pablo Rincón**

Reto técnico desarrollado para un proceso de selección de Analítica Comercial.