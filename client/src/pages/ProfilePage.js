import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    description: '',
    // Champs professionnels
    company_name: '',
    siret: '',
    specialties: '',
    hourly_rate: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserProfile();
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
        setMessage({ type: 'error', text: 'Erreur lors du chargement du profil' });
        return;
      }

      setUserProfile(data);
      setAvatarUrl(data.avatar_url);
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        postal_code: data.postal_code || '',
        description: data.description || '',
        company_name: data.company_name || '',
        siret: data.siret || '',
        specialties: Array.isArray(data.specialties) ? data.specialties.join(', ') : (data.specialties || ''),
        hourly_rate: data.hourly_rate || ''
      });
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement du profil' });
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (event) => {
    try {
      setAvatarUploading(true);
      setMessage({ type: '', text: '' });

      const file = event.target.files[0];
      if (!file) return;

      console.log('Fichier sélectionné:', file.name, file.type, file.size);

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Veuillez sélectionner un fichier image' });
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'L\'image ne doit pas dépasser 5MB' });
        return;
      }

      // Générer un nom de fichier unique (plus simple)
      const fileExt = file.name.split('.').pop().toLowerCase();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      console.log('Nom de fichier:', fileName);

      // Supprimer l'ancien avatar s'il existe
      if (avatarUrl) {
        try {
          const oldFileName = avatarUrl.split('/').pop();
          console.log('Suppression ancien fichier:', oldFileName);
          const { error: deleteError } = await supabase.storage
            .from('avatars')
            .remove([oldFileName]);
          if (deleteError) {
            console.log('Erreur suppression ancien fichier:', deleteError);
          }
        } catch (deleteErr) {
          console.log('Erreur lors de la suppression:', deleteErr);
        }
      }

      // Upload du nouveau fichier
      console.log('Début upload...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      console.log('Résultat upload:', { uploadData, uploadError });

      if (uploadError) {
        console.error('Erreur upload détaillée:', uploadError);
        throw new Error(`Erreur upload: ${uploadError.message || 'Upload failed'}`);
      }

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('URL générée:', urlData);

      if (!urlData || !urlData.publicUrl) {
        throw new Error('Impossible de générer l\'URL publique');
      }

      const newAvatarUrl = urlData.publicUrl;

      // Mettre à jour le profil en base
      console.log('Mise à jour profil avec URL:', newAvatarUrl);
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Erreur mise à jour profil:', updateError);
        throw new Error(`Erreur sauvegarde: ${updateError.message}`);
      }

      setAvatarUrl(newAvatarUrl);
      setMessage({ type: 'success', text: 'Photo de profil mise à jour avec succès !' });
      console.log('Upload terminé avec succès');
    } catch (error) {
      console.error('Erreur upload avatar:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Erreur lors de l\'upload de l\'image'
      });
    } finally {
      setAvatarUploading(false);
      // Réinitialiser l'input file
      event.target.value = '';
    }
  };

  const removeAvatar = async () => {
    if (!avatarUrl) return;

    try {
      setAvatarUploading(true);
      
      // Supprimer le fichier du storage
      const fileName = avatarUrl.split('/').pop();
      await supabase.storage
        .from('avatars')
        .remove([fileName]);

      // Mettre à jour le profil en base
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setAvatarUrl(null);
      setMessage({ type: 'success', text: 'Photo de profil supprimée' });
    } catch (error) {
      console.error('Erreur suppression avatar:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Préparer les données à sauvegarder
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || null,
        address: formData.address || null,
        city: formData.city || null,
        postal_code: formData.postal_code || null,
        description: formData.description || null,
        updated_at: new Date().toISOString()
      };

      // Ajouter les données professionnelles si c'est un professionnel
      if (userProfile?.role === 'professional') {
        updateData.company_name = formData.company_name || null;
        updateData.siret = formData.siret || null;
        updateData.specialties = formData.specialties 
          ? formData.specialties.split(',').map(s => s.trim()).filter(s => s)
          : null;
        updateData.hourly_rate = formData.hourly_rate ? parseFloat(formData.hourly_rate) : null;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
      // Recharger les données du profil
      await fetchUserProfile();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil' });
    } finally {
      setSaving(false);
    }
  };

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
          <p style={{ fontSize: '18px', color: '#666', margin: 0 }}>Chargement du profil...</p>
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

  const getRoleInfo = () => {
    switch (userProfile?.role) {
      case 'admin':
        return {
          color: '#dc3545',
          bgColor: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
          icon: '👑',
          title: 'Administrateur'
        };
      case 'professional':
        return {
          color: '#007bff',
          bgColor: 'linear-gradient(135deg, #74b9ff, #0984e3)',
          icon: '🔧',
          title: 'Professionnel'
        };
      default:
        return {
          color: '#28a745',
          bgColor: 'linear-gradient(135deg, #55efc4, #00b894)',
          icon: '👤',
          title: 'Client'
        };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingTop: '70px' // Pour compenser le header fixe
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px'
      }}>
        {/* En-tête de la page avec photo de profil */}
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
          {/* Photo de profil */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              position: 'relative',
              display: 'inline-block'
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: avatarUrl 
                  ? `url(${avatarUrl}) center/cover` 
                  : roleInfo.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: avatarUrl ? '0' : '48px',
                margin: '0 auto',
                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
                border: '4px solid white',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {!avatarUrl && roleInfo.icon}
                
                {/* Overlay pour l'upload */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  cursor: 'pointer',
                  borderRadius: '50%'
                }}
                className="avatar-overlay"
                onMouseEnter={(e) => e.target.style.opacity = '1'}
                onMouseLeave={(e) => e.target.style.opacity = '0'}
                onClick={() => document.getElementById('avatar-upload').click()}
                >
                  {avatarUploading ? (
                    <div style={{
                      width: '24px',
                      height: '24px',
                      border: '3px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '3px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  ) : (
                    <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
                      <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
                    </svg>
                  )}
                </div>
              </div>
              
              {/* Boutons d'action pour l'avatar */}
              <div style={{
                position: 'absolute',
                top: '90px',
                right: '-10px',
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  type="button"
                  onClick={() => document.getElementById('avatar-upload').click()}
                  disabled={avatarUploading}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    border: 'none',
                    color: 'white',
                    cursor: avatarUploading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => !avatarUploading && (e.target.style.transform = 'scale(1.1)')}
                  onMouseLeave={(e) => !avatarUploading && (e.target.style.transform = 'scale(1)')}
                  title="Changer la photo"
                >
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 4V1h2v3h3v2H5v3H3V6H0V4h3zm3 6V7h3V4h7l1.83 2H21c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V10h3zm7 9c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-3-5c0-1.65 1.35-3 3-3s3 1.35 3 3-1.35 3-3 3-3-1.35-3-3z"/>
                  </svg>
                </button>
                
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    disabled={avatarUploading}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      border: 'none',
                      color: 'white',
                      cursor: avatarUploading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.2s ease'
                    }}
                    onMouseEnter={(e) => !avatarUploading && (e.target.style.transform = 'scale(1.1)')}
                    onMouseLeave={(e) => !avatarUploading && (e.target.style.transform = 'scale(1)')}
                    title="Supprimer la photo"
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Input caché pour l'upload */}
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={uploadAvatar}
                style={{ display: 'none' }}
              />
            </div>
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
            Mon Profil
          </h1>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '8px 16px',
            background: roleInfo.bgColor,
            color: 'white',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            {roleInfo.icon} {roleInfo.title}
          </div>
        </div>

        {/* Message de feedback */}
        {message.text && (
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '24px',
            backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
            color: message.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {message.text}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          {/* Section Informations personnelles */}
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
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
              }}>
                <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <h3 style={{
                margin: '0',
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                Informations personnelles
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Prénom *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
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
                  Nom *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
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
                Email (non modifiable)
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  backgroundColor: '#f9fafb',
                  color: '#6b7280',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="06 12 34 56 78"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez-vous en quelques mots..."
                rows="3"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Section Adresse */}
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
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #059669, #10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
              }}>
                <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <h3 style={{
                margin: '0',
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                Adresse
              </h3>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Adresse
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Rue de la Paix"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10b981';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Ville
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Paris"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#10b981';
                    e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
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
                  Code postal
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  placeholder="75001"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#10b981';
                    e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section Professionnelle (uniquement pour les professionnels) */}
          {userProfile?.role === 'professional' && (
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
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #2196f3, #1976d2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)'
                }}>
                  <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                    <path d="M22.7,19l-9.1-9.1c0.9-2.3,0.4-5-1.5-6.9c-2-2-5.1-2.4-7.4-1.3L9,6L6,9L1.6,4.7C0.4,7,0.9,10.1,2.9,12.1c1.9,1.9,4.6,2.4,6.9,1.5l9.1,9.1c0.4,0.4,1,0.4,1.4,0l2.3-2.3C22.7,20,22.7,19.4,22.7,19z"/>
                  </svg>
                </div>
                <h3 style={{
                  margin: '0',
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  Informations professionnelles
                </h3>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Nom de l'entreprise
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Nom de votre entreprise"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2196f3';
                    e.target.style.boxShadow = '0 0 0 3px rgba(33, 150, 243, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  SIRET
                </label>
                <input
                  type="text"
                  name="siret"
                  value={formData.siret}
                  onChange={handleChange}
                  placeholder="12345678901234"
                  maxLength="14"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2196f3';
                    e.target.style.boxShadow = '0 0 0 3px rgba(33, 150, 243, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Spécialités (séparées par des virgules)
                </label>
                <input
                  type="text"
                  name="specialties"
                  value={formData.specialties}
                  onChange={handleChange}
                  placeholder="Plomberie, Électricité, Chauffage"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2196f3';
                    e.target.style.boxShadow = '0 0 0 3px rgba(33, 150, 243, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Tarif horaire (€)
                </label>
                <input
                  type="number"
                  name="hourly_rate"
                  value={formData.hourly_rate}
                  onChange={handleChange}
                  placeholder="50"
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2196f3';
                    e.target.style.boxShadow = '0 0 0 3px rgba(33, 150, 243, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* Bouton de sauvegarde */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center'
          }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '16px 32px',
                background: saving 
                  ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '18px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: saving 
                  ? '0 4px 12px rgba(156, 163, 175, 0.4)' 
                  : '0 8px 25px rgba(102, 126, 234, 0.4)',
                transform: saving ? 'none' : 'translateY(0)',
                minWidth: '200px'
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!saving) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                }
              }}
            >
              {saving ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeDashoffset="32" opacity="0.3"/>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeDashoffset="20"/>
                  </svg>
                  Sauvegarde...
                </span>
              ) : 
                'Sauvegarder les modifications'
              }
            </button>
            
            <p style={{
              marginTop: '16px',
              fontSize: '14px',
              color: '#6b7280',
              margin: '16px 0 0 0'
            }}>
              Vos modifications seront enregistrées de manière sécurisée.
            </p>
          </div>
        </form>
      </div>

      {/* Animation CSS pour le spinner */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .avatar-overlay:hover {
            opacity: 1 !important;
          }
          
          @media (max-width: 768px) {
            .profile-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ProfilePage;