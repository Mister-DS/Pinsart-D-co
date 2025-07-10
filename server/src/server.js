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
    
    // Test avec la nouvelle table user_profiles
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count', { count: 'exact', head: true });
    
    if (error) throw error;
    
    res.json({ 
      message: 'Connexion Supabase OK !',
      userProfilesCount: data || 0
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
    
    // Utiliser la vue users_complete qui combine auth.users et user_profiles
    const { data, error } = await supabase
      .from('users_complete')
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

// Test de création d'un profil utilisateur
app.post('/api/test-profile', async (req, res) => {
  try {
    const { supabase } = require('./config/supabase');
    
    const testProfile = {
      id: '550e8400-e29b-41d4-a716-446655440000', // UUID de test
      first_name: 'Test',
      last_name: 'User',
      role: 'user'
    };
    
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([testProfile])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ 
      message: 'Profil de test créé !',
      profile: data
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la création du profil',
      error: error.message 
    });
  }
});

// Routes API pour les demandes de travaux
const workRequestsRoutes = require('./routes/workRequests');
app.use('/api/work-requests', workRequestsRoutes);

// Route pour créer/mettre à jour un profil utilisateur
app.post('/api/profile', async (req, res) => {
  try {
    const { supabase } = require('./config/supabase');
    const { auth } = require('./middleware/auth');
    
    // Simuler l'authentification pour le test
    const userId = req.body.user_id || 'test-user-id';
    const profileData = req.body;
    
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert([{ id: userId, ...profileData }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ 
      message: 'Profil mis à jour !',
      profile: data
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour du profil',
      error: error.message 
    });
  }
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Serveur démarré sur http://127.0.0.1:${PORT}`);
  console.log(`📊 Test Supabase: http://127.0.0.1:${PORT}/api/supabase-test`);
  console.log(`👥 Test utilisateurs: http://127.0.0.1:${PORT}/api/users-test`);
});