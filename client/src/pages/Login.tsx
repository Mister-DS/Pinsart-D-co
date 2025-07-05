import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (user) {
      if (user.email_confirmed_at) {
        navigate('/dashboard');
      } else {
        navigate('/verify-email');
      }
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await signIn(formData.email, formData.password);

      if (error) {
        throw error;
      }

      if (data.user) {
        setMessage('✅ Connexion réussie ! Redirection...');
        
        // Redirection automatique gérée par useEffect
        setTimeout(() => {
          if (data.user.email_confirmed_at) {
            navigate('/dashboard');
          } else {
            navigate('/verify-email');
          }
        }, 1500);
      }

    } catch (error: any) {
      console.error('Erreur connexion:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Veuillez confirmer votre email avant de vous connecter';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Trop de tentatives. Veuillez patienter quelques minutes';
      }
      
      setMessage(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '50px',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '450px',
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '10px'
          }}>
            Pinsart Déco
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            margin: 0
          }}>
            Connectez-vous à votre compte
          </p>
        </div>

        {message && (
          <div style={{
            padding: '15px',
            borderRadius: '12px',
            marginBottom: '25px',
            backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
            color: message.includes('✅') ? '#065f46' : '#dc2626',
            border: `1px solid ${message.includes('✅') ? '#a7f3d0' : '#fca5a5'}`,
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#374151',
              fontSize: '14px'
            }}>
              Adresse email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="votre@email.com"
              style={{
                width: '100%',
                padding: '15px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                outline: 'none',
                backgroundColor: '#f9fafb',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#374151',
              fontSize: '14px'
            }}>
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '15px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                outline: 'none',
                backgroundColor: '#f9fafb',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ textAlign: 'right', marginBottom: '25px' }}>
            <Link
              to="/forgot-password"
              style={{
                color: '#667eea',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              background: loading
                ? '#9ca3af'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: loading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
              marginBottom: '25px'
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '10px'
                }}></span>
                Connexion...
              </span>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          padding: '20px 0',
          borderTop: '1px solid #e5e7eb',
          marginTop: '20px'
        }}>
          <p style={{
            color: '#6b7280',
            margin: 0,
            fontSize: '14px'
          }}>
            Pas encore de compte ?{' '}
            <Link
              to="/register"
              style={{
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Créer un compte
            </Link>
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <Link
            to="/"
            style={{
              color: '#9ca3af',
              textDecoration: 'none',
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            ← Retour à l'accueil
          </Link>
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
};

export default Login;