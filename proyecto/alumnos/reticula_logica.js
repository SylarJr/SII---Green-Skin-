// Configuración de Supabase
const supabaseUrl = 'https://kwgtsplpgbjpmukbugvc.supabase.co';
const supabaseKey = 'sb_publishable_CjrhdIkcRfb1enFcpTTQAA_1fFryjoW';
let supabaseClient = null;

// Control de Sesión Inicial Seguro
if (sessionStorage.getItem('sesion_activa') !== 'true' || sessionStorage.getItem('rol_usuario') !== 'alumno') {
    window.location.replace('../Inicial.html'); 
}

function cerrarSesion() {
    sessionStorage.clear();
    window.location.replace('../Inicial.html');
}

// Carga de Datos y Renderizado
document.addEventListener('DOMContentLoaded', async () => {
    if (!window.supabaseClient) {
        window.supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    }
    supabaseClient = window.supabaseClient;

    const idCarrera = sessionStorage.getItem('id_carrera');
    // Obtenemos el id_especialidad que guardaste desde script.js
    const idEspecialidad = sessionStorage.getItem('id_especialidad'); 
    
    const gridContainer = document.getElementById('reticula-grid');
    const loadingMsj = document.getElementById('loading-msj');
    
    console.log("1. ID de carrera recuperado de la sesión:", idCarrera);

    if (!idCarrera || idCarrera === 'undefined') {
        loadingMsj.innerHTML = "<span style='color:red;'>Error: No se encontró la carrera en la sesión. Por favor, inicia sesión de nuevo.</span>";
        return;
    }

    try {
        console.log("2. Buscando retícula para id_carrera:", idCarrera);
        const { data: reticulaData, error: errorReticula } = await supabaseClient
            .from('reticula')
            .select('clave_reticula')
            .eq('id_carrera', idCarrera)
            .maybeSingle();

        if (errorReticula) throw errorReticula;
        
        if (!reticulaData) {
            loadingMsj.innerHTML = `<span style='color:orange;'>No hay retícula registrada para la carrera: ${idCarrera}</span>`;
            return;
        }

        const claveReticula = reticulaData.clave_reticula;
        document.getElementById('carrera-info').innerText = `Plan de Estudios: ${claveReticula}`;

        console.log("3. Buscando materias base para la clave:", claveReticula);
        const { data: materiasData, error: errorMaterias } = await supabaseClient
            .from('reticula_materia')
            .select(`
                semestre_sugerido,
                codigo_materia,
                materia (
                    nombre_materia,
                    creditos
                )
            `)
            .eq('clave_reticula', claveReticula)
            .order('semestre_sugerido', { ascending: true });

        if (errorMaterias) throw errorMaterias;

        // Variable let para poder manipular el arreglo
        let materiasFinales = materiasData || [];

        // 4. Lógica para interceptar la especialidad
        if (idEspecialidad && idEspecialidad !== 'ninguna' && idEspecialidad !== 'undefined' && idEspecialidad !== 'null') {
            console.log("4. Buscando materias específicas de la especialidad:", idEspecialidad);
            
            const { data: espData, error: espError } = await supabaseClient
                .from('especialidad_materia') 
                .select(`
                    semestre_sugerido,
                    codigo_materia,
                    materia (
                        nombre_materia,
                        creditos
                    )
                `)
                .eq('id_especialidad', idEspecialidad);

            if (espError) {
                console.error("Error consultando la especialidad:", espError);
            } else if (espData && espData.length > 0) {
                
                // Paso A: Filtrar las materias comodín que digan "Especialidad"
                materiasFinales = materiasFinales.filter(item => {
                    const nombre = item.materia?.nombre_materia?.toLowerCase() || '';
                    return !nombre.includes('especialidad'); 
                });

                // Paso B: Añadir las materias reales que encontramos en especialidad_materia
                materiasFinales = [...materiasFinales, ...espData];
                
                // Paso C: Reordenar por semestre
                materiasFinales.sort((a, b) => (a.semestre_sugerido || 0) - (b.semestre_sugerido || 0));
            }
        }

        if (materiasFinales.length === 0) {
            loadingMsj.innerHTML = `<span>La retícula ${claveReticula} no tiene materias asignadas.</span>`;
            return;
        }

        // 5. NUEVO: Lógica para obtener estados de materias del alumno
        console.log("5. Buscando estados individuales del alumno...");
        const matricula = sessionStorage.getItem('matricula'); 
        
        const { data: estadosData, error: estadosError } = await supabaseClient
            .from('alumno_materia')
            .select('codigo_materia, estado')
            .eq('no_control', matricula);

        if (estadosError) throw estadosError;

        // Convertimos el arreglo de estados en un diccionario para búsqueda rápida
        const diccionarioEstados = {};
        if (estadosData) {
            estadosData.forEach(item => {
                diccionarioEstados[item.codigo_materia] = item.estado;
            });
        }

        console.log("6. Dibujando materias en pantalla...");
        renderizarReticulaConColores(materiasFinales, gridContainer, diccionarioEstados);
        loadingMsj.style.display = 'none'; 

    } catch (error) {
        console.error("Error al consultar la BD:", error);
        loadingMsj.innerHTML = `<span style='color:red;'>Ocurrió un error al cargar la retícula: ${error.message}</span>`;
    }
});

