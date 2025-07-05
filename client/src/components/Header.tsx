import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  siteName?: string;
  pageTitle?: string; // Peut toujours être fourni pour des pages non-dashboard
  showNavigation?: boolean;
  customContent?: React.ReactNode;
  userRoleOverride?: string; // Prop pour surcharger le rôle (utile pour l'admin principal)
}

const Header: React.FC<HeaderProps> = ({ 
  siteName = "Pinsart Déco", 
  pageTitle,
  showNavigation = true,
  customContent,
  userRoleOverride 
}) => {
  const { user, loading, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/login'; 
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleMouseEnter = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
    }
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    const timeoutId = setTimeout(() => {
      setShowDropdown(false);
    }, 200);
    setDropdownTimeout(timeoutId);
  };

  // Détermine le rôle effectif de l'utilisateur, en priorisant l'override
  const getUserRole = () => {
    return userRoleOverride || user?.user_metadata?.role || 'client';
  };

  // Détermine le lien du dashboard en fonction du rôle
  const getDashboardLink = () => {
    const role = getUserRole();
    switch (role) {
      case 'admin':
        return '/admin';
      case 'employee':
        return '/employee-dashboard';
      case 'client':
      default:
        return '/dashboard';
    }
  };

  // Détermine le texte du rôle à afficher dans le header
  const getRoleText = () => {
    const role = getUserRole();
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'employee':
        return 'Employé';
      case 'client':
      default:
        return 'Client';
    }
  };

  // Nouvelle fonction pour déterminer le titre du dashboard
  const getDynamicDashboardTitle = () => {
    const role = getUserRole();
    switch (role) {
      case 'admin':
        return 'Admin Dashboard';
      case 'employee':
        return 'Dashboard Employé';
      case 'client':
        return 'Dashboard Client';
      default:
        return 'Votre partenaire pour la décoration et la rénovation'; // Titre par défaut pour non connecté
    }
  };

  return (
    <header style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '30px 20px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Logo et titre */}
        <div>
          <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1 style={{ 
              fontSize: '36px',
              fontWeight: 'bold',
              margin: '0 0 10px 0',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer'
            }}>
              {siteName}
            </h1>
          </a>
          <p style={{ 
            fontSize: '18px',
            margin: 0,
            opacity: 0.9
          }}>
            {/* Utilise le titre dynamique si showNavigation est false (pour les dashboards),
                sinon utilise la prop pageTitle ou le slogan par défaut */}
            {!showNavigation && user ? getDynamicDashboardTitle() : pageTitle || "Votre partenaire pour la décoration et la rénovation"}
          </p>
        </div>
        
        {/* Navigation */}
        {customContent || (
          <div style={{ 
            display: 'flex',
            gap: '30px',
            alignItems: 'center',
            marginTop: '15px'
          }}>
            {/* Liens de navigation */}
            {showNavigation && (
              <>
                <a 
                  href="#services" 
                  style={{ 
                    color: 'white', 
                    textDecoration: 'none',
                    fontWeight: '500',
                    transition: 'opacity 0.3s ease',
                    opacity: 0.9,
                    fontSize: '16px'
                  }}
                  onMouseOver={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.opacity = '1';
                    target.style.textDecoration = 'underline';
                  }}
                  onMouseOut={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.opacity = '0.9';
                    target.style.textDecoration = 'none';
                  }}
                >
                  Services
                </a>
                <a 
                  href="#comment" 
                  style={{ 
                    color: 'white', 
                    textDecoration: 'none',
                    fontWeight: '500',
                    transition: 'opacity 0.3s ease',
                    opacity: 0.9,
                    fontSize: '16px'
                  }}
                  onMouseOver={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.opacity = '1';
                    target.style.textDecoration = 'underline';
                  }}
                  onMouseOut={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.opacity = '0.9';
                    target.style.textDecoration = 'none';
                  }}
                >
                  Comment ça marche
                </a>
                <a 
                  href="#contact" 
                  style={{ 
                    color: 'white', 
                    textDecoration: 'none',
                    fontWeight: '500',
                    transition: 'opacity 0.3s ease',
                    opacity: 0.9,
                    fontSize: '16px'
                  }}
                  onMouseOver={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.opacity = '1';
                    target.style.textDecoration = 'underline';
                  }}
                  onMouseOut={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.opacity = '0.9';
                    target.style.textDecoration = 'none';
                  }}
                >
                  Contact
                </a>
              </>
            )}

            {/* Section utilisateur */}
            {loading ? (
              <div style={{
                color: 'white',
                opacity: 0.8,
                fontSize: '16px'
              }}>
                Chargement...
              </div>
            ) : user ? (
              /* Utilisateur connecté */
              <div 
                style={{ 
                  display: 'flex',
                  gap: '15px',
                  alignItems: 'center',
                  position: 'relative'
                }}
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={handleMouseLeave} 
              >
                <div style={{ 
                  color: 'white',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease'
                }}>
                  <span>👋 {user.user_metadata?.prenom || 'Utilisateur'}</span>
                  <span style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {getRoleText()}
                  </span>
                  <span style={{ fontSize: '12px' }}>▼</span>
                </div>
                
                {/* Menu déroulant */}
                {showDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%', 
                    right: 0,
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                    marginTop: '8px',
                    minWidth: '200px',
                    zIndex: 1000,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #e5e7eb',
                      backgroundColor: '#f8fafc'
                    }}>
                      <div style={{
                        color: '#374151',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}>
                        {`${user.user_metadata?.prenom || ''} ${user.user_metadata?.nom || ''}`}
                      </div>
                      <div style={{
                        color: '#6b7280',
                        fontSize: '12px'
                      }}>
                        {user.email}
                      </div>
                    </div>
                    
                    <a 
                      href={getDashboardLink()}
                      style={{
                        display: 'block',
                        padding: '12px 16px',
                        color: '#374151',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'background-color 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.backgroundColor = '#f3f4f6';
                      }}
                      onMouseOut={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.backgroundColor = 'transparent';
                      }}
                    >
                      📊 Mon Dashboard
                    </a>
                    
                    {getUserRole() === 'client' && (
                      <a 
                        href="/create-request"
                        style={{
                          display: 'block',
                          padding: '12px 16px',
                          color: '#374151',
                          textDecoration: 'none',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'background-color 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                          const target = e.target as HTMLElement;
                          target.style.backgroundColor = '#f3f4f6';
                        }}
                        onMouseOut={(e) => {
                          const target = e.target as HTMLElement;
                          target.style.backgroundColor = 'transparent';
                        }}
                      >
                        ➕ Nouvelle demande
                      </a>
                    )}
                    
                    <div style={{
                      borderTop: '1px solid #e5e7eb',
                      padding: '8px 0'
                    }}>
                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          color: '#ef4444',
                          backgroundColor: 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'background-color 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                          const target = e.target as HTMLElement;
                          target.style.backgroundColor = '#fef2f2';
                        }}
                        onMouseOut={(e) => {
                          const target = e.target as HTMLElement;
                          target.style.backgroundColor = 'transparent';
                        }}
                      >
                        🚪 Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Utilisateur non connecté */
              <div style={{ 
                display: 'flex',
                gap: '15px'
              }}>
                <a 
                  href="/register" 
                  style={{ 
                    color: 'white', 
                    textDecoration: 'none', 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    padding: '12px 24px',
                    borderRadius: '25px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}
                  onMouseOver={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.backgroundColor = 'rgba(255,255,255,0.3)';
                    target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                    target.style.transform = 'translateY(0)';
                  }}
                >
                  S'inscrire
                </a>
                <a 
                  href="/login" 
                  style={{ 
                    color: '#667eea', 
                    textDecoration: 'none',
                    backgroundColor: 'white',
                    padding: '12px 24px',
                    borderRadius: '25px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseOver={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.transform = 'translateY(-2px)';
                    target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.transform = 'translateY(0)';
                    target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  Se connecter
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </header>
  );
};

export default Header;
