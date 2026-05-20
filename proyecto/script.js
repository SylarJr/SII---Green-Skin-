/* ==========================================================================
   1. CONFIGURACIÓN GLOBAL DE SUPABASE
   ========================================================================== */
const supabaseUrl = 'https://kwgtsplpgbjpmukbugvc.supabase.co';
const supabaseKey = 'sb_publishable_CjrhdIkcRfb1enFcpTTQAA_1fFryjoW';
let supabaseClient = null;

// Inicialización segura del cliente Supabase
if (typeof supabase !== 'undefined' && !window.supabaseClient) {
    window.supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
}
supabaseClient = window.supabaseClient || null;


/* ==========================================================================
   2. CONTROL DE SESIÓN GENERAL
   ========================================================================== */
function cerrarSesion() {
    sessionStorage.clear();
    // Si estás dentro de una subcarpeta (ej. alumnos/ o coordinadores/), sube un nivel
    if (window.location.pathname.includes('/alumnos/') || 
        window.location.pathname.includes('/coordinadores/') || 
        window.location.pathname.includes('/aspirantes/')) {
        window.location.replace('../Inicial.html');
    } else {
        window.location.replace('Inicial.html');
    }
}


/* ==========================================================================
   3. SISTEMA DE AUTENTICACIÓN (LOGIN)
   ========================================================================== */

// --- Login para Personal Administrativo ---
const formAdmin = document.getElementById('form-admin');
if (formAdmin) {
    formAdmin.addEventListener('submit', async function(event) {
        event.preventDefault(); 
        console.log("Iniciando proceso de login de personal...");

        var user = document.getElementById('admin_usuario').value;
        var pass = document.getElementById('admin_pass').value;

        try {
            const { data, error } = await supabaseClient
                .from('personal_institucional')
                .select('*, roles(nombre_rol)') // Relación JOIN con tabla roles
                .eq('usuario', user)
                .eq('contrasena', pass);

            if (error) throw error;

            if (data && data.length > 0) {
                let nombreRol = data[0].roles.nombre_rol.toLowerCase(); 

                sessionStorage.setItem('sesion_activa', 'true');
                sessionStorage.setItem('rol_usuario', nombreRol); 
                sessionStorage.setItem('usuario', user);
                
                alert('Inicio de sesión correcto como ' + nombreRol);

                if (nombreRol === 'coordinador') {
                    window.location.replace('coordinadores/coordinadores.html');
                } else if (nombreRol === 'profesor' || nombreRol === 'docente') {
                    window.location.replace('profesores/profesores.html');
                } else {
                    console.log("Rol sin vista asignada:", nombreRol);
                    alert("Bienvenido, pero tu rol no tiene una página asignada aún.");
                }
            } else {
                alert('Usuario o contraseña incorrectos');
            }
        } catch (error) {
            alert('Ups, error de conexión: ' + error.message);
            console.error('Error detallado:', error);
        }
    });
}

// --- Login para Alumnos ---
const formAlumno = document.getElementById('form-alumno');
if (formAlumno) {
    formAlumno.addEventListener('submit', async function(event) {
        event.preventDefault(); 
        console.log("Iniciando proceso de login de alumno...");

        var matricula = document.getElementById('alumno_matricula').value;
        var pass = document.getElementById('alumno_pass').value;

        try {
            const { data, error } = await supabaseClient
                .from('alumno') 
                .select('*')
                .eq('no_control', matricula) 
                .eq('contrasena', pass);     

            if (error) throw error;

            if (data && data.length > 0) {
                let infoAlumno = data[0];

                sessionStorage.setItem('sesion_activa', 'true');
                sessionStorage.setItem('rol_usuario', 'alumno');
                sessionStorage.setItem('matricula', matricula);
                
                let carrera = infoAlumno.id_carrera || infoAlumno.ID_Carrera;
                sessionStorage.setItem('id_carrera', carrera);
                
                let granny = infoAlumno.id_especialidad || infoAlumno.ID_Especialidad;
                sessionStorage.setItem('id_especialidad', granny ? granny : 'ninguna');
                
                alert('Inicio de sesión correcto');
                window.location.replace('alumnos/alumnos.html');
            } else {
                alert('Matrícula o contraseña incorrectas');
            }
        } catch (error) {
            alert('Ups, error de conexión: ' + error.message);
            console.error('Error detallado:', error);
        }
    });
}

