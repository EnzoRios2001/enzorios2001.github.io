
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
      <section className="home-hero">
        <div className="home-hero-bg">
          <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80" alt="Clínica moderna" />
          <div className="home-hero-overlay" />
        </div>
        <div className="home-hero-content">
          <h1>Bienvenido a Clínica Salud+</h1>
          <p>Tu salud, nuestra prioridad. Gestiona tus turnos, consulta especialistas y accede a tus servicios médicos de forma simple y rápida.</p>
          <div className="home-hero-actions">
            <Link to="/turno-nuevo" className="hero-action-btn">Solicitar turno</Link>
            {isLoggedIn && (
              <Link to="/estado-turnos" className="hero-action-btn secondary">Ver estado de turnos</Link>
            )}
          </div>
        </div>
      </section>

      {/* ...existing code... */}

      {/* Contacto moderno */}
      <section className="home-contact">
        <h3>¿Necesitas ayuda? Contáctanos</h3>
        <form className="contact-form" onSubmit={async e => {
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
          <input type="email" name="email" placeholder="Tu correo electrónico" required />
          <textarea name="mensaje" placeholder="Describe tu consulta" rows="4" required></textarea>
          <button type="submit">Enviar</button>
        </form>
      </section>
    </>
  );
}

export default Home;
