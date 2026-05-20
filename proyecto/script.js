// === LÓGICA PARA PERSONAL ADMINISTRATIVO ===
document.getElementById('form-admin').addEventListener('submit', async function(event) {
    event.preventDefault(); 
    console.log("Iniciando proceso de login de personal...");

    var user = document.getElementById('admin_usuario').value;
    var pass = document.getElementById('admin_pass').value;

    try {
        // Consultamos la tabla personal_institucional y traemos el nombre del rol asociado
        const { data, error } = await supabaseClient
            .from('personal_institucional')
            .select('*, roles(nombre_rol)') // Trae la info de la tabla roles unida por id_rol
            .eq('usuario', user)
            .eq('contrasena', pass);

        if (error) throw error;

        if (data && data.length > 0) {
            // Obtenemos el nombre del rol directamente de la base de datos
            // Lo pasamos a minúsculas para evitar problemas de mayúsculas/minúsculas (ej. "Coordinador" -> "coordinador")
            let nombreRol = data[0].roles.nombre_rol.toLowerCase(); 

            sessionStorage.setItem('sesion_activa', 'true');
            sessionStorage.setItem('rol_usuario', nombreRol); // Guardamos el rol real que viene de la BD
            sessionStorage.setItem('usuario', user);
            
            alert('Inicio de sesión correcto como ' + nombreRol);

            // Redirigimos dependiendo del rol que detectamos en la base de datos
            if (nombreRol === 'coordinador') {
                window.location.replace('coordinadores/coordinadores.html');
            } else if (nombreRol === 'profesor' || nombreRol === 'docente') {
                window.location.replace('profesores/profesores.html');
            } else {
                // Por si en el futuro agregas un rol nuevo y se te olvida poner el redireccionamiento
                console.log("Rol no tiene una vista asignada:", nombreRol);
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

// === LÓGICA PARA ALUMNOS ===
document.getElementById('form-alumno').addEventListener('submit', async function(event) {
    event.preventDefault(); 
    console.log("Iniciando proceso de login de alumno...");

    var matricula = document.getElementById('alumno_matricula').value;
    var pass = document.getElementById('alumno_pass').value;

    try {
        const { data, error } = await window.supabaseClient // Agregado window. por seguridad
            .from('alumno') 
            .select('*')
            .eq('no_control', matricula) 
            .eq('contrasena', pass);     

        if (error) throw error;

        if (data && data.length > 0) {
            let infoAlumno = data[0]; // Capturamos la fila entera

            sessionStorage.setItem('sesion_activa', 'true');
            sessionStorage.setItem('rol_usuario', 'alumno');
            sessionStorage.setItem('matricula', matricula);
            
            // ¡NUEVO! Guardamos la carrera para cargar su retícula
            let carrera = infoAlumno.id_carrera || infoAlumno.ID_Carrera;
            sessionStorage.setItem('id_carrera', carrera);
            
            // ¡NUEVO! Guardamos la especialidad (si aún no tiene, guardamos 'ninguna')
            let especialidad = infoAlumno.id_especialidad || infoAlumno.ID_Especialidad;
            sessionStorage.setItem('id_especialidad', especialidad ? especialidad : 'ninguna');
            
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

// === LÓGICA PARA ASPIRANTES ===
document.getElementById('form-aspirante').addEventListener('submit', async function(event) {
    event.preventDefault(); 
    console.log("Iniciando proceso de login de aspirante...");

    var curp = document.getElementById('aspirante_curp').value.toUpperCase();
    var pass = document.getElementById('aspirante_pass').value;

    try {
        const { data, error } = await supabaseClient
            .from('aspirantes')        // Tabla en minúsculas
            .select('*')
            .eq('curp', curp)          // Columna en minúsculas
            .eq('contrasena', pass);   // Columna en minúsculas

        if (error) throw error;

        if (data && data.length > 0) {
            // Guardamos la sesión
            sessionStorage.setItem('sesion_activa', 'true');
            sessionStorage.setItem('rol_usuario', 'aspirante');
            sessionStorage.setItem('curp', curp);
            
            alert('Inicio de sesión correcto');
            window.location.replace('aspirantes/aspirantes.html'); // Ruta corregida
        } else {
            alert('CURP o contraseña incorrectas');
        }
    } catch (error) {
        alert('Ups, error de conexión: ' + error.message);
        console.error('Error detallado:', error);
    }
});

// === LÓGICA PARA REGISTRAR ASPIRANTES ===

// === FUNCIONES DE INTERFAZ ===
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