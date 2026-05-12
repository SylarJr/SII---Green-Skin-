const tbodyAspirantes = document.getElementById('tabla-aspirantes');

// 1. Función para cargar los aspirantes al entrar a la página
async function cargarAspirantes() {
    try {
        // ⚠️ AQUÍ ES DONDE VA EL FILTRO: Solo traemos a los Pendientes
        const { data, error } = await window.supabaseClient
            .from('aspirantes')
            .select('*')
            .eq('estado_solicitud', 'Pendiente'); 

        if (error) throw error;

        tbodyAspirantes.innerHTML = ''; // Limpiamos la tabla

        if (data.length === 0) {
            tbodyAspirantes.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay solicitudes pendientes</td></tr>';
            return;
        }

        // Recorremos los datos y creamos las filas
        data.forEach(aspirante => {
            const nombreCompleto = `${aspirante.nombres} ${aspirante.apellido_paterno} ${aspirante.apellido_materno}`;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-size: 0.8rem; font-weight: bold;">${aspirante.curp}</td>
                <td>${nombreCompleto}</td>
                <td>${aspirante.nivel_ingreso} - ${aspirante.campus_universitario}</td>
                <td><span class="status-badge pending">Pendiente</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-check accept" title="Aceptar" onclick="aceptarAspirante('${aspirante.curp}', '${aspirante.contrasena}')">✔</button>
                        <button class="btn-check reject" title="Rechazar" onclick="rechazarAspirante('${aspirante.curp}')">✖</button>
                    </div>
                </td>
            `;
            tbodyAspirantes.appendChild(tr);
        });

    } catch (error) {
        console.error('Error al cargar aspirantes:', error);
    }
}

// 2. Función para Aceptar y convertir en Alumno
async function aceptarAspirante(curp, contrasena) {
    const anio = new Date().getFullYear().toString().slice(-2);
    const matriculaGenerada = anio + Math.floor(100000 + Math.random() * 900000).toString();
    const correoGenerado = `l${matriculaGenerada}@mochis.tecnm.mx`;

    const confirmacion = await Swal.fire({
        title: '¿Aceptar Aspirante?',
        html: `Se generará la matrícula <b>${matriculaGenerada}</b> y pasará a ser Alumno.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, Aceptar',
        cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
        try {
            // PASO A: Insertar en la tabla 'alumno'
            const { error: errorInsert } = await window.supabaseClient
                .from('alumno')
                .insert([
                    {
                        no_control: matriculaGenerada,
                        contrasena: contrasena, 
                        correo_institucional: correoGenerado,
                        curp: curp,
                        id_rol: 6 
                    }
                ]);

            if (errorInsert) throw errorInsert;

            // PASO B: Actualizar estado del aspirante a 'Aceptado'
            const { error: errorUpdate } = await window.supabaseClient
                .from('aspirantes')
                .update({ estado_solicitud: 'Aceptado' }) 
                .eq('curp', curp);

            if (errorUpdate) throw errorUpdate;

            Swal.fire('¡Aceptado!', 'El aspirante ahora es un alumno oficial.', 'success');
            
            // Recargar la tabla para que desaparezca visualmente
            cargarAspirantes();

        } catch (error) {
            Swal.fire('Error', 'Hubo un problema al procesar la aceptación: ' + error.message, 'error');
            console.error(error);
        }
    }
}

// 3. Función para Rechazar
async function rechazarAspirante(curp) {
    const confirmacion = await Swal.fire({
        title: '¿Rechazar Aspirante?',
        text: "La solicitud será marcada como rechazada.",
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: 'Sí, Rechazar',
        confirmButtonColor: '#d33'
    });

    if (confirmacion.isConfirmed) {
        try {
            // Unicamente actualizamos el estado a 'Rechazado', no eliminamos el registro
            const { error } = await window.supabaseClient
                .from('aspirantes')
                .update({ estado_solicitud: 'Rechazado' })
                .eq('curp', curp);

            if (error) throw error;

            Swal.fire('Rechazado', 'El aspirante ha sido marcado como rechazado.', 'success');
            cargarAspirantes();
        } catch (error) {
            Swal.fire('Error', 'No se pudo rechazar: ' + error.message, 'error');
        }
    }
}

// Iniciar la carga al abrir la página
cargarAspirantes();