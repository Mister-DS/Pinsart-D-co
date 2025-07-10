import { supabase } from '../supabase';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

// Fonction pour obtenir le token d'authentification
const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};

// Fonction générique pour les appels API
const apiCall = async (endpoint, options = {}) => {
  const token = await getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erreur API');
  }

  return data;
};

// API pour les demandes de travaux
export const workRequestsAPI = {
  // Créer une nouvelle demande
  create: (workRequestData) =>
    apiCall('/api/work-requests', {
      method: 'POST',
      body: JSON.stringify(workRequestData),
    }),

  // Récupérer mes demandes
  getMy: () => apiCall('/api/work-requests/my'),

  // Test de connexion
  test: () => apiCall('/api/work-requests/test'),
};

export default apiCall;