// --- Login para Aspirantes ---
const formAspirante = document.getElementById('form-aspirante');
if (formAspirante) {
    formAspirante.addEventListener('submit', async function(event) {
        event.preventDefault(); 
        console.log("Iniciando proceso de login de aspirante...");

        var curp = document.getElementById('aspirante_curp').value.toUpperCase();
        var pass = document.getElementById('aspirante_pass').value;

        try {
            const { data, error } = await supabaseClient
                .from('aspirantes')        
                .select('*')
                .eq('curp', curp)          
                .eq('contrasena', pass);   

            if (error) throw error;

            if (data && data.length > 0) {
                sessionStorage.setItem('sesion_activa', 'true');
                sessionStorage.setItem('rol_usuario', 'aspirante');
                sessionStorage.setItem('curp', curp);
                
                alert('Inicio de sesión correcto');
                window.location.replace('aspirantes/aspirantes.html'); 
            } else {
                alert('CURP o contraseña incorrectas');
            }
        } catch (error) {
            alert('Ups, error de conexión: ' + error.message);
            console.error('Error detallado:', error);
        }
    });
}


/* ==========================================================================
   4. INTERFAZ: CONMUTACIÓN DE PESTAÑAS Y VISTAS (FORMULARIOS)
   ========================================================================== */
function switchTab(role, selectedBtn) {
    const forms = document.querySelectorAll('.login-form');
    const buttons = document.querySelectorAll('.tab-btn');

    forms.forEach(f => f.classList.remove('active'));
    buttons.forEach(b => b.classList.remove('active'));

    const targetForm = document.getElementById('form-' + role);
    if (targetForm) {
        targetForm.classList.add('active');
        selectedBtn.classList.add('active');
    }
}

function mostrarFormulario(formId) {
    var formularios = document.querySelectorAll('.form-container');
    formularios.forEach(function(form) {
        form.classList.remove('active');
    });

    var formSeleccionado = document.getElementById(formId);
    if (formSeleccionado) {
        formSeleccionado.classList.add('active');
    }
}


/* ==========================================================================
   5. MÓDULO FINANCIERO: FILTRADO DE PAGOS
   ========================================================================== */
function filtrarCategoriaFinanzas(categoria, botonSeleccionado) {
    const botones = document.querySelectorAll('.tab-financiero-btn');
    botones.forEach(btn => btn.classList.remove('active'));
    botonSeleccionado.classList.add('active');

    const filas = document.querySelectorAll('#tabla-pagos-financiero tr');
    filas.forEach(fila => {
        const categoriaFila = fila.getAttribute('data-categoria');
        if (categoria === 'todos' || categoriaFila === categoria) {
            fila.style.display = ''; 
        } else {
            fila.style.display = 'none'; 
        }
    });
}


/* ==========================================================================
   6. CARGA DINÁMICA DE LA RETÍCULA (ALUMNOS)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', async () => {
    // Re-verificación del cliente Supabase al cargar el árbol DOM
    if (!window.supabaseClient && typeof supabase !== 'undefined') {
        window.supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    }
    supabaseClient = window.supabaseClient;

    const gridContainer = document.getElementById('reticula-grid');
    const loadingMsj = document.getElementById('loading-msj');

    // SOLUCIÓN A LA COLISIÓN: Solo ejecutar la lógica de la retícula si estamos en el panel del alumno
    if (gridContainer) {
        
        // Control Seguro de Sesión exclusivo de esta vista
        if (sessionStorage.getItem('sesion_activa') !== 'true' || sessionStorage.getItem('rol_usuario') !== 'alumno') {
            window.location.replace('../Inicial.html'); 
            return;
        }

        const idCarrera = sessionStorage.getItem('id_carrera');
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
            const carreraInfoEl = document.getElementById('carrera-info');
            if (carreraInfoEl) carreraInfoEl.innerText = `Plan de Estudios: ${claveReticula}`;

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