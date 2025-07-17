import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// Composant Alert réutilisable
const Alert = ({ type, message, onClose, autoClose = true }) => {
  React.useEffect(() => {
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

const ContactPage = () => {
  const { user } = useAuth();
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    name: user ? `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() : '',
    email: user?.email || '',
    subject: '',
    category: '',
    message: '',
    priority: 'normal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showAlert = (type, message) => {
    setAlert({ type, message });
  };

  const closeAlert = () => {
    setAlert(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      showAlert('error', 'Veuillez remplir tous les champs obligatoires');
      setIsSubmitting(false);
      return;
    }

    // Simulation d'envoi (à remplacer par votre logique d'envoi)
    try {
      // Ici vous pourriez envoyer les données à votre backend
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulation

      showAlert('success', 'Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
      
      // Reset form
      setFormData({
        name: user ? `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() : '',
        email: user?.email || '',
        subject: '',
        category: '',
        message: '',
        priority: 'normal'
      });
    } catch (error) {
      showAlert('error', 'Erreur lors de l\'envoi du message. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: '📧',
      title: 'Email',
      value: 'contact@pinsart-deco.fr',
      description: 'Réponse sous 24h'
    },
    {
      icon: '📞',
      title: 'Téléphone',
      value: '+33 1 23 45 67 89',
      description: 'Lun-Ven 9h-18h'
    },
    {
      icon: '📍',
      title: 'Adresse',
      value: 'Pinsart Déco HQ\n123 Rue de la Décoration\n1000 Bruxelles, Belgique',
      description: 'Siège social'
    },
    {
      icon: '💬',
      title: 'Chat en ligne',
      value: 'Support instantané',
      description: 'Lun-Ven 9h-17h'
    }
  ];

  const faqItems = [
    {
      question: 'Comment créer une demande de travaux ?',
      answer: 'Connectez-vous à votre compte et cliquez sur "Nouvelle demande" dans votre dashboard.'
    },
    {
      question: 'Combien de temps pour recevoir un devis ?',
      answer: 'En moyenne, vous recevrez un devis dans les 24-48h après acceptation de votre demande.'
    },
    {
      question: 'Comment modifier mon profil ?',
      answer: 'Rendez-vous dans "Mon Profil" depuis le menu utilisateur en haut à droite.'
    },
    {
      question: 'Les professionnels sont-ils vérifiés ?',
      answer: 'Oui, tous nos professionnels passent par un processus de vérification complet.'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Système d'alertes */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={closeAlert}
        />
      )}

      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
        backdropFilter: 'blur(10px)',
        padding: '80px 20px',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '25px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            margin: '0 auto 30px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}>
            📞
          </div>
          
          <h1 style={{
            margin: '0 0 20px 0',
            fontSize: '48px',
            fontWeight: '700',
            textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
          }}>
            Contactez-nous
          </h1>
          
          <p style={{
            margin: '0',
            fontSize: '20px',
            opacity: 0.9,
            lineHeight: 1.6
          }}>
            Notre équipe est là pour vous accompagner dans tous vos projets
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px' }}>
        
        {/* Méthodes de contact */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '50px',
          marginBottom: '40px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{
            margin: '0 0 40px 0',
            fontSize: '32px',
            fontWeight: '700',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Plusieurs façons de nous joindre
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px'
          }}>
            {contactMethods.map((method, index) => (
              <div
                key={index}
                style={{
                  background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                  padding: '30px',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  fontSize: '40px',
                  marginBottom: '16px'
                }}>
                  {method.icon}
                </div>
                <h3 style={{
                  margin: '0 0 12px 0',
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  {method.title}
                </h3>
                <p style={{
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#3b82f6',
                  whiteSpace: 'pre-line'
                }}>
                  {method.value}
                </p>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#64748b'
                }}>
                  {method.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Formulaire de contact */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '50px',
          marginBottom: '40px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{
            margin: '0 0 40px 0',
            fontSize: '32px',
            fontWeight: '700',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Envoyez-nous un message
          </h2>

          <form onSubmit={handleSubmit} style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              marginBottom: '24px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Nom complet *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              marginBottom: '24px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Catégorie
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                >
                  <option value="">Sélectionnez une catégorie</option>
                  <option value="technique">Problème technique</option>
                  <option value="account">Compte utilisateur</option>
                  <option value="payment">Paiement</option>
                  <option value="professional">Demande professionnel</option>
                  <option value="general">Question générale</option>
                  <option value="suggestion">Suggestion</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Priorité
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                >
                  <option value="low">Basse</option>
                  <option value="normal">Normale</option>
                  <option value="high">Haute</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Sujet *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                placeholder="Résumé de votre demande"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                placeholder="Décrivez votre demande en détail..."
                rows="6"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '16px 48px',
                  background: isSubmitting 
                    ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                    : 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                  minWidth: '200px'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                }}
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </div>
          </form>
        </div>

        {/* FAQ rapide */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '50px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{
            margin: '0 0 40px 0',
            fontSize: '32px',
            fontWeight: '700',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Questions fréquentes
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {faqItems.map((item, index) => (
              <div
                key={index}
                style={{
                  background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <h3 style={{
                  margin: '0 0 12px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  {item.question}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#64748b',
                  lineHeight: 1.6
                }}>
                  {item.answer}
                </p>
              </div>
            ))}
          </div>

          <div style={{
            textAlign: 'center',
            marginTop: '40px'
          }}>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              marginBottom: '20px'
            }}>
              Vous ne trouvez pas la réponse à votre question ?
            </p>
            <button
              onClick={() => document.querySelector('form').scrollIntoView({ behavior: 'smooth' })}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#667eea';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#667eea';
              }}
            >
              Contactez-nous directement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;