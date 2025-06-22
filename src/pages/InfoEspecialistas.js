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
        <div className="container-especialistas">
            <h2>Lista de Especialistas</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {especialistas.length === 0 && !error ? (
                <div className="alert alert-info">No hay especialistas cargados.</div>
            ) : (
                especialistas.map(especialista => (
                    <div key={especialista.id} className="especialista-card">
                        <div className="row align-items-center">
                            <div className="col-md-10">
                                <h4 className="text-center mb-4">{`${especialista.nombre} ${especialista.apellido}`}</h4>
                                <div className="especialista-info-grid">
                                    <div className="especialista-info-label">Nº Matricula:</div>
                                    <div className="especialista-info-value">{especialista.matricula}</div>
                                    <div className="especialista-info-label">Universidad:</div>
                                    <div className="especialista-info-value">{especialista.universidad}</div>
                                    <div className="especialista-info-label">Titulo:</div>
                                    <div className="especialista-info-value">{especialista.titulo}</div>
                                    <div className="especialista-info-label">Especialidades:</div>
                                    <div className="especialista-info-value">
                                        {especialista.especialidades.length > 0 ? (
                                            especialista.especialidades.map(e => (
                                                <span key={e.id} className="especialista-specialty">
                                                    {e.especialidad}
                                                </span>
                                            ))
                                        ) : (
                                            <span>Sin especialidades</span>
                                        )}
                                    </div>
                                    <div className="especialista-info-label">Días y horarios:</div>
                                    <div className="especialista-info-value">
                                        {especialista.horarios.length > 0 ? (
                                            especialista.horarios.map((h, idx) => (
                                                <span key={idx} className="me-3">
                                                    <span style={{ fontWeight: 500 }}>
                                                        {diasSemana[h.dia_semana]}:
                                                    </span>{' '}
                                                    {h.hora_inicio} - {h.hora_fin}
                                                </span>
                                            ))
                                        ) : (
                                            <span>Sin horarios</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-2 d-flex align-items-center justify-content-end">
                                <button
                                    className="btn btn-primary especialista-card-btn"
                                    onClick={() => irATurno(especialista.id)}
                                >
                                    Solicitar Turno
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default InfoEspecialistas;