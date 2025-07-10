const { supabase } = require('../config/supabase');

// Créer une nouvelle demande de travaux
const createWorkRequest = async (req, res) => {
  try {
    console.log('Données reçues:', req.body); // Debug

    const {
      title,
      description,
      category,
      budget_min,
      budget_max,
      desired_date,
      urgency,
      location_address,
      location_city,
      location_postal_code,
      images,
      notes
    } = req.body;

    const userId = req.user.id;

    // Validation des données obligatoires
    if (!title || !description || !category) {
      return res.status(400).json({ 
        message: 'Titre, description et catégorie sont requis' 
      });
    }

    if (!location_city) {
      return res.status(400).json({ 
        message: 'La ville est obligatoire' 
      });
    }

    // Préparer les données à insérer
    const insertData = {
      user_id: userId,
      title: title.trim(),
      description: description.trim(),
      category,
      budget_min: budget_min ? parseFloat(budget_min) : null,
      budget_max: budget_max ? parseFloat(budget_max) : null,
      desired_date: desired_date || null,
      urgency: urgency || 'medium',
      status: 'pending',
      location_address: location_address ? location_address.trim() : null,
      location_city: location_city.trim(),
      location_postal_code: location_postal_code ? location_postal_code.trim() : null,
      images: images || null, // Array d'URLs ou null
      notes: notes ? notes.trim() : null
    };

    console.log('Données à insérer:', insertData); // Debug

    const { data, error } = await supabase
      .from('work_requests')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      throw error;
    }

    console.log('Demande créée:', data); // Debug

    res.status(201).json({
      message: 'Demande de travaux créée avec succès',
      workRequest: data
    });
  } catch (error) {
    console.error('Erreur lors de la création de la demande:', error);
    res.status(500).json({ 
      message: 'Erreur serveur', 
      error: error.message,
      details: error.details || null
    });
  }
};

// Récupérer toutes les demandes d'un utilisateur
const getUserWorkRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('work_requests_with_users')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur Supabase:', error);
      throw error;
    }

    res.json({ workRequests: data });
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    res.status(500).json({ 
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// Récupérer toutes les demandes (pour les professionnels)
const getAllWorkRequests = async (req, res) => {
  try {
    const { category, status, city } = req.query;
    
    let query = supabase
      .from('work_requests_with_users')
      .select('*');

    // Filtres optionnels
    if (category) {
      query = query.eq('category', category);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (city) {
      query = query.ilike('location_city', `%${city}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Erreur Supabase:', error);
      throw error;
    }

    res.json({ workRequests: data });
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    res.status(500).json({ 
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// Mettre à jour le statut d'une demande
const updateWorkRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_to } = req.body;
    const userId = req.user.id;

    // Vérifier que l'utilisateur peut modifier cette demande
    const { data: workRequest, error: fetchError } = await supabase
      .from('work_requests')
      .select('user_id, assigned_to')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    // Seul le créateur ou l'assigné peut modifier
    if (workRequest.user_id !== userId && workRequest.assigned_to !== userId) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (assigned_to) updateData.assigned_to = assigned_to;
    
    const { data, error } = await supabase
      .from('work_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      throw error;
    }

    res.json({
      message: 'Demande mise à jour avec succès',
      workRequest: data
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({ 
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// Test simple pour vérifier que le contrôleur fonctionne
const testController = async (req, res) => {
  try {
    // Récupérer les infos du profil utilisateur
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('Erreur lors de la récupération du profil:', error);
    }

    res.json({ 
      message: 'Contrôleur work requests fonctionne !',
      user: {
        id: req.user.id,
        email: req.user.email,
        profile: profile || null
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur dans testController:', error);
    res.status(500).json({ 
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

module.exports = {
  createWorkRequest,
  getUserWorkRequests,
  getAllWorkRequests,
  updateWorkRequestStatus,
  testController
};