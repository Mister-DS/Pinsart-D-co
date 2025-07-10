import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import WorkRequestForm from '../components/WorkRequests/WorkRequestForm';

const WorkRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSuccess = (workRequest) => {
    console.log('Nouvelle demande créée:', workRequest);
    // Ici on pourrait rediriger vers la liste des demandes
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Demandes de Travaux</h1>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Retour au Dashboard
        </button>
      </div>
      
      <WorkRequestForm onSuccess={handleSuccess} />
    </div>
  );
};

export default WorkRequests;