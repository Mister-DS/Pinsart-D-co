import React, { useState } from 'react';

function Landing() {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Merci ${email} ! Nous vous tiendrons informé.`);
    setEmail('');
  };

  return (
    <div style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      lineHeight: '1.6',
      margin: 0,
      padding: 0
    }}>
      {/* Navigation fixe */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        padding: '15px 0',
        zIndex: 1000,
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 20px'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Pinsart Déco
          </div>
          
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <a href="#services" style={{
              color: '#374151',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.3s ease'
            }}>Services</a>
            <a href="#comment" style={{
              color: '#374151',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.3s ease'
            }}>Comment ça marche</a>
            <a href="#contact" style={{
              color: '#374151',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.3s ease'
            }}>Contact</a>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <a href="/login" style={{
                color: '#667eea',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '20px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}>
                Connexion
              </a>
              <a href="/register" style={{
                backgroundColor: '#667eea',
                color: 'white',
                textDecoration: 'none',
                padding: '8px 20px',
                borderRadius: '20px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 10px rgba(102, 126, 234, 0.3)'
              }}>
                Commencer
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Effet de particules en arrière-plan */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
          `
        }} />
        
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center',
          zIndex: 1
        }}>
          {/* Contenu principal */}
          <div style={{ color: 'white' }}>
            <h1 style={{
              fontSize: '56px',
              fontWeight: 'bold',
              margin: '0 0 20px 0',
              lineHeight: '1.1',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              Transformez votre{' '}
              <span style={{
                background: 'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                maison
              </span>{' '}
              en rêve
            </h1>
            
            <p style={{
              fontSize: '22px',
              margin: '0 0 40px 0',
              opacity: 0.9,
              lineHeight: '1.5'
            }}>
              Connectez-vous avec des professionnels qualifiés pour tous vos projets de décoration et rénovation. Simple, rapide et sur-mesure.
            </p>

            {/* CTA Buttons */}
            <div style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '50px'
            }}>
              <a href="/register" style={{
                display: 'inline-block',
                backgroundColor: 'white',
                color: '#667eea',
                padding: '18px 32px',
                borderRadius: '30px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '18px',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease'
              }}>
                Démarrer mon projet
              </a>
              
              <button style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: '2px solid white',
                padding: '16px 32px',
                borderRadius: '30px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                ▶ Voir la démo
              </button>
            </div>

            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '30px',
              opacity: 0.9
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>500+</div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>Projets réalisés</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>50+</div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>Professionnels</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>4.8★</div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>Note moyenne</div>
              </div>
            </div>
          </div>

          {/* Image/Mockup */}
          <div style={{
            position: 'relative',
            textAlign: 'center'
          }}>
            <div style={{
              width: '400px',
              height: '500px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              📱 Mockup de l'app
              <br />
              (À remplacer par une vraie image)
            </div>
          </div>
        </div>
      </section>

      {/* Section Services */}
      <section id="services" style={{
        padding: '100px 20px',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '42px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: '0 0 20px 0'
          }}>
            Nos services
          </h2>
          <p style={{
            fontSize: '20px',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto 60px auto'
          }}>
            Des solutions complètes pour tous vos besoins en décoration et rénovation
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px'
          }}>
            {/* Service 1 */}
            <div style={{
              backgroundColor: 'white',
              padding: '40px 30px',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#667eea',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 25px auto',
                fontSize: '32px'
              }}>
                🎨
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0 0 15px 0'
              }}>
                Décoration intérieure
              </h3>
              <p style={{
                color: '#6b7280',
                fontSize: '16px',
                lineHeight: '1.6'
              }}>
                Design personnalisé, conseils couleurs, aménagement d'espaces. Nos décorateurs transforment votre intérieur selon vos goûts.
              </p>
            </div>

            {/* Service 2 */}
            <div style={{
              backgroundColor: 'white',
              padding: '40px 30px',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#10b981',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 25px auto',
                fontSize: '32px'
              }}>
                🔨
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0 0 15px 0'
              }}>
                Rénovation
              </h3>
              <p style={{
                color: '#6b7280',
                fontSize: '16px',
                lineHeight: '1.6'
              }}>
                Travaux de rénovation complets, de la petite réparation aux gros œuvres. Professionnels certifiés et matériaux de qualité.
              </p>
            </div>

            {/* Service 3 */}
            <div style={{
              backgroundColor: 'white',
              padding: '40px 30px',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#f59e0b',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 25px auto',
                fontSize: '32px'
              }}>
                💡
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0 0 15px 0'
              }}>
                Conseil & Expertise
              </h3>
              <p style={{
                color: '#6b7280',
                fontSize: '16px',
                lineHeight: '1.6'
              }}>
                Accompagnement personnalisé, études de faisabilité, estimations budgétaires. L'expertise pour réussir votre projet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Comment ça marche */}
      <section id="comment" style={{
        padding: '100px 20px',
        backgroundColor: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{
              fontSize: '42px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: '0 0 20px 0'
            }}>
              Comment ça marche
            </h2>
            <p style={{
              fontSize: '20px',
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Un processus simple et transparent pour concrétiser vos projets
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '60px'
          }}>
            {/* Étape 1 */}
            <div style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 30px auto',
                color: 'white',
                fontSize: '48px',
                fontWeight: 'bold',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
              }}>
                1
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0 0 15px 0'
              }}>
                Décrivez votre projet
              </h3>
              <p style={{
                color: '#6b7280',
                fontSize: '16px',
                lineHeight: '1.6'
              }}>
                Remplissez un formulaire détaillé avec vos besoins, votre budget et vos délais. Plus c'est précis, mieux nous pourrons vous aider.
              </p>
            </div>

            {/* Étape 2 */}
            <div style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 30px auto',
                color: 'white',
                fontSize: '48px',
                fontWeight: 'bold',
                boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
              }}>
                2
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0 0 15px 0'
              }}>
                Recevez des propositions
              </h3>
              <p style={{
                color: '#6b7280',
                fontSize: '16px',
                lineHeight: '1.6'
              }}>
                Nos professionnels qualifiés étudient votre demande et vous proposent des devis personnalisés avec photos et recommandations.
              </p>
            </div>

            {/* Étape 3 */}
            <div style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 30px auto',
                color: 'white',
                fontSize: '48px',
                fontWeight: 'bold',
                boxShadow: '0 10px 30px rgba(245, 158, 11, 0.3)'
              }}>
                3
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0 0 15px 0'
              }}>
                Concrétisez votre rêve
              </h3>
              <p style={{
                color: '#6b7280',
                fontSize: '16px',
                lineHeight: '1.6'
              }}>
                Choisissez votre professionnel, planifiez les travaux et suivez l'avancement en temps réel. Satisfaction garantie !
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section CTA finale */}
      <section style={{
        padding: '100px 20px',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '42px',
            fontWeight: 'bold',
            margin: '0 0 20px 0',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            Prêt à transformer votre maison ?
          </h2>
          <p style={{
            fontSize: '20px',
            margin: '0 0 40px 0',
            opacity: 0.9
          }}>
            Rejoignez des milliers de clients satisfaits qui ont fait confiance à Pinsart Déco
          </p>
          
          <a href="/register" style={{
            display: 'inline-block',
            backgroundColor: 'white',
            color: '#f5576c',
            padding: '20px 40px',
            borderRadius: '30px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '18px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease',
            marginBottom: '30px'
          }}>
            Créer mon compte gratuitement
          </a>

          {/* Newsletter */}
          <div style={{ marginTop: '50px' }}>
            <h3 style={{ fontSize: '24px', margin: '0 0 20px 0' }}>
              Restez informé de nos nouveautés
            </h3>
            <form onSubmit={handleNewsletterSubmit} style={{
              display: 'flex',
              maxWidth: '400px',
              margin: '0 auto',
              gap: '10px'
            }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse email"
                required
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '25px',
                  border: 'none',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
              <button type="submit" style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '2px solid white',
                padding: '12px 24px',
                borderRadius: '25px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                S'abonner
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '60px 20px 30px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px',
            marginBottom: '40px'
          }}>
            {/* Colonne 1 */}
            <div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                margin: '0 0 20px 0',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Pinsart Déco
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>
                La plateforme de référence pour connecter clients et professionnels de la décoration et rénovation.
              </p>
            </div>

            {/* Colonne 2 */}
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px 0' }}>
                Services
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#9ca3af' }}>
                <li style={{ marginBottom: '8px' }}>Décoration intérieure</li>
                <li style={{ marginBottom: '8px' }}>Rénovation</li>
                <li style={{ marginBottom: '8px' }}>Conseil et expertise</li>
                <li style={{ marginBottom: '8px' }}>Suivi de projet</li>
              </ul>
            </div>

            {/* Colonne 3 */}
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px 0' }}>
                Support
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#9ca3af' }}>
                <li style={{ marginBottom: '8px' }}>Centre d'aide</li>
                <li style={{ marginBottom: '8px' }}>Contact</li>
                <li style={{ marginBottom: '8px' }}>FAQ</li>
                <li style={{ marginBottom: '8px' }}>Garanties</li>
              </ul>
            </div>

            {/* Colonne 4 */}
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px 0' }}>
                Légal
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#9ca3af' }}>
                <li style={{ marginBottom: '8px' }}>Conditions d'utilisation</li>
                <li style={{ marginBottom: '8px' }}>Politique de confidentialité</li>
                <li style={{ marginBottom: '8px' }}>Mentions légales</li>
                <li style={{ marginBottom: '8px' }}>Cookies</li>
              </ul>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid #374151',
            paddingTop: '30px',
            textAlign: 'center',
            color: '#9ca3af'
          }}>
            <p style={{ margin: 0 }}>
              © 2025 Pinsart Déco. Tous droits réservés. Développé avec ❤️ par Simon Dierickx
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;