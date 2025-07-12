import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error } = await signIn(email, password);

    if (error) {
      setError('Email ou mot de passe incorrect');
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        animation: 'float 20s ease-in-out infinite',
        pointerEvents: 'none'
      }}></div>

      <div style={{
        maxWidth: '450px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header avec logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            margin: '0 auto 20px',
            boxShadow: '0 15px 30px rgba(102, 126, 234, 0.4)',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            🔐
          </div>
          
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0 0 8px 0',
            animation: 'slideDown 0.6s ease-out'
          }}>
            Bon retour !
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            margin: '0',
            animation: 'slideDown 0.6s ease-out 0.1s both'
          }}>
            Connectez-vous à votre espace personnel
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ animation: 'slideUp 0.6s ease-out 0.2s both' }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              transition: 'color 0.2s ease'
            }}>
              <span style={{ marginRight: '4px' }}>📧</span>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '16px',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'translateY(0)';
                }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              <span style={{ marginRight: '4px' }}>🔒</span>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••"
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '16px',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'translateY(0)';
                }}
              />
            </div>
          </div>

          {/* Message d'erreur animé */}
          {error && (
            <div style={{ 
              color: '#dc2626', 
              backgroundColor: '#fef2f2',
              border: '2px solid #fecaca',
              padding: '16px 20px',
              borderRadius: '16px',
              marginBottom: '24px',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              animation: 'shake 0.5s ease-in-out, slideDown 0.3s ease-out'
            }}>
              <span style={{ marginRight: '8px', fontSize: '16px' }}>⚠️</span>
              {error}
            </div>
          )}

          {/* Bouton de connexion avec animations */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '18px',
              background: loading 
                ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '18px',
              fontWeight: '700',
              transition: 'all 0.3s ease',
              boxShadow: loading 
                ? '0 4px 12px rgba(156, 163, 175, 0.4)' 
                : '0 8px 25px rgba(102, 126, 234, 0.4)',
              transform: loading ? 'none' : 'translateY(0)',
              marginBottom: '24px',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.6)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
              }
            }}
          >
            {/* Animation de ripple au clic */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
              transform: 'translateX(-100%)',
              transition: 'transform 0.6s ease',
              pointerEvents: 'none'
            }}></div>
            
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: '10px', animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeDashoffset="32" opacity="0.3"/>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeDashoffset="20"/>
                </svg>
                Connexion en cours...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ marginRight: '8px' }}>🚀</span>
                Se connecter
              </span>
            )}
          </button>
        </form>

        {/* Lien vers l'inscription */}
        <div style={{ 
          textAlign: 'center',
          paddingTop: '24px',
          borderTop: '1px solid rgba(209, 213, 219, 0.3)',
          animation: 'slideUp 0.6s ease-out 0.4s both'
        }}>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            margin: '0',
            lineHeight: '1.5'
          }}>
            Première visite ?{' '}
            <Link 
              to="/register" 
              style={{ 
                color: '#667eea', 
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#5a67d8';
                e.target.style.textShadow = '0 2px 4px rgba(102, 126, 234, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#667eea';
                e.target.style.textShadow = 'none';
              }}
            >
              Créer un compte
              <span style={{
                position: 'absolute',
                bottom: '-2px',
                left: 0,
                width: '0%',
                height: '2px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                transition: 'width 0.3s ease'
              }}></span>
            </Link>
          </p>
        </div>

        {/* Particules décoratives */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '6px',
          height: '6px',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          borderRadius: '50%',
          animation: 'bounce 2s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          width: '4px',
          height: '4px',
          background: 'linear-gradient(135deg, #764ba2, #667eea)',
          borderRadius: '50%',
          animation: 'bounce 2s ease-in-out infinite 1s'
        }}></div>
      </div>

      {/* Animations CSS */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes float {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(30px, -30px) rotate(120deg); }
            66% { transform: translate(-20px, 20px) rotate(240deg); }
          }
          
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes ripple {
            from { transform: translateX(-100%); }
            to { transform: translateX(100%); }
          }
          
          /* Effet hover sur le lien */
          a:hover span {
            width: 100% !important;
          }
          
          /* Effet ripple sur le bouton */
          button:active div {
            animation: ripple 0.6s ease;
          }
          
          /* Responsive */
          @media (max-width: 768px) {
            .login-container {
              padding: 15px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Login;