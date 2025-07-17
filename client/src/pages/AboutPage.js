import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: '🔐',
      title: 'Authentification sécurisée',
      description: 'Inscription et connexion protégées par JWT pour garantir la sécurité de vos données'
    },
    {
      icon: '📋',
      title: 'Gestion des demandes',
      description: 'Soumettez vos demandes de travaux facilement et suivez leur progression en temps réel'
    },
    {
      icon: '💰',
      title: 'Devis personnalisés',
      description: 'Recevez des devis détaillés de professionnels qualifiés pour vos projets'
    },
    {
      icon: '📅',
      title: 'Planification intelligente',
      description: 'Système de calendrier intégré pour organiser et suivre vos travaux'
    },
    {
      icon: '📧',
      title: 'Notifications email',
      description: 'Restez informé à chaque étape grâce à nos notifications automatiques'
    },
    {
      icon: '⭐',
      title: 'Système de notation',
      description: 'Évaluez et consultez les avis pour choisir les meilleurs professionnels'
    },
    {
      icon: '📊',
      title: 'Historique complet',
      description: 'Accédez à l\'historique de tous vos projets et prestations'
    },
    {
      icon: '👥',
      title: 'Interfaces dédiées',
      description: 'Espaces distincts et optimisés pour clients, professionnels et administrateurs'
    }
  ];

  const technologies = [
    { name: 'React.js', color: '#61DAFB', category: 'Frontend' },
    { name: 'Tailwind CSS', color: '#06B6D4', category: 'Frontend' },
    { name: 'Node.js', color: '#339933', category: 'Backend' },
    { name: 'Express.js', color: '#000000', category: 'Backend' },
    { name: 'MongoDB', color: '#47A248', category: 'Database' },
    { name: 'JWT', color: '#000000', category: 'Auth' },
    { name: 'Cloudinary', color: '#3448C5', category: 'Storage' },
    { name: 'Nodemailer', color: '#339933', category: 'Email' }
  ];

  const stats = [
    { number: '100%', label: 'Sécurisé', icon: '🔒' },
    { number: '24/7', label: 'Disponible', icon: '⏰' },
    { number: '∞', label: 'Projets possibles', icon: '🏠' },
    { number: '5★', label: 'Expérience utilisateur', icon: '⭐' }
  ];

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
          margin: '0 auto',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '30px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            margin: '0 auto 30px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            animation: 'float 3s ease-in-out infinite'
          }}>
            🎨
          </div>
          
          <h1 style={{
            margin: '0 0 20px 0',
            fontSize: '48px',
            fontWeight: '700',
            textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
          }}>
            Pinsart Déco
          </h1>
          
          <p style={{
            margin: '0 0 30px 0',
            fontSize: '20px',
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto 40px',
            lineHeight: 1.6
          }}>
            La plateforme web innovante qui met en relation clients et professionnels 
            de la décoration et rénovation pour des projets réussis
          </p>

          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '16px 32px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '50px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            🚀 Rejoindre la plateforme
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        margin: '0 20px',
        borderRadius: '20px',
        transform: 'translateY(-50px)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '30px'
        }}>
          {stats.map((stat, index) => (
            <div key={index} style={{
              textAlign: 'center',
              padding: '20px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>{stat.icon}</div>
              <div style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '5px'
              }}>
                {stat.number}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 80px' }}>
        
        {/* Mission Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '50px',
          marginBottom: '40px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center'
        }}>
          <h2 style={{
            margin: '0 0 30px 0',
            fontSize: '36px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Notre Mission
          </h2>
          
          <p style={{
            fontSize: '18px',
            lineHeight: 1.8,
            color: '#374151',
            maxWidth: '800px',
            margin: '0 auto 40px',
            textAlign: 'left'
          }}>
            <strong>Pinsart Déco</strong> a été conçu pour simplifier et sécuriser la mise en relation 
            entre particuliers et professionnels de la décoration et rénovation. Notre plateforme 
            offre un <strong>suivi complet</strong> du processus : de la demande initiale à l'évaluation 
            post-travaux, en passant par la création de devis personnalisés et la planification des interventions.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px',
            marginTop: '40px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
              padding: '30px',
              borderRadius: '16px',
              border: '1px solid #bfdbfe'
            }}>
              <h3 style={{
                margin: '0 0 16px 0',
                fontSize: '20px',
                fontWeight: '600',
                color: '#1e40af',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ marginRight: '10px' }}>👤</span>
                Pour les Clients
              </h3>
              <p style={{ margin: 0, fontSize: '16px', color: '#1e40af', lineHeight: 1.6 }}>
                Soumettez facilement vos demandes de travaux, recevez des devis personnalisés 
                et suivez l'avancement de vos projets en temps réel.
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              padding: '30px',
              borderRadius: '16px',
              border: '1px solid #bbf7d0'
            }}>
              <h3 style={{
                margin: '0 0 16px 0',
                fontSize: '20px',
                fontWeight: '600',
                color: '#166534',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ marginRight: '10px' }}>🔧</span>
                Pour les Professionnels
              </h3>
              <p style={{ margin: 0, fontSize: '16px', color: '#166534', lineHeight: 1.6 }}>
                Développez votre activité en accédant à de nouveaux clients, 
                gérez vos devis et planifiez vos interventions efficacement.
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
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
            Fonctionnalités Principales
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {features.map((feature, index) => (
              <div key={index} style={{
                background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                padding: '30px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
              >
                <div style={{
                  fontSize: '40px',
                  marginBottom: '16px',
                  textAlign: 'center'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  margin: '0 0 12px 0',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1e293b',
                  textAlign: 'center'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#64748b',
                  lineHeight: 1.6,
                  textAlign: 'center'
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Section */}
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
            margin: '0 0 20px 0',
            fontSize: '36px',
            fontWeight: '700',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Technologies Modernes
          </h2>
          
          <p style={{
            textAlign: 'center',
            fontSize: '16px',
            color: '#64748b',
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px'
          }}>
            Pinsart Déco utilise un stack technologique moderne et fiable pour garantir 
            performance, sécurité et évolutivité.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            {technologies.map((tech, index) => (
              <div key={index} style={{
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #f1f5f9',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = tech.color;
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#f1f5f9';
                e.target.style.transform = 'scale(1)';
              }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: tech.color,
                  margin: '0 auto 12px',
                  boxShadow: `0 0 0 4px ${tech.color}20`
                }}></div>
                <h4 style={{
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  {tech.name}
                </h4>
                <span style={{
                  fontSize: '12px',
                  color: '#64748b',
                  backgroundColor: '#f1f5f9',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontWeight: '500'
                }}>
                  {tech.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '50px',
          marginBottom: '40px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center'
        }}>
          <h2 style={{
            margin: '0 0 40px 0',
            fontSize: '36px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            L'Équipe
          </h2>

          <div style={{
            maxWidth: '500px',
            margin: '0 auto',
            background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
            padding: '40px',
            borderRadius: '20px',
            border: '1px solid #bae6fd'
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              margin: '0 auto 20px',
              boxShadow: '0 10px 25px rgba(14, 165, 233, 0.3)'
            }}>
              👨‍💻
            </div>
            
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#0c4a6e'
            }}>
              Simon Dierickx
            </h3>
            
            <p style={{
              margin: '0 0 16px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#0369a1'
            }}>
              Développeur Fullstack
            </p>
            
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#0284c7',
              lineHeight: 1.6
            }}>
              Créateur et développeur principal de Pinsart Déco. Projet développé dans le cadre 
              d'un travail scolaire encadré, démontrant une expertise technique complète 
              du développement web moderne.
            </p>
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
            Prêt à transformer vos projets ?
          </h2>
          
          <p style={{
            margin: '0 0 30px 0',
            fontSize: '18px',
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto 40px'
          }}>
            Rejoignez dès maintenant la communauté Pinsart Déco et découvrez une nouvelle 
            façon de gérer vos projets de décoration et rénovation.
          </p>

          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => navigate('/register')}
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
              🚀 S'inscrire maintenant
            </button>

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
              🔑 Se connecter
            </button>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }
        `}
      </style>
    </div>
  );
};

export default AboutPage;