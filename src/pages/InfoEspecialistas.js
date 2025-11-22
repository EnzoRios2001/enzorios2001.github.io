import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import './InfoEspecialistas.css';

function InfoEspecialistas() {
    const [especialistas, setEspecialistas] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [relaciones, setRelaciones] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                // Cargar especialidades
                const { data: especialidadesData, error: espError } = await supabase
                    .from('especialidades')
                    .select('*');
                if (espError) throw new Error(`Error cargando especialidades: ${espError.message}`);
                setEspecialidades(especialidadesData);

                // Cargar especialistas con relación a personas
                const { data: especialistasData, error: docError } = await supabase
                    .from('especialistas')
                    .select(`
        id,
        matricula,
        universidad,
        titulo,
        activo,
        persona (
            nombre,
            apellido
        )
    `);
                if (docError) throw new Error(`Error cargando especialistas: ${docError.message}`);

                // Filtrar solo los especialistas activos
                const especialistasActivos = (especialistasData || []).filter(e => e.activo !== false);

                // Cargar relaciones espe_espe (usando id_persona)
                const { data: relData, error: relError } = await supabase
                    .from('espe_espe')
                    .select('id, id_persona, id_especialidad');
                if (relError) throw new Error(`Error cargando espe_espe: ${relError.message}`);
                setRelaciones(relData);

                // Cargar horarios
                const { data: horariosData, error: horariosError } = await supabase
                    .from('horarios_especialistas')
                    .select('id_especialista, dia_semana, hora_inicio, hora_fin');
                if (horariosError) throw new Error(`Error cargando horarios: ${horariosError.message}`);

                // Verificar que todos los datos estén disponibles
                if (!especialidadesData || !relData || !especialistasData) {
                    throw new Error('Faltan datos para procesar especialistas');
                }

                // Armar lista de especialistas
                const lista = especialistasActivos.map(e => {
                    const espeId = e.id; // ID del especialista

                    // Usar id_persona en lugar de id_especialista
                    const especialidadIds = relData
                        .filter(r => r.id_persona === espeId)
                        .map(r => r.id_especialidad);

                    const especialidades = especialidadesData
                        .filter(es => especialidadIds.includes(es.id))
                        .map(es => ({ id: es.id, especialidad: es.especialidad }));

                    // Asegúrate de que horarios usa id_especialista correctamente
                    const horarios = horariosData.filter(h => h.id_especialista === espeId);
                    const dias = [...new Set(horarios.map(h => h.dia_semana))];

                    return {
                        id: espeId,
                        nombre: e.persona?.nombre || 'Desconocido',
                        apellido: e.persona?.apellido || '',
                        matricula: e.matricula || '',
                        universidad: e.universidad || '',
                        titulo: e.titulo || '',
                        especialidades: especialidades,
                        diasTrabajo: dias,
                        horarios,
                    };
                });

                setEspecialistas(lista);
            } catch (err) {
                setError(err.message);
            }
        };

        cargarDatos();
    }, []);

    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miécoles', 'Jueves', 'Vienes', 'Sábado'];

    const irATurno = (id) => {
        navigate(`/turno-nuevo?espe_espeid=${id}`);
    };

    return (
        <div className="especialistas-container-modern">
            <div className="page-header-modern">
                <span className="header-icon-modern">👨‍⚕️</span>
                <h2 className="page-title-modern">Especialistas</h2>
                <p className="page-subtitle-modern">Conozca a nuestro equipo médico profesional</p>
            </div>
            
            {error && (
                <div className="error-container-modern">
                    <div className="error-message-modern">
                        <span className="error-icon-modern">⚠️</span>
                        <p>{error}</p>
                    </div>
                </div>
            )}
            
            {especialistas.length === 0 && !error ? (
                <div className="empty-state-modern">
                    <span className="empty-icon-modern">👨‍⚕️</span>
                    <h3 className="empty-title-modern">No hay especialistas disponibles</h3>
                    <p className="empty-text-modern">Por favor, contacte con el administrador</p>
                </div>
            ) : (
                <div className="especialistas-grid-modern">
                    {especialistas.map(especialista => (
                        <div key={especialista.id} className="especialista-card-modern">
                            <div className="card-header-modern">
                                <h4 className="especialista-name-modern">
                                    {`${especialista.nombre} ${especialista.apellido}`}
                                </h4>
                            </div>
                            
                            <div className="card-body-modern">
                                <div className="info-item-modern">
                                    <span className="info-label-modern">Nº Matricula:</span>
                                    <span className="info-value-modern">{especialista.matricula}</span>
                                </div>
                                
                                <div className="info-item-modern">
                                    <span className="info-label-modern">Universidad:</span>
                                    <span className="info-value-modern">{especialista.universidad}</span>
                                </div>
                                
                                <div className="info-item-modern">
                                    <span className="info-label-modern">Título:</span>
                                    <span className="info-value-modern">{especialista.titulo}</span>
                                </div>
                                
                                <div className="info-item-modern">
                                    <span className="info-label-modern">Especialidades:</span>
                                    <div className="specialties-container-modern">
                                        {especialista.especialidades.length > 0 ? (
                                            especialista.especialidades.map(e => (
                                                <span key={e.id} className="specialty-badge-modern">
                                                    {e.especialidad}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="no-specialties-modern">Sin especialidades</span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="info-item-modern">
                                    <span className="info-label-modern">Días y horarios:</span>
                                    <div className="schedules-container-modern">
                                        {especialista.horarios.length > 0 ? (
                                            especialista.horarios.map((h, idx) => (
                                                <div key={idx} className="schedule-item-modern">
                                                    <span className="schedule-day-modern">
                                                        {diasSemana[h.dia_semana]}:
                                                    </span>
                                                    <span className="schedule-time-modern">
                                                        {h.hora_inicio} - {h.hora_fin}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <span className="no-schedules-modern">Sin horarios</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="card-footer-modern">
                                <button
                                    className="solicitar-btn-modern"
                                    onClick={() => irATurno(especialista.id)}
                                >
                                    Solicitar Turno
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default InfoEspecialistas;