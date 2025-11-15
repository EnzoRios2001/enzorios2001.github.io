
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

      {/* Accesos rápidos solo si está logeado */}
      {isLoggedIn ? (
        <nav className="home-shortcuts">
          <Link to="/perfil" className="shortcut-card">
            <span className="shortcut-icon"><i className="fa-regular fa-user"></i></span>
            <span>Mi Perfil</span>
          </Link>
          <Link to="/historial" className="shortcut-card">
            <span className="shortcut-icon"><i className="fa-solid fa-notes-medical"></i></span>
            <span>Historial Médico</span>
          </Link>
          <Link to="/info-especialistas" className="shortcut-card">
            <span className="shortcut-icon"><i className="fa-solid fa-user-doctor"></i></span>
            <span>Especialistas</span>
          </Link>
          <Link to="/emergencia" className="shortcut-card">
            <span className="shortcut-icon"><i className="fa-solid fa-triangle-exclamation"></i></span>
            <span>Emergencia</span>
          </Link>
          <Link to="/recuperar-password" className="shortcut-card">
            <span className="shortcut-icon"><i className="fa-solid fa-key"></i></span>
            <span>Cambiar Contraseña</span>
          </Link>
        </nav>
      ) : (
        <section className="home-welcome-info">
          <div className="welcome-img-group">
            <img src="https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&w=600&q=80" alt="Clínica moderna" className="welcome-img" />
          </div>
          <h2>Sobre nuestra clínica</h2>
          <p>
            Clínica Salud+ es un centro médico de excelencia, dedicado a brindar atención integral y personalizada a cada paciente. Contamos con un equipo de especialistas en cardiología, pediatría, cirugía y más, comprometidos con tu bienestar.
          </p>
          <h3>Nuestros especialistas</h3>
          <ul className="especialistas-lista">
            <li>
              <img src="https://images.unsplash.com/photo-1520880867055-1e30d1cb001c?auto=format&fit=crop&w=60&q=80" alt="Cardiólogo" className="especialista-foto" />
              <div className="especialista-info">
                <div className="especialista-nombre">Dr. Juan Pérez</div>
                <div className="especialista-especialidad">Cardiólogo</div>
              </div>
            </li>
            <li>
              <img src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=60&q=80" alt="Pediatra" className="especialista-foto" />
              <div className="especialista-info">
                <div className="especialista-nombre">Dra. Ana Gómez</div>
                <div className="especialista-especialidad">Pediatra</div>
              </div>
            </li>
            <li>
              <img src="https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=60&q=80" alt="Cirujano" className="especialista-foto" />
              <div className="especialista-info">
                <div className="especialista-nombre">Dr. Luis Martínez</div>
                <div className="especialista-especialidad">Cirujano</div>
              </div>
            </li>
            <li>
              <img src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=60&q=80" alt="Clínica General" className="especialista-foto" />
              <div className="especialista-info">
                <div className="especialista-nombre">Dra. Sofía Ramírez</div>
                <div className="especialista-especialidad">Clínica General</div>
              </div>
            </li>
          </ul>
          <p>Regístrate o inicia sesión para acceder a todos los servicios y gestionar tus turnos en línea.</p>
        </section>
      )}

      {/* Contacto moderno */}
      <section className="home-contact">
        <h3>¿Necesitas ayuda? Contáctanos</h3>
        <form className="contact-form" onSubmit={e => e.preventDefault()}>
          <input type="email" placeholder="Tu correo electrónico" required />
          <textarea placeholder="Describe tu consulta" rows="4" required></textarea>
          <button type="submit">Enviar</button>
        </form>
      </section>
    </>
  );
}

export default Home;
