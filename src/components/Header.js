
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
    <header className="header-modern">
      <div className="header-container-modern">
        <div className="header-left-modern">
          <div className="menu-hamburguesa-modern" onClick={() => setMenuOpen(true)}>
            <span className="hamburguesa-linea-modern"></span>
            <span className="hamburguesa-linea-modern"></span>
            <span className="hamburguesa-linea-modern"></span>
          </div>
          <Link to="/" className="titulo-clinica-modern">
            <div className="logo-modern">
              <span className="logo-icon-modern">🏥</span>
              <h1 className="logo-text-modern">Clinica Salud+</h1>
            </div>
          </Link>
        </div>
        <div className="header-right-modern">
          {isLoggedIn ? (
            <div className="auth-container-modern">
              <div className="user-info-modern">
                <span className="user-name-modern">{userName}</span>
                <div className="user-avatar-modern">
                  <span className="avatar-icon-modern">👤</span>
                </div>
              </div>
              <button className="logout-btn-modern" onClick={handleLogout} title="Cerrar sesión">
                <span className="logout-icon-modern">🚫</span>
                <span className="logout-text-modern">Cerrar sesión</span>
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-btn-modern">
              <span className="login-text-modern">Iniciar sesión</span>
            </Link>
          )}
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
        </ul>
      </nav>
      <style>{`
        /* Header Modern Styling */
        .header-modern {
          background: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(10px);
        }
        
        .header-container-modern {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          min-height: 72px;
          box-sizing: border-box;
        }
        
        .header-left-modern {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 20px;
        }
        
        .menu-hamburguesa-modern {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 44px;
          height: 44px;
          cursor: pointer;
          border-radius: 8px;
          transition: background 0.2s ease;
          padding: 8px;
        }
        
        .menu-hamburguesa-modern:hover {
          background: #f3f4f6;
        }
        
        .hamburguesa-linea-modern {
          width: 24px;
          height: 3px;
          background: #2563eb;
          margin: 3px 0;
          border-radius: 2px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .logo-modern {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }
        
        .logo-icon-modern {
          font-size: 1.5rem;
          color: #2563eb;
          background: #e0e7ff;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }
        
        .logo-modern:hover .logo-icon-modern {
          transform: scale(1.05);
        }
        
        .logo-text-modern {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
          padding: 0;
          letter-spacing: -0.025em;
        }
        
        .header-right-modern {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .auth-container-modern {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .user-info-modern {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f8fafc;
          padding: 8px 16px;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
        }
        
        .user-info-modern:hover {
          background: #e0e7ff;
          border-color: #c7d2fe;
        }
        
        .user-name-modern {
          font-size: 0.95rem;
          font-weight: 500;
          color: #374151;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .user-avatar-modern {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }
        
        .avatar-icon-modern {
          font-size: 1rem;
          color: #fff;
        }
        
        .user-info-modern:hover .user-avatar-modern {
          transform: scale(1.1);
        }
        
        .logout-btn-modern {
          background: #dc2626;
          border: 2px solid #dc2626;
          padding: 8px 16px;
          border-radius: 24px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-left: 4px;
          color: white;
          font-weight: 500;
          font-size: 0.9rem;
        }
        
        .logout-btn-modern:hover {
          background: #b91c1c;
          border-color: #b91c1c;
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
        }
        
        .logout-icon-modern {
          font-size: 1.1rem;
          color: #fff;
          font-weight: bold;
        }
        
        .logout-text-modern {
          font-size: 0.85rem;
          color: #fff;
          white-space: nowrap;
        }
        
        .login-btn-modern {
          display: flex;
          align-items: center;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          padding: 10px 20px;
          border-radius: 24px;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(37, 99, 235, 0.2);
        }
        
        .login-btn-modern:hover {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
        
        .login-text-modern {
          font-size: 0.9rem;
          white-space: nowrap;
        }
        
        /* Enhanced Menu Lateral */
        .menu-lateral {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 280px;
          background: #fff;
          box-shadow: 4px 0 20px rgba(0,0,0,0.15);
          z-index: 2000;
          transform: translateX(-100%);
          transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
          border-top-right-radius: 20px;
          border-bottom-right-radius: 20px;
          padding-top: 80px;
          overflow-y: auto;
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
          border-bottom: 1px solid #f1f5f9;
        }
        
        .menu-lateral li:last-child {
          border-bottom: none;
        }
        
        .menu-btn {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 16px 24px;
          text-align: left;
          background: none;
          border: none;
          color: #374151;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .menu-btn:hover {
          background: #f8fafc;
          color: #2563eb;
          padding-left: 28px;
        }
        
        .menu-btn::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 0;
          background: #2563eb;
          transition: height 0.2s ease;
        }
        
        .menu-btn:hover::before {
          height: 60%;
        }
        
        .menu-lateral-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(2px);
          z-index: 1500;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        
        .menu-lateral-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .header-container-modern {
            padding: 0 16px;
            min-height: 64px;
          }
          
          .logo-text-modern {
            font-size: 1.25rem;
          }
          
          .user-name-modern {
            display: none;
          }
          
          .login-text-modern {
            display: inline;
            font-size: 0.8rem;
          }
          
          .login-btn-modern {
            padding: 10px 16px;
            font-size: 0.85rem;
          }
          
          .auth-container-modern {
            gap: 6px;
          }
          
          .logout-btn-modern {
            padding: 8px;
            border-radius: 50%;
            margin-left: 2px;
          }
          
          .logout-text-modern {
            display: none;
          }
          
          .menu-lateral {
            width: 260px;
          }
        }
        
        @media (max-width: 480px) {
          .header-container-modern {
            padding: 0 12px;
          }
          
          .logo-icon-modern {
            width: 36px;
            height: 36px;
            font-size: 1.25rem;
          }
          
          .logo-text-modern {
            font-size: 1.125rem;
          }
        }
      `}</style>
    </header>
  );
}

export default Header;
