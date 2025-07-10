import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Import Supabase directement
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const ProfessionalsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [workRequests, setWorkRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    category: 'all',
    city: '',
    minBudget: '',
    maxBudget: '',
    urgency: 'all'
  });
  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [refuseReason, setRefuseReason] = useState('');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteData, setQuoteData] = useState({
    amount: '',
    description: '',
    duration: '',
    conditions: ''
  });

  useEffect(() => {
    if (user) {
      checkProfessionalAccess();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (userProfile) {
      fetchWorkRequests();
      fetchMyApplications();
      calculateStats();
    }
  }, [userProfile, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkProfessionalAccess = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !data || (data.role !== 'professional' && data.role !== 'admin')) {
        navigate('/dashboard');
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Erreur de vérification accès professionnel:', error);
      navigate('/dashboard');
    }
  };

  const fetchWorkRequests = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('work_requests_with_users')
        .select('*')
        .order('created_at', { ascending: false });

      // Filtres selon l'onglet actif
      if (activeTab === 'new') {
        query = query.eq('status', 'pending');
      } else if (activeTab === 'accepted') {
        query = query.eq('status', 'assigned').eq('assigned_to', user.id);
      } else if (activeTab === 'in_progress') {
        query = query.eq('status', 'in_progress').eq('assigned_to', user.id);
      } else if (activeTab === 'completed') {
        query = query.eq('status', 'completed').eq('assigned_to', user.id);
      } else if (activeTab === 'refused') {
        query = query.eq('status', 'cancelled').eq('assigned_to', user.id);
      }

      // Filtres additionnels
      if (filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters.city) {
        query = query.ilike('location_city', `%${filters.city}%`);
      }
      if (filters.urgency !== 'all') {
        query = query.eq('urgency', filters.urgency);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filtrer par budget côté client si nécessaire
      let filteredData = data || [];
      if (filters.minBudget) {
        filteredData = filteredData.filter(req => 
          req.budget_min >= parseFloat(filters.minBudget)
        );
      }
      if (filters.maxBudget) {
        filteredData = filteredData.filter(req => 
          req.budget_max <= parseFloat(filters.maxBudget)
        );
      }

      setWorkRequests(filteredData);
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    // Ici on récupérerait les candidatures du professionnel
    // Pour l'instant on simule - fonction vide pour éviter les warnings
  };

  const calculateStats = async () => {
    try {
      // Calculer les statistiques du professionnel
      const { data: completedRequests, error } = await supabase
        .from('work_requests')
        .select('budget_max, budget_min')
        .eq('assigned_to', user.id)
        .eq('status', 'completed');

      if (error) throw error;

      const totalRevenue = completedRequests.reduce((sum, req) => {
        return sum + (req.budget_max || req.budget_min || 0);
      }, 0);

      const { data: allMyRequests } = await supabase
        .from('work_requests')
        .select('status')
        .eq('assigned_to', user.id);

      const statusCounts = allMyRequests?.reduce((acc, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1;
        return acc;
      }, {}) || {};

      setStats({
        totalRevenue,
        completedJobs: statusCounts.completed || 0,
        inProgressJobs: statusCounts.in_progress || 0,
        totalJobs: allMyRequests?.length || 0,
        acceptanceRate: allMyRequests?.length > 0 ? 
          ((statusCounts.completed || 0) + (statusCounts.in_progress || 0)) / allMyRequests.length * 100 : 0
      });
    } catch (error) {
      console.error('Erreur calcul statistiques:', error);
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('work_requests')
        .update({ 
          assigned_to: user.id, 
          status: 'assigned' 
        })
        .eq('id', requestId);

      if (error) throw error;

      alert('Demande acceptée avec succès ! En attente de votre devis.');
      fetchWorkRequests();
    } catch (error) {
      console.error('Erreur acceptation:', error);
      alert('Erreur lors de l\'acceptation');
    }
  };

  const openRefuseModal = (request) => {
    setSelectedRequest(request);
    setShowRefuseModal(true);
    setRefuseReason('');
  };

  const openQuoteModal = (request) => {
    setSelectedRequest(request);
    setShowQuoteModal(true);
    setQuoteData({
      amount: '',
      description: '',
      duration: '',
      conditions: ''
    });
  };

  const submitQuote = async () => {
    if (!quoteData.amount || !quoteData.description) {
      alert('Veuillez remplir au moins le montant et la description');
      return;
    }

    try {
      const quoteText = `DEVIS PROFESSIONNEL:
Montant: ${quoteData.amount}€
Description: ${quoteData.description}
Durée estimée: ${quoteData.duration || 'Non spécifiée'}
Conditions: ${quoteData.conditions || 'Selon conditions générales'}
---
Devis soumis par: ${userProfile?.company_name || userProfile?.first_name + ' ' + userProfile?.last_name}`;

      const { error } = await supabase
        .from('work_requests')
        .update({ 
          notes: quoteText,
          // On peut aussi mettre à jour le budget avec le devis
          budget_max: parseFloat(quoteData.amount)
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      alert('Devis envoyé avec succès !');
      setShowQuoteModal(false);
      setSelectedRequest(null);
      setQuoteData({
        amount: '',
        description: '',
        duration: '',
        conditions: ''
      });
      fetchWorkRequests();
    } catch (error) {
      console.error('Erreur envoi devis:', error);
      alert('Erreur lors de l\'envoi du devis');
    }
  };

  const refuseRequest = async () => {
    if (!refuseReason.trim()) {
      alert('Veuillez indiquer une raison de refus');
      return;
    }

    try {
      const { error } = await supabase
        .from('work_requests')
        .update({ 
          status: 'cancelled',
          notes: `Refusé par ${userProfile?.company_name || 'professionnel'}: ${refuseReason}`,
          assigned_to: user.id
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      alert('Demande refusée avec succès.');
      setShowRefuseModal(false);
      setSelectedRequest(null);
      setRefuseReason('');
      fetchWorkRequests();
    } catch (error) {
      console.error('Erreur refus:', error);
      alert('Erreur lors du refus');
    }
  };

  const updateRequestStatus = async (requestId, newStatus) => {
    try {
      const { error } = await supabase
        .from('work_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      alert('Statut mis à jour avec succès !');
      fetchWorkRequests();
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      case 'critical': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'assigned': return '#3b82f6';
      case 'in_progress': return '#8b5cf6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const StatCard = ({ title, value, subtitle, color, icon }) => (
    <div style={{
      background: 'white',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: color
      }}></div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>{title}</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: '700', color: '#111827' }}>{value}</p>
          {subtitle && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>{subtitle}</p>}
        </div>
        <div style={{ 
          fontSize: '32px', 
          backgroundColor: color + '20', 
          padding: '12px', 
          borderRadius: '12px',
          color: color 
        }}>
          {icon}
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, count, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 20px',
        backgroundColor: active ? '#3b82f6' : 'transparent',
        color: active ? 'white' : '#6b7280',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s ease'
      }}
    >
      {label}
      {count !== undefined && (
        <span style={{
          backgroundColor: active ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
          color: active ? 'white' : '#6b7280',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {count}
        </span>
      )}
    </button>
  );

  const RequestCard = ({ request, showActions = true }) => (
    <div style={{
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>
            {request.title}
          </h3>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
            {request.description}
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <span style={{
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: '#f3f4f6',
              color: '#374151'
            }}>
              📂 {request.category}
            </span>
            <span style={{
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: getUrgencyColor(request.urgency) + '20',
              color: getUrgencyColor(request.urgency)
            }}>
              ⚡ {request.urgency}
            </span>
            <span style={{
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: '#e5e7eb',
              color: '#374151'
            }}>
              📍 {request.location_city}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: getStatusColor(request.status) + '20',
              color: getStatusColor(request.status)
            }}>
              {request.status}
            </span>
          </div>
          {(request.budget_min || request.budget_max) && (
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#10b981' }}>
              {request.budget_min && request.budget_max ? 
                `${formatPrice(request.budget_min)} - ${formatPrice(request.budget_max)}` :
                formatPrice(request.budget_max || request.budget_min)
              }
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          <strong>Client:</strong> {request.client_first_name} {request.client_last_name}
          <br />
          <strong>Publié le:</strong> {formatDate(request.created_at)}
          {request.desired_date && (
            <>
              <br />
              <strong>Date souhaitée:</strong> {formatDate(request.desired_date)}
            </>
          )}
        </div>

        {showActions && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {activeTab === 'new' && (
              <>
                <button
                  onClick={() => acceptRequest(request.id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  ✅ Accepter
                </button>
                <button
                  onClick={() => openRefuseModal(request)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  ❌ Refuser
                </button>
              </>
            )}
            {activeTab === 'accepted' && (
              <>
                <button
                  onClick={() => openQuoteModal(request)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  💰 Faire un devis
                </button>
                <button
                  onClick={() => updateRequestStatus(request.id, 'in_progress')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  🚀 Démarrer travaux
                </button>
              </>
            )}
            {activeTab === 'in_progress' && (
              <button
                onClick={() => updateRequestStatus(request.id, 'completed')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                ✅ Terminer
              </button>
            )}
          </div>
        )}
      </div>

      {request.images && request.images.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
            Photos du projet:
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {request.images.slice(0, 3).map((imageUrl, index) => (
              <img
                key={index}
                src={imageUrl}
                alt={`Projet ${index + 1}`}
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb'
                }}
              />
            ))}
            {request.images.length > 3 && (
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                +{request.images.length - 3}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (loading && !userProfile) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ margin: 0, fontSize: '16px', color: '#6b7280' }}>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '32px',
              fontWeight: '700',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              🔧 Espace Professionnel
            </h1>
            <p style={{
              margin: '8px 0 0 0',
              fontSize: '16px',
              color: 'rgba(255,255,255,0.8)'
            }}>
              Gérez vos demandes de travaux et développez votre activité
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s ease'
            }}
          >
            ← Retour au Dashboard
          </button>
        </div>

        {/* Navigation */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '8px',
          borderRadius: '16px',
          marginBottom: '32px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            <TabButton
              id="dashboard"
              label="📊 Dashboard"
              active={activeTab === 'dashboard'}
              onClick={setActiveTab}
            />
            <TabButton
              id="new"
              label="🆕 Nouvelles demandes"
              count={workRequests.filter(r => r.status === 'pending').length}
              active={activeTab === 'new'}
              onClick={setActiveTab}
            />
            <TabButton
              id="accepted"
              label="✅ Acceptées (en attente devis)"
              count={workRequests.filter(r => r.status === 'assigned' && r.assigned_to === user.id).length}
              active={activeTab === 'accepted'}
              onClick={setActiveTab}
            />
            <TabButton
              id="in_progress"
              label="🔄 En cours"
              count={workRequests.filter(r => r.status === 'in_progress' && r.assigned_to === user.id).length}
              active={activeTab === 'in_progress'}
              onClick={setActiveTab}
            />
            <TabButton
              id="completed"
              label="✅ Terminées"
              count={workRequests.filter(r => r.status === 'completed' && r.assigned_to === user.id).length}
              active={activeTab === 'completed'}
              onClick={setActiveTab}
            />
            <TabButton
              id="refused"
              label="❌ Refusées"
              count={workRequests.filter(r => r.status === 'cancelled' && r.assigned_to === user.id).length}
              active={activeTab === 'refused'}
              onClick={setActiveTab}
            />
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'dashboard' && (
            <div>
              {/* Statistiques */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
              }}>
                <StatCard
                  title="Revenus totaux"
                  value={formatPrice(stats.totalRevenue || 0)}
                  subtitle="Demandes terminées"
                  color="#10b981"
                  icon="💰"
                />
                <StatCard
                  title="Projets terminés"
                  value={stats.completedJobs || 0}
                  subtitle={`${stats.totalJobs || 0} projets au total`}
                  color="#3b82f6"
                  icon="✅"
                />
                <StatCard
                  title="Projets en cours"
                  value={stats.inProgressJobs || 0}
                  subtitle="Travaux actifs"
                  color="#8b5cf6"
                  icon="🔄"
                />
                <StatCard
                  title="Taux d'acceptation"
                  value={`${Math.round(stats.acceptanceRate || 0)}%`}
                  subtitle="Performance générale"
                  color="#f59e0b"
                  icon="📈"
                />
              </div>

              {/* Profil professionnel */}
              <div style={{
                backgroundColor: 'white',
                padding: '32px',
                borderRadius: '20px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                border: '1px solid #f3f4f6'
              }}>
                <h2 style={{
                  margin: '0 0 24px 0',
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#111827'
                }}>
                  Mon Profil Professionnel
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '24px'
                }}>
                  <div>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
                      Informations générales
                    </h3>
                    <p><strong>Entreprise :</strong> {userProfile?.company_name || 'Non définie'}</p>
                    <p><strong>SIRET :</strong> {userProfile?.siret || 'Non défini'}</p>
                    <p><strong>Tarif horaire :</strong> {userProfile?.hourly_rate ? `${userProfile.hourly_rate}€/h` : 'Non défini'}</p>
                    <p><strong>Note moyenne :</strong> ⭐ {userProfile?.rating || 0}/5 ({userProfile?.total_reviews || 0} avis)</p>
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
                      Spécialités
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {userProfile?.specialties?.map((specialty, index) => (
                        <span
                          key={index}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          {specialty}
                        </span>
                      )) || <span style={{ color: '#6b7280' }}>Aucune spécialité définie</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'dashboard' && (
            <div>
              {/* Filtres */}
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '16px',
                marginBottom: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #f3f4f6'
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                  Filtres
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px'
                    }}
                  >
                    <option value="all">Toutes catégories</option>
                    <option value="plomberie">Plomberie</option>
                    <option value="electricite">Électricité</option>
                    <option value="peinture">Peinture</option>
                    <option value="menuiserie">Menuiserie</option>
                    <option value="carrelage">Carrelage</option>
                    <option value="jardinage">Jardinage</option>
                    <option value="autre">Autre</option>
                  </select>
                  
                  <input
                    type="number"
                    placeholder="Budget min..."
                    value={filters.minBudget}
                    onChange={(e) => setFilters({...filters, minBudget: e.target.value})}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px'
                    }}
                  />

                  <input
                    type="number"
                    placeholder="Budget max..."
                    value={filters.maxBudget}
                    onChange={(e) => setFilters({...filters, maxBudget: e.target.value})}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px'
                    }}
                  />

                  <select
                    value={filters.urgency}
                    onChange={(e) => setFilters({...filters, urgency: e.target.value})}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px'
                    }}
                  >
                    <option value="all">Toute urgence</option>
                    <option value="low">🟢 Pas urgent</option>
                    <option value="medium">🟡 Modéré</option>
                    <option value="high">🟠 Urgent</option>
                    <option value="critical">🔴 Très urgent</option>
                  </select>

                  <button
                    onClick={fetchWorkRequests}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Appliquer filtres
                  </button>
                </div>
              </div>

              {/* Liste des demandes */}
              {loading ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '60px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f4f6',
                    borderTop: '4px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                </div>
              ) : workRequests.length === 0 ? (
                <div style={{
                  backgroundColor: 'white',
                  padding: '60px',
                  borderRadius: '16px',
                  textAlign: 'center',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #f3f4f6'
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600', color: '#111827' }}>
                    Aucune demande trouvée
                  </h3>
                  <p style={{ margin: 0, color: '#6b7280' }}>
                    {activeTab === 'new' ? 
                      'Aucune nouvelle demande disponible pour le moment.' :
                      `Aucune demande ${activeTab === 'accepted' ? 'acceptée' : 
                                       activeTab === 'in_progress' ? 'en cours' :
                                       activeTab === 'completed' ? 'terminée' : 'refusée'} trouvée.`
                    }
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
                  gap: '24px'
                }}>
                  {workRequests.map(request => (
                    <RequestCard 
                      key={request.id} 
                      request={request} 
                      showActions={activeTab !== 'completed' && activeTab !== 'refused'}
                    />
                  ))}
                </div>
              )}

              {/* Récapitulatif financier pour les demandes terminées */}
              {activeTab === 'completed' && workRequests.length > 0 && (
                <div style={{
                  backgroundColor: 'white',
                  padding: '32px',
                  borderRadius: '20px',
                  marginTop: '32px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #f3f4f6'
                }}>
                  <h2 style={{
                    margin: '0 0 24px 0',
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#111827'
                  }}>
                    💰 Récapitulatif Financier
                  </h2>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '24px',
                    marginBottom: '24px'
                  }}>
                    <div style={{
                      padding: '20px',
                      backgroundColor: '#f0f9ff',
                      borderRadius: '12px',
                      border: '1px solid #bae6fd'
                    }}>
                      <h4 style={{ margin: '0 0 8px 0', color: '#0c4a6e' }}>Revenus ce mois</h4>
                      <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#0c4a6e' }}>
                        {formatPrice(workRequests
                          .filter(r => new Date(r.updated_at).getMonth() === new Date().getMonth())
                          .reduce((sum, r) => sum + (r.budget_max || r.budget_min || 0), 0)
                        )}
                      </p>
                    </div>
                    
                    <div style={{
                      padding: '20px',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '12px',
                      border: '1px solid #bbf7d0'
                    }}>
                      <h4 style={{ margin: '0 0 8px 0', color: '#14532d' }}>Total des revenus</h4>
                      <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#14532d' }}>
                        {formatPrice(workRequests.reduce((sum, r) => sum + (r.budget_max || r.budget_min || 0), 0))}
                      </p>
                    </div>
                    
                    <div style={{
                      padding: '20px',
                      backgroundColor: '#fefce8',
                      borderRadius: '12px',
                      border: '1px solid #fde047'
                    }}>
                      <h4 style={{ margin: '0 0 8px 0', color: '#713f12' }}>Revenus moyens/projet</h4>
                      <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#713f12' }}>
                        {formatPrice(workRequests.length > 0 ? 
                          workRequests.reduce((sum, r) => sum + (r.budget_max || r.budget_min || 0), 0) / workRequests.length : 
                          0
                        )}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    overflowX: 'auto'
                  }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'separate',
                      borderSpacing: 0
                    }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f9fafb' }}>
                          <th style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#6b7280',
                            textTransform: 'uppercase',
                            borderBottom: '1px solid #e5e7eb'
                          }}>
                            Projet
                          </th>
                          <th style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#6b7280',
                            textTransform: 'uppercase',
                            borderBottom: '1px solid #e5e7eb'
                          }}>
                            Client
                          </th>
                          <th style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#6b7280',
                            textTransform: 'uppercase',
                            borderBottom: '1px solid #e5e7eb'
                          }}>
                            Terminé le
                          </th>
                          <th style={{
                            padding: '12px 16px',
                            textAlign: 'right',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#6b7280',
                            textTransform: 'uppercase',
                            borderBottom: '1px solid #e5e7eb'
                          }}>
                            Montant
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {workRequests.map((request, index) => (
                          <tr key={request.id} style={{
                            backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb'
                          }}>
                            <td style={{
                              padding: '12px 16px',
                              borderBottom: '1px solid #e5e7eb',
                              fontSize: '14px',
                              color: '#111827'
                            }}>
                              {request.title}
                            </td>
                            <td style={{
                              padding: '12px 16px',
                              borderBottom: '1px solid #e5e7eb',
                              fontSize: '14px',
                              color: '#6b7280'
                            }}>
                              {request.client_first_name} {request.client_last_name}
                            </td>
                            <td style={{
                              padding: '12px 16px',
                              borderBottom: '1px solid #e5e7eb',
                              fontSize: '14px',
                              color: '#6b7280'
                            }}>
                              {formatDate(request.updated_at)}
                            </td>
                            <td style={{
                              padding: '12px 16px',
                              borderBottom: '1px solid #e5e7eb',
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#10b981',
                              textAlign: 'right'
                            }}>
                              {formatPrice(request.budget_max || request.budget_min || 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                          <td colSpan="3" style={{
                            padding: '16px',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#111827',
                            borderTop: '2px solid #e5e7eb'
                          }}>
                            Total
                          </td>
                          <td style={{
                            padding: '16px',
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#10b981',
                            textAlign: 'right',
                            borderTop: '2px solid #e5e7eb'
                          }}>
                            {formatPrice(workRequests.reduce((sum, r) => sum + (r.budget_max || r.budget_min || 0), 0))}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de devis */}
      {showQuoteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '24px',
              fontWeight: '600',
              color: '#111827'
            }}>
              💰 Créer un devis
            </h3>
            
            <div style={{
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
                <strong>Projet :</strong> {selectedRequest?.title}
              </p>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
                <strong>Client :</strong> {selectedRequest?.client_first_name} {selectedRequest?.client_last_name}
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                <strong>Budget indicatif :</strong> {
                  selectedRequest?.budget_min && selectedRequest?.budget_max ? 
                    `${formatPrice(selectedRequest.budget_min)} - ${formatPrice(selectedRequest.budget_max)}` :
                    formatPrice(selectedRequest?.budget_max || selectedRequest?.budget_min || 0)
                }
              </p>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Montant du devis (€) *
              </label>
              <input
                type="number"
                value={quoteData.amount}
                onChange={(e) => setQuoteData({...quoteData, amount: e.target.value})}
                placeholder="Ex: 1500"
                min="0"
                step="0.01"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Description détaillée des travaux *
              </label>
              <textarea
                value={quoteData.description}
                onChange={(e) => setQuoteData({...quoteData, description: e.target.value})}
                placeholder="Détaillez les travaux inclus dans ce devis, les matériaux, la main d'oeuvre..."
                rows="4"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Durée estimée
                </label>
                <input
                  type="text"
                  value={quoteData.duration}
                  onChange={(e) => setQuoteData({...quoteData, duration: e.target.value})}
                  placeholder="Ex: 3 jours"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Validité du devis
                </label>
                <input
                  type="text"
                  value={quoteData.validity || '30 jours'}
                  onChange={(e) => setQuoteData({...quoteData, validity: e.target.value})}
                  placeholder="Ex: 30 jours"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Conditions particulières
              </label>
              <textarea
                value={quoteData.conditions}
                onChange={(e) => setQuoteData({...quoteData, conditions: e.target.value})}
                placeholder="Modalités de paiement, conditions de réalisation, garanties..."
                rows="3"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowQuoteModal(false);
                  setSelectedRequest(null);
                  setQuoteData({
                    amount: '',
                    description: '',
                    duration: '',
                    conditions: ''
                  });
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button
                onClick={submitQuote}
                disabled={!quoteData.amount || !quoteData.description}
                style={{
                  padding: '12px 24px',
                  backgroundColor: (quoteData.amount && quoteData.description) ? '#f59e0b' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: (quoteData.amount && quoteData.description) ? 'pointer' : 'not-allowed'
                }}
              >
                📋 Envoyer le devis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de refus */}
      {showRefuseModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827'
            }}>
              ❌ Refuser la demande
            </h3>
            
            <p style={{
              margin: '0 0 16px 0',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              <strong>Projet :</strong> {selectedRequest?.title}
            </p>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Raison du refus *
              </label>
              <textarea
                value={refuseReason}
                onChange={(e) => setRefuseReason(e.target.value)}
                placeholder="Expliquez pourquoi vous refusez cette demande (ex: hors de ma zone, pas dans mes compétences, agenda complet...)"
                rows="4"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowRefuseModal(false);
                  setSelectedRequest(null);
                  setRefuseReason('');
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button
                onClick={refuseRequest}
                disabled={!refuseReason.trim()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: refuseReason.trim() ? '#ef4444' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: refuseReason.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalsPage;