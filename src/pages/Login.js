import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registerMode, setRegisterMode] = useState(false);
  const navigate = useNavigate();

  // Iniciar sesión
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        sessionStorage.setItem('usuario', data.user.email);
        navigate('/');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Registro de usuario y luego en persona
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !nombre || !apellido) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    try {
      setLoading(true);
      setError(null);

      // 1. Crear usuario en Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Usa el ID del usuario recién creado
      const userId = data?.user?.id;
      if (!userId) {
        setError('No se pudo obtener el ID del usuario.');
        return;
      }

      // 2. Insertar en persona
      const { error: personaError } = await supabase
        .from('persona')
        .insert([{
          id: userId,
          nombre,
          apellido,
        }]);
      if (personaError) throw personaError;

      setError('Registro exitoso. Revisa tu correo para confirmar la cuenta.');
      setRegisterMode(false);
      setEmail('');
      setPassword('');
      setNombre('');
      setApellido('');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container-modern">
      <div className="login-card-modern">
        <div className="login-header-modern">
          <span className="header-icon-modern">🔐</span>
          <h2 className="page-title-modern">{registerMode ? 'Registrarse' : 'Iniciar Sesión'}</h2>
          <p className="page-subtitle-modern">
            {registerMode ? 'Crea tu cuenta para acceder al sistema' : 'Accede a tu cuenta de paciente'}
          </p>
        </div>
        
        {error && (
          <div className="error-message-modern">
            <span className="error-icon-modern">⚠️</span>
            <p>{error}</p>
          </div>
        )}
        
        {!registerMode ? (
          <form className="login-form-modern" onSubmit={handleSubmit}>
            <div className="form-group-modern">
              <label htmlFor="email" className="form-label-modern">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="form-input-modern"
                placeholder="tu@email.com"
              />
            </div>
            
            <div className="form-group-modern">
              <label htmlFor="password" className="form-label-modern">Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="form-input-modern"
                placeholder="Ingrese su contraseña"
              />
            </div>
            
            <div className="form-actions-modern">
              <button type="submit" disabled={loading} className="btn-primary-modern">
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </div>
            
            <div className="form-links-modern">
              <button
                type="button"
                onClick={() => {
                  setRegisterMode(true);
                  setError(null);
                }}
                disabled={loading}
                className="link-button-modern"
              >
                ¿No tienes cuenta? Regístrate aquí
              </button>
              
              <button
                type="button"
                onClick={async () => {
                  if (!email) {
                    setError('Por favor, ingresa tu email para recuperar la contraseña.');
                    return;
                  }
                  setLoading(true);
                  setError(null);
                  const { error } = await supabase.auth.resetPasswordForEmail(email);
                  if (error) {
                    setError(error.message);
                  } else {
                    setError('Se ha enviado un correo para restablecer la contraseña.');
                  }
                  setLoading(false);
                }}
                disabled={loading}
                className="link-button-modern secondary"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        ) : (
          <form className="login-form-modern" onSubmit={handleRegister}>
            <div className="form-group-modern">
              <label htmlFor="nombre" className="form-label-modern">Nombre</label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                disabled={loading}
                className="form-input-modern"
                placeholder="Ingrese su nombre"
              />
            </div>
            
            <div className="form-group-modern">
              <label htmlFor="apellido" className="form-label-modern">Apellido</label>
              <input
                type="text"
                id="apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
                disabled={loading}
                className="form-input-modern"
                placeholder="Ingrese su apellido"
              />
            </div>
            
            <div className="form-group-modern">
              <label htmlFor="email" className="form-label-modern">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="form-input-modern"
                placeholder="tu@email.com"
              />
            </div>
            
            <div className="form-group-modern">
              <label htmlFor="password" className="form-label-modern">Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="form-input-modern"
                placeholder="Cree una contraseña segura"
              />
            </div>
            
            <div className="form-actions-modern">
              <button type="submit" disabled={loading} className="btn-success-modern">
                {loading ? '👤 Registrando...' : 'Registrarse'}
              </button>
            </div>
            
            <div className="form-links-modern">
              <button
                type="button"
                onClick={() => {
                  setRegisterMode(false);
                  setError(null);
                }}
                disabled={loading}
                className="link-button-modern"
              >
                ¿Ya tienes cuenta? Inicia sesión aquí
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;
