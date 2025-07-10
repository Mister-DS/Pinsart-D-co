const { supabase } = require('../config/supabase');

// Créer une nouvelle demande de travaux
const createWorkRequest = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      budget_min,
      budget_max,
      desired_date,
      location_city
    } = req.body;

    const userId = req.user.id;

    const { data, error } = await supabase
      .from('work_requests')
      .insert([
        {
          user_id: userId,
          title,
          description,
          category,
          budget_min,
          budget_max,
          desired_date,
          location_city,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Demande de travaux créée avec succès',
      workRequest: data
    });
  } catch (error) {
    console.error('Erreur lors de la création de la demande:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Récupérer toutes les demandes d'un utilisateur
const getUserWorkRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('work_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ workRequests: data });
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Test simple pour vérifier que le contrôleur fonctionne
const testController = async (req, res) => {
  res.json({ 
    message: 'Contrôleur work requests fonctionne !',
    user: req.user.email 
  });
};

module.exports = {
  createWorkRequest,
  getUserWorkRequests,
  testController
};