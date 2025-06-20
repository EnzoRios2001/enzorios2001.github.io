import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import './Perfil.css';

function Perfil() {
    const [user, setUser] = useState(null);
    const [persona, setPersona] = useState(null);
    const [paciente, setPaciente] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);

    // Campos editables
    const [nombreInput, setNombreInput] = useState('');
    const [apellidoInput, setApellidoInput] = useState('');
    const [dniInput, setDniInput] = useState('');
    const [phoneInput, setPhoneInput] = useState('');
    // Ejemplo de campos de paciente
    const [fechaNacimientoInput, setFechaNacimientoInput] = useState('');
    const [direccionInput, setDireccionInput] = useState('');
    const [generoInput, setGeneroInput] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchPerfil = async () => {
            setLoading(true);
            setError('');
            try {
                // Obtener usuario autenticado
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError) throw userError;
                if (!user) {
                    setError('No hay usuario autenticado.');
                    setLoading(false);
                    return;
                }
                setUser(user);

                // Buscar persona relacionada por id
                const { data: personaData } = await supabase
                    .from('persona')
                    .select('*')
                    .eq('id', user.id);

                const personaObj = personaData && personaData.length > 0 ? personaData[0] : null;
                setPersona(personaObj);

                if (personaObj) {
                    setPhoneInput(personaObj.telefono || '');
                    setNombreInput(personaObj.nombre || '');
                    setApellidoInput(personaObj.apellido || '');
                    setDniInput(personaObj.dni || '');

                    // Buscar paciente relacionado por id_persona
                    const { data: pacienteData } = await supabase
                        .from('pacientes')
                        .select('*')
                        .eq('id', personaObj.id);

                    const pacienteObj = pacienteData && pacienteData.length > 0 ? pacienteData[0] : null;
                    setPaciente(pacienteObj);

                    if (pacienteObj) {
                        setFechaNacimientoInput(pacienteObj.fecha_nacimiento || '');
                        setDireccionInput(pacienteObj.direccion || '');
                        setGeneroInput(pacienteObj.genero || '');
                    }
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPerfil();
    }, []);

    // Guardar/Actualizar datos de persona, usuario auth y paciente
    const handleGuardar = async (e) => {
        e.preventDefault();
        if (!user) return;
        setSaving(true);
        setError('');
        try {
            // Actualizar o insertar persona
            if (persona) {
                const { error: updateError } = await supabase
                    .from('persona')
                    .update({
                        nombre: nombreInput,
                        apellido: apellidoInput,
                        dni: dniInput,
                        telefono: phoneInput,
                    })
                    .eq('id', user.id);
                if (updateError) throw updateError;
                setPersona({
                    ...persona,
                    nombre: nombreInput,
                    apellido: apellidoInput,
                    dni: dniInput,
                    telefono: phoneInput,
                });
            } else {
                const { data: insertData, error: insertError } = await supabase
                    .from('persona')
                    .insert([{
                        id: user.id,
                        nombre: nombreInput,
                        apellido: apellidoInput,
                        dni: dniInput,
                        telefono: phoneInput,
                    }])
                    .select();
                if (insertError) throw insertError;
                setPersona(insertData[0]);

                // Esperar a que el trigger cree la fila en pacientes
                let pacienteRow = null;
                for (let i = 0; i < 5; i++) { // Intenta hasta 5 veces
                    const { data: pacienteData } = await supabase
                        .from('pacientes')
                        .select('*')
                        .eq('id', user.id);
                    if (pacienteData && pacienteData.length > 0) {
                        pacienteRow = pacienteData[0];
                        break;
                    }
                    await new Promise(res => setTimeout(res, 300)); // Espera 300ms antes de reintentar
                }

                if (pacienteRow) {
                    // Ahora sí, actualiza los datos de paciente
                    const { error: updatePacienteError } = await supabase
                        .from('pacientes')
                        .update({
                            fecha_nacimiento: fechaNacimientoInput,
                            direccion: direccionInput,
                            genero: generoInput,
                        })
                        .eq('id', user.id);
                    if (updatePacienteError) throw updatePacienteError;
                    setPaciente({
                        ...pacienteRow,
                        fecha_nacimiento: fechaNacimientoInput,
                        direccion: direccionInput,
                        genero: generoInput,
                    });
                }
                setEditMode(false);
                setSaving(false);
                return;
            }

            // Solo actualiza paciente si ya existe
            if (paciente) {
                const { error: updatePacienteError } = await supabase
                    .from('pacientes')
                    .update({
                        fecha_nacimiento: fechaNacimientoInput,
                        direccion: direccionInput,
                        genero: generoInput,
                    })
                    .eq('id', persona.id);
                if (updatePacienteError) throw updatePacienteError;
                setPaciente({
                    ...paciente,
                    fecha_nacimiento: fechaNacimientoInput,
                    direccion: direccionInput,
                    genero: generoInput,
                });
            }

            setEditMode(false);

        } catch (err) {
            setError(err.message || JSON.stringify(err));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Cargando perfil...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div className="perfil-container">
            <h2 className="perfil-title">Mi Perfil</h2>
            <form className="perfil-info-group" onSubmit={handleGuardar}>
                <div className="perfil-info-item">
                    <span className="perfil-info-label">Email:</span>
                    <span className="perfil-info-value">{user?.email}</span>
                </div>
                <div className="perfil-info-item">
                    <span className="perfil-info-label">Teléfono:</span>
                    {editMode ? (
                        <input
                            type="int"
                            value={phoneInput}
                            onChange={e => setPhoneInput(e.target.value)}
                            disabled={saving}
                            placeholder="Ej: +56912345678"
                        />
                    ) : (
                        <span className="perfil-info-value">{persona?.telefono || 'No registrado'}</span>
                    )}
                </div>
                <div className="perfil-info-item">
                    <span className="perfil-info-label">Nombre:</span>
                    {editMode ? (
                        <input
                            type="text"
                            value={nombreInput}
                            onChange={e => setNombreInput(e.target.value)}
                            disabled={saving}
                        />
                    ) : (
                        <span className="perfil-info-value">{persona?.nombre || 'No registrado'}</span>
                    )}
                </div>
                <div className="perfil-info-item">
                    <span className="perfil-info-label">Apellido:</span>
                    {editMode ? (
                        <input
                            type="text"
                            value={apellidoInput}
                            onChange={e => setApellidoInput(e.target.value)}
                            disabled={saving}
                        />
                    ) : (
                        <span className="perfil-info-value">{persona?.apellido || 'No registrado'}</span>
                    )}
                </div>
                <div className="perfil-info-item">
                    <span className="perfil-info-label">DNI:</span>
                    {editMode ? (
                        <input
                            type="text"
                            value={dniInput}
                            onChange={e => setDniInput(e.target.value)}
                            disabled={saving}
                        />
                    ) : (
                        <span className="perfil-info-value">{persona?.dni || 'No registrado'}</span>
                    )}
                </div>
                {/* Ejemplo de campos de la tabla paciente */}
                <div className="perfil-info-item">
                    <span className="perfil-info-label">Fecha de nacimiento:</span>
                    {editMode ? (
                        <input
                            type="date"
                            value={fechaNacimientoInput}
                            onChange={e => setFechaNacimientoInput(e.target.value)}
                            disabled={saving}
                        />
                    ) : (
                        <span className="perfil-info-value">{paciente?.fecha_nacimiento || 'No registrado'}</span>
                    )}
                </div>
                <div className="perfil-info-item">
                    <span className="perfil-info-label">Dirección:</span>
                    {editMode ? (
                        <input
                            type="text"
                            value={direccionInput}
                            onChange={e => setDireccionInput(e.target.value)}
                            disabled={saving}
                        />
                    ) : (
                        <span className="perfil-info-value">{paciente?.direccion || 'No registrado'}</span>
                    )}
                </div>
                <div className="perfil-info-item">
                    <span className="perfil-info-label">Género:</span>
                    {editMode ? (
                        <select
                            value={generoInput}
                            onChange={e => setGeneroInput(e.target.value)}
                            disabled={saving}
                        >
                            <option value="">Selecciona...</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                            <option value="otro">Otro</option>
                        </select>
                    ) : (
                        <span className="perfil-info-value">{paciente?.genero || 'No registrado'}</span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                    {!editMode && (
                        <button
                            type="button"
                            className="perfil-form-button"
                            onClick={() => setEditMode(true)}
                        >
                            Editar
                        </button>
                    )}
                    {editMode && (
                        <>
                            <button
                                type="submit"
                                disabled={saving}
                                className="perfil-form-button"
                            >
                                {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditMode(false);
                                    setPhoneInput(persona?.telefono || '');
                                    setNombreInput(persona?.nombre || '');
                                    setApellidoInput(persona?.apellido || '');
                                    setDniInput(persona?.dni || '');
                                    setFechaNacimientoInput(paciente?.fecha_nacimiento || '');
                                    setDireccionInput(paciente?.direccion || '');
                                    setGeneroInput(paciente?.genero || '');
                                }}
                                disabled={saving}
                                className="perfil-form-button"
                                style={{ background: '#ccc', color: '#222' }}
                            >
                                Cancelar
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
}

export default Perfil;