const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration CORS plus permissive
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware pour parser JSON
app.use(express.json());

// Routes de test
app.get('/api/test', (req, res) => {
  console.log('Route /api/test appelée');
  res.json({ message: 'Serveur fonctionne !' });
});

app.get('/api/supabase-test', async (req, res) => {
  try {
    const { supabase } = require('./config/supabase');
    
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) throw error;
    
    res.json({ 
      message: 'Nouvelle config Supabase OK !',
      userCount: data || 0
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur Supabase',
      error: error.message 
    });
  }
});

app.get('/api/users-test', async (req, res) => {
  try {
    const { supabase } = require('./config/supabase');
    
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role')
      .limit(5);
    
    if (error) throw error;
    
    res.json({ 
      message: 'Utilisateurs récupérés !',
      users: data
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message 
    });
  }
});

// Routes API pour les demandes de travaux
const workRequestsRoutes = require('./routes/workRequests');
app.use('/api/work-requests', workRequestsRoutes);

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Serveur démarré sur http://127.0.0.1:${PORT}`);
});