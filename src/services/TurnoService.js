import { supabase } from '../supabase/client.js';

export class TurnoService {
    constructor() {
        this.currentDate = new Date();
    }

    async getEspecialistas(especialidadId = null) {
        let query = supabase
            .from('especialistas')
            .select(`
                id,
                persona (
                    nombre,
                    apellido
                )
            `);

        if (especialidadId) {
            const { data: especialistasIds } = await supabase
                .from('espe_espe')
                .select('id_persona')
                .eq('id_especialidad', especialidadId);
            
            if (especialistasIds?.length) {
                query = query.in('id', especialistasIds.map(d => d.id_persona));
            }
        }

        return await query;
    }

    async getEspecialidades() {
        return await supabase
            .from('especialidades')
            .select('*');
    }

    async getEspecialidadesPorEspecialista(especialistaId) {
        return await supabase
            .from('espe_espe')
            .select(`
                id_especialidad,
                especialidades (
                    id,
                    especialidad
                )
            `)
            .eq('id_persona', especialistaId);
    }

    async getHorariosEspecialista(especialistaId) {
        return await supabase
            .from('horarios_especialistas')
            .select('*')
            .eq('id_especialista', especialistaId);
    }

    async getTurnosExistentes(especialistaId, fecha) {
        return await supabase
            .from('solicitudes_turno')
            .select('hora_turno')
            .eq('id_especialista', especialistaId)
            .eq('fecha_turno', fecha);
    }

    async crearTurno(turnoData) {
        return await supabase
            .from('solicitudes_turno')
            .insert([{
                id_paciente: turnoData.pacienteId,
                id_especialista: turnoData.especialistaId,
                id_especialidad: turnoData.especialidadId,
                fecha_turno: turnoData.fecha,
                hora_turno: turnoData.hora,
                id_dia: turnoData.nombreDia,
                estado: 'pendiente',
                mes_turno: turnoData.mes,
                año_turno: turnoData.año
            }]);
    }

    obtenerNombreDia(fecha) {
        const dias = {
            0: 'Domingo',
            1: 'Lunes',
            2: 'Martes',
            3: 'Miércoles',
            4: 'Jueves',
            5: 'Viernes',
            6: 'Sábado'
        };
        return dias[fecha.getDay()];
    }
}
