let listaPagosGlobal = []; // Caché local para hacer filtros ultrarrápidos en el cliente

document.addEventListener('DOMContentLoaded', async () => {
    await obtenerHistorialPagos();
});

async function obtenerHistorialPagos() {
    const tbody = document.getElementById('tabla-historial-pagos');
    const statusTabla = document.getElementById('status-tabla');

    try {
        console.log("Consultando tabla 'pagos'...");
        const { data, error } = await window.supabaseClient
            .from('pagos')
            .select('*')
            .order('fecha_pago', { ascending: false });

        if (error) throw error;

        listaPagosGlobal = data || [];

        if (listaPagosGlobal.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No se encontraron registros de pagos.</td></tr>';
            return;
        }

        // Poblar dinámicamente el selector de años basándonos en la columna fecha_pago
        generarOpcionesAnio(listaPagosGlobal);

        // Renderizar la tabla completa de manera inicial
        renderizarTabla(listaPagosGlobal);

    } catch (error) {
        console.error("Error al obtener pagos:", error);
        if (statusTabla) {
            statusTabla.innerText = "Error de conexión con las tablas financieras: " + error.message;
            statusTabla.style.color = "red";
        }
    }
}

function generarOpcionesAnio(pagos) {
    const selectAnio = document.getElementById('filtrar-anio');
    const aniosUnicos = new Set();

    pagos.forEach(pago => {
        if (pago.fecha_pago) {
            // Extraer los primeros 4 dígitos correspondientes al año YYYY-MM-DD
            const anio = new Date(pago.fecha_pago).getFullYear();
            if (!isNaN(anio)) {
                aniosUnicos.add(anio);
            }
        }
    });

    // Ordenar años de mayor a menor e insertarlos en el dropdown
    Array.from(aniosUnicos).sort((a, b) => b - a).forEach(anio => {
        const option = document.createElement('option');
        option.value = anio;
        option.innerText = anio;
        selectAnio.appendChild(option);
    });
}

function renderizarTabla(pagosFiltrados) {
    const tbody = document.getElementById('tabla-historial-pagos');
    tbody.innerHTML = '';

    if (pagosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: #666;">Ningún pago coincide con los filtros aplicados.</td></tr>';
        return;
    }

    pagosFiltrados.forEach(pago => {
        const tr = document.createElement('tr');
        
        // Formatear la fecha para que sea legible en español local
        const fechaFormateada = pago.fecha_pago 
            ? new Date(pago.fecha_pago).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })
            : 'Sin Fecha';

        // Estructuración de columnas alineada con el style.css de tu SII
        tr.innerHTML = `
            <td style="font-weight: bold; color: #1b4d5f;">#P-${pago.id_pago || pago.ID_Pago}</td>
            <td style="font-weight: 600;">${pago.no_control || pago.NO_Control}</td>
            <td>${pago.concepto || pago.Concepto}</td>
            <td style="font-weight: bold;">$${parseFloat(pago.monto || pago.Monto).toFixed(2)}</td>
            <td style="font-size: 0.85rem; color: #555;">${fechaFormateada}</td>
            <td style="text-align: center;">
                <span class="status-badge" style="background-color: #e8f5e9; color: #1a5c24; border: 1px solid #c8e6c9; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem;">
                    ${pago.estado_transaccion || 'Acreditado'}
                </span>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Función encargada de evaluar en tiempo real los cambios del buscador de texto y el año elegido
function aplicarFiltros() {
    const textoBusqueda = document.getElementById('buscar-concepto').value.toLowerCase().trim();
    const anioSeleccionado = document.getElementById('filtrar-anio').value;

    const resultados = listaPagosGlobal.filter(pago => {
        // Filtro A: Validar Concepto (Búsqueda parcial de texto)
        const concepto = (pago.concepto || pago.Concepto || '').toLowerCase();
        const coincideConcepto = concepto.includes(textoBusqueda);

        // Filtro B: Validar Año de la fecha capturada
        let coincideAnio = true;
        if (anioSeleccionado !== 'todos' && pago.fecha_pago) {
            const anioPago = new Date(pago.fecha_pago).getFullYear().toString();
            coincideAnio = (anioPago === anioSeleccionado);
        }

        return coincideConcepto && coincideAnio;
    });

    renderizarTabla(resultados);
}