import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase/client';
import './App.css';
import './estilo.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Componentes
import Header from './components/Header';
import Footer from './components/Footer';

// Páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import EstadoTurnos from './pages/EstadoTurnos';
import TurnoNuevo from './pages/TurnoNuevo'; 
import HistorialMedico from './pages/HistorialMedico'; 
import InfoEspecialistas from './pages/InfoEspecialistas'; 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar el estado de autenticación inicial
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);
        if (user) {
          setUserName(user.email);
          sessionStorage.setItem('usuario', user.email);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Suscribirse a cambios en el estado de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      if (session?.user) {
        setUserName(session.user.email);
        sessionStorage.setItem('usuario', session.user.email);
      } else {
        setUserName('');
        sessionStorage.removeItem('usuario');
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      sessionStorage.removeItem('usuario');
      setIsLoggedIn(false);
      setUserName('');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Componente para rutas protegidas
  const PrivateRoute = ({ children }) => {
    if (loading) {
      return <div>Cargando...</div>;
    }
    return isLoggedIn ? children : <Navigate to="/login" />;
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="App">
      <Header isLoggedIn={isLoggedIn} userName={userName} handleLogout={handleLogout} />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {/* Rutas protegidas */}
        <Route
          path="/perfil"
          element={
            <PrivateRoute>
              <Perfil />
            </PrivateRoute>
          }
        />
        <Route
          path="/estado-turnos"
          element={
            <PrivateRoute>
              <EstadoTurnos />
            </PrivateRoute>
          }
        />
        <Route
          path="/historial"
          element={
            <PrivateRoute>
              <HistorialMedico />
            </PrivateRoute>
          }
        />

        <Route
          path="/turno-nuevo"
          element={
            <PrivateRoute>
              <TurnoNuevo />
            </PrivateRoute>
          }
        />
          <Route
          path="/info-especialistas"
          element={
            <PrivateRoute>
              <InfoEspecialistas />
            </PrivateRoute>
          }
        />
        
        {/* Ruta para páginas no encontradas */}
        <Route path="*" element={<div>Página no encontrada</div>} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
