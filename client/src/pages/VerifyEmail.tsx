import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function VerifyEmail() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);
  const { user } = useAuth();

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Récupérer les paramètres de l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const type = urlParams.get('type');
        const access_token = urlParams.get('access_token');
        const refresh_token = urlParams.get('refresh_token');

        console.log('📧 Verification params:', { token, type, access_token: !!access_token });

        if (type === 'signup' || access_token) {
          // La vérification se fait automatiquement par Supabase
          // quand l'utilisateur clique sur le lien dans l'email
          setStatus('success');
          setMessage('Votre email a été vérifié avec succès !');
          
          // Démarrer le countdown pour redirection
          const countdownInterval = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                window.location.href = '/login';
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          return () => clearInterval(countdownInterval);

        } else if (type === 'recovery') {
          // Gestion de la récupération de mot de passe
          setStatus('success');
          setMessage('Vous pouvez maintenant réinitialiser votre mot de passe.');
          setTimeout(() => {
            window.location.href = '/reset-password';
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Lien de vérification invalide ou expiré.');
        }
      } catch (error) {
        console.error('💥 Verification error:', error);
        setStatus('error');
        setMessage('Une erreur est survenue lors de la vérification.');
      }
    };

    handleEmailVerification();
  }, []);

  const resendVerificationEmail = async () => {
    if (!user?.email) {
      setMessage('Impossible de renvoyer l\'email. Veuillez vous réinscrire.');
      setTimeout(() => {
        window.location.href = '/register';
      }, 2000);
      return;
    }

    try {
      setMessage('Email de vérification renvoyé ! Vérifiez votre boîte mail.');
      // Note: Dans un vrai projet, tu aurais une fonction pour renvoyer l'email
      setTimeout(() => {
        window.location.href = '/register';
      }, 3000);
    } catch (error) {
      setMessage('Erreur lors de l\'envoi de l\'email de vérification.');
    }
  };

  const goToLogin = () => {
    window.location.href = '/login';
  };

  const goToRegister = () => {
    window.location.href = '/register';
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
        backgroundColor: 'white',
        padding: '60px 50px',
        borderRadius: '24px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Effet de fond */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.05) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Loading */}
          {status === 'loading' && (
            <>
              <div style={{
                width: '80px',
                height: '80px',
                border: '6px solid #f1f5f9',
                borderTop: '6px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1.5s linear infinite',
                margin: '0 auto 30px auto'
              }}></div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '15px'
              }}>
                Vérification en cours...
              </h1>
              <p style={{
                color: '#6b7280',
                fontSize: '16px',
                lineHeight: '1.6'
              }}>
                Nous vérifions votre adresse email. Veuillez patienter quelques instants.
              </p>
            </>
          )}

          {/* Success */}
          {status === 'success' && (
            <>
              <div style={{
                width: '100px',
                height: '100px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 30px auto',
                fontSize: '48px',
                boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)',
                animation: 'pulse 2s infinite'
              }}>
                ✅
              </div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '15px'
              }}>
                Email vérifié !
              </h1>
              <p style={{
                color: '#6b7280',
                fontSize: '18px',
                lineHeight: '1.6',
                marginBottom: '30px'
              }}>
                {message}
              </p>
              
              {/* Countdown et redirection */}
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '30px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  color: '#667eea',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '3px solid #667eea',
                    borderTop: '3px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Redirection vers la connexion dans {countdown}s...
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={goToLogin}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '25px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }}
                  onMouseOver={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.transform = 'translateY(-2px)';
                    target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                  }}
                  onMouseOut={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.transform = 'translateY(0)';
                    target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                  }}
                >
                  🔑 Se connecter maintenant
                </button>
              </div>
            </>
          )}

          {/* Error */}
          {status === 'error' && (
            <>
              <div style={{
                width: '100px',
                height: '100px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 30px auto',
                fontSize: '48px',
                boxShadow: '0 20px 40px rgba(239, 68, 68, 0.3)'
              }}>
                ❌
              </div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#dc2626',
                marginBottom: '15px'
              }}>
                Erreur de vérification
              </h1>
              <p style={{
                color: '#6b7280',
                fontSize: '16px',
                lineHeight: '1.6',
                marginBottom: '30px'
              }}>
                {message}
              </p>

              <div style={{
                backgroundColor: '#fef2f2',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '30px',
                border: '1px solid #fecaca'
              }}>
                <h3 style={{ 
                  color: '#991b1b', 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  margin: '0 0 10px 0' 
                }}>
                  💡 Que faire ?
                </h3>
                <ul style={{ 
                  color: '#7f1d1d', 
                  fontSize: '14px', 
                  margin: 0, 
                  paddingLeft: '20px',
                  textAlign: 'left',
                  lineHeight: '1.5'
                }}>
                  <li>Vérifiez que le lien n'a pas expiré</li>
                  <li>Essayez de demander un nouvel email</li>
                  <li>Contactez le support si le problème persiste</li>
                </ul>
              </div>

              <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={resendVerificationEmail}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '25px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  📧 Renvoyer l'email
                </button>
                <button
                  onClick={goToRegister}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#667eea',
                    border: '2px solid #667eea',
                    padding: '10px 24px',
                    borderRadius: '25px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.backgroundColor = '#667eea';
                    target.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.backgroundColor = 'transparent';
                    target.style.color = '#667eea';
                  }}
                >
                  🔄 Nouvelle inscription
                </button>
              </div>
            </>
          )}

          {/* Lien retour */}
          <div style={{
            marginTop: '40px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <a
              href="/"
              style={{
                color: '#9ca3af',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'color 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
              onMouseOver={(e) => {
                const target = e.target as HTMLElement;
                target.style.color = '#667eea';
              }}
              onMouseOut={(e) => {
                const target = e.target as HTMLElement;
                target.style.color = '#9ca3af';
              }}
            >
              ← Retour à l'accueil
            </a>
          </div>
        </div>

        {/* Animations CSS */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
            
            @keyframes fadeIn {
              0% { opacity: 0; transform: translateY(20px); }
              100% { opacity: 1; transform: translateY(0); }
            }
          `
        }} />
      </div>
    </div>
  );
}

export default VerifyEmail;