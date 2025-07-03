import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface ServiceRequest {
  id: string;
  titre: string;
  description: string;
  type_travaux: string;
  budget_estime: number;
  statut: string;
  date_souhaitee: string;
  created_at: string;
  adresse_travaux: string;
  code_postal_travaux: string;
  ville_travaux: string;
}

interface Quote {
  id: string;
  titre: string;
  montant_total: number;
  statut: string;
  created_at: string;
  employee_id: string;
}

function ClientDashboard() {
  const [user, setUser] = useState<any>(null);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Récupérer l'utilisateur connecté et ses données
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await loadUserData(user.id);
      }
      setLoading(false);
    };

    getUser();
  }, []);

  // Charger les données du client
  const loadUserData = async (userId: string) => {
    try {
      // Récupérer les demandes de service
      const { data: requests, error: requestsError } = await supabase
        .from('service_requests')
        .select('*')
        .eq('client_id', userId)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;
      setServiceRequests(requests || []);

      // Récupérer les devis
      const { data: quotesData, error: quotesError } = await supabase
        .from('quotes')
        .select('*')
        .eq('client_id', userId)
        .order('created_at', { ascending: false });

      if (quotesError) throw quotesError;
      setQuotes(quotesData || []);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  // Déconnexion
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponible': return '#3b82f6';
      case 'prise': return '#f59e0b';
      case 'en_cours': return '#8b5cf6';
      case 'terminee': return '#10b981';
      case 'annulee': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Obtenir le texte du statut
  const getStatusText = (status: string) => {
    switch (status) {
      case 'disponible': return 'Disponible';
      case 'prise': return 'Prise en charge';
      case 'en_cours': return 'En cours';
      case 'terminee': return 'Terminée';
      case 'annulee': return 'Annulée';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          fontSize: '18px',
          color: '#6b7280'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          Chargement de votre dashboard...
        </div>
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `
        }} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '20px 0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              Pinsart Déco
            </h1>
            <p style={{ color: '#6b7280', margin: '5px 0 0 0', fontSize: '14px' }}>
              Tableau de bord client
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ color: '#374151', fontWeight: '500' }}>
              👋 Bonjour, {user?.email}
            </span>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Navigation tabs */}
        <div style={{
          display: 'flex',
          gap: '30px',
          marginBottom: '40px',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '0'
        }}>
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
            { id: 'requests', label: 'Mes demandes', icon: '📋' },
            { id: 'quotes', label: 'Mes devis', icon: '💰' },
            { id: 'profile', label: 'Mon profil', icon: '👤' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '15px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: activeTab === tab.id ? '#667eea' : '#6b7280',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '3px solid #667eea' : '3px solid transparent',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Vue d'ensemble */}
        {activeTab === 'overview' && (
          <div>
            {/* Statistiques */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '25px',
              marginBottom: '40px'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: '#ddd6fe',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    📋
                  </div>
                  <div>
                    <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                      {serviceRequests.length}
                    </h3>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
                      Demandes totales
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    💰
                  </div>
                  <div>
                    <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                      {quotes.length}
                    </h3>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
                      Devis reçus
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: '#d1fae5',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    ✅
                  </div>
                  <div>
                    <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                      {serviceRequests.filter(r => r.statut === 'terminee').length}
                    </h3>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
                      Projets terminés
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb',
              marginBottom: '30px'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 20px 0' }}>
                Actions rapides
              </h2>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <a href="/create-request" style={{
                  backgroundColor: '#667eea',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ➕ Nouvelle demande
                </a>
                <button style={{
                  backgroundColor: 'transparent',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  📞 Support
                </button>
              </div>
            </div>

            {/* Dernières demandes */}
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 20px 0' }}>
                Dernières demandes
              </h2>
              {serviceRequests.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#6b7280'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>📋</div>
                  <h3 style={{ fontSize: '18px', margin: '0 0 10px 0' }}>Aucune demande pour le moment</h3>
                  <p style={{ margin: '0 0 20px 0' }}>Créez votre première demande pour commencer !</p>
                  <a href="/create-request" style={{
                    backgroundColor: '#667eea',
                    color: 'white',
                    textDecoration: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontWeight: '600'
                  }}>
                    Créer une demande
                  </a>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {serviceRequests.slice(0, 3).map(request => (
                    <div key={request.id} style={{
                      padding: '20px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 5px 0' }}>
                          {request.titre}
                        </h4>
                        <p style={{ color: '#6b7280', margin: '0 0 5px 0', fontSize: '14px' }}>
                          {request.adresse_travaux}, {request.ville_travaux}
                        </p>
                        <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
                          Créée le {formatDate(request.created_at)}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          backgroundColor: getStatusColor(request.statut),
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {getStatusText(request.statut)}
                        </span>
                        <div style={{ marginTop: '8px', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                          {request.budget_estime}€
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mes demandes */}
        {activeTab === 'requests' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                Mes demandes de travaux
              </h2>
              <a href="/create-request" style={{
                backgroundColor: '#667eea',
                color: 'white',
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}>
                ➕ Nouvelle demande
              </a>
            </div>

            {serviceRequests.length === 0 ? (
              <div style={{
                backgroundColor: 'white',
                padding: '60px',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>📋</div>
                <h3 style={{ fontSize: '24px', color: '#1f2937', margin: '0 0 15px 0' }}>
                  Aucune demande pour le moment
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '30px', fontSize: '16px' }}>
                  Créez votre première demande pour commencer votre projet de décoration ou rénovation !
                </p>
                <a href="/create-request" style={{
                  backgroundColor: '#667eea',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '16px'
                }}>
                  Créer ma première demande
                </a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {serviceRequests.map(request => (
                  <div key={request.id} style={{
                    backgroundColor: 'white',
                    padding: '30px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 10px 0' }}>
                          {request.titre}
                        </h3>
                        <span style={{
                          backgroundColor: getStatusColor(request.statut),
                          color: 'white',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {getStatusText(request.statut)}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                          Budget: {request.budget_estime}€
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>
                          Créée le {formatDate(request.created_at)}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <p style={{ color: '#374151', margin: '0 0 15px 0', lineHeight: '1.6' }}>
                        {request.description}
                      </p>
                      <div style={{ display: 'flex', gap: '30px', fontSize: '14px', color: '#6b7280' }}>
                        <span><strong>Type:</strong> {request.type_travaux}</span>
                        <span><strong>Lieu:</strong> {request.adresse_travaux}, {request.ville_travaux}</span>
                        {request.date_souhaitee && (
                          <span><strong>Date souhaitée:</strong> {formatDate(request.date_souhaitee)}</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button style={{
                        backgroundColor: '#667eea',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '14px'
                      }}>
                        Voir détails
                      </button>
                      {request.statut === 'disponible' && (
                        <button style={{
                          backgroundColor: 'transparent',
                          color: '#ef4444',
                          border: '1px solid #ef4444',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '14px'
                        }}>
                          Annuler
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mes devis */}
        {activeTab === 'quotes' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 30px 0' }}>
              Mes devis reçus
            </h2>

            {quotes.length === 0 ? (
              <div style={{
                backgroundColor: 'white',
                padding: '60px',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>💰</div>
                <h3 style={{ fontSize: '24px', color: '#1f2937', margin: '0 0 15px 0' }}>
                  Aucun devis pour le moment
                </h3>
                <p style={{ color: '#6b7280', fontSize: '16px' }}>
                  Vos devis apparaîtront ici une fois que les professionnels auront répondu à vos demandes.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {quotes.map(quote => (
                  <div key={quote.id} style={{
                    backgroundColor: 'white',
                    padding: '30px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 10px 0' }}>
                          {quote.titre}
                        </h3>
                        <span style={{
                          backgroundColor: getStatusColor(quote.statut),
                          color: 'white',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {getStatusText(quote.statut)}
                        </span>
                        <p style={{ color: '#6b7280', margin: '15px 0 0 0', fontSize: '14px' }}>
                          Reçu le {formatDate(quote.created_at)}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                          {quote.montant_total}€
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                      <button style={{
                        backgroundColor: '#667eea',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}>
                        Voir le devis
                      </button>
                      {quote.statut === 'en_attente' && (
                        <>
                          <button style={{
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}>
                            Accepter
                          </button>
                          <button style={{
                            backgroundColor: 'transparent',
                            color: '#ef4444',
                            border: '1px solid #ef4444',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}>
                            Refuser
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mon profil */}
        {activeTab === 'profile' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 30px 0' }}>
              Mon profil
            </h2>
            <div style={{
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>👤</div>
              <h3 style={{ fontSize: '24px', color: '#1f2937', margin: '0 0 15px 0' }}>
                Gestion du profil
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '30px' }}>
                Fonctionnalité en cours de développement...
              </p>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Email: {user?.email}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientDashboard;