"use strict";

const RUTA_DATOS = "data/processed/consulta_maestra.json";

const estado = {
    datos: [],
    regionalSeleccionada: "Todas",
};

const elementos = {
    estadoCarga: document.getElementById("estado-carga"),
    dashboard: document.getElementById("dashboard"),

    kpiPolizas: document.getElementById("kpi-polizas"),
    kpiPrima: document.getElementById("kpi-prima"),
    kpiEfectividad: document.getElementById(
        "kpi-efectividad"
    ),

    graficoRegionales: document.getElementById(
        "grafico-regionales"
    ),

    graficoEfectividad: document.getElementById(
        "grafico-efectividad"
    ),

    tablaAsesores: document.getElementById(
        "tabla-asesores"
    ),

    filtroRegional: document.getElementById(
        "filtro-regional"
    ),

    limpiarFiltro: document.getElementById(
        "limpiar-filtro"
    ),

    resumenFiltro: document.getElementById(
        "resumen-filtro"
    ),

    hallazgoTitulo: document.getElementById(
        "hallazgo-titulo"
    ),

    hallazgoTexto: document.getElementById(
        "hallazgo-texto"
    ),
};

const formatoNumero = new Intl.NumberFormat("es-CO");

const formatoMoneda = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
});

const formatoPorcentaje = new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});


/* ---------------------------------------------------------
   Carga y preparación
--------------------------------------------------------- */

async function cargarDatos() {
    const respuesta = await fetch(RUTA_DATOS);

    if (!respuesta.ok) {
        throw new Error(
            `No fue posible cargar los datos. Código: ${
                respuesta.status
            }`
        );
    }

    const datos = await respuesta.json();

    if (!Array.isArray(datos) || datos.length === 0) {
        throw new Error(
            "El archivo de datos no contiene registros."
        );
    }

    return datos;
}

function convertirNumero(valor) {
    const numero = Number(valor);

    return Number.isFinite(numero) ? numero : 0;
}

function normalizarDatos(datos) {
    return datos.map((registro) => ({
        asesor: String(registro.asesor ?? ""),
        regional: String(registro.regional ?? ""),

        polizasVigentes: convertirNumero(
            registro.polizas_vigentes
        ),

        primaTotalVigente: convertirNumero(
            registro.prima_total_vigente
        ),

        gestionesTotales: convertirNumero(
            registro.gestiones_totales
        ),

        gestionesEfectivas: convertirNumero(
            registro.gestiones_efectivas
        ),

        tasaEfectividad: convertirNumero(
            registro.tasa_efectividad
        ),
    }));
}


/* ---------------------------------------------------------
   Filtros
--------------------------------------------------------- */

function cargarOpcionesRegionales(datos) {
    const regionales = [
        ...new Set(
            datos.map((registro) => registro.regional)
        ),
    ].sort((a, b) => a.localeCompare(b, "es"));

    regionales.forEach((regional) => {
        const opcion = document.createElement("option");

        opcion.value = regional;
        opcion.textContent = regional;

        elementos.filtroRegional.appendChild(opcion);
    });
}

function obtenerDatosFiltrados() {
    if (estado.regionalSeleccionada === "Todas") {
        return estado.datos;
    }

    return estado.datos.filter(
        (registro) =>
            registro.regional ===
            estado.regionalSeleccionada
    );
}

function actualizarResumenFiltro(datos) {
    const cantidadAsesores = datos.length;

    if (estado.regionalSeleccionada === "Todas") {
        elementos.resumenFiltro.textContent =
            `${cantidadAsesores} asesores · ` +
            "6 regionales";
    } else {
        elementos.resumenFiltro.textContent =
            `${cantidadAsesores} asesores · ` +
            estado.regionalSeleccionada;
    }
}


/* ---------------------------------------------------------
   Indicadores
--------------------------------------------------------- */

function calcularIndicadores(datos) {
    const acumulado = datos.reduce(
        (resultado, asesor) => {
            resultado.polizas += asesor.polizasVigentes;
            resultado.prima += asesor.primaTotalVigente;
            resultado.gestiones += asesor.gestionesTotales;
            resultado.efectivas +=
                asesor.gestionesEfectivas;

            return resultado;
        },
        {
            polizas: 0,
            prima: 0,
            gestiones: 0,
            efectivas: 0,
        }
    );

    const tasaEfectividad =
        acumulado.gestiones > 0
            ? acumulado.efectivas /
              acumulado.gestiones
            : 0;

    return {
        ...acumulado,
        tasaEfectividad,
    };
}

function mostrarIndicadores(datos) {
    const indicadores = calcularIndicadores(datos);

    elementos.kpiPolizas.textContent =
        formatoNumero.format(indicadores.polizas);

    elementos.kpiPrima.textContent =
        formatoMoneda.format(indicadores.prima);

    elementos.kpiEfectividad.textContent =
        `${formatoPorcentaje.format(
            indicadores.tasaEfectividad * 100
        )} %`;
}


/* ---------------------------------------------------------
   Agrupación regional
--------------------------------------------------------- */

function agruparPorRegional(datos) {
    const mapaRegionales = new Map();

    datos.forEach((asesor) => {
        const regional = mapaRegionales.get(
            asesor.regional
        ) ?? {
            regional: asesor.regional,
            prima: 0,
            gestiones: 0,
            efectivas: 0,
        };

        regional.prima += asesor.primaTotalVigente;
        regional.gestiones += asesor.gestionesTotales;
        regional.efectivas +=
            asesor.gestionesEfectivas;

        mapaRegionales.set(
            asesor.regional,
            regional
        );
    });

    return Array.from(mapaRegionales.values()).map(
        (regional) => ({
            ...regional,

            efectividad:
                regional.gestiones > 0
                    ? regional.efectivas /
                      regional.gestiones
                    : 0,
        })
    );
}


/* ---------------------------------------------------------
   Gráfico de prima
--------------------------------------------------------- */

function mostrarGraficoPrima(datos) {
    const regionales = agruparPorRegional(datos).sort(
        (a, b) => b.prima - a.prima
    );

    elementos.graficoRegionales.innerHTML = "";

    if (regionales.length === 0) {
        elementos.graficoRegionales.textContent =
            "No hay información disponible.";

        return;
    }

    const primaMaxima = Math.max(
        ...regionales.map((regional) => regional.prima)
    );

    regionales.forEach((regional) => {
        const porcentaje =
            primaMaxima > 0
                ? (regional.prima / primaMaxima) * 100
                : 0;

        const fila = document.createElement("div");

        fila.className = "barra-fila";

        fila.innerHTML = `
            <span
                class="barra-fila__nombre"
                title="${regional.regional}"
            >
                ${regional.regional}
            </span>

            <div
                class="barra-fila__pista"
                role="img"
                aria-label="${
                    regional.regional
                }: ${formatoMoneda.format(
                    regional.prima
                )}"
            >
                <div
                    class="barra-fila__valor"
                    style="width: ${porcentaje}%"
                ></div>
            </div>

            <span class="barra-fila__cantidad">
                ${formatoMoneda.format(
                    regional.prima
                )}
            </span>
        `;

        elementos.graficoRegionales.appendChild(fila);
    });
}


/* ---------------------------------------------------------
   Gráfico de efectividad
--------------------------------------------------------- */

function mostrarGraficoEfectividad(datos) {
    const regionales = agruparPorRegional(datos).sort(
        (a, b) => b.efectividad - a.efectividad
    );

    elementos.graficoEfectividad.innerHTML = "";

    if (regionales.length === 0) {
        elementos.graficoEfectividad.textContent =
            "No hay información disponible.";

        return;
    }

    regionales.forEach((regional) => {
        const porcentaje =
            regional.efectividad * 100;

        const fila = document.createElement("div");

        fila.className = "barra-fila";

        fila.innerHTML = `
            <span
                class="barra-fila__nombre"
                title="${regional.regional}"
            >
                ${regional.regional}
            </span>

            <div
                class="barra-fila__pista"
                role="img"
                aria-label="${
                    regional.regional
                }: ${formatoPorcentaje.format(
                    porcentaje
                )} por ciento"
            >
                <div
                    class="
                        barra-fila__valor
                        barra-fila__valor--efectividad
                    "
                    style="width: ${porcentaje}%"
                ></div>
            </div>

            <span class="barra-fila__cantidad">
                ${formatoPorcentaje.format(
                    porcentaje
                )} %
            </span>
        `;

        elementos.graficoEfectividad.appendChild(
            fila
        );
    });
}


/* ---------------------------------------------------------
   Tabla top 10
--------------------------------------------------------- */

function obtenerTopAsesores(datos, cantidad = 10) {
    return [...datos]
        .sort(
            (a, b) =>
                b.primaTotalVigente -
                a.primaTotalVigente
        )
        .slice(0, cantidad);
}

