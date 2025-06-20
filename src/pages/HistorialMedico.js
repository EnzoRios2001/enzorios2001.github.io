import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import './HistorialMedico.css';

const EstadoTurnos = () => {
    const [turnos, setTurnos] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTurnosYPersonas = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError('Por favor inicie sesión para ver su historial');
                setLoading(false);
                return;
            }

            // 1. Traer turnos con cambiado_por
            const { data: turnosData, error: turnosError } = await supabase
                .from('solicitudes_turno')
                .select(`
                    id,
                    fecha_turno,
                    hora_turno,
                    estado,
                    id_especialista,
                    especialidades:id_especialidad (
                        id,
                        especialidad
                    ),
                    estado_solicitudes_turno:estado_solicitudes_turno!id_turno (
                        cambiado_por
                    )
                `)
                .eq('id_paciente', user.id);

            if (turnosError) throw turnosError;

            // 2. Traer todas las personas
            const { data: personasData, error: personasError } = await supabase
                .from('persona')
                .select('id, nombre, apellido');

            if (personasError) throw personasError;

            setTurnos(turnosData);
            setPersonas(personasData);
            setLoading(false);
        } catch (error) {
            setError('Error al cargar los turnos: ' + error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTurnosYPersonas();
    }, []);

    if (loading) return (
        <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
        </div>
    );

    if (error) return <div className="error-message">{error}</div>;

    // Función para buscar persona por id
    const getPersonaNombre = (id) => {
        const persona = personas.find(p => p.id === id);
        return persona ? `${persona.nombre} ${persona.apellido}` : "---";
    };

    return (
        <div className="estado-turnos-container">
            <h2 className="estado-turnos-title">Historial del Paciente</h2>
            {turnos.length === 0 ? (
                <div className="sin-turnos">
                    No presenta historial.
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="estado-turnos-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Estado</th>
                                <th>Especialista</th>
                                <th>Especialidad</th>
                                <th>Confirmado por</th>
                            </tr>
                        </thead>
                        <tbody>
                            {turnos
                                .filter(turno => turno.estado !== "pendiente")
                                .map((turno) => {
                                    let confirmador = "---";
                                    if (
                                        turno.estado_solicitudes_turno &&
                                        turno.estado_solicitudes_turno.length > 0
                                    ) {
                                        // Toma el último estado
                                        const ultimoEstado = turno.estado_solicitudes_turno[turno.estado_solicitudes_turno.length - 1];
                                        confirmador = getPersonaNombre(ultimoEstado.cambiado_por);
                                    }
                                    // Obtener nombre del especialista
                                    const especialista = getPersonaNombre(turno.id_especialista);

                                    return (
                                        <tr key={turno.id}>
                                            <td>{new Date(turno.fecha_turno).toLocaleDateString()}</td>
                                            <td>{turno.hora_turno}</td>
                                            <td>
                                                <span className={`estado-badge estado-badge-${turno.estado}`}>
                                                    {turno.estado.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                {especialista}
                                            </td>
                                            <td className="especialidad-cell">
                                                {turno.especialidades?.especialidad || 'No especificada'}
                                            </td>
                                            <td>
                                                {confirmador}
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default EstadoTurnos;