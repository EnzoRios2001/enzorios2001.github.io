
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../estilo.css';
import { supabase } from '../supabase/client';

function Header({ isLoggedIn, userName, handleLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Cerrar el menú si se hace click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target) && !event.target.classList.contains('menu-hamburguesa')) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header>
      <div className="header-container">
        <div className="header-left">
          <div className="menu-hamburguesa" onClick={() => setMenuOpen(true)}>
            <span className="hamburguesa-linea"></span>
            <span className="hamburguesa-linea"></span>
            <span className="hamburguesa-linea"></span>
          </div>
          <Link to="/" className="titulo-clinica">
            <h1>Clinica Salud+</h1>
          </Link>
        </div>
        <div className="header-buttons">
          {isLoggedIn ? (
            <span id="userName">{userName}</span>
          ) : null}
        </div>
      </div>
      <div className={`menu-lateral-overlay${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(false)}></div>
      <nav className={`menu-lateral${menuOpen ? ' open' : ''}`} ref={menuRef}>
        <ul>
          <li><Link to="/perfil" className="menu-btn" onClick={() => setMenuOpen(false)}>Mi Perfil</Link></li>
          <li><Link to="/historial" className="menu-btn" onClick={() => setMenuOpen(false)}>Historial Médico</Link></li>
          <li><Link to="/info-especialistas" className="menu-btn" onClick={() => setMenuOpen(false)}>Especialistas</Link></li>
          <li><Link to="/emergencia" className="menu-btn" onClick={() => setMenuOpen(false)}>Emergencia</Link></li>
          <li><Link to="/recuperar-password" className="menu-btn" onClick={() => setMenuOpen(false)}>Cambiar Contraseña</Link></li>
          {isLoggedIn ? (
            <li><button className="menu-btn" onClick={() => { handleLogout(); setMenuOpen(false); }}>Cerrar sesión</button></li>
          ) : (
            <li><Link to="/login" className="menu-btn" onClick={() => setMenuOpen(false)}>Iniciar sesión</Link></li>
          )}
        </ul>
      </nav>
      <style>{`
        .header-container {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 0 32px;
          box-sizing: border-box;
          min-height: 64px;
        }
        .header-left {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 18px;
        }
        .menu-hamburguesa {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 40px;
          height: 40px;
          cursor: pointer;
        }
        .hamburguesa-linea {
          width: 28px;
          height: 4px;
          background: #1976d2;
          margin: 4px 0;
          border-radius: 2px;
          transition: all 0.3s;
        }
        .titulo-clinica {
          text-decoration: none;
        }
        .titulo-clinica h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #222;
          margin: 0;
          padding: 0;
        }
        .header-buttons {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .menu-lateral {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 20vw;
          min-width: 220px;
          max-width: 400px;
          background: #fff;
          box-shadow: 2px 0 16px rgba(0,0,0,0.12);
          z-index: 2000;
          transform: translateX(-100%);
          transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
          border-top-right-radius: 16px;
          border-bottom-right-radius: 16px;
          padding-top: 60px;
        }
        .menu-lateral.open {
          transform: translateX(0);
        }
        .menu-lateral ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .menu-lateral li {
          margin: 0;
          padding: 0;
        }
        .menu-btn {
          display: block;
          width: 100%;
          padding: 16px 32px;
          text-align: left;
          background: none;
          border: none;
          color: #1976d2;
          font-size: 1.1rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s, color 0.2s;
        }
        .menu-btn:hover {
          background: #e3f2fd;
          color: #0d47a1;
        }
        .menu-lateral-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.15);
          z-index: 1500;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }
        .menu-lateral-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }
      `}</style>
    </header>
  );
}

export default Header;
