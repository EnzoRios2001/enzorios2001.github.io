import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import './estadoTurnos.css';

const EstadoTurnos = () => {
    const [turnos, setTurnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const getUserAndFetchTurnos = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            setError('Por favor inicie sesión para ver sus turnos');
            setLoading(false);
            return;
        }

        const user = session.user;

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

        if (error) {
            setError('Error al cargar los turnos: ' + error.message);
        } else {
            setTurnos(data);
        }

        setLoading(false);
    };

    getUserAndFetchTurnos();

    useEffect(() => {
        getUserAndFetchTurnos();
    }, []);

    const handleCancelar = async (turnoId) => {
        try {
            const confirmacion = window.confirm('¿Está seguro que desea cancelar este turno?');
            if (!confirmacion) return;
            // Obtener el usuario logeado
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No se pudo obtener el usuario logeado');
            // Llamar al RPC para cancelar y loguear el turno
            const { error } = await supabase.rpc('cancelar_turno', {
                turno_id: turnoId,
                nuevo_estado: 'cancelado',
                user_id: user.id
            });
            if (error) throw error;
            getUserAndFetchTurnos();
        } catch (error) {
            alert('Error al cancelar el turno: ' + error.message);
        }
    };

    if (loading) return (
        <div className="loading-container-modern">
            <div className="loading-spinner-modern">
                <div className="spinner-modern"></div>
                <p className="loading-text-modern">Cargando turnos...</p>
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

    return (
        <div className="estado-turnos-container-modern">
            <div className="page-header-modern">
                <span className="header-icon-modern">📅</span>
                <h2 className="page-title-modern">Estado de sus Turnos</h2>
                <p className="page-subtitle-modern">Gestione sus citas médicas</p>
            </div>
            {turnos.length === 0 ? (
                <div className="empty-state-modern">
                    <span className="empty-icon-modern">📋</span>
                    <h3 className="empty-title-modern">No tiene turnos pendientes</h3>
                    <p className="empty-text-modern">Puede solicitar un nuevo turno cuando lo desee</p>
                    <a href="/turno-nuevo" className="empty-action-modern">
                        Solicitar turno
                    </a>
                </div>
            ) : (
                <div className="table-container-modern">
                    <div className="table-wrapper-modern">
                        <table className="estado-turnos-table-modern">
                            <thead className="table-header-modern">
                                <tr>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Estado</th>
                                    <th>Especialidad</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="table-body-modern">
                                {turnos.map((turno) => (
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
                                        <td className="table-cell-modern especialidad-cell-modern">
                                            <span className="especialidad-text-modern">
                                                {turno.especialidades?.especialidad || 'No especificada'}
                                            </span>
                                        </td>
                                        <td className="table-cell-modern acciones-cell-modern">
                                            {(turno.estado === 'pendiente' || turno.estado === 'aprobado') && (
                                                <button
                                                    onClick={() => handleCancelar(turno.id)}
                                                    className="btn-cancelar-modern"
                                                >
                                                    <span className="btn-icon-modern">❌</span>
                                                    Cancelar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EstadoTurnos;
