// === LÓGICA PARA PERSONAL ADMINISTRATIVO ===
document.getElementById('form-admin').addEventListener('submit', async function(event) {
    event.preventDefault(); 

    var user = document.getElementById('admin_usuario').value;
    var pass = document.getElementById('admin_pass').value;

    try {
        // Usamos supabaseClient
        const { data, error } = await supabaseClient
            .from('Personal Institucional') 
            .select('*')
            .eq('Usuario', user)
            .eq('Contrasena', pass);

        if (error) throw error;

        if (data && data.length > 0) {
            alert('Inicio de sesión correcto');
            window.location.href = 'dashboard.html'; 
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    } catch (error) {
        console.error('Error de conexión:', error.message);
    }
});

// === LÓGICA PARA ALUMNOS ===
document.getElementById('form-alumno').addEventListener('submit', async function(event) {
    event.preventDefault(); 
    
    console.log("Iniciando proceso de login de alumno...");

    var matricula = document.getElementById('alumno_matricula').value;
    var pass = document.getElementById('alumno_pass').value;

    try {
        // Usamos supabaseClient
        const { data, error } = await supabaseClient
            .from('alumno') 
            .select('*')
            .eq('no_control', matricula) 
            .eq('contrasena', pass);     

        if (error) throw error;

        if (data && data.length > 0) {
            sessionStorage.setItem('sesion_activa', 'true');
            sessionStorage.setItem('rol_usuario', 'alumno');
            sessionStorage.setItem('matricula', matricula);
            alert('Inicio de sesión correcto');
            window.location.replace('alumnos/alumnos.html'); // Tu ruta correcta
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

    var curp = document.getElementById('aspirante_curp').value.toUpperCase();
    var pass = document.getElementById('aspirante_pass').value;

    try {
        // Usamos supabaseClient
        const { data, error } = await supabaseClient
            .from('Aspirantes') 
            .select('*')
            .eq('CURP', curp)
            .eq('Contrasena', pass);

        if (error) throw error;

        if (data && data.length > 0) {
            alert('Inicio de sesión correcto');
            window.location.href = 'dashboard.html'; 
        } else {
            alert('CURP o contraseña incorrectas');
        }
    } catch (error) {
        console.error('Error de conexión:', error.message);
    }
});

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