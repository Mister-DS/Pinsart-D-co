import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'employee' | 'admin';
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  fallback 
}) => {
  const { user, userProfile, loading } = useAuth();

  // Affichage de chargement
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            margin: 0
          }}>
            Vérification de l'authentification...
          </p>
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

  // Utilisateur non connecté
  if (!user || !userProfile) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Redirection vers login avec message
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '50px',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%',
          margin: '0 20px'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '20px'
          }}>
            🔒
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '15px'
          }}>
            Accès restreint
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            marginBottom: '30px',
            lineHeight: '1.6'
          }}>
            Vous devez être connecté pour accéder à cette page.
          </p>
          <div style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center'
          }}>
            <a 
              href="/login"
              style={{
                backgroundColor: '#667eea',
                color: 'white',
                textDecoration: 'none',
                padding: '15px 30px',
                borderRadius: '10px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              Se connecter
            </a>
            <a 
              href="/register"
              style={{
                backgroundColor: 'transparent',
                color: '#667eea',
                textDecoration: 'none',
                padding: '15px 30px',
                borderRadius: '10px',
                fontWeight: '600',
                border: '2px solid #667eea',
                transition: 'all 0.3s ease'
              }}
            >
              S'inscrire
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Compte inactif
  if (!userProfile.is_active) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '50px',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%',
          margin: '0 20px'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '20px'
          }}>
            ⚠️
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#ef4444',
            marginBottom: '15px'
          }}>
            Compte désactivé
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            marginBottom: '30px',
            lineHeight: '1.6'
          }}>
            Votre compte a été temporairement désactivé. Veuillez contacter le support pour plus d'informations.
          </p>
          <div style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center'
          }}>
            <a 
              href="mailto:support@pinsart-deco.com"
              style={{
                backgroundColor: '#667eea',
                color: 'white',
                textDecoration: 'none',
                padding: '15px 30px',
                borderRadius: '10px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              Contacter le support
            </a>
            <button 
              onClick={() => window.location.href = '/'}
              style={{
                backgroundColor: 'transparent',
                color: '#667eea',
                border: '2px solid #667eea',
                padding: '15px 30px',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vérification du rôle requis
  if (requiredRole && userProfile.role !== requiredRole) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '50px',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%',
          margin: '0 20px'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '20px'
          }}>
            🚫
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#ef4444',
            marginBottom: '15px'
          }}>
            Accès non autorisé
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            marginBottom: '30px',
            lineHeight: '1.6'
          }}>
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            <br />
            <strong>Votre rôle :</strong> {userProfile.role}
            <br />
            <strong>Rôle requis :</strong> {requiredRole}
          </p>
          <button 
            onClick={() => {
              // Rediriger vers le dashboard approprié selon le rôle
              const dashboardRoute = userProfile.role === 'employee' 
                ? '/employee-dashboard' 
                : userProfile.role === 'admin'
                ? '/admin-dashboard'
                : '/dashboard';
              window.location.href = dashboardRoute;
            }}
            style={{
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Aller à mon dashboard
          </button>
        </div>
      </div>
    );
  }

  // Utilisateur autorisé - afficher le contenu
  return <>{children}</>;
};

export default ProtectedRoute;