import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  // Afficher un loader pendant la vérification de l'authentification
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{
            color: '#64748b',
            fontSize: '16px',
            fontWeight: '500'
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

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si l'utilisateur est connecté mais son email n'est pas confirmé
  if (user && !user.email_confirmed_at) {
    return <Navigate to="/verify-email" replace />;
  }

  // Vérification du rôle si requis (optionnel)
  if (requiredRole) {
    const userRole = user.user_metadata?.role || 'client';
    if (userRole !== requiredRole) {
      // Rediriger vers une page d'erreur ou dashboard approprié
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Si tout va bien, afficher le contenu protégé
  return <>{children}</>;
};

export default ProtectedRoute;