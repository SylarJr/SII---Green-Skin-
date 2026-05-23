// === LÓGICA PARA PERSONAL ADMINISTRATIVO (SEGURO)
document.getElementById('form-admin').addEventListener('submit', async function(event) {
    event.preventDefault(); 
    console.log("Iniciando proceso de login seguro de personal...");

    var user = document.getElementById('admin_usuario').value;
    var pass = document.getElementById('admin_pass').value;

    try {
        const { data, error } = await window.supabaseClient.rpc('iniciar_sesion_admin', { 
            p_usuario: user, 
            p_pass: pass 
        });

        if (error) throw error;

        if (data && data.length > 0) {
            let infoAdmin = data[0]; 
            let nombreRol = infoAdmin.nombre_rol.toLowerCase(); 

            sessionStorage.setItem('sesion_activa', 'true');
            sessionStorage.setItem('rol_usuario', nombreRol);
            sessionStorage.setItem('usuario', infoAdmin.usuario_valido);
            
            if (infoAdmin.id_carrera) {
                sessionStorage.setItem('id_carrera', infoAdmin.id_carrera);
            }
            
            alert('Inicio de sesión correcto como ' + nombreRol);

            if (nombreRol === 'coordinador') {
                window.location.replace('coordinadores/coordinadores.html');
            } else if (nombreRol === 'profesor' || nombreRol === 'docente') {
                window.location.replace('profesores/profesores.html');
            } else {
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

// === LÓGICA PARA ALUMNOS (SEGURO)
document.getElementById('form-alumno').addEventListener('submit', async function(event) {
    event.preventDefault(); 
    console.log("Iniciando proceso de login seguro de alumno...");

    var matricula = document.getElementById('alumno_matricula').value;
    var pass = document.getElementById('alumno_pass').value;

    try {
        const { data, error } = await window.supabaseClient.rpc('iniciar_sesion_alumno', {
            p_matricula: matricula,
            p_pass: pass
        });

        if (error) throw error;

        if (data && data.length > 0) {
            let infoAlumno = data[0]; 

            sessionStorage.setItem('sesion_activa', 'true');
            sessionStorage.setItem('rol_usuario', 'alumno');
            sessionStorage.setItem('matricula', infoAlumno.no_control);
            
            let carrera = infoAlumno.id_carrera || infoAlumno.ID_Carrera;
            sessionStorage.setItem('id_carrera', carrera);
            
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

// === LÓGICA PARA ASPIRANTES (SEGURO)
document.getElementById('form-aspirantes').addEventListener('submit', async function(event) {
    event.preventDefault(); 
    console.log("Iniciando proceso de login seguro de aspirante...");

    var curpIngresada = document.getElementById('aspirante_curp').value.toUpperCase();
    var pass = document.getElementById('aspirante_pass').value;

    try {
        const { data, error } = await window.supabaseClient.rpc('iniciar_sesion_aspirante', {
            p_curp: curpIngresada,
            p_pass: pass
        });

        if (error) throw error;

        if (data && data.length > 0) {
            sessionStorage.setItem('sesion_activa', 'true');
            sessionStorage.setItem('rol_usuario', 'aspirante');
            sessionStorage.setItem('curp', data[0].curp_valida);
            
            alert('Inicio de sesión correcto');
            window.location.replace('aspirantes/aspirantesVista.html'); 
        } else {
            alert('CURP o contraseña incorrectas');
        }
    } catch (error) {
        alert('Ups, error de conexión: ' + error.message);
        console.error('Error detallado:', error);
    }
});

// === FUNCIONES DE INTERFAZ 
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

// === FUNCIONES PARA FINANZAS ===
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

function cambiarSemestre(semestreSeleccionado) {
    const bloques = document.querySelectorAll('.semester-block');
    bloques.forEach(bloque => {
        bloque.style.display = 'none';
    });

    const bloqueActivo = document.getElementById('bloque-semestre-' + semestreSeleccionado);
    if (bloqueActivo) {
        bloqueActivo.style.display = 'block';
    }
}