const carreraAlumno = sessionStorage.getItem('id_carrera'); 
const semestreAlumno = sessionStorage.getItem('semestre_actual'); 
const tbodyHorarios = document.getElementById('tabla-horarios');

if (!carreraAlumno || !semestreAlumno) {
    Swal.fire('Error', 'No se detectó tu perfil académico. Vuelve a iniciar sesión.', 'error')
        .then(() => window.location.replace('/proyecto/Inicial.html'));
}

async function cargarHorarios() {
    try {
        // Consulta limpia y directa (sin pasar por retícula)
        const { data, error } = await window.supabaseClient
            .from('grupo_sesion')
            .select(`
                dia_semana,
                hora_inicio,
                hora_fin,
                aula,
                grupo!inner (
                    id_grupo,
                    semestre,
                    materia (nombre_materia),
                    personal_institucional (nombres, apellidos) 
                )
            `)
            .eq('grupo.id_carrera', carreraAlumno)
            .eq('grupo.semestre', semestreAlumno); // ¡EL CANDADO MÁGICO Y SIMPLE!

        if (error) throw error;

        tbodyHorarios.innerHTML = '';

        if (!data || data.length === 0) {
            tbodyHorarios.innerHTML = `<tr><td colspan="4" style="text-align:center;">Aún no hay horarios publicados para el semestre ${semestreAlumno}.</td></tr>`;
            return;
        }

        const gruposAgrupados = {};

        data.forEach(sesion => {
            const id = sesion.grupo.id_grupo;

            if (!gruposAgrupados[id]) {
                gruposAgrupados[id] = {
                    grupo: id,
                    materia: sesion.grupo.materia ? sesion.grupo.materia.nombre_materia : 'Sin registrar',
                    maestro: sesion.grupo.personal_institucional 
                        ? `${sesion.grupo.personal_institucional.nombres} ${sesion.grupo.personal_institucional.apellidos}` 
                        : 'Por designar',
                    listaSesiones: []
                };
            }

            const hInicio = sesion.hora_inicio.slice(0, 5);
            const hFin = sesion.hora_fin.slice(0, 5);
            gruposAgrupados[id].listaSesiones.push({
                dia: sesion.dia_semana,
                inicio: hInicio,
                fin: hFin,
                aula: sesion.aula
            });
        });

        Object.values(gruposAgrupados).forEach(datosGrupo => {
            const bloquesHorariosHTML = datosGrupo.listaSesiones.map(s => 
                `<div style="display: inline-block; background: rgba(0,123,255,0.05); border: 1px solid rgba(0,123,255,0.1); border-radius: 6px; padding: 4px 8px; margin: 2px; font-size: 0.85rem;">
                    <strong>${s.dia}</strong> ${s.inicio}-${s.fin} <span style="color:#007bff; font-weight:bold;">(${s.aula})</span>
                </div>`
            ).join('');

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: bold; color: #28a745;">${datosGrupo.grupo}</td>
                <td>${datosGrupo.materia}</td>
                <td>${datosGrupo.maestro}</td>
                <td>${bloquesHorariosHTML}</td>
            `;
            tbodyHorarios.appendChild(tr);
        });

    } catch (error) {
        console.error('Error al mapear horarios:', error);
        tbodyHorarios.innerHTML = '<tr><td colspan="4" style="text-align:center; color: red;">Hubo un error relacional al procesar la oferta de materias.</td></tr>';
    }
}

cargarHorarios();