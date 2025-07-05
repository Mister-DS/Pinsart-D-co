import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Mise à jour de l'interface FormData pour inclure tous les champs de la table client
interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  nom: string;
  prenom: string;
  telephone: string;
  telephone_label: string; // Nouveau champ
  adresse_ligne1: string;  // Nouveau champ
  adresse_ligne2: string;  // Nouveau champ
  code_postal: string;     // Nouveau champ
  ville: string;           // Nouveau champ
  pays: string;            // Nouveau champ
  date_naissance: string;  // Nouveau champ (sera une chaîne YYYY-MM-DD)
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: '',
    telephone: '',
    telephone_label: 'Mobile', // Valeur par défaut
    adresse_ligne1: '',
    adresse_ligne2: '',
    code_postal: '',
    ville: '',
    pays: 'Belgium', // Valeur par défaut
    date_naissance: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.email) {
      newErrors.email = 'Email requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 caractères';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmation requise';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mots de passe différents';
    }

    if (!formData.nom) {
      newErrors.nom = 'Nom requis';
    }

    if (!formData.prenom) {
      newErrors.prenom = 'Prénom requis';
    }

    if (!formData.telephone) { // Rendu obligatoire car NOT NULL dans votre table
      newErrors.telephone = 'Téléphone requis';
    }

    if (!formData.adresse_ligne1) { // Nouveau champ requis
      newErrors.adresse_ligne1 = 'Adresse ligne 1 requise';
    }

    if (!formData.code_postal) { // Nouveau champ requis
      newErrors.code_postal = 'Code postal requis';
    }

    if (!formData.ville) { // Nouveau champ requis
      newErrors.ville = 'Ville requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Passer toutes les données du formulaire à la fonction signUp
      const { error } = await signUp(
        formData.email,
        formData.password,
        {
          nom: formData.nom,
          prenom: formData.prenom,
          telephone: formData.telephone,
          telephone_label: formData.telephone_label,
          adresse_ligne1: formData.adresse_ligne1,
          adresse_ligne2: formData.adresse_ligne2,
          code_postal: formData.code_postal,
          ville: formData.ville,
          pays: formData.pays,
          date_naissance: formData.date_naissance || null // Passer null si vide pour DATE
        }
      );

      if (error) {
        throw error;
      }

      setMessage('✅ Inscription réussie ! Vérifiez votre email pour activer votre compte.');
      
      // Rediriger vers la page de vérification après 3 secondes
      setTimeout(() => {
        navigate('/verify-email');
      }, 3000);

    } catch (error: any) {
      console.error('Erreur inscription:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('already registered')) {
        errorMessage = 'Cette adresse email est déjà utilisée';
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      } else if (error.message.includes('duplicate key value violates unique constraint "clients_email_key"')) {
        errorMessage = 'Cette adresse email est déjà utilisée pour un compte client.';
      }
      
      setMessage(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '600px', // Augmenté pour accueillir plus de champs
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '10px'
          }}>
            Créer un compte
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            margin: 0
          }}>
            Rejoignez Pinsart Déco
          </p>
        </div>

        {message && (
          <div style={{
            padding: '15px',
            borderRadius: '12px',
            marginBottom: '25px',
            backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
            color: message.includes('✅') ? '#065f46' : '#dc2626',
            border: `1px solid ${message.includes('✅') ? '#a7f3d0' : '#fca5a5'}`,
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Nom et Prénom */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
              }}>
                Prénom *
              </label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `2px solid ${errors.prenom ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  backgroundColor: '#f9fafb',
                  boxSizing: 'border-box'
                }}
                placeholder="Votre prénom"
              />
              {errors.prenom && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  {errors.prenom}
                </span>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
              }}>
                Nom *
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `2px solid ${errors.nom ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  backgroundColor: '#f9fafb',
                  boxSizing: 'border-box'
                }}
                placeholder="Votre nom"
              />
              {errors.nom && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  {errors.nom}
                </span>
              )}
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '600',
              color: '#374151',
              fontSize: '14px'
            }}>
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: `2px solid ${errors.email ? '#ef4444' : '#e5e7eb'}`,
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                backgroundColor: '#f9fafb',
                boxSizing: 'border-box'
              }}
              placeholder="votre@email.com"
            />
            {errors.email && (
              <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {errors.email}
              </span>
            )}
          </div>

          {/* Téléphone et Label Téléphone */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <div style={{ flex: 2 }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
              }}>
                Téléphone *
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `2px solid ${errors.telephone ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  backgroundColor: '#f9fafb',
                  boxSizing: 'border-box'
                }}
                placeholder="Votre numéro de téléphone"
              />
              {errors.telephone && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  {errors.telephone}
                </span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
              }}>
                Type de téléphone
              </label>
              <select
                name="telephone_label"
                value={formData.telephone_label}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  backgroundColor: '#f9fafb',
                  boxSizing: 'border-box',
                  appearance: 'none' // Pour masquer la flèche par défaut du select
                }}
              >
                <option value="Mobile">Mobile</option>
                <option value="Fixe">Fixe</option>
                <option value="Professionnel">Professionnel</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>

          {/* Adresse Ligne 1 et Ligne 2 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '600',
              color: '#374151',
              fontSize: '14px'
            }}>
              Adresse Ligne 1 *
            </label>
            <input
              type="text"
              name="adresse_ligne1"
              value={formData.adresse_ligne1}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: `2px solid ${errors.adresse_ligne1 ? '#ef4444' : '#e5e7eb'}`,
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                backgroundColor: '#f9fafb',
                boxSizing: 'border-box'
              }}
              placeholder="Ex: 123 Rue de l'Exemple"
            />
            {errors.adresse_ligne1 && (
              <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {errors.adresse_ligne1}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '600',
              color: '#374151',
              fontSize: '14px'
            }}>
              Adresse Ligne 2 (Optionnel)
            </label>
            <input
              type="text"
              name="adresse_ligne2"
              value={formData.adresse_ligne2}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                backgroundColor: '#f9fafb',
                boxSizing: 'border-box'
              }}
              placeholder="Ex: Apt 4B"
            />
          </div>

          {/* Code Postal et Ville */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
              }}>
                Code Postal *
              </label>
              <input
                type="text"
                name="code_postal"
                value={formData.code_postal}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `2px solid ${errors.code_postal ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  backgroundColor: '#f9fafb',
                  boxSizing: 'border-box'
                }}
                placeholder="Ex: 1000"
              />
              {errors.code_postal && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  {errors.code_postal}
                </span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
              }}>
                Ville *
              </label>
              <input
                type="text"
                name="ville"
                value={formData.ville}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `2px solid ${errors.ville ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  backgroundColor: '#f9fafb',
                  boxSizing: 'border-box'
                }}
                placeholder="Ex: Bruxelles"
              />
              {errors.ville && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  {errors.ville}
                </span>
              )}
            </div>
          </div>

          {/* Pays et Date de Naissance */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
              }}>
                Pays
              </label>
              <input
                type="text"
                name="pays"
                value={formData.pays}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  backgroundColor: '#f9fafb',
                  boxSizing: 'border-box'
                }}
                placeholder="Ex: Belgique"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
              }}>
                Date de Naissance (Optionnel)
              </label>
              <input
                type="date"
                name="date_naissance"
                value={formData.date_naissance}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  backgroundColor: '#f9fafb',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '600',
              color: '#374151',
              fontSize: '14px'
            }}>
              Mot de passe *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: `2px solid ${errors.password ? '#ef4444' : '#e5e7eb'}`,
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                backgroundColor: '#f9fafb',
                boxSizing: 'border-box'
              }}
              placeholder="Minimum 6 caractères"
            />
            {errors.password && (
              <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {errors.password}
              </span>
            )}
          </div>

          {/* Confirmer le mot de passe */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '600',
              color: '#374151',
              fontSize: '14px'
            }}>
              Confirmer le mot de passe *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: `2px solid ${errors.confirmPassword ? '#ef4444' : '#e5e7eb'}`,
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                backgroundColor: '#f9fafb',
                boxSizing: 'border-box'
              }}
              placeholder="Répétez votre mot de passe"
            />
            {errors.confirmPassword && (
              <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              background: loading
                ? '#9ca3af'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: loading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
              marginBottom: '20px'
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '10px'
                }}></span>
                Création du compte...
              </span>
            ) : (
              'Créer mon compte'
            )}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          padding: '20px 0',
          borderTop: '1px solid #e5e7eb',
          marginTop: '10px'
        }}>
          <p style={{
            color: '#6b7280',
            margin: 0,
            fontSize: '14px'
          }}>
            Déjà un compte ?{' '}
            <Link
              to="/login"
              style={{
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Se connecter
            </Link>
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <Link
            to="/"
            style={{
              color: '#9ca3af',
              textDecoration: 'none',
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
};

export default Register;
