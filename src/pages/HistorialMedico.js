import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import './HistorialMedico.css';

const HistorialMedico = () => {
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
        <div className="loading-container-modern">
            <div className="loading-spinner-modern">
                <div className="spinner-modern"></div>
                <p className="loading-text-modern">Cargando historial...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="error-container-modern">
            <div className="error-message-modern">
                <span className="error-icon-modern">⚠️</span>
                <p>{error}</p>
            </div>
        </div>
    );

    // Función para buscar persona por id
    const getPersonaNombre = (id) => {
        const persona = personas.find(p => p.id === id);
        return persona ? `${persona.nombre} ${persona.apellido}` : "---";
    };

    return (
        <div className="historial-container-modern">
            <div className="page-header-modern">
                <span className="header-icon-modern">📚</span>
                <h2 className="page-title-modern">Historial Médico</h2>
                <p className="page-subtitle-modern">Registro de sus citas médicas</p>
            </div>
            {turnos.length === 0 ? (
                <div className="empty-state-modern">
                    <span className="empty-icon-modern">📖</span>
                    <h3 className="empty-title-modern">No tiene historial médico</h3>
                    <p className="empty-text-modern">Sus citas completadas aparecerán aquí</p>
                </div>
            ) : (
                <div className="table-container-modern">
                    <div className="table-wrapper-modern">
                        <table className="historial-table-modern">
                            <thead className="table-header-modern">
                                <tr>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Estado</th>
                                    <th>Especialista</th>
                                    <th>Especialidad</th>
                                    <th>Confirmado por</th>
                                </tr>
                            </thead>
                            <tbody className="table-body-modern">
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
                                            <tr key={turno.id} className="table-row-modern">
                                                <td className="table-cell-modern fecha-cell-modern">
                                                    <span className="fecha-text-modern">
                                                        {new Date(turno.fecha_turno).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td className="table-cell-modern hora-cell-modern">
                                                    <span className="hora-text-modern">{turno.hora_turno}</span>
                                                </td>
                                                <td className="table-cell-modern estado-cell-modern">
                                                    <span className={`estado-badge-modern estado-badge-${turno.estado}`}>
                                                        {turno.estado.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="table-cell-modern especialista-cell-modern">
                                                    <span className="especialista-text-modern">{especialista}</span>
                                                </td>
                                                <td className="table-cell-modern especialidad-cell-modern">
                                                    <span className="especialidad-text-modern">
                                                        {turno.especialidades?.especialidad || 'No especificada'}
                                                    </span>
                                                </td>
                                                <td className="table-cell-modern confirmado-cell-modern">
                                                    <span className="confirmado-text-modern">{confirmador}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistorialMedico;