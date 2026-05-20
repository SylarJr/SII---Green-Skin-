// Configuración de Supabase
const supabaseUrl = 'https://kwgtsplpgbjpmukbugvc.supabase.co';
const supabaseKey = 'sb_publishable_CjrhdIkcRfb1enFcpTTQAA_1fFryjoW';
let supabaseClient = null;

// Control de Sesión Inicial Seguro
if (sessionStorage.getItem('sesion_activa') !== 'true' || sessionStorage.getItem('rol_usuario') !== 'alumno') {
    // Si tus archivos están en /proyecto/alumnos, esto busca /proyecto/Inicial.html
    window.location.replace('../Inicial.html'); 
}

function cerrarSesion() {
    sessionStorage.clear();
    window.location.replace('../Inicial.html');
}

// Carga de Datos y Renderizado
document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar el cliente una vez que el DOM y los scripts externos estén listos
    if (!window.supabaseClient) {
        window.supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    }
    supabaseClient = window.supabaseClient;

    const idCarrera = sessionStorage.getItem('id_carrera');
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

        console.log("3. Buscando materias para la clave:", claveReticula);
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

        if (!materiasData || materiasData.length === 0) {
            loadingMsj.innerHTML = `<span>La retícula ${claveReticula} no tiene materias asignadas.</span>`;
            return;
        }

        console.log("4. Dibujando materias en pantalla...");
        renderizarReticula(materiasData, gridContainer);
        loadingMsj.style.display = 'none'; 

    } catch (error) {
        console.error("Error al consultar la BD:", error);
        loadingMsj.innerHTML = `<span style='color:red;'>Ocurrió un error al cargar la retícula: ${error.message}</span>`;
    }
});

function renderizarReticula(materias, container) {
    const semestresObj = {};

    materias.forEach(item => {
        const sem = item.semestre_sugerido || 0; 
        if (!semestresObj[sem]) {
            semestresObj[sem] = [];
        }
        semestresObj[sem].push(item);
    });

    const semestresKeys = Object.keys(semestresObj).map(Number).sort((a, b) => a - b);

    semestresKeys.forEach(semNum => {
        const columnaHTML = document.createElement('div');
        columnaHTML.className = 'semestre-columna';
        
        const tituloSemestre = semNum === 0 ? "Optativas" : `Semestre ${semNum}`;
        columnaHTML.innerHTML = `<h3>${tituloSemestre}</h3>`;

        semestresObj[semNum].forEach(materiaObj => {
            const infoMateria = materiaObj.materia;
            const nombreMateria = infoMateria ? infoMateria.nombre_materia : "Materia no encontrada";
            const creditos = infoMateria ? infoMateria.creditos : "-";

            const tarjeta = document.createElement('div');
            tarjeta.className = 'materia-card';
            tarjeta.innerHTML = `
                <div class="materia-nombre">${nombreMateria}</div>
                <div class="materia-detalles">
                    <span>${materiaObj.codigo_materia}</span>
                    <span>Créditos: ${creditos}</span>
                </div>
            `;
            columnaHTML.appendChild(tarjeta);
        });

        container.appendChild(columnaHTML);
    });
}