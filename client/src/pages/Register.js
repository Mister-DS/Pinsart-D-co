import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation simplifiée pour les clients
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    const userData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone: formData.phone || null,
      address: formData.address || null,
      city: formData.city || null,
      postal_code: formData.postalCode || null,
      role: formData.email === 'dierickxsimon198@gmail.com' ? 'admin' : 'client',
      company_name: null,
      siret: null,
      specialties: null,
      description: formData.description || null,
      hourly_rate: null,
      is_verified: true 
    };

    const { error } = await signUp(
      formData.email,
      formData.password,
      userData
    );

    if (error) {
      setError(error.message);
    } else {
      alert('Inscription réussie ! Vous êtes maintenant connecté.');
      navigate('/');
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
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '700px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0 0 8px 0'
          }}>
            Créer un compte
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            margin: '0'
          }}>
            Rejoignez notre plateforme en quelques minutes
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Section Informations personnelles */}
          <div style={{
            background: 'linear-gradient(145deg, #f8fafc, #e2e8f0)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
              }}>
                <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <h3 style={{
                margin: '0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                Informations personnelles
              </h3>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Prénom *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Nom *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0411 22 33 44"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Section Adresse */}
          <div style={{
            background: 'linear-gradient(145deg, #f0fdf4, #dcfce7)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid rgba(34, 197, 94, 0.1)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #059669, #10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
              }}>
                <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <h3 style={{
                margin: '0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                Adresse
              </h3>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Adresse
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Rue de la Paix"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10b981';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 2 }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Ville
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Liege"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#10b981';
                    e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Code postal
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="4040"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#10b981';
                    e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section À propos de vous */}
          <div style={{
            background: 'linear-gradient(145deg, #fef3c7, #fde68a)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid rgba(245, 158, 11, 0.1)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #d97706, #f59e0b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
              }}>
                <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                  <path d="M9 11H7v9c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-9z"/>
                  <path d="M13 11h-2v9c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-9z"/>
                  <path d="M12 3L2 12h3v8h14v-8h3L12 3z"/>
                </svg>
              </div>
              <h3 style={{
                margin: '0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                À propos de vous
              </h3>
            </div>
            
            <div>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Description (optionnel)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez-vous en quelques mots..."
                rows="3"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#f59e0b';
                  e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Section Sécurité */}
          <div style={{
            background: 'linear-gradient(145deg, #fce7f3, #fbcfe8)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid rgba(236, 72, 153, 0.1)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #be185d, #ec4899)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.4)'
              }}>
                <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                  <path d="M18,8h-1V6c0-2.76-2.24-5-5-5S7,3.24,7,6v2H6c-1.1,0-2,0.9-2,2v10c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V10C20,8.9,19.1,8,18,8z M12,17c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S13.1,17,12,17z M15.1,8H8.9V6c0-1.71,1.39-3.1,3.1-3.1s3.1,1.39,3.1,3.1V8z"/>
                </svg>
              </div>
              <h3 style={{
                margin: '0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                Sécurité
              </h3>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Mot de passe *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Minimum 6 caractères"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ec4899';
                  e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Confirmer le mot de passe *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirmez votre mot de passe"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ec4899';
                  e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div style={{ 
              color: '#dc2626', 
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '24px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: loading 
                ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '18px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: loading 
                ? '0 4px 12px rgba(156, 163, 175, 0.4)' 
                : '0 8px 25px rgba(102, 126, 234, 0.4)',
              transform: loading ? 'none' : 'translateY(0)',
              marginBottom: '24px'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
              }
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeDashoffset="32" opacity="0.3"/>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeDashoffset="20"/>
                </svg>
                Inscription en cours...
              </span>
            ) : 
              'Créer mon compte'
            }
          </button>
        </form>

        {/* Lien de connexion */}
        <div style={{ 
          textAlign: 'center',
          paddingTop: '24px',
          borderTop: '1px solid rgba(209, 213, 219, 0.3)'
        }}>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            margin: '0'
          }}>
            Déjà un compte ?{' '}
            <Link 
              to="/login" 
              style={{ 
                color: '#667eea', 
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#5a67d8'}
              onMouseLeave={(e) => e.target.style.color = '#667eea'}
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>

      {/* Animation CSS pour le spinner */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Register;