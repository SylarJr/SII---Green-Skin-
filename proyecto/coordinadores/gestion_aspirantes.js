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