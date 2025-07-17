import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HowItWorksPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 6);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      id: 1,
      title: "Créez votre demande",
      description: "Décrivez votre projet de décoration ou rénovation en détail. Ajoutez des photos, spécifiez votre budget et votre localisation.",
      icon: "📝",
      color: "#3b82f6",
      details: [
        "Formulaire simple et intuitif",
        "Upload de photos facultatif",
        "Estimation budgétaire",
        "Choix de la catégorie de travaux"
      ]
    },
    {
      id: 2,
      title: "Les professionnels consultent",
      description: "Votre demande est visible par les professionnels qualifiés de votre région. Ils peuvent voir tous les détails de votre projet.",
      icon: "👀",
      color: "#10b981",
      details: [
        "Visibilité géolocalisée",
        "Filtrage par spécialités",
        "Professionnels vérifiés",
        "Consultation des détails complets"
      ]
    },
    {
      id: 3,
      title: "Réception des candidatures",
      description: "Les professionnels intéressés acceptent votre demande. Vous recevez une notification pour chaque candidature.",
      icon: "✋",
      color: "#f59e0b",
      details: [
        "Notifications en temps réel",
        "Profils des professionnels",
        "Historique et évaluations",
        "Informations de contact"
      ]
    },
    {
      id: 4,
      title: "Acceptation par un professionnel",
      description: "Un professionnel intéressé accepte votre demande et vous envoie un devis détaillé avec description, prix et délais.",
      icon: "✅",
      color: "#8b5cf6",
      details: [
        "Acceptation de la demande",
        "Devis détaillé automatique",
        "Prix et délais précis",
        "Professionnel assigné"
      ]
    },
    {
      id: 5,
      title: "Validation du devis",
      description: "Vous recevez le devis du professionnel assigné. Validez-le pour lancer officiellement votre projet.",
      icon: "📋",
      color: "#ef4444",
      details: [
        "Réception du devis",
        "Vérification des détails",
        "Validation ou négociation",
        "Lancement du projet"
      ]
    },
    {
      id: 6,
      title: "Réalisation et suivi",
      description: "Le professionnel réalise vos travaux. Suivez l'avancement et évaluez la prestation une fois terminée.",
      icon: "🔨",
      color: "#06b6d4",
      details: [
        "Suivi en temps réel",
        "Communication continue",
        "Validation des étapes",
        "Évaluation finale"
      ]
    }
  ];

  const StepCard = ({ step, index, isActive }) => (
    <div
      style={{
        background: isActive ? 'linear-gradient(135deg, ' + step.color + ', ' + step.color + 'dd)' : 'white',
        color: isActive ? 'white' : '#374151',
        padding: '32px',
        borderRadius: '20px',
        boxShadow: isActive ? '0 20px 40px rgba(0, 0, 0, 0.15)' : '0 8px 25px rgba(0, 0, 0, 0.08)',
        border: isActive ? 'none' : '1px solid #f3f4f6',
        transition: 'all 0.5s ease',
        transform: isActive ? 'translateY(-10px) scale(1.02)' : 'translateY(0) scale(1)',
        position: 'relative',
        cursor: 'pointer',
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column'
      }}
      onClick={() => setActiveStep(index)}
    >
      {/* Numéro d'étape */}
      <div
        style={{
          position: 'absolute',
          top: '-15px',
          left: '20px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : step.color,
          color: isActive ? 'white' : 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: '700',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
      >
        {step.id}
      </div>

      {/* Icône */}
      <div
        style={{
          fontSize: '48px',
          marginBottom: '20px',
          textAlign: 'center',
          marginTop: '10px'
        }}
      >
        {step.icon}
      </div>

      {/* Titre */}
      <h3
        style={{
          margin: '0 0 16px 0',
          fontSize: '24px',
          fontWeight: '700',
          textAlign: 'center',
          color: isActive ? 'white' : '#1f2937'
        }}
      >
        {step.title}
      </h3>

      {/* Description */}
      <p
        style={{
          margin: '0 0 20px 0',
          fontSize: '16px',
          lineHeight: 1.6,
          textAlign: 'center',
          opacity: isActive ? 0.95 : 0.8,
          flex: 1
        }}
      >
        {step.description}
      </p>

      {/* Détails */}
      <div style={{ marginTop: 'auto' }}>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontSize: '14px'
          }}
        >
          {step.details.map((detail, idx) => (
            <li
              key={idx}
              style={{
                padding: '4px 0',
                opacity: isActive ? 0.9 : 0.7,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <span style={{ marginRight: '8px' }}>→</span>
              {detail}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const Arrow = ({ direction = 'right', style = {} }) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        color: '#9ca3af',
        ...style
      }}
    >
      {direction === 'right' ? '→' : 
       direction === 'left' ? '←' : 
       direction === 'down' ? '↓' : '→'}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
        backdropFilter: 'blur(10px)',
        padding: '80px 20px',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{
          maxWidth: '1200px',
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
            ⚡
          </div>
          
          <h1 style={{
            margin: '0 0 20px 0',
            fontSize: '48px',
            fontWeight: '700',
            textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
          }}>
            Comment ça marche
          </h1>
          
          <p style={{
            margin: '0 0 40px 0',
            fontSize: '20px',
            opacity: 0.9,
            maxWidth: '700px',
            margin: '0 auto 40px',
            lineHeight: 1.6
          }}>
            Découvrez le processus simple et sécurisé pour réaliser vos projets de décoration et rénovation avec Pinsart Déco
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => navigate(user ? '/work-requests' : '/register')}
              style={{
                padding: '16px 32px',
                backgroundColor: 'white',
                color: '#667eea',
                border: 'none',
                borderRadius: '50px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(255, 255, 255, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(255, 255, 255, 0.2)';
              }}
            >
              {user ? 'Créer une demande' : 'Commencer maintenant'}
            </button>

            <button
              onClick={() => navigate('/about')}
              style={{
                padding: '16px 32px',
                backgroundColor: 'transparent',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '50px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              En savoir plus
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '80px 20px' }}>
        
        {/* Section principale des étapes */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '60px 40px',
          marginBottom: '60px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{
              margin: '0 0 20px 0',
              fontSize: '36px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Le processus en 6 étapes
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Un parcours simple et transparent pour tous vos projets
            </p>
          </div>

          {/* Grid des étapes avec disposition en quinconce */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '40px',
            maxWidth: '1200px',
            margin: '0 auto',
            position: 'relative'
          }}>
            {/* Ligne 1 : Étapes 1, 2, 3 */}
            <div style={{ gridColumn: '1', position: 'relative' }}>
              <StepCard step={steps[0]} index={0} isActive={activeStep === 0} />
              {/* Flèche vers étape 2 */}
              <Arrow 
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '-20px',
                  transform: 'translateY(-50%)',
                  zIndex: 10
                }}
              />
            </div>

            <div style={{ gridColumn: '2', position: 'relative' }}>
              <StepCard step={steps[1]} index={1} isActive={activeStep === 1} />
              {/* Flèche vers étape 3 */}
              <Arrow 
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '-20px',
                  transform: 'translateY(-50%)',
                  zIndex: 10
                }}
              />
            </div>

            <div style={{ gridColumn: '3', position: 'relative' }}>
              <StepCard step={steps[2]} index={2} isActive={activeStep === 2} />
              {/* Flèche vers étape 4 (vers le bas-gauche) */}
              <Arrow 
                direction="down"
                style={{
                  position: 'absolute',
                  bottom: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%) rotate(-135deg)',
                  zIndex: 10
                }}
              />
            </div>

            {/* Ligne 2 : Étapes 6, 5, 4 (ordre inversé pour quinconce) */}
            <div style={{ gridColumn: '1', marginTop: '40px', position: 'relative' }}>
              <StepCard step={steps[5]} index={5} isActive={activeStep === 5} />
            </div>

            <div style={{ gridColumn: '2', marginTop: '40px', position: 'relative' }}>
              <StepCard step={steps[4]} index={4} isActive={activeStep === 4} />
              {/* Flèche vers étape 6 */}
              <Arrow 
                direction="left"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '-20px',
                  transform: 'translateY(-50%)',
                  zIndex: 10
                }}
              />
            </div>

            <div style={{ gridColumn: '3', marginTop: '40px', position: 'relative' }}>
              <StepCard step={steps[3]} index={3} isActive={activeStep === 3} />
              {/* Flèche vers étape 5 */}
              <Arrow 
                direction="left"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '-20px',
                  transform: 'translateY(-50%)',
                  zIndex: 10
                }}
              />
            </div>
          </div>

          {/* Indicateurs d'étapes */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '40px'
          }}>
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveStep(index)}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: activeStep === index ? '#667eea' : '#d1d5db',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* Section avantages */}
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
            fontSize: '36px',
            fontWeight: '700',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Pourquoi choisir Pinsart Déco
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px'
          }}>
            {[
              {
                icon: '🔒',
                title: 'Sécurité garantie',
                description: 'Professionnels vérifiés et paiements sécurisés pour votre tranquillité d\'esprit'
              },
              {
                icon: '⚡',
                title: 'Rapidité d\'exécution',
                description: 'Processus optimisé pour recevoir rapidement des devis et commencer vos travaux'
              },
              {
                icon: '💰',
                title: 'Transparence des prix',
                description: 'Devis détaillés et comparaison facilitée pour faire le meilleur choix'
              },
              {
                icon: '🎯',
                title: 'Qualité assurée',
                description: 'Système d\'évaluation et de suivi pour garantir la qualité des prestations'
              },
              {
                icon: '📱',
                title: 'Suivi en temps réel',
                description: 'Notifications et mises à jour pour suivre l\'avancement de vos projets'
              },
              {
                icon: '🤝',
                title: 'Support client',
                description: 'Équipe dédiée pour vous accompagner tout au long de votre projet'
              }
            ].map((advantage, index) => (
              <div
                key={index}
                style={{
                  background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                  padding: '30px',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center',
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>
                  {advantage.icon}
                </div>
                <h3 style={{
                  margin: '0 0 12px 0',
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  {advantage.title}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#64748b',
                  lineHeight: 1.6
                }}>
                  {advantage.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          borderRadius: '24px',
          padding: '50px',
          textAlign: 'center',
          color: 'white',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
        }}>
          <h2 style={{
            margin: '0 0 20px 0',
            fontSize: '32px',
            fontWeight: '700'
          }}>
            Prêt à démarrer votre projet ?
          </h2>
          
          <p style={{
            margin: '0 0 30px 0',
            fontSize: '18px',
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto 40px'
          }}>
            Rejoignez des milliers de clients satisfaits qui ont réalisé leurs projets avec Pinsart Déco
          </p>

          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => navigate(user ? '/work-requests' : '/register')}
              style={{
                padding: '16px 32px',
                backgroundColor: 'white',
                color: '#667eea',
                border: 'none',
                borderRadius: '50px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(255, 255, 255, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(255, 255, 255, 0.2)';
              }}
            >
              {user ? 'Créer ma première demande' : 'Créer mon compte gratuit'}
            </button>

            {!user && (
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '16px 32px',
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '50px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                J'ai déjà un compte
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Responsive */}
      <style>
        {`
          @media (max-width: 768px) {
            .step-grid {
              grid-template-columns: 1fr !important;
              gap: 20px !important;
            }
            .step-card {
              margin-top: 0 !important;
            }
            .arrow {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default HowItWorksPage;