function renderizarReticulaConColores(materias, container, diccionarioEstados) {
    const semestresObj = {};

    // 1. Agrupar las materias por su semestre
    materias.forEach(item => {
        const sem = item.semestre_sugerido || 0; 
        if (!semestresObj[sem]) {
            semestresObj[sem] = [];
        }
        semestresObj[sem].push(item);
    });

    // Ordenamos los semestres
    const semestresKeys = Object.keys(semestresObj).map(Number).sort((a, b) => a - b);

    // 2. Crear las columnas por cada semestre
    semestresKeys.forEach(semNum => {
        const columnaHTML = document.createElement('div');
        columnaHTML.className = 'semestre-columna';
        
        const tituloSemestre = semNum === 0 ? "Optativas" : `Semestre ${semNum}`;
        columnaHTML.innerHTML = `<h3>${tituloSemestre}</h3>`;

        // 3. Llenar las tarjetas en la columna
        semestresObj[semNum].forEach(materiaObj => {
            const infoMateria = materiaObj.materia;
            const codigo = materiaObj.codigo_materia;
            const nombreMateria = infoMateria ? infoMateria.nombre_materia : "Materia no encontrada";
            const creditos = infoMateria ? infoMateria.creditos : "-";

            // Obtenemos el estado (si no existe, por defecto es 'no_permitida')
            let estadoActual = diccionarioEstados[codigo] || 'no_permitida'; 
            
            // NORMALIZACIÓN: Minúsculas, sin espacios al inicio/final, y cambiamos espacios/guiones bajos por guiones
            estadoActual = estadoActual.toLowerCase().trim().replace(/_| /g, '-');

            // Prevención de errores comunes:
            if (estadoActual === 'acreditado') {
                estadoActual = 'acreditada';
            }
            
            // Creamos la clase final, ejemplo: "estado-acreditada"
            const claseColor = `estado-${estadoActual}`;

            const tarjeta = document.createElement('div');
            
            // Le inyectamos la clase de color a la tarjeta
            tarjeta.className = `materia-card ${claseColor}`; 
            tarjeta.innerHTML = `
                <div class="materia-nombre">${nombreMateria}</div>
                <div class="materia-detalles">
                    <span>${codigo}</span>
                    <span>Créditos: ${creditos}</span>
                </div>
            `;
            columnaHTML.appendChild(tarjeta);
        });

        // 4. Agregar la columna terminada al contenedor principal
        container.appendChild(columnaHTML);
    });
}