function mostrarTabla(datos) {
    const asesores = obtenerTopAsesores(datos);

    elementos.tablaAsesores.innerHTML = "";

    asesores.forEach((asesor, indice) => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td class="posicion">
                ${indice + 1}
            </td>

            <td>
                ${asesor.asesor}
            </td>

            <td>
                ${asesor.regional}
            </td>

            <td class="valor-numerico">
                ${formatoNumero.format(
                    asesor.polizasVigentes
                )}
            </td>

            <td class="valor-numerico">
                ${formatoMoneda.format(
                    asesor.primaTotalVigente
                )}
            </td>

            <td class="valor-numerico">
                ${formatoPorcentaje.format(
                    asesor.tasaEfectividad * 100
                )} %
            </td>
        `;

        elementos.tablaAsesores.appendChild(fila);
    });
}


/* ---------------------------------------------------------
   Hallazgo ejecutivo
--------------------------------------------------------- */

function mostrarHallazgo(datos) {
    if (datos.length === 0) {
        elementos.hallazgoTitulo.textContent =
            "Sin información";

        elementos.hallazgoTexto.textContent =
            "No existen registros para el filtro seleccionado.";

        return;
    }

    const liderPrima = [...datos].sort(
        (a, b) =>
            b.primaTotalVigente -
            a.primaTotalVigente
    )[0];

    const liderEfectividad = [...datos].sort(
        (a, b) =>
            b.tasaEfectividad -
            a.tasaEfectividad
    )[0];

    const principalesPorPrima = obtenerTopAsesores(
        datos,
        Math.min(10, datos.length)
    );

    const oportunidad = [
        ...principalesPorPrima,
    ].sort(
        (a, b) =>
            a.tasaEfectividad -
            b.tasaEfectividad
    )[0];

    const contexto =
        estado.regionalSeleccionada === "Todas"
            ? "En la operación consolidada"
            : `En ${estado.regionalSeleccionada}`;

    elementos.hallazgoTitulo.textContent =
        `${contexto}, la productividad presenta ` +
        "diferencias entre asesores";

    elementos.hallazgoTexto.textContent =
        `${liderEfectividad.asesor} registra la mayor ` +
        `efectividad, con ${formatoPorcentaje.format(
            liderEfectividad.tasaEfectividad * 100
        )} %. ` +
        `${liderPrima.asesor} concentra la mayor prima ` +
        `vigente, con ${formatoMoneda.format(
            liderPrima.primaTotalVigente
        )}. ` +
        `${oportunidad.asesor} aparece como oportunidad ` +
        `de acompañamiento porque administra ` +
        `${formatoMoneda.format(
            oportunidad.primaTotalVigente
        )} y presenta una efectividad de ` +
        `${formatoPorcentaje.format(
            oportunidad.tasaEfectividad * 100
        )} %.`;
}


/* ---------------------------------------------------------
   Actualización general
--------------------------------------------------------- */

function actualizarDashboard() {
    const datosFiltrados = obtenerDatosFiltrados();

    mostrarIndicadores(datosFiltrados);
    mostrarGraficoPrima(datosFiltrados);
    mostrarGraficoEfectividad(datosFiltrados);
    mostrarTabla(datosFiltrados);
    mostrarHallazgo(datosFiltrados);
    actualizarResumenFiltro(datosFiltrados);
}

function configurarEventos() {
    elementos.filtroRegional.addEventListener(
        "change",
        (evento) => {
            estado.regionalSeleccionada =
                evento.target.value;

            actualizarDashboard();
        }
    );

    elementos.limpiarFiltro.addEventListener(
        "click",
        () => {
            estado.regionalSeleccionada = "Todas";
            elementos.filtroRegional.value = "Todas";

            actualizarDashboard();
        }
    );
}


/* ---------------------------------------------------------
   Inicio y manejo de errores
--------------------------------------------------------- */

function mostrarDashboard() {
    elementos.estadoCarga.classList.add("oculto");
    elementos.dashboard.classList.remove("oculto");
}

function mostrarError(error) {
    console.error(error);

    elementos.estadoCarga.classList.add("error");

    elementos.estadoCarga.innerHTML = `
        <strong>
            No fue posible cargar el dashboard.
        </strong>

        <br>

        ${error.message}

        <br><br>

        Abre el proyecto utilizando Live Server.
    `;
}

async function iniciarDashboard() {
    try {
        const datosOriginales = await cargarDatos();

        estado.datos = normalizarDatos(
            datosOriginales
        );

        cargarOpcionesRegionales(estado.datos);
        configurarEventos();
        actualizarDashboard();
        mostrarDashboard();
    } catch (error) {
        mostrarError(error);
    }
}

document.addEventListener(
    "DOMContentLoaded",
    iniciarDashboard
);