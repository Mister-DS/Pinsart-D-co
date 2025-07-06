import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Dashboard</h1>
        <button 
          onClick={handleSignOut}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Déconnexion
        </button>
      </div>

      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
        <h3>Bienvenue !</h3>
        <p><strong>Email :</strong> {user.email}</p>
        <p><strong>ID :</strong> {user.id}</p>
        <p><strong>Rôle :</strong> {user.user_metadata?.role || 'Non défini'}</p>
        <p><strong>Prénom :</strong> {user.user_metadata?.first_name}</p>
        <p><strong>Nom :</strong> {user.user_metadata?.last_name}</p>
      </div>
    </div>
  );
};

export default Dashboard;