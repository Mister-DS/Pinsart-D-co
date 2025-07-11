import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';

const Dashboard = () => {
  const { user } = useAuth();
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

  if (!user) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '40px',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ fontSize: '18px', color: '#666', margin: 0 }}>Chargement de votre profil...</p>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  const getRoleInfo = () => {
    switch (userProfile?.role) {
      case 'admin':
        return {
          color: '#dc3545',
          bgColor: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
          icon: '👑',
          title: 'Administrateur',
          description: 'Accès complet à la plateforme'
        };
      case 'professional':
        return {
          color: '#007bff',
          bgColor: 'linear-gradient(135deg, #74b9ff, #0984e3)',
          icon: '🔧',
          title: 'Professionnel',
          description: 'Prestataire de services'
        };
      default:
        return {
          color: '#28a745',
          bgColor: 'linear-gradient(135deg, #55efc4, #00b894)',
          icon: '👤',
          title: 'Client',
          description: 'Utilisateur standard'
        };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 40px'
      }}>
        {/* Profile Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          marginBottom: '30px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '30px', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '24px',
              background: roleInfo.bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
              flexShrink: 0
            }}>
              {roleInfo.icon}
            </div>

            {/* User Info */}
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{
                  margin: '0 0 8px 0',
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#1f2937'
                }}>
                  {userProfile?.first_name || 'Prénom'} {userProfile?.last_name || 'Nom'}
                </h2>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '8px 16px',
                  background: roleInfo.bgColor,
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}>
                  {roleInfo.icon} {roleInfo.title}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px'
              }}>
                <div>
                  <h4 style={{
                    margin: '0 0 12px 0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Informations personnelles
                  </h4>
                  <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
                    <p style={{ margin: '4px 0' }}><strong>Email:</strong> {user.email}</p>
                    <p style={{ margin: '4px 0' }}><strong>Téléphone:</strong> {userProfile?.phone || 'Non renseigné'}</p>
                    <p style={{ margin: '4px 0' }}><strong>Ville:</strong> {userProfile?.city || 'Non renseignée'}</p>
                  </div>
                </div>

                {userProfile?.role === 'professional' && (
                  <div>
                    <h4 style={{
                      margin: '0 0 12px 0',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      Informations professionnelles
                    </h4>
                    <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
                      <p style={{ margin: '4px 0' }}><strong>Entreprise:</strong> {userProfile.company_name || 'Non définie'}</p>
                      <p style={{ margin: '4px 0' }}><strong>Tarif:</strong> {userProfile.hourly_rate ? `${userProfile.hourly_rate}€/h` : 'Non défini'}</p>
                      <p style={{ margin: '4px 0' }}><strong>Note:</strong> ⭐ {userProfile.rating}/5 ({userProfile.total_reviews} avis)</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Special Role Cards */}
        {userProfile?.role === 'professional' && (
          <div style={{
            background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
            borderRadius: '20px',
            padding: '30px',
            marginBottom: '30px',
            border: '1px solid rgba(33, 150, 243, 0.1)',
            boxShadow: '0 8px 25px rgba(33, 150, 243, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2196f3, #1976d2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginRight: '15px',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)'
              }}>
                🔧
              </div>
              <div>
                <h3 style={{ margin: '0', fontSize: '20px', fontWeight: '600', color: '#1565c0' }}>
                  Espace Professionnel
                </h3>
                <p style={{ margin: '4px 0 0 0', color: '#1976d2', fontSize: '14px' }}>
                  Gérez vos services et demandes clients
                </p>
              </div>
            </div>
            
            {userProfile.specialties && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.7)',
                borderRadius: '12px',
                padding: '15px',
                marginTop: '15px'
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '600', color: '#1565c0' }}>
                  Spécialités
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {userProfile.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '4px 12px',
                        background: 'linear-gradient(135deg, #2196f3, #1976d2)',
                        color: 'white',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {userProfile?.role === 'admin' && (
          <div style={{
            background: 'linear-gradient(135deg, #ffebee, #ffcdd2)',
            borderRadius: '20px',
            padding: '30px',
            marginBottom: '30px',
            border: '1px solid rgba(244, 67, 54, 0.1)',
            boxShadow: '0 8px 25px rgba(244, 67, 54, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginRight: '15px',
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)'
              }}>
                👑
              </div>
              <div>
                <h3 style={{ margin: '0', fontSize: '20px', fontWeight: '600', color: '#c62828' }}>
                  Accès Administrateur
                </h3>
                <p style={{ margin: '4px 0 0 0', color: '#d32f2f', fontSize: '14px' }}>
                  Vous avez tous les privilèges sur la plateforme
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          <Link 
            to="/work-requests"
            style={{
              display: 'block',
              padding: '24px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              textDecoration: 'none',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-5px)';
              e.target.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(135deg, #28a745, #20c997)'
            }}></div>
            
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #28a745, #20c997)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                marginRight: '12px',
                boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
              }}>
                📋
              </div>
              <h3 style={{
                margin: '0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                {userProfile?.role === 'professional' ? 'Demandes reçues' : 'Créer une demande'}
              </h3>
            </div>
            
            <p style={{
              margin: '0',
              color: '#6b7280',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              {userProfile?.role === 'professional' 
                ? 'Consultez et gérez les demandes de travaux de vos clients'
                : 'Créez une nouvelle demande de travaux et trouvez un professionnel'
              }
            </p>
          </Link>

          {userProfile?.role === 'professional' && (
            <Link 
              to="/professionals"
              style={{
                display: 'block',
                padding: '24px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                textDecoration: 'none',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(135deg, #007bff, #0056b3)'
              }}></div>
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #007bff, #0056b3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  marginRight: '12px',
                  boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)'
                }}>
                  🔧
                </div>
                <h3 style={{
                  margin: '0',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  Espace Professionnel
                </h3>
              </div>
              
              <p style={{
                margin: '0',
                color: '#6b7280',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                Gérez votre profil professionnel, vos services et vos tarifs
              </p>
            </Link>
          )}

          {userProfile?.role === 'admin' && (
            <Link 
              to="/admin"
              style={{
                display: 'block',
                padding: '24px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                textDecoration: 'none',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(135deg, #dc3545, #c82333)'
              }}></div>
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #dc3545, #c82333)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  marginRight: '12px',
                  boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)'
                }}>
                  ⚙️
                </div>
                <h3 style={{
                  margin: '0',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  Administration
                </h3>
              </div>
              
              <p style={{
                margin: '0',
                color: '#6b7280',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                Gérez les utilisateurs, modérez le contenu et configurez la plateforme
              </p>
            </Link>
          )}
        </div>

        {/* Warning for incomplete profile */}
        {!userProfile && (
          <div style={{
            marginTop: '30px',
            padding: '24px',
            background: 'linear-gradient(135deg, #fff3cd, #ffeaa7)',
            border: '1px solid #ffc107',
            borderRadius: '20px',
            boxShadow: '0 8px 25px rgba(255, 193, 7, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ffc107, #ff8f00)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginRight: '15px',
                boxShadow: '0 4px 12px rgba(255, 193, 7, 0.4)'
              }}>
                ⚠️
              </div>
              <div>
                <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '600', color: '#856404' }}>
                  Profil incomplet
                </h3>
                <p style={{ margin: '4px 0 0 0', color: '#856404', fontSize: '14px' }}>
                  Votre profil utilisateur n'a pas été créé correctement. Contactez l'administrateur.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;