import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Chargement...</p>
      </div>
    );
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
        <p><strong>Rôle :</strong> {userProfile?.role || 'Non défini'}</p>
        <p><strong>Prénom :</strong> {userProfile?.first_name || user.user_metadata?.first_name || 'Non défini'}</p>
        <p><strong>Nom :</strong> {userProfile?.last_name || user.user_metadata?.last_name || 'Non défini'}</p>
        
        {userProfile?.role === 'professional' && (
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
            <h4>Informations Professionnel</h4>
            <p><strong>Entreprise :</strong> {userProfile.company_name || 'Non définie'}</p>
            <p><strong>Spécialités :</strong> {userProfile.specialties?.join(', ') || 'Non définies'}</p>
            <p><strong>Tarif horaire :</strong> {userProfile.hourly_rate ? `${userProfile.hourly_rate}€/h` : 'Non défini'}</p>
            <p><strong>Note :</strong> {userProfile.rating}/5 ({userProfile.total_reviews} avis)</p>
          </div>
        )}

        {userProfile?.role === 'admin' && (
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
            <h4>🔧 Accès Administrateur</h4>
            <p>Vous avez accès aux fonctions d'administration.</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <Link 
          to="/work-requests"
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            display: 'inline-block'
          }}
        >
          {userProfile?.role === 'professional' ? 'Voir les demandes' : 'Créer une demande de travaux'}
        </Link>

        {userProfile?.role === 'professional' && (
          <Link 
            to="/professionals"
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
            🔧 Espace Professionnel
          </Link>
        )}

        {userProfile?.role === 'admin' && (
          <>
            <Link 
              to="/professionals"
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                display: 'inline-block'
              }}
            >
              🔧 Espace Professionnel
            </Link>
            <Link 
              to="/admin"
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                display: 'inline-block'
              }}
            >
              Administration
            </Link>
          </>
        )}
      </div>

      {!userProfile && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '4px' }}>
          <p><strong>⚠️ Profil incomplet</strong></p>
          <p>Votre profil utilisateur n'a pas été créé correctement. Contactez l'administrateur.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;