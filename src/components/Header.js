import React from 'react';
import { Link } from 'react-router-dom';

function Header({ isLoggedIn, userName, handleLogout }) {
  return (
    <header>
      <div className="header-container">
        <Link to="/">
          <h1>Clinica MedioPelo</h1>
        </Link>
        <div className="header-buttons">
          {isLoggedIn ? (
            <div id="userSection">
              <button className="nav-btn">Buscar</button>
              <button className="nav-btn">Ayuda</button>
              <button id="changeViewBtn" className="nav-btn">Cambiar Vista</button>
              <span id="userName">{userName}</span>
              <button onClick={handleLogout}>Cerrar sesión</button>
            </div>
          ) : (
            <div id="guestSection">
              <button className="nav-btn">Buscar</button>
              <button className="nav-btn">Ayuda</button>
              <Link to="/login" className="login">
                Iniciar sesión
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
