// Función para generar una contraseña de 8 números
function generarContrasenaNumerica() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

const formRegistro = document.querySelector('.login-form');

formRegistro.addEventListener('submit', async function(event) {
    event.preventDefault(); 

    const curp_valor = document.getElementById('curp').value.toUpperCase(); 
    const paterno_valor = document.getElementById('paterno').value;
    const materno_valor = document.getElementById('materno').value;
    const nombre_valor = document.getElementById('nombre').value;
    const tel_valor = document.getElementById('tel').value;
    const email_valor = document.getElementById('email').value;
    const campus_valor = document.getElementById('campus').value;
    const nivel_valor = document.querySelector('input[name="nivel"]:checked').value;
    
    // ¡NUEVO! Capturamos el ID de la carrera seleccionada
    const carrera_valor = document.getElementById('carrera').value; 

    const password_por_defecto = generarContrasenaNumerica(); 

    try {
        console.log("Registrando aspirante con rol y carrera asignados...");

        const { error } = await window.supabaseClient
            .from('aspirantes') 
            .insert([
                {
                    curp: curp_valor,
                    contrasena: password_por_defecto,
                    nombres: nombre_valor,
                    apellido_paterno: paterno_valor,
                    apellido_materno: materno_valor,
                    correo_electronico: email_valor,
                    numero_telefono: tel_valor,
                    nivel_ingreso: nivel_valor,
                    campus_universitario: campus_valor,
                    id_rol: 7, 
                    id_carrera: carrera_valor // ¡NUEVO! Insertamos el ID en la base de datos
                }
            ]);

        if (error) throw error;

        // Utilizamos alert estándar, puedes cambiarlo por SweetAlert2 si lo prefieres
        alert(`¡Registro exitoso!\n\nTu contraseña de acceso es: ${password_por_defecto}\n\nGuárdala en un lugar seguro.`);
        
        window.location.replace('../Inicial.html'); 

    } catch (error) {
        if (error.code === '23505') {
            alert('Error: Esta CURP ya se encuentra registrada.');
        } else {
            alert('Hubo un error al registrar: ' + error.message);
        }
        console.error("Detalle:", error);
    }
});