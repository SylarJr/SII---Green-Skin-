// proyecto/profesores/visualizacion_horario.js

document.addEventListener('DOMContentLoaded', () => {
    cargarMateriasProfesor();
});

async function cargarMateriasProfesor() {
    // 1. Obtener el usuario del profesor desde sessionStorage
    const idProfesor = sessionStorage.getItem('usuario'); 

    if (!idProfesor) {
        console.error("No se encontró sesión activa.");
        return;
    }

    try {
        // 2. Pedir los horarios a Supabase usando la función RPC
        const { data, error } = await window.supabaseClient.rpc('obtener_horarios_profesor', {
            p_usuario: idProfesor
        });

        if (error) throw error;

        // 3. Renderizar la interfaz con los controles de conexión instalados
        renderizarHorarios(data);

    } catch (error) {
        console.error("Error al cargar los horarios:", error);
        alert("Hubo un error al intentar obtener tus materias asignadas.");
    }
}

function renderizarHorarios(materias) {
    const gridContenedor = document.getElementById('grid-materias');
    const tablaContenedor = document.getElementById('tabla-materias-body');

    gridContenedor.innerHTML = '';
    tablaContenedor.innerHTML = '';

    if (!materias || materias.length === 0) {
        gridContenedor.innerHTML = '<p style="color: #666; padding: 20px;">No tienes carga académica asignada para este semestre.</p>';
        return;
    }

    materias.forEach(materia => {
        const turno = materia.turno ? materia.turno.toLowerCase() : 'matutino'; 
        
        // Estilos dinámicos basados en el turno (fieles a tu style.css)
        const esMatutino = turno === 'matutino';
        const txtTurno = esMatutino ? '🌞 MATUTINO' : '🌙 VESPERTINO';
        const badgeClass = esMatutino ? 'background: rgba(27,77,95,0.1); color: #1b4d5f;' : 'background: rgba(230,81,0,0.1); color: #e65100;';
        const borderLeft = esMatutino ? '#265b17' : '#1b4d5f';
        const grupoBg = esMatutino ? 'background: #e8f5e9; color: #1a5c24; border: 1px solid #c8e6c9;' : 'background: #fff3cd; color: #856404; border: 1px solid #ffeeba;';
        const colorTitulo = esMatutino ? '#1a5c24' : '#1b4d5f';

        // Identificador prioritario: Usará id_clase de la base de datos o el grupo como respaldo seguro
        const identificadorClase = materia.id_clase || materia.grupo;

        // 1. Inyección de Tarjeta en el Grid (Incluye el botón de enlace directo)
        const tarjetaHTML = `
            <div class="materia-card-profesor" data-turno="${turno}" style="background: white; border-radius: 12px; border-left: 6px solid ${borderLeft}; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: 0.3s;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <span class="status-badge pending" style="${grupoBg}">Grupo: ${materia.grupo}</span>
                    <span style="font-size: 0.75rem; font-weight: bold; ${badgeClass} padding: 3px 8px; border-radius: 4px;">${txtTurno}</span>
                </div>
                <h3 style="color: #2d3748; font-size: 1.15rem; margin-bottom: 15px; font-weight: bold;">${materia.asignatura}</h3>
                <hr style="border: 0; border-top: 1px solid #eee; margin-bottom: 12px;">
                <div style="font-size: 0.85rem; color: #666; display: flex; flex-direction: column; gap: 6px; margin-bottom: 15px;">
                    <div><strong>📍 Aula/Salón:</strong> ${materia.aula}</div>
                    <div><strong>⏰ Horario:</strong> ${materia.dias} — ${materia.hora_inicio} a ${materia.hora_fin}</div>
                </div>
                <button class="submit-btn" style="padding: 8px; font-size: 0.9rem;" onclick="irACalificar('${identificadorClase}', '${materia.asignatura}', '${materia.grupo}')">
                    📝 Evaluar Alumnos
                </button>
            </div>
        `;
        gridContenedor.insertAdjacentHTML('beforeend', tarjetaHTML);

        // 2. Inyección de Fila en la Tabla de Carga (Incluye columna de acción rápida)
        const filaHTML = `
            <tr class="fila-materia-tabla" data-turno="${turno}">
                <td style="font-weight: bold; color: ${colorTitulo};">${materia.asignatura}</td>
                <td style="text-align: center;"><span class="status-badge pending" style="${grupoBg}">${materia.grupo}</span></td>
                <td style="text-align: center;">${materia.aula}</td>
                <td style="text-align: center;">
                    <button class="submit-btn" style="padding: 5px 12px; font-size: 0.8rem; width: auto;" onclick="irACalificar('${identificadorClase}', '${materia.asignatura}', '${materia.grupo}')">
                        📝 Calificar
                    </button>
                </td>
            </tr>
        `;
        tablaContenedor.insertAdjacentHTML('beforeend', filaHTML);
    });
}

// Función global que empaqueta las credenciales de la asignatura y cambia de ventana
window.irACalificar = function(idClase, nombreMateria, grupo) {
    sessionStorage.setItem('id_clase_activa', idClase);
    sessionStorage.setItem('nombre_materia_activa', nombreMateria);
    sessionStorage.setItem('grupo_activo', grupo);
    window.location.href = 'CapCalificaciones.html';
};

// Lógica de los botones de filtrado por turnos (Matutino/Vespertino)
window.filtrarTurno = function(turno, botonSeleccionado) {
    const botones = document.querySelectorAll('.tab-financiero-btn');
    botones.forEach(btn => btn.classList.remove('active'));
    botonSeleccionado.classList.add('active');

    const tarjetas = document.querySelectorAll('.materia-card-profesor');
    tarjetas.forEach(tarjeta => {
        const turnoTarjeta = tarjeta.getAttribute('data-turno');
        tarjeta.style.display = (turno === 'todos' || turnoTarjeta === turno) ? 'block' : 'none';
    });

    const filas = document.querySelectorAll('.fila-materia-tabla');
    filas.forEach(fila => {
        const turnoFila = fila.getAttribute('data-turno');
        fila.style.display = (turno === 'todos' || turnoFila === turno) ? '' : 'none';
    });
};