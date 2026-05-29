// proyecto/profesores/logica_calificaciones.js

// Recuperar la clase seleccionada previamente (debes asegurarte de guardar esto en sessionStorage al hacer clic en "Mis_Materias")
const idClaseActual = sessionStorage.getItem('id_clase_activa');
const tbodyCalificaciones = document.getElementById('tabla-calificaciones-body');
let listaAlumnos = [];

document.addEventListener('DOMContentLoaded', async () => {
    if (!idClaseActual) {
        Swal.fire('Atención', 'No has seleccionado un grupo para calificar.', 'warning')
            .then(() => window.location.href = 'Mis_Materias.html');
        return;
    }
    await cargarListaAlumnos();
});

async function cargarListaAlumnos() {
    try {
        // 1. Obtener los alumnos inscritos en este grupo (Asumiendo que existe una tabla 'carga_academica')
        const { data: inscritos, error: errorInscritos } = await window.supabaseClient
            .from('carga_academica')
            .select(`
                no_control,
                alumno ( nombres, apellido_paterno, apellido_materno )
            `)
            .eq('id_clase', idClaseActual);

        if (errorInscritos) throw errorInscritos;

        // 2. Obtener las calificaciones existentes, si las hay
        const { data: notas, error: errorNotas } = await window.supabaseClient
            .from('calificaciones_parciales')
            .select('*')
            .eq('id_clase', idClaseActual);

        if (errorNotas) throw errorNotas;

        // Convertir las notas a un diccionario para búsqueda rápida
        const diccionarioNotas = {};
        notas.forEach(nota => {
            diccionarioNotas[nota.no_control] = nota;
        });

        tbodyCalificaciones.innerHTML = '';
        listaAlumnos = inscritos;

        if (inscritos.length === 0) {
            tbodyCalificaciones.innerHTML = '<tr><td colspan="7" style="text-align:center;">No hay alumnos inscritos en este grupo.</td></tr>';
            return;
        }

        // 3. Renderizar la tabla con los inputs
        inscritos.forEach(registro => {
            const alumno = registro.alumno;
            const noControl = registro.no_control;
            const nombreCompleto = `${alumno.nombres} ${alumno.apellido_paterno} ${alumno.apellido_materno}`;
            
            // Obtener notas previas o poner vacío
            const notasPrevias = diccionarioNotas[noControl] || {};

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-size: 0.9rem;">
                    <strong>${noControl}</strong><br>
                    ${nombreCompleto}
                </td>
                <td style="color: #666; font-size: 0.85rem;">Materia Actual</td>
                ${[1, 2, 3, 4, 5].map(unidad => `
                    <td>
                        <input type="number" 
                               class="input-nota" 
                               data-control="${noControl}" 
                               data-unidad="unidad_${unidad}" 
                               step="1" min="0" max="100" 
                               value="${notasPrevias[`unidad_${unidad}`] || ''}" 
                               placeholder="0">
                    </td>
                `).join('')}
            `;
            tbodyCalificaciones.appendChild(tr);
        });

    } catch (error) {
        console.error("Error al cargar calificaciones:", error);
        tbodyCalificaciones.innerHTML = '<tr><td colspan="7" style="text-align:center; color: red;">Error al obtener la lista de alumnos.</td></tr>';
    }
}

// Acción de guardar calificaciones
document.getElementById('btn-guardar-notas').addEventListener('click', async () => {
    const inputs = document.querySelectorAll('.input-nota');
    const datosAGuardar = {};

    // Recolectar datos de todos los inputs generados dinámicamente
    inputs.forEach(input => {
        const noControl = input.getAttribute('data-control');
        const unidad = input.getAttribute('data-unidad');
        let valor = parseFloat(input.value);

        if (isNaN(valor)) valor = null;

        if (!datosAGuardar[noControl]) {
            datosAGuardar[noControl] = {
                no_control: noControl,
                id_clase: idClaseActual
            };
        }
        datosAGuardar[noControl][unidad] = valor;
    });

    const arregloUpsert = Object.values(datosAGuardar);

    try {
        // Hacer un "upsert" (insertar si no existe, actualizar si ya existe, usando la llave única no_control + id_clase)
        const { error } = await window.supabaseClient
            .from('calificaciones_parciales')
            .upsert(arregloUpsert, { onConflict: 'no_control, id_clase' });

        if (error) throw error;

        Swal.fire({
            title: '¡Guardado exitoso!',
            text: 'Las calificaciones han sido actualizadas en el sistema.',
            icon: 'success',
            confirmButtonColor: '#265b17'
        });

    } catch (error) {
        Swal.fire('Error', 'No se pudieron guardar las calificaciones: ' + error.message, 'error');
        console.error(error);
    }
});