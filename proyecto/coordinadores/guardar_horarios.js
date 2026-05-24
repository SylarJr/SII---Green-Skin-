const formHorario = document.getElementById('form-crear-horario');
const btnAgregarDia = document.getElementById('btn-agregar-dia');
const contenedorSesiones = document.getElementById('contenedor-sesiones');

const carreraCoordinador = sessionStorage.getItem('id_carrera'); 
const selectMateria = document.getElementById('select_materia');
const selectProfesor = document.getElementById('select_profesor');
const selectSemestre = document.getElementById('select_semestre');
const selectEspecialidad = document.getElementById('select_especialidad'); 

if (!carreraCoordinador) {
    Swal.fire('Error', 'No se detectó la carrera del coordinador.', 'error')
        .then(() => window.location.replace('/proyecto/Inicial.html'));
}

// Clonar dinámicamente filas para más sesiones de clase
btnAgregarDia.addEventListener('click', () => {
    const nuevaFila = document.querySelector('.fila-sesion').cloneNode(true);
    nuevaFila.querySelector('.hora-inicio-input').value = '';
    nuevaFila.querySelector('.hora-fin-input').value = '';
    nuevaFila.querySelector('.aula-input').value = '';
    
    const btnEliminar = document.createElement('button');
    btnEliminar.type = 'button';
    btnEliminar.innerHTML = 'X'; 
    btnEliminar.style = 'background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 25px; height: 38px;';
    btnEliminar.onclick = function() { nuevaFila.remove(); };
    
    nuevaFila.appendChild(btnEliminar);
    contenedorSesiones.appendChild(nuevaFila);
});

// Escuchadores de eventos para recargar materias dinámicamente
selectSemestre.addEventListener('change', actualizarListaMaterias);
selectEspecialidad.addEventListener('change', actualizarListaMaterias);

function actualizarListaMaterias() {
    const semestre = selectSemestre.value;
    const specialty = selectEspecialidad.value;
    if (semestre) {
        cargarMaterias(semestre, specialty);
    } else {
        selectMateria.innerHTML = '<option value="" disabled selected>Esperando selección de semestre...</option>';
    }
}

