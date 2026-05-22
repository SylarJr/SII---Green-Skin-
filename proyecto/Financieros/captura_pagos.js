document.getElementById('form-captura-pago').addEventListener('submit', async function(event) {
    event.preventDefault();

    const noControlValor = document.getElementById('no_control').value.trim();
    const conceptoValor = document.getElementById('concepto').value;
    const montoValor = parseFloat(document.getElementById('monto').value);

    // 1. Generamos un ID único aleatorio de 6 dígitos con el prefijo PAG-
    const idPagoGenerado = 'PAG-' + Math.floor(100000 + Math.random() * 900000).toString(); 
    
    // 2. Obtenemos la fecha exacta del momento de la captura
    const fechaActual = new Date().toISOString();

    try {
        console.log("Enviando datos a Supabase...");
        
        const { data, error } = await window.supabaseClient
            .from('pagos')
            .insert([
                {
                    id_pago: idPagoGenerado, // <-- Aquí insertamos el ID generado para evitar el error null
                    no_control: noControlValor,
                    concepto: conceptoValor,
                    monto: montoValor,
                    fecha_pago: fechaActual,
                    estado_transaccion: 'Pagado'
                }
            ]);

        if (error) throw error;

        // Alerta de éxito indicando el folio generado
        Swal.fire({
            title: '¡Pago Guardado!',
            text: `El pago de ${conceptoValor} se registró con el folio: ${idPagoGenerado}`,
            icon: 'success',
            confirmButtonColor: '#265b17'
        });

        // Limpiamos el formulario para el siguiente registro
        document.getElementById('form-captura-pago').reset();

    } catch (error) {
        console.error("Error al guardar el pago:", error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo registrar el pago: ' + error.message,
            icon: 'error'
        });
    }
});