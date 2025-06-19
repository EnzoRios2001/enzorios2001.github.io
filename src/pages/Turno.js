import React, { useEffect, useState } from 'react';
import { TurnoService } from '../services/TurnoService';
import { TurnoUIManager } from '../services/TurnoUIManager';
import { handleError, toggleElementDisplay, formatearFecha } from './utils';
import './turno.css';

const Turno = () => {
    const [userId, setUserId] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [especialistas, setEspecialistas] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [selectedEspecialista, setSelectedEspecialista] = useState('');
    const [selectedEspecialidad, setSelectedEspecialidad] = useState('');
    const [currentMonth, setCurrentMonth] = useState('');

    // Usar useRef para mantener referencias estables a los servicios
    const turnoService = React.useRef(null);
    const uiManager = React.useRef(null);

    useEffect(() => {
        const initializeServices = async () => {
            try {
                // Inicializar servicios
                turnoService.current = new TurnoService();
                uiManager.current = new TurnoUIManager();

                // Inicializar la relación bidireccional
                uiManager.current.init(turnoService.current);
                
                // Cargar datos iniciales
                const { data: especialidadesData, error: errorEsp } = await turnoService.current.getEspecialidades();
                if (errorEsp) throw errorEsp;
                setEspecialidades(especialidadesData);
                
                // Cargar especialistas iniciales
                const { data: especialistasData, error: errorDoc } = await turnoService.current.getEspecialistas();
                if (errorDoc) throw errorDoc;
                setEspecialistas(especialistasData);

                // Renderizar el calendario inicial
                uiManager.current.generarDiasCalendario();
            } catch (error) {
                console.error('Error en la inicialización:', error);
                handleError(error);
            }
        };

        initializeServices();
    }, []);

    const handleEspecialistaChange = async (e) => {
        const especialistaId = e.target.value;
        setSelectedEspecialista(especialistaId);
        if (especialistaId) {
            await uiManager.current.cargarHorariosEspecialista(especialistaId);
        }
    };

    const handleEspecialidadChange = async (e) => {
        const especialidadId = e.target.value;
        setSelectedEspecialidad(especialidadId);
        if (especialidadId) {
            await uiManager.current.cargarEspecialistas(especialidadId);
        }
    };

    const closeTimeSlots = () => {
        toggleElementDisplay('overlay', false);
        toggleElementDisplay('timeSlots', false);
        toggleElementDisplay('confirmationModal', false);
    };

    const cancelarConfirmacion = () => {
        toggleElementDisplay('confirmationModal', false);
        toggleElementDisplay('overlay', false);
        window.turnoPendiente = null;
    };

    const confirmarTurno = async () => {
        if (!window.turnoPendiente) return;
        try {
            const { error } = await turnoService.current.crearTurno(window.turnoPendiente);
            if (error) throw error;
            
            alert('Turno registrado exitosamente');
            closeTimeSlots();
            cancelarConfirmacion();
        } catch (error) {
            handleError(error, 'Error al registrar el turno');
        }
    };

    return (
        <div className="container">
            <div className="user-info">
                <span id="userId">{userId || 'Cargando información del usuario...'}</span>
                
            </div>

            <a href="/" className="back-link">Volver al Inicio</a>

            <div className="selectors">
                <div className="selector-box">
                    <h3>Seleccionar Especialista</h3>
                    <select 
                        id="especialistaSelect" 
                        value={selectedEspecialista}
                        onChange={handleEspecialistaChange}
                    >
                        <option value="">Seleccione un especialista</option>
                        {especialistas.map(esp => (
                            <option key={esp.id} value={esp.id}>
                                {`${esp.persona.nombre} ${esp.persona.apellido}`}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="selector-box">
                    <h3>Seleccionar Especialidad</h3>
                    <select 
                        id="especialidadSelect"
                        value={selectedEspecialidad}
                        onChange={handleEspecialidadChange}
                    >
                        <option value="">Seleccione una especialidad</option>
                        {especialidades.map(esp => (
                            <option key={esp.id} value={esp.id}>
                                {esp.especialidad}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="calendar">
                <div className="calendar-header">
                    <div className="calendar-nav">
                        <button id="prevMonth" onClick={() => {
                            uiManager.current.retrocederMes();
                            uiManager.current.generarDiasCalendario();
                        }}>&lt;</button>
                    </div>
                    <h2 id="currentMonth">{currentMonth}</h2>
                    <div className="calendar-nav">
                        <button id="nextMonth" onClick={() => {
                            uiManager.current.avanzarMes();
                            uiManager.current.generarDiasCalendario();
                        }}>&gt;</button>
                    </div>
                </div>
                <div className="calendar-grid">
                    <div className="day-header">Dom</div>
                    <div className="day-header">Lun</div>
                    <div className="day-header">Mar</div>
                    <div className="day-header">Mié</div>
                    <div className="day-header">Jue</div>
                    <div className="day-header">Vie</div>
                    <div className="day-header">Sáb</div>
                </div>
                <div className="calendar-grid" id="calendar-days"></div>
            </div>

            <div className="overlay" id="overlay"></div>
            <div className="time-slots" id="timeSlots">
                <button className="close-modal" onClick={closeTimeSlots}>&times;</button>
                <h3>Seleccionar Horario</h3>
                <div className="time-grid"></div>
            </div>

            <div className="confirmation-modal" id="confirmationModal">
                <h3>Confirmar Turno</h3>
                <div className="confirmation-details" id="confirmationDetails"></div>
                <div className="confirmation-buttons">
                    <button className="cancel-btn" onClick={cancelarConfirmacion}>Cancelar</button>
                    <button className="confirm-btn" onClick={confirmarTurno}>Confirmar</button>
                </div>
            </div>
        </div>
    );
};

export default Turno;
