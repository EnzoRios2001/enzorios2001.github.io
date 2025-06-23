import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { supabase } from '../supabase/client';
import "./turnonuevo.css";

// Obtiene especialidades desde la tabla 'especialidades'
async function obtenerEspecialidades() {
  const { data, error } = await supabase
    .from('especialidades')
    .select('id, especialidad')
    .order('especialidad', { ascending: true });
  if (error) {
    console.error('Error obteniendo especialidades:', error);
    return [];
  }
  return data;
}

// Obtiene especialistas para una especialidad desde la tabla 'espe_espe', 'especialistas' y 'persona'
async function obtenerEspecialistasPorEspecialidad(id_especialidad) {
  // 1. Traer todos los especialistas de la especialidad
  const { data, error } = await supabase
    .from('espe_espe')
    .select(`
      id,
      id_persona,
      especialistas:especialistas!espe_espe_id_persona_fkey (
        id,
        persona (
          nombre,
          apellido
        )
      )
    `)
    .eq('id_especialidad', id_especialidad);
  if (error) {
    console.error('Error obteniendo especialistas:', error);
    return [];
  }
  // 2. Traer todos los id_persona con rol 'especialista' de la tabla rol_persona
  const { data: roles, error: errorRoles } = await supabase
    .from('rol_persona')
    .select('id, rol')
    .eq('rol', 'especialista');
  if (errorRoles) {
    console.error('Error obteniendo roles:', errorRoles);
    return [];
  }
  const idsEspecialistas = new Set((roles || []).map(r => r.id));
  // 3. Filtrar solo los especialistas cuyo id_persona esté en la lista de idsEspecialistas
  const filtrados = data.filter(e => idsEspecialistas.has(e.id_persona));
  // Formatea para mostrar nombre completo
  return filtrados.map(e => {
    const especialista = e.especialistas;
    const persona = especialista && especialista.persona;
    return {
      espe_espe_id: e.id, // id de la relación espe_espe
      id_persona: especialista ? especialista.id : e.id_persona,
      nombre: persona ? `${persona.nombre} ${persona.apellido}` : `ID ${e.id_persona}`
    };
  });
}

// Obtiene días de trabajo del especialista desde la tabla 'horarios_especialista'
async function obtenerDiasTrabajo(id_especialista) {
  const { data, error } = await supabase
    .from('horarios_especialistas')
    .select('dia_semana')
    .eq('id_especialista', id_especialista);
  if (error) {
    console.error('Error obteniendo días de trabajo:', error);
    return [];
  }
  // dia_semana: 0=Dom, 1=Lun, ..., 6=Sab
  return data.map(d => d.dia_semana);
}

// Obtiene horarios del especialista para un día de la semana
async function obtenerHorariosPorEspecialista(id_especialista) {
  const { data, error } = await supabase
    .from('horarios_especialistas')
    .select('id_horario, id_especialista, dia_semana, hora_inicio, hora_fin')
    .eq('id_especialista', id_especialista);
  if (error) {
    console.error('Error obteniendo horarios:', error);
    return [];
  }
  return data;
}

const DIAS_SEMANA = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado"
};

