import React from 'react';
import ServiceCard from '../components/ServiceCard';

function Home() {
  const siteName = "Pinsart Déco";

  return (
    <div style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {/* Header avec navigation */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px 20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Logo et titre */}
          <div>
            <h1 style={{ 
              fontSize: '36px',
              fontWeight: 'bold',
              margin: '0 0 10px 0',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              {siteName}
            </h1>
            <p style={{ 
              fontSize: '18px',
              margin: 0,
              opacity: 0.9
            }}>
              Votre partenaire pour la décoration et la rénovation
            </p>
          </div>
          
          {/* Navigation */}
          <div style={{ 
            display: 'flex',
            gap: '15px',
            marginTop: '15px'
          }}>
            <a 
              href="/register" 
              style={{ 
                color: 'white', 
                textDecoration: 'none', 
                backgroundColor: 'rgba(255,255,255,0.2)',
                padding: '12px 24px',
                borderRadius: '25px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                border: '2px solid rgba(255,255,255,0.3)'
              }}
              onMouseOver={(e) => {
                const target = e.target as HTMLElement;
                target.style.backgroundColor = 'rgba(255,255,255,0.3)';
                target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                const target = e.target as HTMLElement;
                target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                target.style.transform = 'translateY(0)';
              }}
            >
              S'inscrire
            </a>
            <a 
              href="/login" 
              style={{ 
                color: '#667eea', 
                textDecoration: 'none',
                backgroundColor: 'white',
                padding: '12px 24px',
                borderRadius: '25px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}
              onMouseOver={(e) => {
                const target = e.target as HTMLElement;
                target.style.transform = 'translateY(-2px)';
                target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                const target = e.target as HTMLElement;
                target.style.transform = 'translateY(0)';
                target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
              }}
            >
              Se connecter
            </a>
          </div>
        </div>
      </header>

      {/* Section héro */}
      <section style={{
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        padding: '80px 20px',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            margin: '0 0 20px 0',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            Transformez votre maison
          </h2>
          <p style={{
            fontSize: '20px',
            margin: '0 0 40px 0',
            opacity: 0.9,
            lineHeight: '1.6'
          }}>
            Connectez-vous avec des professionnels qualifiés pour tous vos projets de décoration et rénovation
          </p>
          <a 
            href="/register"
            style={{
              display: 'inline-block',
              backgroundColor: 'white',
              color: '#f5576c',
              padding: '18px 36px',
              borderRadius: '30px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '18px',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              const target = e.target as HTMLElement;
              target.style.transform = 'translateY(-3px)';
              target.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.3)';
            }}
            onMouseOut={(e) => {
              const target = e.target as HTMLElement;
              target.style.transform = 'translateY(0)';
              target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
            }}
          >
            Commencer maintenant
          </a>
        </div>
      </section>

      {/* Section services */}
      <main style={{
        padding: '80px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: '0 0 20px 0'
          }}>
            Nos services
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Découvrez notre gamme complète de services pour embellir et rénover votre habitat
          </p>
        </div>

        <div style={{
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '30px'
        }}>
          <ServiceCard 
            title="Décoration intérieure" 
            description="Transformez vos espaces avec nos experts en décoration. Design personnalisé et conseils sur-mesure." 
          />
          <ServiceCard 
            title="Rénovation" 
            description="Modernisez votre habitat avec nos professionnels qualifiés. De la petite réparation aux gros travaux." 
          />
          <ServiceCard 
            title="Conseil personnalisé" 
            description="Bénéficiez de conseils d'experts adaptés à vos besoins et votre budget pour tous vos projets." 
          />
        </div>
      </main>

      {/* Section comment ça marche */}
      <section style={{
        backgroundColor: 'white',
        padding: '80px 20px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#1f2937',
            textAlign: 'center',
            margin: '0 0 60px 0'
          }}>
            Comment ça marche
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px'
          }}>
            {/* Étape 1 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#667eea',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                color: 'white',
                fontSize: '32px',
                fontWeight: 'bold'
              }}>
                1
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 15px 0' }}>
                Décrivez votre projet
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Créez votre demande en détaillant vos besoins, votre budget et vos délais
              </p>
            </div>

            {/* Étape 2 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                color: 'white',
                fontSize: '32px',
                fontWeight: 'bold'
              }}>
                2
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 15px 0' }}>
                Recevez des devis
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Nos professionnels vous proposent des devis personnalisés pour votre projet
              </p>
            </div>

            {/* Étape 3 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#f59e0b',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                color: 'white',
                fontSize: '32px',
                fontWeight: 'bold'
              }}>
                3
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 15px 0' }}>
                Réalisez vos travaux
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Choisissez votre professionnel et suivez l'avancement de vos travaux
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 20px 0' }}>
            Pinsart Déco
          </h3>
          <p style={{ color: '#9ca3af', margin: '0 0 30px 0' }}>
            Votre partenaire de confiance pour tous vos projets de décoration et rénovation
          </p>
          <div style={{
            borderTop: '1px solid #374151',
            paddingTop: '20px',
            color: '#9ca3af',
            fontSize: '14px'
          }}>
            © 2025 Pinsart Déco. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;