
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../estilo.css';
import { supabase } from '../supabase/client';

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);
      } catch (e) {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  if (loading) return null;

  return (
    <>
      {/* Hero Section moderna */}
      <section className="home-hero-modern">
        <div className="home-hero-bg-modern">
          <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80" alt="Clínica moderna" />
          <div className="home-hero-overlay-modern" />
        </div>
        <div className="home-hero-content-modern">
          <div className="hero-text-container-modern">
            <h1 className="hero-title-modern">Bienvenido a Clínica Salud+</h1>
            <p className="hero-subtitle-modern">Tu salud, nuestra prioridad. Gestiona tus turnos, consulta especialistas y accede a tus servicios médicos de forma simple y rápida.</p>
          </div>
          <div className="home-hero-actions-modern">
            <Link to="/turno-nuevo" className="hero-action-btn-modern primary">
              <span className="btn-icon-modern">📅</span>
              Solicitar turno
            </Link>
            {isLoggedIn && (
              <Link to="/estado-turnos" className="hero-action-btn-modern secondary">
                <span className="btn-icon-modern">📋</span>
                Ver estado de turnos
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ...existing code... */}

      {/* Contacto moderno */}
      <section className="home-contact-modern">
        <div className="contact-container-modern">
          <div className="contact-header-modern">
            <span className="contact-icon-modern">💬</span>
            <h3 className="contact-title-modern">¿Necesitas ayuda? Contáctanos</h3>
            <p className="contact-subtitle-modern">Estamos aquí para ayudarte con cualquier consulta</p>
          </div>
          <form className="contact-form-modern" onSubmit={async e => {
            e.preventDefault();
            const email = e.target.email.value;
            const mensaje = e.target.mensaje.value;
            try {
              // Si el usuario está logeado, guardar el mensaje y activar notificación
              if (window.sessionStorage.getItem('usuario')) {
                const { error } = await supabase.from('contacto').insert([{ email, mensaje, leido: false }]);
                if (error) {
                  alert('Error al enviar el mensaje. Intenta nuevamente.');
                } else {
                  alert('Mensaje enviado correctamente. ¡Gracias por contactarnos!');
                  e.target.reset();
                }
              } else {
                // Si no está logeado, solo guardar y enviar email, sin notificación
                const { error } = await supabase.from('contacto').insert([{ email, mensaje }]);
                if (error) {
                  alert('Error al enviar el mensaje. Intenta nuevamente.');
                } else {
                  alert('Mensaje enviado correctamente. ¡Gracias por contactarnos!');
                  e.target.reset();
                }
              }
            } catch (err) {
              alert('Error inesperado.');
            }
          }}>
            <div className="form-group-modern">
              <label htmlFor="email" className="form-label-modern">Correo electrónico</label>
              <input 
                type="email" 
                id="email"
                name="email" 
                placeholder="tu@email.com" 
                className="form-input-modern"
                required 
              />
            </div>
            <div className="form-group-modern">
              <label htmlFor="mensaje" className="form-label-modern">Mensaje</label>
              <textarea 
                id="mensaje"
                name="mensaje" 
                placeholder="Describe tu consulta..." 
                rows="4" 
                className="form-textarea-modern"
                required
              ></textarea>
            </div>
            <button type="submit" className="submit-btn-modern">
              <span className="btn-icon-modern">📤</span>
              Enviar mensaje
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

export default Home;
