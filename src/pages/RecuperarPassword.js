import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';

function RecuperarPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Confirmar el usuario con el token de la URL
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', ''));
    const token = params.get('token');
    const type = params.get('type');
    if (token && type === 'confirmation') {
      supabase.auth
        .verifyOtp({ type: 'email', token })
        .then(({ data, error }) => {
          if (error) setError('No se pudo confirmar el usuario.');
        });
    }
  }, []);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      setError('Por favor, ingresa la nueva contraseña.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
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
          <span className="header-icon-modern">🔑</span>
          <h2 className="page-title-modern">Restablecer Contraseña</h2>
          <p className="page-subtitle-modern">Ingrese su nueva contraseña segura</p>
        </div>
        
        {error && (
          <div className="error-message-modern">
            <span className="error-icon-modern">⚠️</span>
            <p>{error}</p>
          </div>
        )}
        
        {success ? (
          <div className="success-message-modern">
            <span className="success-icon-modern">✅</span>
            <p>Contraseña actualizada correctamente. Redirigiendo...</p>
          </div>
        ) : (
          <form className="login-form-modern" onSubmit={handlePasswordReset}>
            <div className="form-group-modern">
              <label htmlFor="newPassword" className="form-label-modern">Nueva Contraseña</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                className="form-input-modern"
                placeholder="Ingrese su nueva contraseña"
              />
            </div>
            
            <div className="form-actions-modern">
              <button type="submit" disabled={loading} className="btn-primary-modern">
                {loading ? '🔄 Actualizando...' : '🔒 Actualizar Contraseña'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default RecuperarPassword;