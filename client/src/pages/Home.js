import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🏠 Pinsart Déco</h1>
      <p>Plateforme de demande de travaux</p>
      
      <div style={{ margin: '30px 0' }}>
        {user ? (
          <div>
            <p>Bonjour {user.user_metadata?.first_name} !</p>
            <Link 
              to="/dashboard"
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                margin: '0 10px'
              }}
            >
              Mon Dashboard
            </Link>
          </div>
        ) : (
          <div>
            <Link 
              to="/login"
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                margin: '0 10px'
              }}
            >
              Se connecter
            </Link>
            <Link 
              to="/register"
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                margin: '0 10px'
              }}
            >
              S'inscrire
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;