function TurnoNuevo() {
  const [especialidades, setEspecialidades] = useState([]);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState("");
  const [especialistas, setEspecialistas] = useState([]);
  const [especialistaSeleccionado, setEspecialistaSeleccionado] = useState("");
  const [diasTrabajo, setDiasTrabajo] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [loadingDias, setLoadingDias] = useState(false);
  const [loadingEspecialistas, setLoadingEspecialistas] = useState(false);
  const [horarios, setHorarios] = useState([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [confirmado, setConfirmado] = useState(false);

  useEffect(() => {
    async function fetchEspecialidades() {
      const data = await obtenerEspecialidades();
      setEspecialidades(data);
    }
    fetchEspecialidades();
  }, []);

  useEffect(() => {
    if (!especialidadSeleccionada) {
      setEspecialistas([]);
      setEspecialistaSeleccionado("");
      return;
    }
    setLoadingEspecialistas(true);
    obtenerEspecialistasPorEspecialidad(Number(especialidadSeleccionada)).then(data => {
      setEspecialistas(data);
      setEspecialistaSeleccionado("");
      setLoadingEspecialistas(false);
    });
  }, [especialidadSeleccionada]);

  useEffect(() => {
    if (!especialistaSeleccionado) {
      setDiasTrabajo([]);
      setHorarios([]);
      setHorarioSeleccionado("");
      return;
    }
    setLoadingDias(true);
    obtenerDiasTrabajo(especialistaSeleccionado).then(data => {
      setDiasTrabajo(data);
      setLoadingDias(false);
    });
    // Cargar horarios del especialista
    obtenerHorariosPorEspecialista(especialistaSeleccionado).then(data => {
      setHorarios(data);
      setHorarioSeleccionado("");
    });
  }, [especialistaSeleccionado]);

  const isDiaTrabajo = (date) => diasTrabajo.includes(date.getDay());

  // Enviar solicitud de turno
  const handleEnviarSolicitud = async () => {
    setMensaje("");
    setMostrarModal(true);
  };

  // Confirmar y enviar a la base de datos
  const handleConfirmar = async () => {
    setEnviando(true);
    setMensaje("");
    // Obtener usuario logeado
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();
    if (userError || !user) {
      setMensaje("No se pudo obtener el usuario logeado.");
      setEnviando(false);
      return;
    }
    // Verificar si el usuario tiene rol 'paciente'
    const { data: rolesPaciente, error: errorRolesPaciente } = await supabase
      .from('rol_persona')
      .select('id, rol')
      .eq('id', user.id)
      .eq('rol', 'paciente');
    if (errorRolesPaciente) {
      setMensaje("Error al verificar el rol del usuario.");
      setEnviando(false);
      return;
    }
    if (!rolesPaciente || rolesPaciente.length === 0) {
      setMensaje("No tienes permisos para solicitar un turno. Solo los usuarios con rol 'paciente' pueden hacerlo.");
      setEnviando(false);
      setMostrarModal(false);
      return;
    }
    const horario = horarios.find(h => String(h.id_horario) === String(horarioSeleccionado));
    const { error } = await supabase
      .from('solicitudes_turno')
      .insert([
        {
          fecha_turno: fechaSeleccionada ? fechaSeleccionada.toISOString().slice(0, 10) : null,
          hora_turno: horarioSeleccionado ? (horario ? horario.hora_inicio : null) : null,
          id_dia: horario ? horario.dia_semana : null,
          id_especialidad: especialidadSeleccionada || null,
          id_especialista: especialistaSeleccionado || null,
          id_paciente: user.id,
          id_horario: horarioSeleccionado || null // <-- Agregado: guardar id_horario
        }
      ]);
    if (error) {
      setMensaje("Error al enviar la solicitud: " + error.message);
      setEnviando(false);
      setMostrarModal(false);
    } else {
      setMensaje("¡Solicitud enviada correctamente! Recuerda que el orden de atención es por orden de llegada.");
      setConfirmado(true);
    }
    setEnviando(false);
  };

  // Obtener textos para mostrar en el modal
  const especialidadText = especialidades.find(e => String(e.id) === String(especialidadSeleccionada))?.especialidad || "";
  const especialistaText = especialistas.find(e => String(e.id_persona) === String(especialistaSeleccionado))?.nombre || "";
  const horarioObj = horarios.find(h => String(h.id_horario) === String(horarioSeleccionado));
  const horarioText = horarioObj
    ? `${DIAS_SEMANA[horarioObj.dia_semana] || `Día ${horarioObj.dia_semana}`} - ${horarioObj.hora_inicio} a ${horarioObj.hora_fin}`
    : "";
  const fechaText = fechaSeleccionada ? fechaSeleccionada.toLocaleDateString() : "";

  // Limpia todos los campos y estados
  const limpiarTodo = () => {
    setEspecialidadSeleccionada("");
    setEspecialistas([]);
    setEspecialistaSeleccionado("");
    setDiasTrabajo([]);
    setFechaSeleccionada(null);
    setHorarios([]);
    setHorarioSeleccionado("");
    setMensaje("");
    setConfirmado(false);
    setMostrarModal(false);
  };

  return (
    <div className="turno-nuevo-container">
      <h2>Selecciona un turno</h2>
      <div style={{ marginBottom: 16 }}>
        <label className="turno-nuevo-label">Especialidad:</label>
        <select
          className="turno-nuevo-select"
          value={especialidadSeleccionada}
          onChange={e => setEspecialidadSeleccionada(e.target.value)}
        >
          <option value="">Seleccione una especialidad</option>
          {especialidades.map(e => (
            <option key={e.id} value={e.id}>{e.especialidad}</option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label className="turno-nuevo-label">Especialista:</label>
        <select
          className="turno-nuevo-select"
          value={especialistaSeleccionado}
          onChange={e => setEspecialistaSeleccionado(e.target.value)}
          disabled={!especialidadSeleccionada || loadingEspecialistas}
        >
          <option value="">Seleccione un especialista</option>
          {especialistas.map(e => (
            <option key={e.id_persona} value={e.id_persona}>{e.nombre}</option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label className="turno-nuevo-label">Fecha:</label><br />
        <DatePicker
          className="turno-nuevo-datepicker"
          selected={fechaSeleccionada}
          onChange={setFechaSeleccionada}
          filterDate={isDiaTrabajo}
          placeholderText="Elige una fecha disponible"
          dateFormat="yyyy-MM-dd"
          minDate={new Date()}
          disabled={!especialistaSeleccionado || loadingDias}
        />
        {loadingDias && <div>Cargando días disponibles...</div>}
      </div>
      <div style={{ marginBottom: 16 }}>
        <label className="turno-nuevo-label">Horario:</label>
        <select
          className="turno-nuevo-select"
          value={horarioSeleccionado}
          onChange={e => setHorarioSeleccionado(e.target.value)}
          disabled={!especialistaSeleccionado || horarios.length === 0}
        >
          <option value="">Seleccione un horario</option>
          {horarios
            .filter(h => h.hora_inicio !== null && h.hora_fin !== null)
            .map(h => (
              <option key={h.id_horario} value={h.id_horario}>
                {h.hora_inicio} a {h.hora_fin}
              </option>
            ))}
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <button className="turno-nuevo-button" onClick={handleEnviarSolicitud} disabled={enviando}>
          {enviando ? "Enviando..." : "Solicitar turno"}
        </button>
        {mensaje && !mostrarModal && (
          <div className={`turno-nuevo-mensaje ${mensaje.startsWith('¡') ? 'success' : 'error'}`}>
            {mensaje}
          </div>
        )}
      </div>
      {mostrarModal && (
        <div className="turno-nuevo-modal-overlay">
          <div className="turno-nuevo-modal">
            {!confirmado ? (
              <>
                <h3>Confirmar solicitud</h3>
                <div className="turno-nuevo-modal-datos">
                  <div><strong>Especialidad:</strong> {especialidadText}</div>
                  <div><strong>Especialista:</strong> {especialistaText}</div>
                  <div><strong>Fecha:</strong> {fechaText}</div>
                  <div><strong>Horario:</strong> {horarioText}</div>
                </div>
                <div className="turno-nuevo-modal-botones">
                  <button className="turno-nuevo-button" onClick={handleConfirmar} disabled={enviando}>
                    {enviando ? "Enviando..." : "Confirmar"}
                  </button>
                  <button className="turno-nuevo-button" style={{ background: '#eee', color: '#222' }} onClick={() => setMostrarModal(false)} disabled={enviando}>
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="turno-nuevo-mensaje success" style={{ marginBottom: '1rem' }}>
                  {mensaje}
                </div>
                <div className="turno-nuevo-modal-botones">
                  <button className="turno-nuevo-button" style={{ marginTop: '1rem' }} onClick={limpiarTodo}>
                    Cerrar
                  </button>
                  <button className="turno-nuevo-button" style={{ marginTop: '0.5rem', background: '#f3f3f3', color: '#222', border: '1px solid #e0e0e0' }} onClick={() => alert('Comprobante visual (solo muestra)')}>Descargar comprobante</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TurnoNuevo;
