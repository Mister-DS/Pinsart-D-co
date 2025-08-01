import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import Supabase directement
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    navigate('/');
  };

  const getUserDisplayName = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    }
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name;
    }
    return user?.email?.split('@')[0] || 'Utilisateur';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#dc3545';
      case 'professional': return '#007bff';
      case 'client': return '#28a745';
      case 'user': return '#28a745'; // Fallback pour les anciens comptes
      default: return '#6c757d';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return '👑';
      case 'professional': return '🔧';
      case 'client': return '👤';
      case 'user': return '👤';
      default: return '👤';
    }
  };

  const getDashboardLink = () => {
    if (userProfile?.role === 'professional') {
      return '/professionals';
    }
    if (userProfile?.role === 'admin') {
      return '/admin';
    }
    return '/dashboard';
  };

  // Composant Avatar avec photo de profil ou fallback
  const UserAvatar = ({ size = 40, showBorder = false, clickable = false }) => {
    const avatarStyle = {
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${size * 0.35}px`,
      fontWeight: '600',
      cursor: clickable ? 'pointer' : 'default',
      border: showBorder ? '3px solid white' : 'none',
      boxShadow: showBorder ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none',
      transition: 'transform 0.2s ease',
      position: 'relative',
      overflow: 'hidden'
    };

    if (userProfile?.avatar_url) {
      return (
        <div
          style={{
            ...avatarStyle,
            backgroundImage: `url(${userProfile.avatar_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'transparent'
          }}
          onMouseEnter={(e) => clickable && (e.target.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => clickable && (e.target.style.transform = 'scale(1)')}
        />
      );
    }

    // Fallback avec initiales et couleur de rôle
    return (
      <div
        style={{
          ...avatarStyle,
          backgroundColor: getRoleColor(userProfile?.role),
          color: 'white'
        }}
        onMouseEnter={(e) => clickable && (e.target.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => clickable && (e.target.style.transform = 'scale(1)')}
      >
        {getUserInitials()}
      </div>
    );
  };

  return (
    <header style={{
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid #e5e7eb'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px'
      }}>
        {/* Logo */}
        <Link 
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: '#111827',
            fontWeight: '700',
            fontSize: '24px'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px',
            color: 'white',
            fontSize: '20px'
          }}>
            🏠
          </div>
          <span style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Pinsart Déco
          </span>
        </Link>

        {/* Navigation principale - Desktop */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px'
        }}>
          {/* Liens publics */}
          <div style={{
            display: 'flex',
            gap: '24px',
            alignItems: 'center'
          }}>
            <Link
              to="/about"
              style={{
                textDecoration: 'none',
                color: '#6b7280',
                fontWeight: '500',
                fontSize: '16px',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.color = '#3b82f6'}
              onMouseOut={(e) => e.target.style.color = '#6b7280'}
            >
              À propos
            </Link>
            <Link
              to="/how-it-works"
              style={{
                textDecoration: 'none',
                color: '#6b7280',
                fontWeight: '500',
                fontSize: '16px',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.color = '#3b82f6'}
              onMouseOut={(e) => e.target.style.color = '#6b7280'}
            >
              Comment ça marche
            </Link>
          </div>

          {/* Menu utilisateur */}
          {user ? (
            <div style={{ position: 'relative' }} ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                {/* Avatar avec photo de profil */}
                <UserAvatar size={40} clickable={true} />
                
                {/* Infos utilisateur */}
                <div style={{ textAlign: 'left' }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#111827'
                  }}>
                    {getUserDisplayName()}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: getRoleColor(userProfile?.role),
                    fontWeight: '500',
                    textTransform: 'capitalize',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>{getRoleIcon(userProfile?.role)}</span>
                    {userProfile?.role === 'professional' ? 'Professionnel' :
                     userProfile?.role === 'admin' ? 'Administrateur' : 'Client'}
                  </div>
                </div>
                
                {/* Flèche */}
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}>
                  ▼
                </div>
              </button>

              {/* Menu déroulant */}
              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                  border: '1px solid #e5e7eb',
                  minWidth: '240px',
                  overflow: 'hidden',
                  zIndex: 1000
                }}>
                  {/* Header du menu avec photo de profil */}
                  <div style={{
                    padding: '16px',
                    borderBottom: '1px solid #f3f4f6',
                    backgroundColor: '#f9fafb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <UserAvatar size={48} showBorder={true} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                        {getUserDisplayName()}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {user.email}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: getRoleColor(userProfile?.role),
                        fontWeight: '500',
                        marginTop: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span>{getRoleIcon(userProfile?.role)}</span>
                        {userProfile?.role === 'professional' ? 'Professionnel' :
                         userProfile?.role === 'admin' ? 'Administrateur' : 'Client'}
                      </div>
                    </div>
                  </div>

                  {/* Liens du menu */}
                  <div style={{ padding: '8px 0' }}>
                    <Link
                      to={getDashboardLink()}
                      onClick={() => setShowUserMenu(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        textDecoration: 'none',
                        color: '#374151',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <span>📊</span>
                      {userProfile?.role === 'professional' ? 'Espace Pro' :
                       userProfile?.role === 'admin' ? 'Administration' : 'Mon Dashboard'}
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        textDecoration: 'none',
                        color: '#374151',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <span>👤</span>
                      Mon Profil
                    </Link>

                    {/* Séparateur pour les liens spécifiques */}
                    <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '8px 0' }}></div>

                    {/* Liens pour les clients */}
                    {(userProfile?.role === 'client' || userProfile?.role === 'user') && (
                      <Link
                        to="/work-requests"
                        onClick={() => setShowUserMenu(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          textDecoration: 'none',
                          color: '#374151',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                        onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <span>📋</span>
                        Nouvelle demande
                      </Link>
                    )}

                    {/* Liens pour les professionnels */}
                    {userProfile?.role === 'professional' && (
                      <>
                        <Link
                          to="/quotes"
                          onClick={() => setShowUserMenu(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            textDecoration: 'none',
                            color: '#374151',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <span>📋</span>
                          Mes devis
                        </Link>
                        
                        <Link
                          to="/quotes/new"
                          onClick={() => setShowUserMenu(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            textDecoration: 'none',
                            color: '#2563eb',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#eff6ff'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <span>➕</span>
                          Nouveau devis
                        </Link>

                        <Link
                          to="/work-requests"
                          onClick={() => setShowUserMenu(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            textDecoration: 'none',
                            color: '#374151',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <span>🔨</span>
                          Demandes de travaux
                        </Link>
                      </>
                    )}

                    {/* Liens pour les admins */}
                    {userProfile?.role === 'admin' && (
                      <>
                        <Link
                          to="/quotes"
                          onClick={() => setShowUserMenu(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            textDecoration: 'none',
                            color: '#374151',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <span>📋</span>
                          Tous les devis
                        </Link>

                        <Link
                          to="/quotes/new"
                          onClick={() => setShowUserMenu(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            textDecoration: 'none',
                            color: '#2563eb',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#eff6ff'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <span>➕</span>
                          Nouveau devis
                        </Link>

                        <Link
                          to="/work-requests"
                          onClick={() => setShowUserMenu(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            textDecoration: 'none',
                            color: '#374151',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <span>🔨</span>
                          Toutes les demandes
                        </Link>

                        <Link
                          to="/professionals"
                          onClick={() => setShowUserMenu(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            textDecoration: 'none',
                            color: '#374151',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <span>🔧</span>
                          Gestion professionnels
                        </Link>
                      </>
                    )}
                  </div>

                  {/* Séparateur */}
                  <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '8px 0' }}></div>

                  {/* Déconnexion */}
                  <div style={{ padding: '8px 0' }}>
                    <button
                      onClick={handleSignOut}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#dc2626',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#fef2f2'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <span>🚪</span>
                      Se déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Boutons connexion/inscription */
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              <Link
                to="/login"
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '500',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.borderColor = '#9ca3af';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = '#d1d5db';
                }}
              >
                Se connecter
              </Link>
              <Link
                to="/register"
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
              >
                S'inscrire
              </Link>
            </div>
          )}
        </nav>

        {/* Bouton mobile menu */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          style={{
            display: 'none',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#6b7280'
          }}
          className="mobile-menu-button"
        >
          ☰
        </button>
      </div>

      {/* Menu mobile */}
      {showMobileMenu && (
        <div style={{
          backgroundColor: 'white',
          borderTop: '1px solid #e5e7eb',
          padding: '20px'
        }}
        className="mobile-menu"
        >
          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '12px'
            }}>
              <UserAvatar size={36} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                  {getUserDisplayName()}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {user.email}
                </div>
              </div>
            </div>
          )}
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <Link to="/about" style={{ color: '#6b7280', textDecoration: 'none' }}>À propos</Link>
            <Link to="/how-it-works" style={{ color: '#6b7280', textDecoration: 'none' }}>Comment ça marche</Link>
            {user ? (
              <>
                <Link to={getDashboardLink()} style={{ color: '#6b7280', textDecoration: 'none' }}>
                  {userProfile?.role === 'professional' ? 'Espace Pro' :
                   userProfile?.role === 'admin' ? 'Administration' : 'Dashboard'}
                </Link>
                <Link to="/profile" style={{ color: '#6b7280', textDecoration: 'none' }}>Mon Profil</Link>
                
                {/* Liens spécifiques mobile */}
                {(userProfile?.role === 'client' || userProfile?.role === 'user') && (
                  <Link to="/work-requests" style={{ color: '#6b7280', textDecoration: 'none' }}>Nouvelle demande</Link>
                )}
                
                {(userProfile?.role === 'professional' || userProfile?.role === 'admin') && (
                  <>
                    <Link to="/quotes" style={{ color: '#6b7280', textDecoration: 'none' }}>Mes devis</Link>
                    <Link to="/quotes/new" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>➕ Nouveau devis</Link>
                    <Link to="/work-requests" style={{ color: '#6b7280', textDecoration: 'none' }}>Demandes de travaux</Link>
                  </>
                )}
                
                {userProfile?.role === 'admin' && (
                  <Link to="/professionals" style={{ color: '#6b7280', textDecoration: 'none' }}>Gestion professionnels</Link>
                )}
                
                <button onClick={handleSignOut} style={{ color: '#dc2626', background: 'none', border: 'none', textAlign: 'left' }}>
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={{ color: '#6b7280', textDecoration: 'none' }}>Se connecter</Link>
                <Link to="/register" style={{ color: '#3b82f6', textDecoration: 'none' }}>S'inscrire</Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>
        {`
          @media (max-width: 768px) {
            .mobile-menu-button {
              display: block !important;
            }
            nav {
              display: none !important;
            }
          }
        `}
      </style>
    </header>
  );
};

export default Header;