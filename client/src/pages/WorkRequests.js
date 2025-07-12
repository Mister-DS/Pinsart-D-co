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
  };

  return (
    <div style={{ padding: '20px' }}>
      <WorkRequestForm onSuccess={handleSuccess} />
    </div>
  );
};

export default WorkRequests;