import React, { useState, useEffect } from 'react';
import { useAuth, validatePassword, validateEmail } from '../context/AuthContext';

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
  const [passwordStrength, setPasswordStrength] = useState<{isValid: boolean; errors: string[]}>({
    isValid: false,
    errors: []
  });
  const [showPasswordTips, setShowPasswordTips] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const { signUp, user } = useAuth();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (user) {
      window.location.href = '/dashboard';
    }
  }, [user]);

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

    // Validation en temps réel du mot de passe
    if (name === 'password') {
      const validation = validatePassword(value);
      setPasswordStrength(validation);
    }

    // Validation email en temps réel
    if (name === 'email' && value) {
      const emailValidation = validateEmail(value);
      if (!emailValidation.isValid) {
        setErrors(prev => ({
          ...prev,
          email: emailValidation.error || ''
        }));
      }
    }
  };

  // Validation par étape
  const validateStep = (step: number) => {
    const newErrors: {[key: string]: string} = {};

    if (step === 1) {
      // Informations personnelles
      if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
      if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
      if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
      
      const emailValidation = validateEmail(formData.email);
      if (formData.email && !emailValidation.isValid) {
        newErrors.email = emailValidation.error || 'Email invalide';
      }
      
      const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;
      if (formData.nom && !nameRegex.test(formData.nom)) {
        newErrors.nom = 'Nom invalide (2-50 caractères, lettres uniquement)';
      }
      if (formData.prenom && !nameRegex.test(formData.prenom)) {
        newErrors.prenom = 'Prénom invalide (2-50 caractères, lettres uniquement)';
      }
    } else if (step === 2) {
      // Contact et adresse
      if (!formData.telephone.trim()) newErrors.telephone = 'Le téléphone est requis';
      if (!formData.adresseLigne1.trim()) newErrors.adresseLigne1 = 'L\'adresse est requise';
      if (!formData.codePostal.trim()) newErrors.codePostal = 'Le code postal est requis';
      if (!formData.ville.trim()) newErrors.ville = 'La ville est requise';
      
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,15}$/;
      if (formData.telephone && !phoneRegex.test(formData.telephone)) {
        newErrors.telephone = 'Format de téléphone invalide';
      }
      
      const postalRegex = /^[0-9]{4,5}$/;
      if (formData.codePostal && !postalRegex.test(formData.codePostal)) {
        newErrors.codePostal = 'Code postal invalide (4-5 chiffres)';
      }
    } else if (step === 3) {
      // Mot de passe
      if (!formData.password) newErrors.password = 'Le mot de passe est requis';
      
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = 'Le mot de passe ne respecte pas les critères de sécurité';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation entre les étapes
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3)) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await signUp(formData.email, formData.password, formData);

      if (error) {
        setMessage(`❌ ${error.message}`);
        return;
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
      setCurrentStep(1);

    } catch (error: any) {
      console.error('Erreur inscription:', error);
      setMessage('❌ Une erreur inattendue s\'est produite');
    } finally {
      setLoading(false);
    }
  };

  // Indicateur de force du mot de passe
  const getPasswordStrengthColor = () => {
    if (!formData.password) return '#e5e7eb';
    if (passwordStrength.errors.length > 3) return '#ef4444';
    if (passwordStrength.errors.length > 1) return '#f59e0b';
    if (passwordStrength.errors.length === 0) return '#10b981';
    return '#f59e0b';
  };

  const getPasswordStrengthText = () => {
    if (!formData.password) return 'Entrez un mot de passe';
    if (passwordStrength.errors.length > 3) return 'Très faible';
    if (passwordStrength.errors.length > 1) return 'Faible';
    if (passwordStrength.errors.length === 0) return 'Fort';
    return 'Moyen';
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '0',
        borderRadius: '24px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
        width: '100%',
        maxWidth: '800px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        
        {/* Header avec progression */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px 50px 30px',
          color: 'white',
          position: 'relative'
        }}>
          {/* Effet de particules */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
            `
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h1 style={{ 
                fontSize: '32px',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                🏠 Rejoignez Pinsart Déco
              </h1>
              <p style={{ fontSize: '18px', margin: 0, opacity: 0.9 }}>
                Créez votre compte en quelques étapes simples
              </p>
            </div>

            {/* Indicateur de progression */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
              {[1, 2, 3].map(step => (
                <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: currentStep >= step ? 'white' : 'rgba(255, 255, 255, 0.3)',
                    color: currentStep >= step ? '#667eea' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    boxShadow: currentStep >= step ? '0 4px 15px rgba(255, 255, 255, 0.3)' : 'none'
                  }}>
                    {currentStep > step ? '✓' : step}
                  </div>
                  {step < 3 && (
                    <div style={{
                      width: '60px',
                      height: '2px',
                      backgroundColor: currentStep > step ? 'white' : 'rgba(255, 255, 255, 0.3)',
                      marginLeft: '10px',
                      transition: 'all 0.3s ease'
                    }} />
                  )}
                </div>
              ))}
            </div>

            {/* Labels des étapes */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', fontSize: '14px', opacity: 0.9 }}>
              <span>Informations</span>
              <span>Contact & Adresse</span>
              <span>Sécurité</span>
            </div>
          </div>
        </div>

        {/* Message de retour */}
        {message && (
          <div style={{
            margin: '30px 50px 0',
            padding: '20px',
            borderRadius: '12px',
            backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
            color: message.includes('✅') ? '#065f46' : '#dc2626',
            border: `1px solid ${message.includes('✅') ? '#a7f3d0' : '#fca5a5'}`,
            fontSize: '16px',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            {message}
          </div>
        )}

        {/* Contenu du formulaire */}
        <div style={{ padding: '50px' }}>
          <form onSubmit={handleSubmit}>
            
            {/* Étape 1: Informations personnelles */}
            {currentStep === 1 && (
              <div style={{ animation: 'slideIn 0.3s ease-out' }}>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#1f2937', 
                  marginBottom: '30px',
                  textAlign: 'center'
                }}>
                  👤 Vos informations personnelles
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
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
                        padding: '15px',
                        border: errors.nom ? '2px solid #ef4444' : '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        transition: 'all 0.3s ease',
                        outline: 'none',
                        backgroundColor: '#f8fafc'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.backgroundColor = 'white';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = errors.nom ? '#ef4444' : '#e5e7eb';
                        e.target.style.backgroundColor = '#f8fafc';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    {errors.nom && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px', display: 'block' }}>{errors.nom}</span>}
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
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
                        padding: '15px',
                        border: errors.prenom ? '2px solid #ef4444' : '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        transition: 'all 0.3s ease',
                        outline: 'none',
                        backgroundColor: '#f8fafc'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.backgroundColor = 'white';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = errors.prenom ? '#ef4444' : '#e5e7eb';
                        e.target.style.backgroundColor = '#f8fafc';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    {errors.prenom && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px', display: 'block' }}>{errors.prenom}</span>}
                  </div>
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#374151',
                    fontSize: '14px'
                  }}>
                    Adresse email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: errors.email ? '2px solid #ef4444' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      backgroundColor: '#f8fafc'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.email ? '#ef4444' : '#e5e7eb';
                      e.target.style.backgroundColor = '#f8fafc';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {errors.email && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px', display: 'block' }}>{errors.email}</span>}
                </div>

                <div style={{ marginBottom: '40px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#374151',
                    fontSize: '14px'
                  }}>
                    Date de naissance (optionnel)
                  </label>
                  <input
                    type="date"
                    name="dateNaissance"
                    value={formData.dateNaissance}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      backgroundColor: '#f8fafc'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Étape 2: Contact et adresse */}
            {currentStep === 2 && (
              <div style={{ animation: 'slideIn 0.3s ease-out' }}>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#1f2937', 
                  marginBottom: '30px',
                  textAlign: 'center'
                }}>
                  📱 Contact et adresse
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px', marginBottom: '25px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600', 
                      color: '#374151',
                      fontSize: '14px'
                    }}>
                      Numéro de téléphone *
                    </label>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      placeholder="+32 456 78 90 12"
                      style={{
                        width: '100%',
                        padding: '15px',
                        border: errors.telephone ? '2px solid #ef4444' : '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        transition: 'all 0.3s ease',
                        outline: 'none',
                        backgroundColor: '#f8fafc'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.backgroundColor = 'white';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = errors.telephone ? '#ef4444' : '#e5e7eb';
                        e.target.style.backgroundColor = '#f8fafc';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    {errors.telephone && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px', display: 'block' }}>{errors.telephone}</span>}
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600', 
                      color: '#374151',
                      fontSize: '14px'
                    }}>
                      Type
                    </label>
                    <select
                      name="telephoneLabel"
                      value={formData.telephoneLabel}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '15px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        outline: 'none',
                        backgroundColor: '#f8fafc',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Mobile">📱 Mobile</option>
                      <option value="Fixe">🏠 Fixe</option>
                      <option value="Professionnel">💼 Professionnel</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#374151',
                    fontSize: '14px'
                  }}>
                    Adresse *
                  </label>
                  <input
                    type="text"
                    name="adresseLigne1"
                    value={formData.adresseLigne1}
                    onChange={handleChange}
                    placeholder="123 Rue de la Paix"
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: errors.adresseLigne1 ? '2px solid #ef4444' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      backgroundColor: '#f8fafc'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.adresseLigne1 ? '#ef4444' : '#e5e7eb';
                      e.target.style.backgroundColor = '#f8fafc';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {errors.adresseLigne1 && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px', display: 'block' }}>{errors.adresseLigne1}</span>}
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <input
                    type="text"
                    name="adresseLigne2"
                    value={formData.adresseLigne2}
                    onChange={handleChange}
                    placeholder="Appartement, étage (optionnel)"
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      backgroundColor: '#f8fafc'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px', marginBottom: '40px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600', 
                      color: '#374151',
                      fontSize: '14px'
                    }}>
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
                        padding: '15px',
                        border: errors.codePostal ? '2px solid #ef4444' : '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        transition: 'all 0.3s ease',
                        outline: 'none',
                        backgroundColor: '#f8fafc'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.backgroundColor = 'white';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = errors.codePostal ? '#ef4444' : '#e5e7eb';
                        e.target.style.backgroundColor = '#f8fafc';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    {errors.codePostal && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px', display: 'block' }}>{errors.codePostal}</span>}
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
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
                      placeholder="Bruxelles"
                      style={{
                        width: '100%',
                        padding: '15px',
                        border: errors.ville ? '2px solid #ef4444' : '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        transition: 'all 0.3s ease',
                        outline: 'none',
                        backgroundColor: '#f8fafc'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.backgroundColor = 'white';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = errors.ville ? '#ef4444' : '#e5e7eb';
                        e.target.style.backgroundColor = '#f8fafc';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    {errors.ville && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px', display: 'block' }}>{errors.ville}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Étape 3: Sécurité */}
            {currentStep === 3 && (
              <div style={{ animation: 'slideIn 0.3s ease-out' }}>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#1f2937', 
                  marginBottom: '30px',
                  textAlign: 'center'
                }}>
                  🔒 Sécurisez votre compte
                </h2>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#374151',
                    fontSize: '14px'
                  }}>
                    Mot de passe *
                    <button
                      type="button"
                      onClick={() => setShowPasswordTips(!showPasswordTips)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#667eea',
                        cursor: 'pointer',
                        fontSize: '12px',
                        marginLeft: '10px',
                        fontWeight: '500'
                      }}
                    >
                      {showPasswordTips ? '🔼 Masquer' : '🔽 Critères'}
                    </button>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Créez un mot de passe sécurisé"
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: errors.password ? '2px solid #ef4444' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      backgroundColor: '#f8fafc'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.password ? '#ef4444' : '#e5e7eb';
                      e.target.style.backgroundColor = '#f8fafc';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  
                  {/* Indicateur de force du mot de passe */}
                  {formData.password && (
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{
                          flex: 1,
                          height: '6px',
                          backgroundColor: '#e5e7eb',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            backgroundColor: getPasswordStrengthColor(),
                            width: `${Math.max(20, (5 - passwordStrength.errors.length) * 25)}%`,
                            transition: 'all 0.4s ease',
                            borderRadius: '3px'
                          }} />
                        </div>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: getPasswordStrengthColor(),
                          minWidth: '80px'
                        }}>
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Critères de mot de passe */}
                  {showPasswordTips && (
                    <div style={{
                      marginTop: '15px',
                      padding: '20px',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 15px 0' }}>
                        🛡️ Votre mot de passe doit contenir :
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          fontSize: '13px',
                          color: formData.password.length >= 8 ? '#059669' : '#dc2626'
                        }}>
                          <span>{formData.password.length >= 8 ? '✅' : '❌'}</span>
                          Au moins 8 caractères
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          fontSize: '13px',
                          color: /[A-Z]/.test(formData.password) ? '#059669' : '#dc2626'
                        }}>
                          <span>{/[A-Z]/.test(formData.password) ? '✅' : '❌'}</span>
                          Une majuscule (A-Z)
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          fontSize: '13px',
                          color: /[a-z]/.test(formData.password) ? '#059669' : '#dc2626'
                        }}>
                          <span>{/[a-z]/.test(formData.password) ? '✅' : '❌'}</span>
                          Une minuscule (a-z)
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          fontSize: '13px',
                          color: /\d/.test(formData.password) ? '#059669' : '#dc2626'
                        }}>
                          <span>{/\d/.test(formData.password) ? '✅' : '❌'}</span>
                          Un chiffre (0-9)
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          fontSize: '13px',
                          color: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? '#059669' : '#dc2626',
                          gridColumn: '1 / -1'
                        }}>
                          <span>{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? '✅' : '❌'}</span>
                          Un caractère spécial (!@#$%^&*...)
                        </div>
                      </div>
                    </div>
                  )}

                  {errors.password && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', display: 'block' }}>{errors.password}</span>}
                </div>

                <div style={{ marginBottom: '40px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
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
                    placeholder="Retapez votre mot de passe"
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: errors.confirmPassword ? '2px solid #ef4444' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      backgroundColor: '#f8fafc'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.confirmPassword ? '#ef4444' : '#e5e7eb';
                      e.target.style.backgroundColor = '#f8fafc';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {errors.confirmPassword && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', display: 'block' }}>{errors.confirmPassword}</span>}
                  
                  {/* Indicateur de correspondance */}
                  {formData.confirmPassword && (
                    <div style={{
                      marginTop: '10px',
                      padding: '10px 15px',
                      borderRadius: '8px',
                      backgroundColor: formData.password === formData.confirmPassword ? '#d1fae5' : '#fee2e2',
                      border: `1px solid ${formData.password === formData.confirmPassword ? '#a7f3d0' : '#fca5a5'}`,
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>{formData.password === formData.confirmPassword ? '✅' : '❌'}</span>
                      <span style={{ 
                        color: formData.password === formData.confirmPassword ? '#065f46' : '#dc2626',
                        fontWeight: '500'
                      }}>
                        {formData.password === formData.confirmPassword 
                          ? 'Les mots de passe correspondent' 
                          : 'Les mots de passe ne correspondent pas'
                        }
                      </span>
                    </div>
                  )}
                </div>

                {/* Conditions d'utilisation */}
                <div style={{
                  padding: '20px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  marginBottom: '30px'
                }}>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#6b7280', 
                    margin: 0, 
                    lineHeight: '1.6',
                    textAlign: 'center'
                  }}>
                    En créant votre compte, vous acceptez nos{' '}
                    <a href="/terms" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>
                      Conditions d'utilisation
                    </a>
                    {' '}et notre{' '}
                    <a href="/privacy" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>
                      Politique de confidentialité
                    </a>
                  </p>
                </div>
              </div>
            )}

            {/* Boutons de navigation */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: '40px'
            }}>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#667eea',
                    border: '2px solid #667eea',
                    padding: '12px 30px',
                    borderRadius: '25px',
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.backgroundColor = '#667eea';
                    target.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.backgroundColor = 'transparent';
                    target.style.color = '#667eea';
                  }}
                >
                  ← Précédent
                </button>
              ) : (
                <div></div>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '15px 40px',
                    borderRadius: '25px',
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.transform = 'translateY(-2px)';
                    target.style.boxShadow = '0 12px 30px rgba(102, 126, 234, 0.5)';
                  }}
                  onMouseOut={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.transform = 'translateY(0)';
                    target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                  }}
                >
                  Continuer →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !passwordStrength.isValid}
                  style={{
                    background: (loading || !passwordStrength.isValid) 
                      ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' 
                      : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '15px 40px',
                    borderRadius: '25px',
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: (loading || !passwordStrength.isValid) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: (loading || !passwordStrength.isValid) 
                      ? 'none' 
                      : '0 8px 25px rgba(5, 150, 105, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                  onMouseOver={(e) => {
                    if (!loading && passwordStrength.isValid) {
                      const target = e.target as HTMLElement;
                      target.style.transform = 'translateY(-2px)';
                      target.style.boxShadow = '0 12px 30px rgba(5, 150, 105, 0.5)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loading && passwordStrength.isValid) {
                      const target = e.target as HTMLElement;
                      target.style.transform = 'translateY(0)';
                      target.style.boxShadow = '0 8px 25px rgba(5, 150, 105, 0.4)';
                    }
                  }}
                >
                  {loading && (
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid white',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  )}
                  {loading ? 'Création en cours...' : '🎉 Créer mon compte'}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '30px 50px',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 15px 0' }}>
            Déjà un compte ?{' '}
            <a href="/login" style={{ 
              color: '#667eea', 
              textDecoration: 'none', 
              fontWeight: '600',
              transition: 'color 0.3s ease'
            }}>
              Se connecter maintenant
            </a>
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '12px', color: '#9ca3af' }}>
            <a href="/help" style={{ color: '#9ca3af', textDecoration: 'none' }}>
              Aide
            </a>
            <a href="/contact" style={{ color: '#9ca3af', textDecoration: 'none' }}>
              Contact
            </a>
            <a href="/privacy" style={{ color: '#9ca3af', textDecoration: 'none' }}>
              Confidentialité
            </a>
          </div>
        </div>

        {/* Animations CSS */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes slideIn {
              0% { 
                opacity: 0; 
                transform: translateX(20px); 
              }
              100% { 
                opacity: 1; 
                transform: translateX(0); 
              }
            }
            
            @keyframes fadeIn {
              0% { opacity: 0; }
              100% { opacity: 1; }
            }
          `
        }} />
      </div>
    </div>
  );
}

export default Register;