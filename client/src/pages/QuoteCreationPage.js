import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

// Composant Alert réutilisable
const Alert = ({ type, message, onClose, autoClose = true }) => {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const getAlertStyles = () => {
    const baseStyles = {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      padding: '16px 20px',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      minWidth: '300px',
      maxWidth: '500px',
      fontSize: '14px',
      fontWeight: '500',
      animation: 'slideIn 0.3s ease-out',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(16, 185, 129, 0.95)',
          color: 'white',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        };
      case 'error':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(239, 68, 68, 0.95)',
          color: 'white',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        };
      case 'warning':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(245, 158, 11, 0.95)',
          color: 'white',
          border: '1px solid rgba(245, 158, 11, 0.3)'
        };
      case 'info':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(59, 130, 246, 0.95)',
          color: 'white',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        };
      default:
        return baseStyles;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div style={getAlertStyles()}>
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {getIcon()}
        </div>
        <div style={{ flex: 1 }}>
          {message}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              fontSize: '16px',
              opacity: 0.7,
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '1'}
            onMouseLeave={(e) => e.target.style.opacity = '0.7'}
          >
            ×
          </button>
        )}
      </div>
    </>
  );
};

const QuoteCreationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [clients, setClients] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  
  const [quoteData, setQuoteData] = useState({
    client_id: '',
    title: '',
    description: '',
    work_location: '',
    estimated_duration: '',
    estimated_start_date: '',
    notes: '',
    status: 'draft'
  });

  const [quoteItems, setQuoteItems] = useState([
    {
      id: Date.now(),
      description: '',
      quantity: 1,
      unit_price: 0,
      total: 0
    }
  ]);

  // Fonction pour afficher les alertes
  const showAlert = (type, message) => {
    setAlert({ type, message });
  };

  const closeAlert = () => {
    setAlert(null);
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserProfile();
    fetchClients();
  }, [user, navigate]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        showAlert('error', 'Erreur lors du chargement du profil');
        return;
      }

      setUserProfile(data);
      
      // Vérifier que l'utilisateur est un professionnel
      if (data.role !== 'professional' && data.role !== 'admin') {
        showAlert('error', 'Accès non autorisé. Seuls les professionnels peuvent créer des devis.');
        setTimeout(() => navigate('/dashboard'), 3000);
        return;
      }
    } catch (error) {
      console.error('Erreur:', error);
      showAlert('error', 'Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'user')
        .order('first_name');

      if (error) {
        console.error('Erreur lors de la récupération des clients:', error);
        showAlert('warning', 'Impossible de charger la liste des clients');
        return;
      }

      setClients(data);
    } catch (error) {
      console.error('Erreur:', error);
      showAlert('error', 'Erreur lors du chargement des clients');
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!quoteData.client_id) errors.client_id = 'Veuillez sélectionner un client';
    if (!quoteData.title.trim()) errors.title = 'Le titre est obligatoire';
    if (!quoteData.description.trim()) errors.description = 'La description est obligatoire';
    
    const validItems = quoteItems.filter(item => item.description.trim() !== '');
    if (validItems.length === 0) {
      errors.items = 'Veuillez ajouter au moins un item au devis';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleQuoteDataChange = (e) => {
    const { name, value } = e.target;
    setQuoteData({
      ...quoteData,
      [name]: value
    });
    
    // Supprimer l'erreur si le champ est maintenant valide
    if (formErrors[name] && value.trim()) {
      setFormErrors({
        ...formErrors,
        [name]: undefined
      });
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...quoteItems];
    updatedItems[index][field] = value;
    
    // Recalculer le total pour cet item
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = parseFloat(updatedItems[index].quantity) || 0;
      const unitPrice = parseFloat(updatedItems[index].unit_price) || 0;
      updatedItems[index].total = quantity * unitPrice;
    }
    
    setQuoteItems(updatedItems);
    
    // Supprimer l'erreur des items si on a au moins un item valide
    if (formErrors.items && updatedItems.some(item => item.description.trim() !== '')) {
      setFormErrors({
        ...formErrors,
        items: undefined
      });
    }
  };

  const addItem = () => {
    setQuoteItems([
      ...quoteItems,
      {
        id: Date.now(),
        description: '',
        quantity: 1,
        unit_price: 0,
        total: 0
      }
    ]);
    showAlert('info', 'Nouvelle ligne ajoutée');
  };

  const removeItem = (index) => {
    if (quoteItems.length > 1) {
      setQuoteItems(quoteItems.filter((_, i) => i !== index));
      showAlert('info', 'Ligne supprimée');
    }
  };

  const calculateTotal = () => {
    return quoteItems.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showAlert('error', 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setSaving(true);

    try {
      const validItems = quoteItems.filter(item => item.description.trim() !== '');
      
      if (validItems.length === 0) {
        showAlert('error', 'Veuillez ajouter au moins un item au devis');
        setSaving(false);
        return;
      }

      // Insérer le devis principal
      const quotePayload = {
        professional_id: user.id,
        client_id: quoteData.client_id,
        title: quoteData.title.trim(),
        description: quoteData.description.trim(),
        work_location: quoteData.work_location.trim() || null,
        estimated_duration: quoteData.estimated_duration.trim() || null,
        estimated_start_date: quoteData.estimated_start_date || null,
        notes: quoteData.notes.trim() || null,
        total_amount: calculateTotal(),
        status: quoteData.status,
        created_at: new Date().toISOString()
      };

      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert([quotePayload])
        .select()
        .single();

      if (quoteError) {
        throw quoteError;
      }

      // Insérer les items du devis
      const itemsPayload = validItems.map(item => ({
        quote_id: quote.id,
        description: item.description.trim(),
        quantity: parseFloat(item.quantity) || 0,
        unit_price: parseFloat(item.unit_price) || 0,
        total_price: parseFloat(item.total) || 0
      }));

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(itemsPayload);

      if (itemsError) {
        throw itemsError;
      }

      const statusText = quoteData.status === 'draft' ? 'sauvegardé en brouillon' : 'créé et envoyé';
      showAlert('success', `Devis ${statusText} avec succès !`);
      
      setTimeout(() => {
        navigate('/quotes');
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de la création du devis:', error);
      showAlert('error', 'Erreur lors de la création du devis. Veuillez réessayer.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsDraft = () => {
    setQuoteData({...quoteData, status: 'draft'});
    setTimeout(() => {
      document.querySelector('form').requestSubmit();
    }, 100);
  };

  const handleSendQuote = () => {
    setQuoteData({...quoteData, status: 'sent'});
    setTimeout(() => {
      document.querySelector('form').requestSubmit();
    }, 100);
  };

  const getInputStyle = (fieldName) => ({
    width: '100%',
    padding: '12px 16px',
    border: `2px solid ${formErrors[fieldName] ? '#ef4444' : '#e5e7eb'}`,
    borderRadius: '12px',
    fontSize: '16px',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  });

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '40px',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ fontSize: '18px', color: '#666', margin: 0 }}>Chargement...</p>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingTop: '70px'
    }}>
      {/* Système d'alertes */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={closeAlert}
        />
      )}

      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '40px'
      }}>
        {/* En-tête */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          marginBottom: '30px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #2196f3, #1976d2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            margin: '0 auto 20px',
            boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)'
          }}>
            📋
          </div>
          
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '32px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Nouveau Devis
          </h1>
          
          <p style={{
            margin: '0',
            fontSize: '16px',
            color: '#6b7280'
          }}>
            Créez un devis détaillé pour vos clients
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Informations générales */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '30px',
            marginBottom: '24px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{
              margin: '0 0 24px 0',
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '8px' }}>📄</span>
              Informations générales
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Client *
                </label>
                <select
                  name="client_id"
                  value={quoteData.client_id}
                  onChange={handleQuoteDataChange}
                  required
                  style={getInputStyle('client_id')}
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.first_name} {client.last_name} ({client.email})
                    </option>
                  ))}
                </select>
                {formErrors.client_id && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {formErrors.client_id}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Titre du devis *
                </label>
                <input
                  type="text"
                  name="title"
                  value={quoteData.title}
                  onChange={handleQuoteDataChange}
                  required
                  placeholder="Ex: Rénovation salle de bain"
                  style={getInputStyle('title')}
                />
                {formErrors.title && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {formErrors.title}
                  </p>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Description des travaux *
              </label>
              <textarea
                name="description"
                value={quoteData.description}
                onChange={handleQuoteDataChange}
                required
                placeholder="Décrivez en détail les travaux à réaliser..."
                rows="4"
                style={{
                  ...getInputStyle('description'),
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              {formErrors.description && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                  {formErrors.description}
                </p>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Lieu des travaux
                </label>
                <input
                  type="text"
                  name="work_location"
                  value={quoteData.work_location}
                  onChange={handleQuoteDataChange}
                  placeholder="Adresse des travaux"
                  style={getInputStyle('work_location')}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Durée estimée
                </label>
                <input
                  type="text"
                  name="estimated_duration"
                  value={quoteData.estimated_duration}
                  onChange={handleQuoteDataChange}
                  placeholder="Ex: 3 jours"
                  style={getInputStyle('estimated_duration')}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Date de début prévue
                </label>
                <input
                  type="date"
                  name="estimated_start_date"
                  value={quoteData.estimated_start_date}
                  onChange={handleQuoteDataChange}
                  style={getInputStyle('estimated_start_date')}
                />
              </div>
            </div>
          </div>

          {/* Détail du devis */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '30px',
            marginBottom: '24px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h3 style={{
                margin: '0',
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ marginRight: '8px' }}>💰</span>
                Détail du devis
              </h3>
              
              <button
                type="button"
                onClick={addItem}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'transform 0.2s',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                + Ajouter une ligne
              </button>
            </div>

            {formErrors.items && (
              <div style={{
                padding: '12px',
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '16px'
              }}>
                {formErrors.items}
              </div>
            )}

            {/* En-têtes des colonnes */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '3fr 1fr 1fr 1fr 50px',
              gap: '16px',
              padding: '12px 0',
              borderBottom: '2px solid #e5e7eb',
              marginBottom: '16px',
              fontWeight: '600',
              fontSize: '14px',
              color: '#374151'
            }}>
              <div>Description</div>
              <div>Quantité</div>
              <div>Prix unitaire (€)</div>
              <div>Total (€)</div>
              <div></div>
            </div>

            {/* Lignes du devis */}
            {quoteItems.map((item, index) => (
              <div key={item.id} style={{
                display: 'grid',
                gridTemplateColumns: '3fr 1fr 1fr 1fr 50px',
                gap: '16px',
                marginBottom: '12px',
                alignItems: 'center'
              }}>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  placeholder="Description de l'item"
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
                
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  min="0"
                  step="0.01"
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
                
                <input
                  type="number"
                  value={item.unit_price}
                  onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                  min="0"
                  step="0.01"
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
                
                <div style={{
                  padding: '8px 12px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  textAlign: 'right'
                }}>
                  {item.total.toFixed(2)}
                </div>
                
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={quoteItems.length === 1}
                  style={{
                    padding: '8px',
                    backgroundColor: quoteItems.length === 1 ? '#f3f4f6' : '#fee2e2',
                    color: quoteItems.length === 1 ? '#9ca3af' : '#dc2626',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: quoteItems.length === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    transition: 'background-color 0.2s'
                  }}
                >
                  🗑️
                </button>
              </div>
            ))}

            {/* Total général */}
            <div style={{
              borderTop: '2px solid #e5e7eb',
              paddingTop: '16px',
              marginTop: '16px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '16px'
              }}>
                <span style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  Total général :
                </span>
                <span style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#059669',
                  padding: '8px 16px',
                  backgroundColor: '#d1fae5',
                  borderRadius: '12px'
                }}>
                  {calculateTotal().toFixed(2)} €
                </span>
              </div>
            </div>
          </div>

          {/* Notes additionnelles */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '30px',
            marginBottom: '24px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '8px' }}>📝</span>
              Notes additionnelles
            </h3>

            <textarea
              name="notes"
              value={quoteData.notes}
              onChange={handleQuoteDataChange}
              placeholder="Conditions particulières, garanties, délais de paiement..."
              rows="4"
              style={getInputStyle('notes')}
            />
          </div>

          {/* Boutons d'action */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            gap: '16px',
            justifyContent: 'center'
          }}>
            <button
              type="button"
              onClick={handleSaveAsDraft}
              disabled={saving}
              style={{
                padding: '16px 24px',
                background: saving 
                  ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                  : 'linear-gradient(135deg, #9ca3af, #6b7280)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 12px rgba(156, 163, 175, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(156, 163, 175, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(156, 163, 175, 0.3)';
              }}
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder en brouillon'}
            </button>

            <button
              type="button"
              onClick={handleSendQuote}
              disabled={saving}
              style={{
                padding: '16px 24px',
                background: saving 
                  ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                minWidth: '200px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
              }}
            >
              {saving ? 'Création...' : 'Créer et envoyer le devis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuoteCreationPage;