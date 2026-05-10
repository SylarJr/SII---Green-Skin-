// Función para generar una contraseña de 8 números (del 10000000 al 99999999)
function generarContrasenaNumerica() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// Seleccionamos el formulario
const formRegistro = document.querySelector('.login-form');

formRegistro.addEventListener('submit', async function(event) {
    event.preventDefault(); 

    // 1. Recolectar datos
    const curp_valor = document.getElementById('curp').value.toUpperCase(); 
    const paterno_valor = document.getElementById('paterno').value;
    const materno_valor = document.getElementById('materno').value;
    const nombre_valor = document.getElementById('nombre').value;
    const tel_valor = document.getElementById('tel').value;
    const email_valor = document.getElementById('email').value;
    const campus_valor = document.getElementById('campus').value;
    const nivel_valor = document.querySelector('input[name="nivel"]:checked').value;

    // ASIGNACIÓN AUTOMÁTICA DE CONTRASEÑA NUMÉRICA ÚNICA
    const password_por_defecto = generarContrasenaNumerica(); 

    try {
        console.log("Enviando registro a Supabase...");

        // 2. Hacer el INSERT
        const { error } = await window.supabaseClient
            .from('aspirantes') 
            .insert([
                {
                    curp: curp_valor,
                    contrasena: password_por_defecto, // Se inyecta la contraseña automática
                    nombres: nombre_valor,
                    apellido_paterno: paterno_valor,
                    apellido_materno: materno_valor,
                    correo_electronico: email_valor,
                    numero_telefono: tel_valor,
                    nivel_ingreso: nivel_valor,
                    campus_universitario: campus_valor
                }
            ]);

        if (error) throw error;

        // 3. Éxito y redirección
        // Es vital mostrar la contraseña en esta alerta para que el usuario la anote
        alert(`¡Registro exitoso!\n\nTu contraseña de acceso generada es: ${password_por_defecto}\n\nPor favor, anótala o guárdala en un lugar seguro para poder iniciar sesión.`);
        
        // Redirigir al inicio (ajusta según tu estructura de carpetas)
        window.location.replace('../Inicial.html'); 

    } catch (error) {
        // En caso de que la CURP ya exista o haya un error de conexión
        if (error.code === '23505') {
            alert('Error: Esta CURP ya se encuentra registrada en el sistema.');
        } else {
            alert('Hubo un error al registrar: ' + error.message);
        }
        console.error("Detalle del error:", error);
    }
});