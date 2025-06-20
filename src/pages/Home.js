import React from 'react';
import { Link } from 'react-router-dom';
import '../estilo.css';
import { supabase } from "../supabase/client";


function Home() {
  return (
    <>
      <div className="hero-shortcuts">
        <Link to="/perfil" className="shortcut-button">
          <span className="icon-placeholder"></span>
          <span>Mi Perfil</span>
        </Link>
        <Link to="/turno-nuevo" className="shortcut-button">
          <span className="icon-placeholder"></span>
          <span>Solicitar turno</span>
        </Link>
        <Link to="/estado-turnos" className="shortcut-button">
          <span className="icon-placeholder"></span>
          <span>Estado de turnos</span>
        </Link>
        <Link to="/historial" className="shortcut-button">
          <span className="icon-placeholder"></span>
          <span>Historial de medico</span>
        </Link>
      </div>

      <div className="categories">
        <div className="categories-grid">
          <button><span>General</span></button>
          <button><span>Especialistas</span></button>
          <button><span>Cirujanos</span></button>
          <button><span>Cardiólogo</span></button>
          <button><span>Emergencia</span></button>
          <button><span>Nosotros</span></button>
          <button><span>Ubicación</span></button>
          <button><span>Pediatra</span></button>
        </div>
      </div>

      <div className="popular" id="popularSection">
        <div className="popular-image">
          <img src="/img/fondo2.jpg" alt="Consulta médica en escritorio" />
        </div>
      </div>
      
      <div className="popular-header">
        <h3>¿Necesitas ayuda? Contactanos:</h3>
        <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="Tu correo electrónico" required />
          <textarea placeholder="Describe tu consulta" rows="4" required></textarea>
          <button type="submit">Enviar</button>
        </form>
      </div>
    </>
  );
}

export default Home;