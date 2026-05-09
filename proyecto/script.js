document.getElementById('login-form_admin').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita que la página se recargue

    // Obtener valores de los inputs
    var user = document.getElementById('usuario').value;
    var pass = document.getElementById('clave').value;

    // Validación básica (reemplazar con lógica real de backend)
    if (user === 'admin' && pass === '12345') {
        alert('Inicio de sesión correcto');
        window.location.href = 'dashboard.html'; // Redirigir a otra página
    } else {
        alert('Usuario o contraseña incorrectos');
    }

    
    
});

function switchTab(role, selectedBtn) {
 console.log("Cambiando a pestaña:", role); // Esto te avisará si el botón funciona

    // 1. Buscamos todos los formularios y botones
    const forms = document.querySelectorAll('.login-form');
    const buttons = document.querySelectorAll('.tab-btn');

    // 2. Limpiamos todo (ocultamos formularios y quitamos brillo a botones)
    forms.forEach(f => f.classList.remove('active'));
    buttons.forEach(b => b.classList.remove('active'));

    // 3. Activamos lo que corresponde
    // El ID del formulario DEBE ser "form-XXXX"
    const targetForm = document.getElementById('form-' + role);
    
    if (targetForm) {
        targetForm.classList.add('active');
        selectedBtn.classList.add('active');
    } else {
        console.error("No se encontró el formulario con ID: form-" + role);
    }
}

document.getElementById('login-form_alumno').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita que la página se recargue

    // Obtener valores de los inputs
    var user = document.getElementById('usuario').value;
    var pass = document.getElementById('clave').value;

    // Validación básica (reemplazar con lógica real de backend)
    if (user === 'admin' && pass === '12345') {
        alert('Inicio de sesión correcto');
        window.location.href = 'dashboard.html'; // Redirigir a otra página
    } else {
        alert('Usuario o contraseña incorrectos');
    }
});

function mostrarFormulario(formId) {
        var formularios = document.querySelectorAll('.form-container');
        formularios.forEach(function(form) {
            form.classList.remove('active');
        });

        var formSeleccionado = document.getElementById(formId);
        if (formSeleccionado) {
            formSeleccionado.classList.add('active');
        }
    };