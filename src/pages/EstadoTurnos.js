import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import './estadoTurnos.css';

const EstadoTurnos = () => {
    const [turnos, setTurnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTurnos = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError('Por favor inicie sesión para ver sus turnos');
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('solicitudes_turno')
                .select(`
                    *,
                    especialidades:id_especialidad (
                        id,
                        especialidad
                    )
                `)
                .eq('id_paciente', user.id);

            if (error) throw error;

            setTurnos(data);
            setLoading(false);
        } catch (error) {
            setError('Error al cargar los turnos: ' + error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTurnos();
    }, []);

    const handleCancelar = async (turnoId) => {
        try {
            const confirmacion = window.confirm('¿Está seguro que desea cancelar este turno?');
            if (!confirmacion) return;

            const { error } = await supabase
                .from('solicitudes_turno')
                .update({ estado: 'cancelado' })
                .eq('id', turnoId);

            if (error) throw error;
            
            fetchTurnos();
        } catch (error) {
            alert('Error al cancelar el turno: ' + error.message);
        }
    };

    if (loading) return (
        <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
        </div>
    );

    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="estado-turnos-container">
            <h2 className="estado-turnos-title">Estado de sus Turnos</h2>
            {turnos.length === 0 ? (
                <div className="sin-turnos">
                    No tiene solicitudes de turnos pendientes.
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="estado-turnos-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Estado</th>
                                <th>Especialidad</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {turnos.map((turno) => (
                                <tr key={turno.id}>
                                    <td>{new Date(turno.fecha_turno).toLocaleDateString()}</td>
                                    <td>{turno.hora_turno}</td>
                                    <td>
                                        <span className={`estado-badge estado-badge-${turno.estado}`}>
                                            {turno.estado.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="especialidad-cell">
                                        {turno.especialidades?.especialidad || 'No especificada'}
                                    </td>
                                    <td>
                                        {(turno.estado === 'pendiente' || turno.estado === 'aprobado') && (
                                            <button
                                                onClick={() => handleCancelar(turno.id)}
                                                className="btn-cancelar"
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default EstadoTurnos;
