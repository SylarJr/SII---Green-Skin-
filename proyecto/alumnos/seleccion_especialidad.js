const matriculaSesion = sessionStorage.getItem('matricula');
const carreraSesion = sessionStorage.getItem('id_carrera');

// 1. Verificar si el alumno necesita elegir especialidad
async function verificarMomentoEspecialidad() {
    if (!matriculaSesion) return;

    try {
        // Consultamos el semestre y la especialidad actual directamente a la base
        const { data, error } = await window.supabaseClient
            .from('alumno')
            .select('semestre_actual, id_especialidad')
            .eq('no_control', matriculaSesion)
            .single();

        if (error) throw error;

        // LA REGLA DE ORO: Si va en 7mo (o superior) y no tiene especialidad
        if (data.semestre_actual >= 7 && (!data.id_especialidad || data.id_especialidad === 'ninguna')) {
            mostrarModalEspecialidad();
        }
    } catch (error) {
        console.error("Error al verificar el perfil del alumno:", error);
    }
}

// 2. Mostrar la ventana y cargar las opciones de SU carrera
async function mostrarModalEspecialidad() {
    const modal = document.getElementById('modal-especialidad');
    const selectEspecialidad = document.getElementById('select-nueva-especialidad');
    
    modal.style.display = 'flex'; // Mostramos el modal

    try {
        const { data, error } = await window.supabaseClient
            .from('especialidad')
            .select('id_especialidad, nombre_especialidad')
            .eq('id_carrera', carreraSesion); // Solo le mostramos las de Informática (o su carrera)

        if (error) throw error;

        selectEspecialidad.innerHTML = '<option value="" disabled selected>Elige tu especialidad...</option>';
        data.forEach(esp => {
            const option = document.createElement('option');
            option.value = esp.id_especialidad;
            option.textContent = esp.nombre_especialidad;
            selectEspecialidad.appendChild(option);
        });

    } catch (error) {
        selectEspecialidad.innerHTML = '<option value="" disabled>Error al cargar especialidades</option>';
    }
}

// 3. Guardar la decisión en la base de datos
document.getElementById('btn-guardar-especialidad').addEventListener('click', async () => {
    const seleccion = document.getElementById('select-nueva-especialidad').value;
    
    if (!seleccion) {
        Swal.fire('Atención', 'Debes seleccionar una especialidad para continuar.', 'warning');
        return;
    }

    try {
        const { error } = await window.supabaseClient
            .from('alumno')
            .update({ id_especialidad: seleccion })
            .eq('no_control', matriculaSesion);

        if (error) throw error;

        // Actualizamos la sesión para que no se lo vuelva a preguntar
        sessionStorage.setItem('id_especialidad', seleccion); 
        
        Swal.fire('¡Excelente elección!', 'Tu especialidad ha sido registrada. Tu retícula se ha actualizado.', 'success')
            .then(() => {
                document.getElementById('modal-especialidad').style.display = 'none';
                // Aquí podrías llamar a la función que carga las materias para que se refresque la tabla
            });

    } catch (error) {
        Swal.fire('Error', 'No se pudo guardar tu elección.', 'error');
    }
});

// Ejecutamos la validación al cargar la página
verificarMomentoEspecialidad();