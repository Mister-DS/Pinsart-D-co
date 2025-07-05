import React, { useState, useEffect } from 'react';
import Header from '../components/Header'; // Assurez-vous que le chemin est correct
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase'; // Assurez-vous que le chemin est correct

interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  is_active: boolean;
  created_at: string;
  role: string;
  banned_until?: string;
  email_confirmed_at?: string;
}

function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Définir l'email de l'administrateur principal
  const ADMIN_EMAIL = 'dierickxsimon198@gmail.com';
  // Vérifier si l'utilisateur connecté est l'admin principal
  const isAdmin = user?.email === ADMIN_EMAIL;

  // Déterminer le rôle à passer au Header pour l'affichage
  const currentUserRoleForHeader = isAdmin ? 'admin' : (user?.user_metadata?.role || 'client');

  useEffect(() => {
    // Rediriger si l'authentification est terminée et que l'utilisateur n'est pas l'admin
    if (!authLoading && (!user || !isAdmin)) {
      window.location.href = '/'; // Redirige vers l'accueil ou une page d'accès refusé
      return;
    }
    
    // Charger les utilisateurs si l'utilisateur est l'admin et que l'authentification est terminée
    if (user && isAdmin && !authLoading) {
      loadUsers();
    }
  }, [user, authLoading, isAdmin]); // Dépendances pour re-déclencher si l'utilisateur ou le statut de chargement change

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Utilisation de supabase.auth.admin.listUsers() pour récupérer tous les utilisateurs
      // Note: Cette fonction nécessite des clés de service Supabase côté serveur ou des politiques RLS très spécifiques.
      // Assurez-vous que votre configuration Supabase permet cette opération pour l'utilisateur connecté.
      const { data: authUsers, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        console.error('Erreur auth.admin.listUsers:', error);
        setMessage('⚠️ Impossible de charger les utilisateurs. Vérifiez les permissions admin.');
        return;
      }

      const formattedUsers: User[] = authUsers.users
        // Filtrer l'admin principal pour ne pas le modifier ou le supprimer accidentellement
        .filter(authUser => authUser.email !== ADMIN_EMAIL)
        .map(authUser => ({
          id: authUser.id,
          email: authUser.email || '',
          nom: authUser.user_metadata?.nom || '',
          prenom: authUser.user_metadata?.prenom || '',
          telephone: authUser.user_metadata?.telephone || '',
          is_active: authUser.user_metadata?.is_active !== false, // Par défaut actif si non défini
          created_at: authUser.created_at,
          role: authUser.user_metadata?.role || 'client', // Rôle par défaut 'client'
          banned_until: authUser.user_metadata?.banned_at || undefined,
          email_confirmed_at: authUser.email_confirmed_at
        }));

      // Trier les utilisateurs par date de création (du plus récent au plus ancien)
      formattedUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setUsers(formattedUsers);
      
      if (formattedUsers.length === 0) {
        setMessage('ℹ️ Aucun utilisateur trouvé. Les nouveaux utilisateurs apparaîtront ici.');
      }
      
    } catch (error: any) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      setMessage(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeEmployee = async (userId: string) => {
    // Remplacer window.confirm par une modal personnalisée pour une meilleure UX
    const confirmed = window.confirm('Voulez-vous vraiment promouvoir cet utilisateur au rang d\'employé ?');
    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      // Récupérer les métadonnées actuelles pour les fusionner
      const userToPromote = users.find(u => u.id === userId);
      if (!userToPromote) {
        setMessage('Utilisateur non trouvé.');
        return;
      }

      // Mettre à jour le rôle dans les métadonnées de l'utilisateur Supabase Auth
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...userToPromote, // Conserver les autres métadonnées
          role: 'employee'
        }
      });

      if (error) throw error;

      // Tenter d'insérer l'utilisateur dans la table 'employees' si elle existe
      // Cette partie est facultative et dépend de votre schéma de DB.
      // Si la table 'employees' n'existe pas ou n'est pas nécessaire, vous pouvez la supprimer.
      try {
        const { error: employeeError } = await supabase
          .from('employees')
          .insert({
            id: userId,
            email: userToPromote.email,
            nom: userToPromote.nom,
            prenom: userToPromote.prenom,
            telephone: userToPromote.telephone,
            is_active: true, // Les employés sont généralement actifs par défaut
            created_at: new Date().toISOString() // Date de création de l'enregistrement employé
          });

        // Gérer spécifiquement l'erreur si la table 'employees' n'existe pas
        if (employeeError && employeeError.code !== '42P01') { // '42P01' est le code pour "undefined_table"
          console.warn('Erreur lors de l\'ajout dans la table employees (peut-être la table n\'existe pas):', employeeError);
        } else if (employeeError) {
          console.warn('Erreur lors de l\'ajout dans la table employees:', employeeError);
        }
      } catch (employeeError) {
        console.warn('Erreur inattendue lors de l\'insertion dans la table employees:', employeeError);
      }

      setMessage('✅ Utilisateur promu employé avec succès !');
      await loadUsers(); // Recharger la liste pour voir le changement

    } catch (error: any) {
      console.error('Erreur lors de la promotion:', error);
      setMessage(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = async (userId: string, isActive: boolean) => {
    const action = isActive ? 'désactiver' : 'réactiver';
    // Remplacer window.confirm par une modal personnalisée
    const confirmed = window.confirm(`Voulez-vous vraiment ${action} cet utilisateur ?`);
    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) {
        setMessage('Utilisateur non trouvé.');
        return;
      }

      // Mettre à jour l'état d'activité et les champs de bannissement dans les métadonnées
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...userToUpdate, // Conserver les autres métadonnées
          is_active: !isActive,
          banned_by_admin: isActive ? true : false, // Indique si banni par admin
          banned_at: isActive ? new Date().toISOString() : null // Date du bannissement
        }
      });
      
      if (error) throw error;
      
      setMessage(isActive ? '✅ Utilisateur désactivé' : '✅ Utilisateur réactivé');
      await loadUsers();

    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      setMessage(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    // Remplacer window.confirm par une modal personnalisée
    const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur ? Cette action est irréversible.');
    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      
      // Tenter de supprimer l'utilisateur de la table 'employees' si elle existe
      // La suppression de auth.users devrait cascader vers 'clients' si la relation est configurée.
      try {
        const { error: employeeDeleteError } = await supabase.from('employees').delete().eq('id', userId);
        if (employeeDeleteError && employeeDeleteError.code !== '42P01') {
          console.warn('Erreur lors de la suppression de la table employees (peut-être la table n\'existe pas):', employeeDeleteError);
        }
      } catch (error) {
        console.warn('Erreur inattendue lors de la suppression de la table employees:', error);
      }

      // Supprimer l'utilisateur de Supabase Auth (ce qui devrait aussi le supprimer de 'clients' via CASCADE)
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      setMessage('✅ Utilisateur supprimé définitivement');
      await loadUsers();

    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      setMessage(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'employee': return { bg: '#ddd6fe', text: '#5b21b6' };
      case 'client': return { bg: '#e0e7ff', text: '#3730a3' };
      case 'admin': return { bg: '#fef9c3', text: '#a16207' }; // Couleur pour l'admin
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'employee': return '👷 Employé';
      case 'client': return '👤 Client';
      case 'admin': return '👑 Admin'; // Texte pour l'admin
      default: return '❓ Inconnu';
    }
  };

  // Affichage du chargement initial
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Chargement de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Redirection si non admin
  if (!user || !isAdmin) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '10px' }}>🚫 Accès refusé</h2>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            Seul l'administrateur principal peut accéder à cette page.
          </p>
          <a href="/" style={{ 
            color: '#667eea', 
            textDecoration: 'none',
            backgroundColor: '#f0f4ff',
            padding: '10px 20px',
            borderRadius: '6px',
            border: '1px solid #667eea'
          }}>
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header unifié - Passe le rôle déterminé par AdminDashboard */}
      <Header 
        siteName="Pinsart Déco" 
        pageTitle="🔐 Administration - Gestion des utilisateurs"
        showNavigation={false}
        userRoleOverride={currentUserRoleForHeader} // Passe le rôle "admin" pour l'affichage
      />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Statistiques */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#e0e7ff',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                👥
              </div>
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  {users.length}
                </h3>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
                  Utilisateurs total
                </p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#ddd6fe',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                👷
              </div>
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  {users.filter(u => u.role === 'employee').length}
                </h3>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
                  Employés
                </p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#d1fae5',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                ✅
              </div>
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  {users.filter(u => u.is_active).length}
                </h3>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
                  Actifs
                </p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#fee2e2',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                🚫
              </div>
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  {users.filter(u => !u.is_active).length}
                </h3>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
                  Désactivés
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div style={{
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
            color: message.includes('✅') ? '#065f46' : '#dc2626',
            border: `1px solid ${message.includes('✅') ? '#a7f3d0' : '#fca5a5'}`,
            fontSize: '14px'
          }}>
            {message}
          </div>
        )}

        {/* Liste des utilisateurs */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f8fafc'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
              Tous les utilisateurs inscrits
            </h3>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{
                width: '30px',
                height: '30px',
                border: '3px solid #e5e7eb',
                borderTop: '3px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 15px'
              }}></div>
              Chargement des utilisateurs...
            </div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#6b7280' }}>Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div style={{ padding: '20px' }}>
              {users.map(user => {
                const roleColor = getRoleColor(user.role);
                return (
                  <div key={user.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 0',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                          {user.prenom} {user.nom}
                        </h4>
                        <span style={{
                          backgroundColor: roleColor.bg,
                          color: roleColor.text,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {getRoleDisplay(user.role)} {/* Utilise getRoleDisplay */}
                        </span>
                      </div>
                      <p style={{ color: '#6b7280', margin: '0 0 5px 0', fontSize: '14px' }}>
                        📧 {user.email}
                      </p>
                      {user.telephone && (
                        <p style={{ color: '#6b7280', margin: '0 0 5px 0', fontSize: '14px' }}>
                          📞 {user.telephone}
                        </p>
                      )}
                      <p style={{ color: '#9ca3af', margin: 0, fontSize: '12px' }}>
                        Inscrit le {formatDate(user.created_at)}
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{
                        backgroundColor: user.is_active ? '#d1fae5' : '#fee2e2',
                        color: user.is_active ? '#065f46' : '#dc2626',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {user.is_active ? '✅ Actif' : '🚫 Désactivé'}
                      </span>
                      
                      {user.role === 'client' && (
                        <button
                          onClick={() => handleMakeEmployee(user.id)}
                          style={{
                            backgroundColor: '#8b5cf6',
                            color: 'white',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          👷 Faire employé
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleToggleBan(user.id, user.is_active)}
                        style={{
                          backgroundColor: user.is_active ? '#f59e0b' : '#10b981',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        {user.is_active ? '🚫 Désactiver' : '✅ Réactiver'}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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

export default AdminDashboard;
