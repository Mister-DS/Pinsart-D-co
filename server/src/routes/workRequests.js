const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createWorkRequest,
  getUserWorkRequests,
  testController
} = require('../controllers/workRequestController');

// Toutes les routes nécessitent une authentification
router.use(auth);

// Route de test
router.get('/test', testController);

// POST /api/work-requests - Créer une nouvelle demande
router.post('/', createWorkRequest);

// GET /api/work-requests/my - Récupérer mes demandes
router.get('/my', getUserWorkRequests);

module.exports = router;