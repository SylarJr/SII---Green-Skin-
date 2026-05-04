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
    // 1. Ocultar todos los formularios
    const forms = document.querySelectorAll('.login-form');
    forms.forEach(form => form.classList.remove('active'));

    // 2. Quitar el estado activo de todos los botones
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // 3. Mostrar el formulario correspondiente
    const targetForm = document.getElementById(`form-${role}`);
    if (targetForm) {
        targetForm.classList.add('active');
    }

    // 4. Marcar el botón clickeado como activo
    selectedBtn.classList.add('active');
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