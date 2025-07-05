import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';

const VerifyEmail: React.FC = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si l'utilisateur n'est pas connecté, rediriger vers login
    if (!user) {
      navigate('/login');
      return;
    }

    // Si l'email est déjà vérifié, rediriger vers dashboard
    if (user.email_confirmed_at) {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);

  const handleResendVerification = async () => {
    if (!user?.email) return;

    setLoading(true);
    setMessage('');

    try {
      // Renvoyer l'email de vérification
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email
      });

      if (error) {
        throw error;
      }

      setMessage('✅ Email de vérification renvoyé ! Vérifiez votre boîte email.');
    } catch (error: any) {
      console.error('Erreur lors du renvoi:', error);
      setMessage(`❌ Erreur : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  if (!user) {
    return null; // Le useEffect redirigera
  }

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
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        {/* Icône email */}
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#f0f4ff',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 30px'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="22,6 12,13 2,6" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '15px'
        }}>
          Vérifiez votre email
        </h1>

        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          lineHeight: '1.6',
          marginBottom: '20px'
        }}>
          Nous avons envoyé un email de confirmation à<br/>
          <strong style={{ color: '#667eea' }}>{user.email}</strong>
        </p>

        <p style={{
          color: '#6b7280',
          fontSize: '14px',
          lineHeight: '1.5',
          marginBottom: '30px'
        }}>
          Cliquez sur le lien dans l'email pour activer votre compte. 
          Si vous ne voyez pas l'email, vérifiez votre dossier spam.
        </p>

        {message && (
          <div style={{
            padding: '15px',
            borderRadius: '12px',
            marginBottom: '25px',
            backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
            color: message.includes('✅') ? '#065f46' : '#dc2626',
            border: `1px solid ${message.includes('✅') ? '#a7f3d0' : '#fca5a5'}`,
            fontSize: '14px'
          }}>
            {message}
          </div>
        )}

        <div style={{ marginBottom: '30px' }}>
          <button
            onClick={handleResendVerification}
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
              marginBottom: '15px'
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
                Envoi en cours...
              </span>
            ) : (
              'Renvoyer l\'email de vérification'
            )}
          </button>

          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: '15px',
              background: 'transparent',
              color: '#6b7280',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Se déconnecter
          </button>
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '10px'
          }}>
            Vous ne recevez pas l'email ?
          </h3>
          <ul style={{
            textAlign: 'left',
            color: '#6b7280',
            fontSize: '14px',
            lineHeight: '1.5',
            paddingLeft: '20px',
            margin: 0
          }}>
            <li>Vérifiez votre dossier spam/courrier indésirable</li>
            <li>Assurez-vous que l'adresse email est correcte</li>
            <li>Patientez quelques minutes (l'email peut prendre du temps)</li>
            <li>Cliquez sur "Renvoyer l'email" ci-dessus</li>
          </ul>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
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

export default VerifyEmail;