const formHorario = document.getElementById('form-crear-horario');
const btnAgregarDia = document.getElementById('btn-agregar-dia');
const contenedorSesiones = document.getElementById('contenedor-sesiones');

const carreraCoordinador = sessionStorage.getItem('id_carrera'); 
const selectMateria = document.getElementById('select_materia');
const selectProfesor = document.getElementById('select_profesor');

if (!carreraCoordinador) {
    Swal.fire('Error', 'No se detectó la carrera del coordinador. Vuelve a iniciar sesión.', 'error')
        .then(() => window.location.replace('/proyecto/Inicial.html'));
}

// Clonar dinámicamente filas para más días de clase
btnAgregarDia.addEventListener('click', () => {
    const nuevaFila = document.querySelector('.fila-sesion').cloneNode(true);
    // Limpiar los campos clonados
    nuevaFila.querySelector('.hora-inicio-input').value = '';
    nuevaFila.querySelector('.hora-fin-input').value = '';
    nuevaFila.querySelector('.aula-input').value = '';
    
    // Añadir botón de eliminar fila
    const btnEliminar = document.createElement('button');
    btnEliminar.type = 'button';
    btnEliminar.innerHTML = '✖';
    btnEliminar.style = 'background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 25px; height: 38px;';
    btnEliminar.onclick = function() { nuevaFila.remove(); };
    
    nuevaFila.appendChild(btnEliminar);
    contenedorSesiones.appendChild(nuevaFila);
});

async function cargarMaterias() {
    try {
        console.log("Buscando materias para la retícula RET-INF-2020...");
        
        const { data, error } = await window.supabaseClient
            .from('reticula_materia')
            .select('codigo_materia, materia(nombre_materia)')
            .eq('clave_reticula', 'RET-INF-2020'); 

        if (error) throw error;
        
        // Imprimimos en la consola los datos crudos para diagnosticar
        console.log("Materias devueltas por Supabase:", data);

        selectMateria.innerHTML = '<option value="" disabled selected>Selecciona una materia</option>';
        
        if (data && data.length > 0) {
            data.forEach(item => {
                const option = document.createElement('option');
                
                // Extraemos el nombre de forma segura (por si Supabase lo devuelve como arreglo)
                let nombreMateria = "Nombre no disponible";
                if (item.materia && !Array.isArray(item.materia)) {
                    nombreMateria = item.materia.nombre_materia;
                } else if (item.materia && Array.isArray(item.materia)) {
                    nombreMateria = item.materia[0].nombre_materia;
                }

                option.value = item.codigo_materia; 
                option.textContent = `${item.codigo_materia} - ${nombreMateria}`; 
                selectMateria.appendChild(option);
            });
        } else {
             selectMateria.innerHTML = '<option value="" disabled>No hay materias en la retícula</option>';
             console.warn("Advertencia: Supabase devolvió 0 materias. Revisa la tabla reticula_materia.");
        }

    } catch (error) {
        console.error("Error de conexión al cargar materias:", error);
        selectMateria.innerHTML = '<option value="" disabled>Error de conexión</option>';
    }
}

async function cargarProfesores() {
    try {
        const { data, error } = await window.supabaseClient
            .from('personal_institucional')
            .select('usuario, nombres, apellidos')
            .eq('id_rol', 4) 
            .eq('id_carrera', carreraCoordinador);

        if (error) throw error;
        selectProfesor.innerHTML = '<option value="" disabled selected>Selecciona un profesor</option>';
        data.forEach(profesor => {
            const option = document.createElement('option');
            option.value = profesor.usuario; 
            option.textContent = `${profesor.nombres} ${profesor.apellidos}`; 
            selectProfesor.appendChild(option);
        });
    } catch (error) {
        selectProfesor.innerHTML = '<option value="" disabled>Error al cargar profesores</option>';
    }
}

async function cargarSemestres() {
    try {
        const { data, error } = await window.supabaseClient
            .from('semestre')
            .select('id_semestre, descripcion'); // Quitamos el filtro de carrera si la tabla es general

        if (error) throw error;
        
        const select_Semestre = document.getElementById('select_semestre');
        select_Semestre.innerHTML = '<option value="" disabled selected>Selecciona el semestre...</option>';
        
        data.forEach(s => {
            const option = document.createElement('option');
            option.value = s.id_semestre;
            option.textContent = s.descripcion;
            select_Semestre.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar semestres:", error);
    }
}

cargarMaterias();
cargarProfesores();
cargarSemestres();


// Guardado Maestro-Detalle
// Guardado Maestro-Detalle
formHorario.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const idGrupoValor = document.getElementById('id_grupo').value.toUpperCase().trim();

    const datosGrupo = {
        id_grupo: idGrupoValor,
        codigo_materia: selectMateria.value,
        profesor_asignado: selectProfesor.value,
        periodo_escolar: document.getElementById('periodo').value,
        id_carrera: carreraCoordinador,
        semestre: parseInt(document.getElementById('select_semestre').value)
    };

    try {
        // PASO A: Insertar el registro Maestro
        const { error: errorGrupo } = await window.supabaseClient.from('grupo').insert([datosGrupo]);
        if (errorGrupo) throw errorGrupo;
        
        // PASO B: Recolectar sesiones
        const filasSesiones = document.querySelectorAll('.fila-sesion');
        const listaSesiones = [];

        filasSesiones.forEach(fila => {
            listaSesiones.push({
                id_grupo: idGrupoValor,
                dia_semana: fila.querySelector('.dia-select').value,
                hora_inicio: fila.querySelector('.hora-inicio-input').value,
                hora_fin: fila.querySelector('.hora-fin-input').value,
                aula: fila.querySelector('.aula-input').value.trim()
            });
        });

        // PASO C: Insertar el bloque de sesiones
        const { error: errorSesiones } = await window.supabaseClient.from('grupo_sesion').insert(listaSesiones);
        if (errorSesiones) throw errorSesiones;

        Swal.fire('¡Éxito!', 'El grupo y todas sus sesiones fueron configurados correctamente.', 'success');
        
        contenedorSesiones.innerHTML = '';
        // Re-insertamos la fila inicial limpia
        // (Nota: Asegúrate de tener una función que genere la fila inicial si esto falla)
        formHorario.reset();

    } catch (error) {
        console.error("Error completo:", error);
        Swal.fire('Error de Guardado', error.message, 'error');
    }
}); // <--- ESTA LLAVE CIERRA EL EVENT LISTENER