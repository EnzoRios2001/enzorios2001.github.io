import React from 'react';
import { Link } from 'react-router-dom';
import '../estilo.css';

function Footer (){
  return (
    <footer>
      <div class="footer-container">
        <div class="footer-grid">
          <div>
            <h3>Regístrese para obtener novedades sobre los servicios:</h3>
            <input type="email" placeholder="Ingresa tu correo electrónico" />
          </div>
          <div>
            <h3>Acerca de</h3>
            <ul>
              <li>Servicios</li>
              <li>Médicos</li>
              <li>Citas</li>
            </ul>
          </div>
          <div>
            <h3>Síguenos</h3>
            <ul>
              <li>Facebook</li>
              <li>Twitter</li>
              <li>Instagram</li>
            </ul>
          </div>
          <div>
            <h3>Para Pacientes</h3>
            <ul>
              <li>Facturación de seguros</li>
              <li>Historial médico</li>
              <li>Emergencia</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
