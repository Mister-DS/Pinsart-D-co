import React, { useState } from 'react';
import { supabase } from '../supabase';

function Register() {
  // États pour le formulaire
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    telephone: '',
    telephoneLabel: 'Mobile',
    adresseLigne1: '',
    adresseLigne2: '',
    codePostal: '',
    ville: '',
    dateNaissance: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Gestion des changements dans les inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors((prev: {[key: string]: string}) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    if (!formData.password) newErrors.password = 'Le mot de passe est requis';
    if (formData.password.length < 6) newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    if (!formData.telephone.trim()) newErrors.telephone = 'Le téléphone est requis';
    if (!formData.adresseLigne1.trim()) newErrors.adresseLigne1 = 'L\'adresse est requise';
    if (!formData.codePostal.trim()) newErrors.codePostal = 'Le code postal est requis';
    if (!formData.ville.trim()) newErrors.ville = 'La ville est requise';

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage('Veuillez corriger les erreurs du formulaire');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // 1. Créer le compte Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        throw authError;
      }

      // 2. Insérer les données dans la table clients
      if (authData.user) {
        const { error: dbError } = await supabase
          .from('clients')
          .insert([
            {
              id: authData.user.id, // Utilise l'ID de Supabase Auth
              nom: formData.nom,
              prenom: formData.prenom,
              email: formData.email,
              telephone: formData.telephone,
              telephone_label: formData.telephoneLabel,
              adresse_ligne1: formData.adresseLigne1,
              adresse_ligne2: formData.adresseLigne2 || null,
              code_postal: formData.codePostal,
              ville: formData.ville,
              date_naissance: formData.dateNaissance || null,
            }
          ]);

        if (dbError) {
          throw dbError;
        }
      }

      setMessage('✅ Inscription réussie ! Vérifiez votre email pour confirmer votre compte.');
      
      // Réinitialiser le formulaire
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        confirmPassword: '',
        telephone: '',
        telephoneLabel: 'Mobile',
        adresseLigne1: '',
        adresseLigne2: '',
        codePostal: '',
        ville: '',
        dateNaissance: ''
      });

    } catch (error: any) {
      console.error('Erreur inscription:', error);
      setMessage(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      padding: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '600px'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          color: '#2563eb', 
          marginBottom: '30px',
          fontSize: '28px'
        }}>
          Inscription - Pinsart Déco
        </h1>

        {message && (
          <div style={{
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
            color: message.includes('✅') ? '#065f46' : '#dc2626',
            border: `1px solid ${message.includes('✅') ? '#a7f3d0' : '#fca5a5'}`
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Informations personnelles */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#374151', marginBottom: '15px' }}>Informations personnelles</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Nom *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: errors.nom ? '2px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
                {errors.nom && <span style={{ color: '#dc2626', fontSize: '14px' }}>{errors.nom}</span>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Prénom *
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: errors.prenom ? '2px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
                {errors.prenom && <span style={{ color: '#dc2626', fontSize: '14px' }}>{errors.prenom}</span>}
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Date de naissance
              </label>
              <input
                type="date"
                name="dateNaissance"
                value={formData.dateNaissance}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            </div>
          </div>

          {/* Contact */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#374151', marginBottom: '15px' }}>Contact</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: errors.email ? '2px solid #dc2626' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
              {errors.email && <span style={{ color: '#dc2626', fontSize: '14px' }}>{errors.email}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Téléphone *
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="+32 456 78 90 12"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: errors.telephone ? '2px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
                {errors.telephone && <span style={{ color: '#dc2626', fontSize: '14px' }}>{errors.telephone}</span>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Type
                </label>
                <select
                  name="telephoneLabel"
                  value={formData.telephoneLabel}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                >
                  <option value="Mobile">Mobile</option>
                  <option value="Fixe">Fixe</option>
                  <option value="Professionnel">Professionnel</option>
                </select>
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#374151', marginBottom: '15px' }}>Adresse</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Adresse ligne 1 *
              </label>
              <input
                type="text"
                name="adresseLigne1"
                value={formData.adresseLigne1}
                onChange={handleChange}
                placeholder="123 Rue de la Paix"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: errors.adresseLigne1 ? '2px solid #dc2626' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
              {errors.adresseLigne1 && <span style={{ color: '#dc2626', fontSize: '14px' }}>{errors.adresseLigne1}</span>}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Adresse ligne 2
              </label>
              <input
                type="text"
                name="adresseLigne2"
                value={formData.adresseLigne2}
                onChange={handleChange}
                placeholder="Appartement, étage, etc."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Code postal *
                </label>
                <input
                  type="text"
                  name="codePostal"
                  value={formData.codePostal}
                  onChange={handleChange}
                  placeholder="1000"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: errors.codePostal ? '2px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
                {errors.codePostal && <span style={{ color: '#dc2626', fontSize: '14px' }}>{errors.codePostal}</span>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Ville *
                </label>
                <input
                  type="text"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  placeholder="Bruxelles"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: errors.ville ? '2px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
                {errors.ville && <span style={{ color: '#dc2626', fontSize: '14px' }}>{errors.ville}</span>}
              </div>
            </div>
          </div>

          {/* Mot de passe */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#374151', marginBottom: '15px' }}>Sécurité</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Mot de passe *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: errors.password ? '2px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
                {errors.password && <span style={{ color: '#dc2626', fontSize: '14px' }}>{errors.password}</span>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Confirmer le mot de passe *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: errors.confirmPassword ? '2px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
                {errors.confirmPassword && <span style={{ color: '#dc2626', fontSize: '14px' }}>{errors.confirmPassword}</span>}
              </div>
            </div>
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#6b7280' }}>
            Déjà un compte ? <a href="/login" style={{ color: '#2563eb', textDecoration: 'none' }}>Se connecter</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;