// Cargar las especialidades asociadas a la carrera del coordinador
async function cargarEspecialidades() {
    try {
        // Inicializamos limpiando el selector con la opción por defecto
        selectEspecialidad.innerHTML = '<option value="ninguna" selected>Sin especialidad (Solo materias base)</option>';

        const { data, error } = await window.supabaseClient
            .from('especialidad')
            .select('id_especialidad, nombre_especialidad')
            .eq('id_carrera', carreraCoordinador);

        if (error) throw error;
        
        if (data && data.length > 0) {
            data.forEach(esp => {
                const option = document.createElement('option');
                option.value = esp.id_especialidad;
                option.textContent = esp.nombre_especialidad;
                selectEspecialidad.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Error al cargar especialidades:", error);
    }
}

// Carga combinada: Materias base + Materias de especialidad filtradas por semestre
async function cargarMaterias(semestre, especialidad) {
    try {
        selectMateria.innerHTML = '<option value="" disabled selected>Buscando materias...</option>';
        
        // 1. Consulta para obtener materias del tronco común
        const queryBase = window.supabaseClient
            .from('reticula_materia')
            .select('codigo_materia, materia(nombre_materia)')
            .eq('clave_reticula', 'RET-INF-2020')
            .eq('semestre_sugerido', semestre);

        // 2. Consulta para obtener materias del módulo de especialidad (si aplica)
        let queryEsp = null;
        if (especialidad && especialidad !== 'ninguna') {
            queryEsp = window.supabaseClient
                .from('especialidad_materia')
                .select('codigo_materia, materia(nombre_materia)')
                .eq('id_especialidad', especialidad)
                .eq('semestre_sugerido', semestre);
        }

        // Resolución en paralelo de las peticiones a la base de datos
        const [resBase, resEsp] = await Promise.all([
            queryBase,
            queryEsp ? queryEsp : Promise.resolve({ data: [] })
        ]);

        if (resBase.error) throw resBase.error;
        if (resEsp && resEsp.error) throw resEsp.error;

        selectMateria.innerHTML = '<option value="" disabled selected>Selecciona una materia</option>';

        // Helper seguro para extraer cadenas de texto de las relaciones
        const extraerNombre = (item) => {
            if (!item.materia) return "Nombre no disponible";
            return Array.isArray(item.materia) ? item.materia[0].nombre_materia : item.materia.nombre_materia;
        };

        // Inyección organizada por grupos visuales (optgroup)
        if (resBase.data && resBase.data.length > 0) {
            const grupoBase = document.createElement('optgroup');
            grupoBase.label = "Materias Base";
            resBase.data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.codigo_materia;
                option.textContent = `${item.codigo_materia} - ${extraerNombre(item)}`;
                grupoBase.appendChild(option);
            });
            selectMateria.appendChild(grupoBase);
        }

        if (resEsp && resEsp.data && resEsp.data.length > 0) {
            const grupoEsp = document.createElement('optgroup');
            grupoEsp.label = "Materias de Especialidad";
            resEsp.data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.codigo_materia;
                option.textContent = `${item.codigo_materia} - ${extraerNombre(item)}`;
                grupoEsp.appendChild(option);
            });
            selectMateria.appendChild(grupoEsp);
        }

        // Validamos si el menú desplegable quedó vacío tras filtrar
        if (selectMateria.options.length === 1) {
            selectMateria.innerHTML = '<option value="" disabled selected>No hay materias para esta selección</option>';
        }

    } catch (error) {
        console.error("Error al cargar materias:", error);
        selectMateria.innerHTML = '<option value="" disabled selected>Error de conexión</option>';
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
            .from('semestres')
            .select('id_semestre, descripcion'); 

        if (error) throw error;
        
        selectSemestre.innerHTML = '<option value="" disabled selected>Selecciona el semestre...</option>';
        data.forEach(s => {
            const option = document.createElement('option');
            option.value = s.id_semestre;
            option.textContent = s.descripcion;
            selectSemestre.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar semestres:", error);
    }
}

// Inicialización de selectores fijos al abrir la vista
cargarProfesores();
cargarSemestres();
cargarEspecialidades(); 

// Registro completo de la planeación académica (Maestro-Detalle)
formHorario.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const idGrupoValor = document.getElementById('id_grupo').value.toUpperCase().trim();

    const datosGrupo = {
        id_grupo: idGrupoValor,
        codigo_materia: selectMateria.value,
        profesor_asignado: selectProfesor.value,
        periodo_escolar: document.getElementById('periodo').value,
        id_carrera: carreraCoordinador,
        semestre: parseInt(selectSemestre.value)
    };

    try {
        // Bloque A: Inserción del encabezado del grupo
        const { error: errorGrupo } = await window.supabaseClient.from('grupo').insert([datosGrupo]);
        if (errorGrupo) throw errorGrupo;
        
        // Bloque B: Mapeo y recolección de los días/horas añadidos dinámicamente
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

        // Bloque C: Registro masivo del desglose de sesiones semanales
        const { error: errorSesiones } = await window.supabaseClient.from('grupo_sesion').insert(listaSesiones);
        if (errorSesiones) throw errorSesiones;

        Swal.fire('¡Éxito!', 'El grupo y todas sus sesiones fueron configurados.', 'success');
        
        // Limpieza profunda del formulario para la creación del siguiente grupo
        const filasExtra = document.querySelectorAll('.fila-sesion');
        for (let i = 1; i < filasExtra.length; i++) {
            filasExtra[i].remove();
        }
        
        formHorario.reset();
        selectMateria.innerHTML = '<option value="" disabled selected>Esperando selección de semestre...</option>';
        selectEspecialidad.value = "ninguna";

    } catch (error) {
        console.error("Error completo durante el guardado:", error);
        Swal.fire('Error de Guardado', error.message, 'error');
    }
});