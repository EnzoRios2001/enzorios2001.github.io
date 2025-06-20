import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { supabase } from '../supabase/client';

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
  // Ajusta el join para que use la relación 'persona' en vez de 'id_persona'
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
  // Formatea para mostrar nombre completo
  return data.map(e => {
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
    // Buscar datos del horario seleccionado (comparando como string para evitar problemas de tipo)
    const horario = horarios.find(h => String(h.id_horario) === String(horarioSeleccionado));
    // Insertar en la tabla solicitudes_turno
    const { error } = await supabase
      .from('solicitudes_turno')
      .insert([
        {
          fecha_turno: fechaSeleccionada ? fechaSeleccionada.toISOString().slice(0, 10) : null,
          hora_turno: horarioSeleccionado ? (horario ? horario.hora_inicio : null) : null,
          id_dia: horario ? horario.dia_semana : null,
          id_especialidad: especialidadSeleccionada || null,
          id_especialista: especialistaSeleccionado || null,
          id_paciente: user.id
        }
      ]);
    if (error) {
      setMensaje("Error al enviar la solicitud: " + error.message);
    } else {
      setMensaje("¡Solicitud enviada correctamente!");
      setFechaSeleccionada(null);
      setHorarioSeleccionado("");
    }
    setEnviando(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: 24, background: "#f9f9fb", borderRadius: 12 }}>
      <h2>Selecciona un turno</h2>
      <div style={{ marginBottom: 16 }}>
        <label>Especialidad:</label>
        <select
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
        <label>Especialista:</label>
        <select
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
        <label>Fecha:</label><br />
        <DatePicker
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
        <label>Horario:</label>
        <select
          value={horarioSeleccionado}
          onChange={e => setHorarioSeleccionado(e.target.value)}
          disabled={!especialistaSeleccionado || horarios.length === 0}
        >
          <option value="">Seleccione un horario</option>
          {horarios.map(h => (
            <option key={h.id_horario} value={h.id_horario}>
              Día {h.dia_semana} - {h.hora_inicio} a {h.hora_fin}
            </option>
          ))}
        </select>
      </div>
      {fechaSeleccionada && (
        <div style={{ marginTop: 16 }}>
          <strong>Fecha seleccionada:</strong> {fechaSeleccionada.toLocaleDateString()}
        </div>
      )}
      <div style={{ marginBottom: 16 }}>
        <button onClick={handleEnviarSolicitud} disabled={enviando}>
          {enviando ? "Enviando..." : "Solicitar turno"}
        </button>
        {mensaje && <div style={{ marginTop: 8, color: mensaje.startsWith('¡') ? 'green' : 'red' }}>{mensaje}</div>}
      </div>
    </div>
  );
}

export default TurnoNuevo;
