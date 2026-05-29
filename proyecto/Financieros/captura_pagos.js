// 1. Buscar TODOS los pagos pendientes del alumno
// Le agregamos el parámetro "esRecargaAutomatica" que por defecto es falso
async function buscarPagoPendiente(esRecargaAutomatica = false) {
    const noControlValor = document.getElementById('no_control_busqueda').value.trim();

    if (!noControlValor) {
        // Solo avisamos si el cajero le dio clic al botón manualmente
        if (!esRecargaAutomatica) {
            Swal.fire('Atención', 'Ingresa un número de control.', 'warning');
        }
        return;
    }

    try {
        const { data, error } = await window.supabaseClient
            .from('pagos')
            .select('*')
            .eq('no_control', noControlValor)
            .ilike('estado_transaccion', 'Pendiente'); 

        if (error) throw error;

        // Verificamos si el arreglo viene vacío
        if (!data || data.length === 0) {
            // Ocultamos la tabla porque ya no hay pendientes
            document.getElementById('contenedor-resultados-pendientes').style.display = 'none';
            
            // ¡LA MAGIA AQUÍ! Solo mostramos la alerta si NO es una recarga automática
            if (!esRecargaAutomatica) {
                Swal.fire('Sin resultados', 'El alumno no tiene referencias pendientes generadas o ya fueron pagadas.', 'info');
            }
            return; // Detenemos la función aquí
        }

        // Si hay datos, llenamos la tabla dinámica
        const tbody = document.getElementById('tabla-pendientes-body');
        tbody.innerHTML = ''; // Limpiamos búsquedas anteriores

        data.forEach(pago => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: bold; color: #1b4d5f;">${pago.id_pago}</td>
                <td>${pago.concepto}</td>
                <td style="font-weight: bold;">$${parseFloat(pago.monto).toFixed(2)}</td>
                <td style="text-align: center;">
                    <button type="button" class="submit-btn" style="padding: 6px 12px; font-size: 0.85rem; width: auto;" onclick="acreditarPago('${pago.id_pago}')">💰 Cobrar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Mostramos el contenedor con la tabla
        document.getElementById('contenedor-resultados-pendientes').style.display = 'block';

    } catch (error) {
        document.getElementById('contenedor-resultados-pendientes').style.display = 'none';
        if (!esRecargaAutomatica) {
            Swal.fire('Error', 'Hubo un problema al buscar: ' + error.message, 'error');
        }
    }
}

// 2. Acreditar un pago específico
async function acreditarPago(idPago) {
    try {
        const fechaActual = new Date().toISOString();

        // Hacemos UPDATE solo al ID específico que el cajero seleccionó
        const { data, error } = await window.supabaseClient
            .from('pagos')
            .update({ 
                estado_transaccion: 'Pagado',
                fecha_pago: fechaActual 
            })
            .eq('id_pago', idPago)
            .select(); 

        if (error) throw error;

        if (!data || data.length === 0) {
            throw new Error("Bloqueo de seguridad (RLS). Tu base de datos no permite actualizar a la tabla 'pagos'.");
        }

        Swal.fire({
            title: '¡Pago Acreditado!',
            text: `El trámite con folio ${idPago} ha sido marcado como Pagado.`,
            icon: 'success',
            confirmButtonColor: '#265b17'
        }).then(() => {
            // Le pasamos "true" para indicarle que es una recarga automática silenciosa
            buscarPagoPendiente(true);
        });

    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
}