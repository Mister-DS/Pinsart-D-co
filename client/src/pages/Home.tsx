import React from 'react';
import ServiceCard from '../components/ServiceCard';

function Home() {
  const siteName = "Pinsart Déco";

  return (
    <div className="App">
      <header style={{backgroundColor: '#2563eb', color: 'white', padding: '20px'}}>
        <h1>{siteName}</h1>
        <p>Votre partenaire pour la décoration et la rénovation</p>
        
        {/* Navigation */}
        <div style={{ marginTop: '15px' }}>
          <a 
            href="/register" 
            style={{ 
              color: 'white', 
              textDecoration: 'none', 
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '8px 16px',
              borderRadius: '6px',
              marginRight: '10px'
            }}
          >
            S'inscrire
          </a>
          <a 
            href="/login" 
            style={{ 
              color: 'white', 
              textDecoration: 'none',
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '8px 16px',
              borderRadius: '6px'
            }}
          >
            Se connecter
          </a>
        </div>
      </header>

      <main style={{padding: '40px 20px'}}>
        <h2>Nos services</h2>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}}>
          <ServiceCard 
            title="Decoration interieure" 
            description="Transformez vos espaces avec nos experts" 
          />
          <ServiceCard 
            title="Renovation" 
            description="Modernisez votre habitat" 
          />
          <ServiceCard 
            title="Conseil personnalise" 
            description="Des solutions adaptees a vos besoins" 
          />
        </div>
      </main>
    </div>
  );
}

export default Home;