import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

const Home = () => {
  const { user } = useAuth();

  return (
    <div>
      <Header />
      
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            margin: '0 0 24px 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            🏠 Trouvez le professionnel parfait pour vos travaux
          </h1>
          <p style={{
            fontSize: '20px',
            margin: '0 0 40px 0',
            opacity: 0.9,
            lineHeight: '1.6'
          }}>
            Pinsart Déco vous connecte avec les meilleurs artisans de votre région. 
            Demandez des devis gratuits et choisissez le professionnel qui vous convient.
          </p>
          
          {!user && (
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/register"
                style={{
                  padding: '16px 32px',
                  backgroundColor: 'white',
                  color: '#667eea',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '16px',
                  transition: 'transform 0.2s ease',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                🚀 Commencer maintenant
              </Link>
              <Link
                to="/work-requests"
                style={{
                  padding: '16px 32px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.3)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                📋 Demander un devis
              </Link>
            </div>
          )}

          {user && (
            <div style={{
              padding: '24px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <p style={{ margin: '0 0 16px 0', fontSize: '18px' }}>
                👋 Bon retour, {user.user_metadata?.first_name || 'cher utilisateur'} !
              </p>
              <Link
                to="/dashboard"
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'white',
                  color: '#667eea',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Accéder à mon espace
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '700',
            textAlign: 'center',
            margin: '0 0 16px 0',
            color: '#111827'
          }}>
            Comment ça fonctionne ?
          </h2>
          <p style={{
            fontSize: '18px',
            textAlign: 'center',
            color: '#6b7280',
            margin: '0 0 60px 0'
          }}>
            En 3 étapes simples, trouvez le professionnel idéal
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '32px 24px',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '36px'
              }}>
                📝
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 16px 0', color: '#111827' }}>
                1. Décrivez votre projet
              </h3>
              <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: '1.6' }}>
                Remplissez notre formulaire en détaillant vos besoins, votre budget et vos préférences.
              </p>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '32px 24px',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '36px'
              }}>
                🔍
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 16px 0', color: '#111827' }}>
                2. Recevez des devis
              </h3>
              <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: '1.6' }}>
                Les professionnels qualifiés de votre région vous envoient leurs propositions personnalisées.
              </p>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '32px 24px',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#f59e0b',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '36px'
              }}>
                ⭐
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 16px 0', color: '#111827' }}>
                3. Choisissez et réalisez
              </h3>
              <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: '1.6' }}>
                Comparez les offres, choisissez votre professionnel et suivez l'avancement de vos travaux.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            margin: '0 0 16px 0',
            color: '#111827'
          }}>
            Prêt à commencer vos travaux ?
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            margin: '0 0 32px 0',
            lineHeight: '1.6'
          }}>
            Rejoignez des milliers de clients satisfaits qui ont trouvé leur professionnel idéal sur Pinsart Déco.
          </p>
          
          {!user ? (
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/register"
                style={{
                  padding: '16px 32px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#2563eb';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 12px rgba(59, 130, 246, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#3b82f6';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.3)';
                }}
              >
                🚀 Créer mon compte
              </Link>
              <Link
                to="/work-requests"
                style={{
                  padding: '16px 32px',
                  backgroundColor: 'transparent',
                  color: '#3b82f6',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '16px',
                  border: '2px solid #3b82f6',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#3b82f6';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#3b82f6';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                📋 Demander un devis gratuit
              </Link>
            </div>
          ) : (
            <Link
              to="/work-requests"
              style={{
                padding: '16px 32px',
                backgroundColor: '#10b981',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#059669';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 12px rgba(16, 185, 129, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#10b981';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 6px rgba(16, 185, 129, 0.3)';
              }}
            >
              📋 Créer une nouvelle demande
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#111827',
        color: 'white',
        padding: '60px 20px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px',
            marginBottom: '40px'
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '8px',
                  fontSize: '16px'
                }}>
                  🏠
                </div>
                <span style={{ fontSize: '20px', fontWeight: '700' }}>Pinsart Déco</span>
              </div>
              <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.6' }}>
                La plateforme de référence pour trouver les meilleurs professionnels du bâtiment et de la rénovation.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Services</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/about" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>À propos</Link>
                <Link to="/how-it-works" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Comment ça marche</Link>
                <Link to="/work-requests" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Demander un devis</Link>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Support</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="mailto:contact@pinsart-deco.be" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Contact</a>
                <a href="/help" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Aide</a>
                <a href="/terms" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Conditions d'utilisation</a>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Professionnels</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/register" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Devenir partenaire</Link>
                <Link to="/professionals" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Espace Pro</Link>
              </div>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid #374151',
            paddingTop: '20px',
            fontSize: '14px',
            color: '#9ca3af'
          }}>
            © 2025 Pinsart Déco. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;