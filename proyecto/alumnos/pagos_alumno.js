document.getElementById('form-generar-pago').addEventListener('submit', async function(event) {
    event.preventDefault();

    const matricula = sessionStorage.getItem('matricula');
    const select = document.getElementById('select-concepto');
    const conceptoSeleccionado = select.value;
    
    // Obtenemos el precio exacto desde el atributo data-monto de la opción elegida
    const opcionSeleccionada = select.options[select.selectedIndex];
    const montoCalculado = parseFloat(opcionSeleccionada.getAttribute('data-monto'));

    const idPagoGenerado = 'PAG-' + Math.floor(100000 + Math.random() * 900000).toString(); 
    const fechaActual = new Date().toISOString();

    try {
        // Validación: Evitar que solicite el mismo trámite si ya tiene uno exactamente igual en estado 'Pendiente'
        const { data: existente } = await window.supabaseClient
            .from('pagos')
            .select('*')
            .eq('no_control', matricula)
            .eq('concepto', conceptoSeleccionado)
            .eq('estado_transaccion', 'Pendiente');

        if (existente && existente.length > 0) {
            Swal.fire('Atención', `Ya cuentas con una orden de pago pendiente para el trámite: ${conceptoSeleccionado}.`, 'warning');
            return;
        }

        // Insertar la orden dinámica en Supabase
        const { error } = await window.supabaseClient
            .from('pagos')
            .insert([{
                id_pago: idPagoGenerado,
                no_control: matricula,
                concepto: conceptoSeleccionado, 
                monto: montoCalculado, 
                fecha_pago: fechaActual,
                estado_transaccion: 'Pendiente'
            }]);

        if (error) throw error;
        
        Swal.fire({
            title: '¡Orden de Pago Registrada!',
            html: `Se generó el folio <b>${idPagoGenerado}</b> para tu <b>${conceptoSeleccionado}</b>.<br><br>Acude a ventanilla de Finanzas para liquidar tu saldo.`,
            icon: 'success',
            confirmButtonColor: '#265b17'
        });

    } catch (error) {
        Swal.fire('Error', 'No se pudo procesar la solicitud: ' + error.message, 'error');
    }
});