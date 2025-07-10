import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [workRequests, setWorkRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'requests') {
      fetchWorkRequests();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchStats();
  }, [users, workRequests]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || data?.role !== 'admin') {
        navigate('/dashboard');
        return;
      }

      fetchUsers();
      fetchWorkRequests();
    } catch (error) {
      console.error('Erreur de vérification admin:', error);
      navigate('/dashboard');
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users_complete')
        .select('*')
        .order('profile_created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('work_requests_with_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkRequests(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const userCounts = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});

      const requestCounts = workRequests.reduce((acc, request) => {
        acc[request.status] = (acc[request.status] || 0) + 1;
        return acc;
      }, {});

      setStats({
        users: userCounts,
        requests: requestCounts,
        totalUsers: users.length,
        totalRequests: workRequests.length,
        activeUsers: users.filter(u => u.is_verified).length,
        bannedUsers: users.filter(u => !u.is_verified).length
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      showNotification(`Rôle mis à jour vers ${newRole}`, 'success');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      showNotification('Erreur lors de la mise à jour du rôle', 'error');
    }
  };

  const toggleUserStatus = async (userId, isActive) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_verified: isActive })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_verified: isActive } : user
      ));

      if (isActive) {
        showNotification('Utilisateur débanني et remis en client', 'success');
      } else {
        showNotification('Utilisateur banni', 'success');
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      showNotification('Erreur lors du changement de statut', 'error');
    }
  };

  const updateRequestStatus = async (requestId, newStatus) => {
    try {
      const { error } = await supabase
        .from('work_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      setWorkRequests(workRequests.map(request => 
        request.id === requestId ? { ...request, status: newStatus } : request
      ));

      showNotification(`Statut mis à jour vers ${newStatus}`, 'success');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      showNotification('Erreur lors de la mise à jour du statut', 'error');
    }
  };

  const showNotification = (message, type) => {
    // Simple notification - dans un vrai projet, utiliser une lib comme react-toastify
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: '700', color: '#111827' }}>{value}</p>
          {subtitle && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>{subtitle}</p>}
        </div>
        <div style={{ 
          fontSize: '24px', 
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

  const TabButton = ({ id, label, icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
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
      <span>{icon}</span>
      {label}
    </button>
  );

  const UserCard = ({ user }) => (
    <div style={{
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#3b82f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '600',
          fontSize: '18px'
        }}>
          {user.first_name?.[0] || user.email[0].toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
            {user.first_name} {user.last_name}
          </h3>
          <p style={{ margin: '4px 0', fontSize: '14px', color: '#6b7280' }}>{user.email}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: user.role === 'admin' ? '#ef4444' : user.role === 'professional' ? '#3b82f6' : '#10b981',
            color: 'white'
          }}>
            {user.role}
          </span>
          <span style={{
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: user.is_verified ? '#10b981' : '#ef4444',
            color: 'white'
          }}>
            {user.is_verified ? 'Actif' : 'Banni'}
          </span>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {user.role !== 'professional' && (
          <button
            onClick={() => updateUserRole(user.id, 'professional')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
          >
            Promouvoir Pro
          </button>
        )}
        {user.role !== 'user' && user.role !== 'admin' && (
          <button
            onClick={() => updateUserRole(user.id, 'user')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
          >
            Remettre Client
          </button>
        )}
        {user.role !== 'admin' && (
          <button
            onClick={() => {
              if (user.is_verified) {
                // Si on bannit, on bannit seulement
                toggleUserStatus(user.id, false);
              } else {
                // Si on débanit, on débanit ET on remet client par défaut
                toggleUserStatus(user.id, true);
                if (user.role !== 'user') {
                  setTimeout(() => updateUserRole(user.id, 'user'), 500);
                }
              }
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: user.is_verified ? '#ef4444' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
          >
            {user.is_verified ? 'Bannir' : 'Débannir → Client'}
          </button>
        )}
      </div>
    </div>
  );

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
              🛠️ Administration
            </h1>
            <p style={{
              margin: '8px 0 0 0',
              fontSize: '16px',
              color: 'rgba(255,255,255,0.8)'
            }}>
              Gérez votre plateforme Pinsart Déco
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
          <div style={{ display: 'flex', gap: '4px' }}>
            <TabButton
              id="dashboard"
              label="Dashboard"
              icon="📊"
              active={activeTab === 'dashboard'}
              onClick={setActiveTab}
            />
            <TabButton
              id="users"
              label="Utilisateurs"
              icon="👥"
              active={activeTab === 'users'}
              onClick={setActiveTab}
            />
            <TabButton
              id="requests"
              label="Demandes"
              icon="🔧"
              active={activeTab === 'requests'}
              onClick={setActiveTab}
            />
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'dashboard' && (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
              }}>
                <StatCard
                  title="Total Utilisateurs"
                  value={stats.totalUsers}
                  subtitle={`${stats.activeUsers} actifs, ${stats.bannedUsers} bannis`}
                  color="#3b82f6"
                  icon="👥"
                />
                <StatCard
                  title="Clients"
                  value={stats.users?.user || 0}
                  subtitle="Utilisateurs standards"
                  color="#10b981"
                  icon="🙋‍♂️"
                />
                <StatCard
                  title="Professionnels"
                  value={stats.users?.professional || 0}
                  subtitle="Prestataires de services"
                  color="#8b5cf6"
                  icon="🔧"
                />
                <StatCard
                  title="Demandes"
                  value={stats.totalRequests}
                  subtitle={`${stats.requests?.pending || 0} en attente`}
                  color="#f59e0b"
                  icon="📋"
                />
              </div>

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
                  Activité récente
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '24px'
                }}>
                  <div>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
                      Statut des demandes
                    </h3>
                    {Object.entries(stats.requests || {}).map(([status, count]) => (
                      <div key={status} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: '1px solid #f3f4f6'
                      }}>
                        <span style={{ fontSize: '14px', color: '#6b7280', textTransform: 'capitalize' }}>
                          {status}
                        </span>
                        <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
                      Types d'utilisateurs
                    </h3>
                    {Object.entries(stats.users || {}).map(([role, count]) => (
                      <div key={role} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: '1px solid #f3f4f6'
                      }}>
                        <span style={{ fontSize: '14px', color: '#6b7280', textTransform: 'capitalize' }}>
                          {role}
                        </span>
                        <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              {/* Filters */}
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '16px',
                marginBottom: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #f3f4f6'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: '200px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                  />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">Tous les rôles</option>
                    <option value="user">Clients</option>
                    <option value="professional">Professionnels</option>
                    <option value="admin">Administrateurs</option>
                  </select>
                </div>
              </div>

              {/* Users Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                gap: '24px'
              }}>
                {filteredUsers.map(user => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              border: '1px solid #f3f4f6'
            }}>
              <div style={{
                padding: '24px',
                borderBottom: '1px solid #f3f4f6'
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#111827'
                }}>
                  Demandes de travaux
                </h2>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                        Demande
                      </th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                        Client
                      </th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                        Statut
                      </th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                        Date
                      </th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {workRequests.map((request, index) => (
                      <tr key={request.id} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb' }}>
                        <td style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
                          <div>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                              {request.title}
                            </p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                              {request.category} • {request.location_city}
                            </p>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
                          <div>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                              {request.client_first_name} {request.client_last_name}
                            </p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                              {request.client_email}
                            </p>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: request.status === 'pending' ? '#fef3c7' :
                                           request.status === 'completed' ? '#d1fae5' :
                                           request.status === 'in_progress' ? '#dbeafe' : '#fee2e2',
                            color: request.status === 'pending' ? '#d97706' :
                                  request.status === 'completed' ? '#065f46' :
                                  request.status === 'in_progress' ? '#1d4ed8' : '#dc2626'
                          }}>
                            {request.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', fontSize: '14px', color: '#6b7280' }}>
                          {formatDate(request.created_at)}
                        </td>
                        <td style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
                          <select
                            value={request.status}
                            onChange={(e) => updateRequestStatus(request.id, e.target.value)}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid #d1d5db',
                              fontSize: '12px',
                              backgroundColor: 'white',
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          >
                            <option value="pending">En attente</option>
                            <option value="assigned">Assignée</option>
                            <option value="in_progress">En cours</option>
                            <option value="completed">Terminée</option>
                            <option value="cancelled">Annulée</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;