import React, { useEffect, useState } from 'react';
import './App.css';
import ServiceCard from './components/ServiceCard';
import { supabase } from './supabase';

function App() {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');

  // Test de connexion Supabase
  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('count', { count: 'exact' });
        
        if (error) {
          setConnectionStatus(`❌ Erreur: ${error.message}`);
        } else {
          setConnectionStatus('✅ Connexion Supabase réussie !');
        }
      } catch (err) {
        setConnectionStatus('❌ Erreur de connexion');
      }
    };

    testConnection();
  }, []);

  const siteName = "Pinsart Déco";

  return (
    <div className="App">
      <header style={{backgroundColor: '#2563eb', color: 'white', padding: '20px'}}>
        <h1>{siteName}</h1>
        <p>Votre partenaire pour la décoration et la rénovation</p>
        <div style={{backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '5px', marginTop: '10px'}}>
          <strong>Status DB: {connectionStatus}</strong>
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

export default App;