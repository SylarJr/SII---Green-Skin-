// 1. Función para cargar aspirantes en la tabla
async function cargarAspirantes() {
    try {
        const tbody = document.getElementById('tabla-aspirantes');
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Cargando aspirantes...</td></tr>';

        // Consultamos a Supabase los aspirantes (EXCLUYENDO a los 'Aceptado')
        const { data, error } = await window.supabaseClient
            .from('aspirantes')
            .select('*')
            .neq('estado_solicitud', 'Aceptado') // <-- Este filtro hace la magia
            .order('estado_solicitud', { ascending: false }); 

        if (error) throw error;

        // Limpiamos el tbody
        tbody.innerHTML = '';

        if (data && data.length > 0) {
            data.forEach(aspirante => {
                const tr = document.createElement('tr');
                
                // Nombre completo
                const nombreCompleto = `${aspirante.nombres} ${aspirante.apellido_paterno} ${aspirante.apellido_materno}`;
                
                // Formato de Estado con colores
                let colorEstado = '#333';
                if(aspirante.estado_solicitud === 'Rechazado') colorEstado = '#dc3545';
                if(aspirante.estado_solicitud === 'Pendiente') colorEstado = '#ffc107';

                // Lógica de los botones con la palomita (✔) y la equis (✖)
                let botonesHtml = '';
                if (aspirante.estado_solicitud === 'Pendiente') {
                    // Usamos title="..." para que al pasar el mouse por encima diga "Aceptar" o "Rechazar"
                    botonesHtml = `
                        <button onclick="aceptarAspirante('${aspirante.curp}', '${aspirante.contrasena}', '${aspirante.id_carrera}')" class="submit-btn" style="background: #28a745; margin-right: 5px; padding: 5px 10px; font-size: 1rem; width: auto; font-weight: bold; cursor: pointer;" title="Aceptar">
                            ✔
                        </button>
                        <button onclick="rechazarAspirante('${aspirante.curp}')" class="submit-btn" style="background: #dc3545; padding: 5px 10px; font-size: 1rem; width: auto; font-weight: bold; cursor: pointer;" title="Rechazar">
                            ✖
                        </button>
                    `;
                } else {
                    botonesHtml = `<span style="color: #666; font-size: 0.85rem; font-style: italic;">Sin acciones</span>`;
                }

                // Construimos la fila
                tr.innerHTML = `
                    <td>${aspirante.curp}</td>
                    <td>${nombreCompleto}</td>
                    <td>${aspirante.nivel_ingreso}<br><small style="color: #666;">${aspirante.campus_universitario}</small></td>
                    <td style="font-weight: bold; color: ${colorEstado};">${aspirante.estado_solicitud || 'Pendiente'}</td>
                    <td>${botonesHtml}</td>
                `;
                
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay aspirantes pendientes por revisar.</td></tr>';
        }

    } catch (error) {
        console.error("Error al cargar aspirantes:", error);
        const tbody = document.getElementById('tabla-aspirantes');
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Error al cargar datos: ${error.message}</td></tr>`;
    }
}

// Llamar a la función apenas cargue el script
cargarAspirantes();

// 2. Función para Aceptar y convertir en Alumno
async function aceptarAspirante(curp, contrasena, idCarrera) {
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
                        id_rol: 6,
                        id_carrera: idCarrera 
                    }
                ]);

            if (errorInsert) throw errorInsert;

            // PASO B: Actualizar estado del aspirante a 'Aceptado'
            const { data: dataUpdate, error: errorUpdate } = await window.supabaseClient
                .from('aspirantes')
                .update({ estado_solicitud: 'Aceptado' }) 
                .eq('curp', curp)
                .select(); // ¡CLAVE! Obliga a Supabase a devolver lo que actualizó

            if (errorUpdate) throw errorUpdate;

            // ¡NUEVO!: Validación contra la trampa silenciosa
            if (!dataUpdate || dataUpdate.length === 0) {
                throw new Error("El sistema bloqueó la actualización de estado (Verifica el RLS de la tabla aspirantes).");
            }

            Swal.fire('¡Aceptado!', 'El aspirante ahora es un alumno oficial.', 'success');
            cargarAspirantes();

        } catch (error) {
            Swal.fire('Error', 'Hubo un problema al procesar la aceptación: ' + error.message, 'error');
            console.error(error);
        }
    }
}

// 3. Función para Rechazar Aspirante
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
            const { data: dataUpdate, error } = await window.supabaseClient
                .from('aspirantes')
                .update({ estado_solicitud: 'Rechazado' })
                .eq('curp', curp)
                .select(); // ¡CLAVE!

            if (error) throw error;
            
            if (!dataUpdate || dataUpdate.length === 0) {
                throw new Error("El sistema bloqueó la actualización de estado por RLS.");
            }

            Swal.fire('Rechazado', 'El aspirante ha sido marcado como rechazado.', 'success');
            cargarAspirantes();
        } catch (error) {
            Swal.fire('Error', 'No se pudo rechazar: ' + error.message, 'error');
        }
    }
}