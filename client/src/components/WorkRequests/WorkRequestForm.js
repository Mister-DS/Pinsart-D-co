import React, { useState } from 'react';

// Import Supabase directement
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Upload des images vers Supabase Storage
const uploadImages = async (photos) => {
  const uploadedUrls = [];
  
  for (const photo of photos) {
    try {
      const fileExt = photo.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `work-requests/${fileName}`;

      const { error } = await supabase.storage
        .from('images')
        .upload(filePath, photo.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erreur upload:', error);
        throw error;
      }

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    } catch (error) {
      console.error('Erreur lors de l\'upload de', photo.file.name, ':', error);
      throw new Error(`Erreur lors de l'upload de ${photo.file.name}`);
    }
  }
  
  return uploadedUrls;
};

// API directe
const createWorkRequest = async (requestData) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';
  
  const response = await fetch(`${API_URL}/api/work-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(requestData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erreur API');
  }
  return data;
};

const WorkRequestForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'plomberie',
    budget_min: '',
    budget_max: '',
    desired_date: '',
    urgency: 'medium',
    location_address: '',
    location_city: '',
    location_postal_code: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const categories = [
    { value: 'plomberie', label: 'Plomberie', icon: '🔧' },
    { value: 'electricite', label: 'Électricité', icon: '⚡' },
    { value: 'peinture', label: 'Peinture', icon: '🎨' },
    { value: 'menuiserie', label: 'Menuiserie', icon: '🪚' },
    { value: 'carrelage', label: 'Carrelage', icon: '🏠' },
    { value: 'jardinage', label: 'Jardinage', icon: '🌱' },
    { value: 'autre', label: 'Autre', icon: '📋' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileSelect = (files) => {
    console.log('Fichiers sélectionnés:', files); // Debug
    const newFiles = Array.from(files);
    const remainingSlots = 5 - photos.length;
    const filesToAdd = newFiles.slice(0, remainingSlots);

    console.log('Fichiers à ajouter:', filesToAdd); // Debug

    // Validation des fichiers
    const validFiles = filesToAdd.filter(file => {
      console.log('Validation fichier:', file.name, file.type, file.size); // Debug
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} n'est pas une image valide`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        alert(`${file.name} est trop volumineux (max 5MB)`);
        return false;
      }
      return true;
    });

    console.log('Fichiers valides:', validFiles); // Debug

    // Créer des previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('Preview créé pour:', file.name); // Debug
        setPhotos(prev => [...prev, {
          file,
          preview: e.target.result,
          id: Date.now() + Math.random()
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    console.log('Drop détecté:', e.dataTransfer.files); // Debug
    setDragActive(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removePhoto = (photoId) => {
    setPhotos(photos.filter(photo => photo.id !== photoId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setUploadProgress(0);

    try {
      // Validation des champs obligatoires
      if (!formData.title || !formData.description || !formData.location_city) {
        setError('Veuillez remplir tous les champs obligatoires (titre, description, ville)');
        return;
      }

      // 1. Upload des images vers Supabase Storage
      let imageUrls = [];
      if (photos.length > 0) {
        setUploadProgress(25);
        try {
          imageUrls = await uploadImages(photos);
          setUploadProgress(75);
        } catch (uploadError) {
          throw new Error(`Erreur lors de l'upload des images: ${uploadError.message}`);
        }
      }

      // 2. Préparer les données avec URLs des images
      const requestData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
        desired_date: formData.desired_date || null,
        urgency: formData.urgency,
        location_address: formData.location_address.trim() || null,
        location_city: formData.location_city.trim(),
        location_postal_code: formData.location_postal_code.trim() || null,
        notes: formData.notes.trim() || null,
        images: imageUrls // URLs complètes des images uploadées
      };

      console.log('Données envoyées:', requestData);
      
      setUploadProgress(90);
      const result = await createWorkRequest(requestData);
      setUploadProgress(100);
      
      // Animation de succès
      const successDiv = document.createElement('div');
      successDiv.innerHTML = '✅ Demande créée avec succès !';
      successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 600;
        box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
      `;
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);
      
      // Reset du formulaire
      setFormData({
        title: '',
        description: '',
        category: 'plomberie',
        budget_min: '',
        budget_max: '',
        desired_date: '',
        urgency: 'medium',
        location_address: '',
        location_city: '',
        location_postal_code: '',
        notes: ''
      });
      setPhotos([]);
      setUploadProgress(0);
      
      if (onSuccess) onSuccess(result.workRequest);
    } catch (error) {
      setError(error.message);
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <style>
        {`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .form-input {
            width: 100%;
            padding: 16px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            font-size: 16px;
            outline: none;
            transition: border-color 0.2s ease;
            font-family: inherit;
            box-sizing: border-box;
          }
          .form-input:focus {
            border-color: #667eea;
          }
          .form-label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 600;
            color: #374151;
          }
          .form-group {
            margin-bottom: 24px;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          .grid-3 {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 16px;
          }
          @media (max-width: 768px) {
            .grid-2, .grid-3 {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>
      
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{
            margin: '0 0 8px 0',
            fontSize: '32px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🏠 Nouvelle Demande de Travaux
          </h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '16px' }}>
            Décrivez votre projet et ajoutez des photos pour obtenir les meilleurs devis
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Titre */}
          <div className="form-group">
            <label className="form-label">
              Titre du projet *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Ex: Réparation fuite d'eau dans la cuisine"
              className="form-input"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              Description détaillée *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Décrivez en détail les travaux souhaités, l'état actuel, vos attentes..."
              rows="4"
              className="form-input"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Catégorie */}
          <div className="form-group">
            <label className="form-label">
              Catégorie *
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '12px'
            }}>
              {categories.map(cat => (
                <label
                  key={cat.value}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '16px 12px',
                    border: `2px solid ${formData.category === cat.value ? '#667eea' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: formData.category === cat.value ? '#f0f4ff' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat.value}
                    checked={formData.category === cat.value}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  <span style={{ fontSize: '24px', marginBottom: '4px' }}>{cat.icon}</span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: formData.category === cat.value ? '#667eea' : '#6b7280',
                    textAlign: 'center'
                  }}>
                    {cat.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="form-group">
            <label className="form-label">
              Budget estimé (€)
            </label>
            <div className="grid-2">
              <div>
                <input
                  type="number"
                  name="budget_min"
                  value={formData.budget_min}
                  onChange={handleChange}
                  min="0"
                  placeholder="Minimum"
                  className="form-input"
                />
              </div>
              <div>
                <input
                  type="number"
                  name="budget_max"
                  value={formData.budget_max}
                  onChange={handleChange}
                  min="0"
                  placeholder="Maximum"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Date et Urgence */}
          <div className="grid-2 form-group">
            <div>
              <label className="form-label">
                Date souhaitée
              </label>
              <input
                type="date"
                name="desired_date"
                value={formData.desired_date}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            
            <div>
              <label className="form-label">
                Urgence
              </label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                className="form-input"
                style={{ backgroundColor: 'white' }}
              >
                <option value="low">🟢 Pas urgent</option>
                <option value="medium">🟡 Modéré</option>
                <option value="high">🟠 Urgent</option>
                <option value="critical">🔴 Très urgent</option>
              </select>
            </div>
          </div>

          {/* Adresse complète */}
          <div className="form-group">
            <label className="form-label">
              Adresse complète
            </label>
            <input
              type="text"
              name="location_address"
              value={formData.location_address}
              onChange={handleChange}
              placeholder="Ex: 123 Rue de la Paix"
              className="form-input"
            />
          </div>

          {/* Ville et Code Postal */}
          <div className="grid-3 form-group">
            <div>
              <label className="form-label">
                Ville *
              </label>
              <input
                type="text"
                name="location_city"
                value={formData.location_city}
                onChange={handleChange}
                required
                placeholder="Ex: Bruxelles"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">
                Code postal
              </label>
              <input
                type="text"
                name="location_postal_code"
                value={formData.location_postal_code}
                onChange={handleChange}
                placeholder="Ex: 1000"
                pattern="[0-9]{4,5}"
                className="form-input"
              />
            </div>
          </div>

          {/* Upload de Photos */}
          <div className="form-group">
            <label className="form-label">
              Photos du projet ({photos.length}/5)
            </label>
            
            {/* Zone de Drop */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              style={{
                border: `2px dashed ${dragActive ? '#667eea' : '#d1d5db'}`,
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                backgroundColor: dragActive ? '#f0f4ff' : '#f9fafb',
                transition: 'all 0.2s ease',
                marginBottom: '16px'
              }}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                style={{ display: 'none' }}
                id="photo-upload"
                disabled={photos.length >= 5}
              />
              
              <div style={{ marginBottom: '16px', fontSize: '48px' }}>
                {photos.length >= 5 ? '✅' : '📸'}
              </div>
              
              {photos.length >= 5 ? (
                <p style={{ margin: 0, color: '#10b981', fontWeight: '600' }}>
                  Limite de 5 photos atteinte
                </p>
              ) : (
                <>
                  <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                    Glissez vos photos ici ou
                  </p>
                  <label
                    htmlFor="photo-upload"
                    style={{
                      display: 'inline-block',
                      padding: '12px 24px',
                      backgroundColor: '#667eea',
                      color: 'white',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    Choisir des fichiers
                  </label>
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                    PNG, JPG jusqu'à 5MB • Maximum 5 photos
                  </p>
                </>
              )}
            </div>

            {/* Aperçu des Photos */}
            {photos.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '12px'
              }}>
                {photos.map(photo => (
                  <div
                    key={photo.id}
                    style={{
                      position: 'relative',
                      aspectRatio: '1',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '2px solid #e5e7eb'
                    }}
                  >
                    <img
                      src={photo.preview}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes supplémentaires */}
          <div className="form-group">
            <label className="form-label">
              Notes supplémentaires
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Informations complémentaires, contraintes particulières, horaires préférés..."
              rows="3"
              className="form-input"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Barre de progression */}
          {loading && uploadProgress > 0 && (
            <div style={{
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: '#f0f9ff',
              borderRadius: '12px',
              border: '1px solid #bae6fd'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #3b82f6',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>
                  Upload en cours... {uploadProgress}%
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${uploadProgress}%`,
                  height: '100%',
                  backgroundColor: '#3b82f6',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div style={{
              padding: '16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              color: '#dc2626',
              marginBottom: '24px',
              fontSize: '14px'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Bouton Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '18px',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}>
                </div>
                {uploadProgress > 0 ? `Upload... ${uploadProgress}%` : 'Création en cours...'}
              </span>
            ) : (
              '🚀 Créer ma demande de travaux'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WorkRequestForm;