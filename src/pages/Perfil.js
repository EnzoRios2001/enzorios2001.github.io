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
    const fecha_nacimiento_a_guardar = fechaNacimientoInput.trim() === '' ? null : fechaNacimientoInput;


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
                        setFechaNacimientoInput(pacienteObj.fecha_nacimiento
                            ? new Date(pacienteObj.fecha_nacimiento).toISOString().split('T')[0]
                            : ''
                        );
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
                            fecha_nacimiento: fecha_nacimiento_a_guardar,
                            direccion: direccionInput,
                            genero: generoInput,
                        })
                        .eq('id', user.id);
                    if (updatePacienteError) throw updatePacienteError;
                    setPaciente({
                        ...pacienteRow,
                        fecha_nacimiento: fecha_nacimiento_a_guardar,
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
                        fecha_nacimiento: fecha_nacimiento_a_guardar,
                        direccion: direccionInput,
                        genero: generoInput,
                    })
                    .eq('id', persona.id);
                if (updatePacienteError) throw updatePacienteError;
                setPaciente({
                    ...paciente,
                    fecha_nacimiento: fecha_nacimiento_a_guardar,
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

    if (loading) return (
        <div className="loading-container-modern">
            <div className="loading-spinner-modern">
                <div className="spinner-modern"></div>
                <p className="loading-text-modern">Cargando perfil...</p>
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
        <div className="perfil-container-modern">
            <div className="page-header-modern">
                <span className="header-icon-modern">👤</span>
                <h2 className="page-title-modern">Mi Perfil</h2>
                <p className="page-subtitle-modern">Gestione su información personal</p>
            </div>
            
            <form className="perfil-form-modern" onSubmit={handleGuardar}>
                <div className="form-section-modern">
                    <h3 className="section-title-modern">Información de Cuenta</h3>
                    <div className="form-grid-modern">
                        <div className="form-group-modern">
                            <label className="form-label-modern">Email:</label>
                            <div className="form-value-modern">{user?.email}</div>
                        </div>
                    </div>
                </div>

                <div className="form-section-modern">
                    <h3 className="section-title-modern">Información Personal</h3>
                    <div className="form-grid-modern">
                        <div className="form-group-modern">
                            <label className="form-label-modern">Nombre:</label>
                            {editMode ? (
                                <input
                                    type="text"
                                    value={nombreInput}
                                    onChange={e => setNombreInput(e.target.value)}
                                    disabled={saving}
                                    className="form-input-modern"
                                    placeholder="Ingrese su nombre"
                                />
                            ) : (
                                <div className="form-value-modern">{persona?.nombre || 'No registrado'}</div>
                            )}
                        </div>
                        
                        <div className="form-group-modern">
                            <label className="form-label-modern">Apellido:</label>
                            {editMode ? (
                                <input
                                    type="text"
                                    value={apellidoInput}
                                    onChange={e => setApellidoInput(e.target.value)}
                                    disabled={saving}
                                    className="form-input-modern"
                                    placeholder="Ingrese su apellido"
                                />
                            ) : (
                                <div className="form-value-modern">{persona?.apellido || 'No registrado'}</div>
                            )}
                        </div>
                        
                        <div className="form-group-modern">
                            <label className="form-label-modern">DNI:</label>
                            {editMode ? (
                                <input
                                    type="text"
                                    value={dniInput}
                                    onChange={e => setDniInput(e.target.value)}
                                    disabled={saving}
                                    className="form-input-modern"
                                    placeholder="Ingrese su DNI"
                                />
                            ) : (
                                <div className="form-value-modern">{persona?.dni || 'No registrado'}</div>
                            )}
                        </div>
                        
                        <div className="form-group-modern">
                            <label className="form-label-modern">Teléfono:</label>
                            {editMode ? (
                                <input
                                    type="tel"
                                    value={phoneInput}
                                    onChange={e => setPhoneInput(e.target.value)}
                                    disabled={saving}
                                    className="form-input-modern"
                                    placeholder="Ej: +56912345678"
                                />
                            ) : (
                                <div className="form-value-modern">{persona?.telefono || 'No registrado'}</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-section-modern">
                    <h3 className="section-title-modern">Información Médica</h3>
                    <div className="form-grid-modern">
                        <div className="form-group-modern">
                            <label className="form-label-modern">Fecha de nacimiento:</label>
                            {editMode ? (
                                <input
                                    type="date"
                                    value={fechaNacimientoInput}
                                    onChange={e => setFechaNacimientoInput(e.target.value)}
                                    disabled={saving}
                                    className="form-input-modern"
                                />
                            ) : (
                                <div className="form-value-modern">
                                    {paciente?.fecha_nacimiento
                                        ? new Date(paciente.fecha_nacimiento).toLocaleDateString()
                                        : 'No registrado'}
                                </div>
                            )}
                        </div>
                        
                        <div className="form-group-modern">
                            <label className="form-label-modern">Género:</label>
                            {editMode ? (
                                <select
                                    value={generoInput}
                                    onChange={e => setGeneroInput(e.target.value)}
                                    disabled={saving}
                                    className="form-select-modern"
                                >
                                    <option value="">Selecciona...</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Femenino">Femenino</option>
                                    <option value="otro">Otro</option>
                                </select>
                            ) : (
                                <div className="form-value-modern">{paciente?.genero || 'No registrado'}</div>
                            )}
                        </div>
                        
                        <div className="form-group-modern full-width">
                            <label className="form-label-modern">Dirección:</label>
                            {editMode ? (
                                <input
                                    type="text"
                                    value={direccionInput}
                                    onChange={e => setDireccionInput(e.target.value)}
                                    disabled={saving}
                                    className="form-input-modern"
                                    placeholder="Ingrese su dirección"
                                />
                            ) : (
                                <div className="form-value-modern">{paciente?.direccion || 'No registrado'}</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-actions-modern">
                    {!editMode && (
                        <button
                            type="button"
                            className="btn-primary-modern"
                            onClick={() => setEditMode(true)}
                        >
                            ✏️ Editar Perfil
                        </button>
                    )}
                    {editMode && (
                        <>
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn-success-modern"
                            >
                                {saving ? '💾 Guardando...' : '💾 Guardar Cambios'}
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
                                className="btn-secondary-modern"
                            >
                                ❌ Cancelar
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
}

export default Perfil;