import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const Home = () => {
  const { user } = useAuth();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Récupérer les travaux réalisés depuis la base de données
  const fetchPortfolioItems = async () => {
    try {
      // Récupérer les demandes de travaux terminées avec images
      const { data: workRequests, error } = await supabase
        .from('work_requests')
        .select(`
          *,
          user_profiles!work_requests_assigned_to_fkey (
            company_name,
            first_name,
            last_name
          )
        `)
        .eq('status', 'completed')
        .not('images', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Erreur lors de la récupération des travaux:', error);
        return;
      }

      // Transformer les données pour le portfolio
      const transformedData = workRequests
        ?.filter(req => req.images && req.images.length > 0)
        .map(req => ({
          id: req.id,
          title: req.title,
          category: req.category,
          image: req.images[0], // Première image
          description: req.description.substring(0, 100) + '...',
          professional: req.user_profiles?.company_name || 
                       `${req.user_profiles?.first_name || ''} ${req.user_profiles?.last_name || ''}`.trim() || 
                       'Professionnel',
          duration: req.estimated_duration || 'Non spécifié',
          rating: 5 // Par défaut, plus tard on pourra ajouter un système de notation
        })) || [];

      setPortfolioItems(transformedData);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Récupérer les témoignages depuis la base de données
  const fetchTestimonials = async () => {
    try {
      // Pour le moment, on va chercher des avis dans les notes des demandes terminées
      const { data: reviews, error } = await supabase
        .from('work_requests')
        .select(`
          *,
          user_profiles!work_requests_user_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq('status', 'completed')
        .not('client_review', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Erreur lors de la récupération des avis:', error);
        return;
      }

      // Transformer les données pour les témoignages
      const transformedReviews = reviews
        ?.filter(req => req.client_review && req.client_review.trim() !== '')
        .map(req => ({
          id: req.id,
          name: `${req.user_profiles?.first_name || 'Client'} ${req.user_profiles?.last_name || ''}`.trim(),
          location: req.location_city || 'Non spécifié',
          rating: req.client_rating || 5,
          comment: req.client_review,
          project: req.category,
          date: new Date(req.updated_at).toLocaleDateString('fr-FR', { 
            month: 'long', 
            year: 'numeric' 
          })
        })) || [];

      setTestimonials(transformedReviews);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPortfolioItems(),
        fetchTestimonials()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Rotation automatique des témoignages
  useEffect(() => {
    if (testimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [testimonials.length]);

  const StarRating = ({ rating }) => (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[...Array(5)].map((_, i) => (
        <span key={i} style={{
          color: i < rating ? '#fbbf24' : '#e5e7eb',
          fontSize: '16px'
        }}>
          ★
        </span>
      ))}
    </div>
  );

  return (
    <div>
      <Header />
      
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            margin: '0 0 24px 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            🏠 Trouvez le professionnel parfait pour vos travaux
          </h1>
          <p style={{
            fontSize: '20px',
            margin: '0 0 40px 0',
            opacity: 0.9,
            lineHeight: '1.6'
          }}>
            Pinsart Déco vous connecte avec les meilleurs artisans de votre région. 
            Demandez des devis gratuits et choisissez le professionnel qui vous convient.
          </p>
          
          {!user && (
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/register"
                style={{
                  padding: '16px 32px',
                  backgroundColor: 'white',
                  color: '#667eea',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '16px',
                  transition: 'transform 0.2s ease',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                🚀 Commencer maintenant
              </Link>
              <Link
                to="/work-requests"
                style={{
                  padding: '16px 32px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.3)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                📋 Demander un devis
              </Link>
            </div>
          )}

          {user && (
            <div style={{
              padding: '24px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <p style={{ margin: '0 0 16px 0', fontSize: '18px' }}>
                👋 Bon retour, {user.user_metadata?.first_name || 'cher utilisateur'} !
              </p>
              <Link
                to="/dashboard"
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'white',
                  color: '#667eea',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Accéder à mon espace
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Portfolio Section - Défilement automatique */}
      <section style={{
        padding: '80px 0',
        backgroundColor: '#f9fafb',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '700',
            textAlign: 'center',
            margin: '0 0 16px 0',
            color: '#111827'
          }}>
            Nos réalisations
          </h2>
          <p style={{
            fontSize: '18px',
            textAlign: 'center',
            color: '#6b7280',
            margin: '0 0 60px 0'
          }}>
            Découvrez les projets réalisés par nos professionnels
          </p>

          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '400px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f4f6',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
          ) : portfolioItems.length > 0 ? (
            <div style={{
              position: 'relative',
              height: '400px',
              overflow: 'hidden',
              borderRadius: '16px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                animation: portfolioItems.length > 3 ? 'scroll 30s linear infinite' : 'none',
                height: '100%'
              }}>
                {(portfolioItems.length > 3 ? [...portfolioItems, ...portfolioItems] : portfolioItems).map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    style={{
                      minWidth: '320px',
                      height: '380px',
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      marginRight: '24px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                      border: '1px solid #e5e7eb',
                      transition: 'transform 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-10px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    <div style={{
                      width: '100%',
                      height: '220px',
                      backgroundImage: `url(${item.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        textTransform: 'capitalize'
                      }}>
                        {item.category}
                      </div>
                      
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <StarRating rating={item.rating} />
                      </div>
                    </div>
                    
                    <div style={{ padding: '20px' }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        margin: '0 0 8px 0',
                        color: '#111827'
                      }}>
                        {item.title}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        margin: '0 0 12px 0',
                        lineHeight: '1.4'
                      }}>
                        {item.description}
                      </p>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px',
                        color: '#9ca3af'
                      }}>
                        <span>Par {item.professional}</span>
                        <span>{item.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: 'white',
              padding: '60px 40px',
              borderRadius: '20px',
              textAlign: 'center',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <div style={{
                fontSize: '64px',
                marginBottom: '20px',
                opacity: 0.7
              }}>
                🚧
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                margin: '0 0 16px 0',
                color: '#111827'
              }}>
                Travaux en cours...
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                lineHeight: '1.6',
                margin: '0 0 24px 0'
              }}>
                Nos professionnels réalisent actuellement leurs premiers projets. 
                Dès qu'ils partageront leurs réalisations, nous les afficherons ici !
              </p>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <Link
                  to="/work-requests"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '500',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                >
                  Créer une demande
                </Link>
                <Link
                  to="/register"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'transparent',
                    color: '#3b82f6',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '500',
                    fontSize: '14px',
                    border: '2px solid #3b82f6',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#3b82f6';
                    e.target.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#3b82f6';
                  }}
                >
                  Devenir professionnel
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: 'white'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '700',
            textAlign: 'center',
            margin: '0 0 16px 0',
            color: '#111827'
          }}>
            Ce que disent nos clients
          </h2>
          <p style={{
            fontSize: '18px',
            textAlign: 'center',
            color: '#6b7280',
            margin: '0 0 60px 0'
          }}>
            La satisfaction de nos clients est notre priorité
          </p>

          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f4f6',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
          ) : testimonials.length > 0 ? (
            <>
              <div style={{
                backgroundColor: '#f9fafb',
                padding: '40px',
                borderRadius: '20px',
                textAlign: 'center',
                border: '1px solid #e5e7eb',
                position: 'relative',
                maxWidth: '700px',
                margin: '0 auto'
              }}>
                <div style={{
                  fontSize: '48px',
                  color: '#3b82f6',
                  marginBottom: '20px',
                  opacity: 0.3
                }}>
                  "
                </div>
                
                <p style={{
                  fontSize: '18px',
                  color: '#374151',
                  fontStyle: 'italic',
                  lineHeight: '1.6',
                  margin: '0 0 24px 0'
                }}>
                  {testimonials[currentTestimonial].comment}
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <StarRating rating={testimonials[currentTestimonial].rating} />
                </div>

                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '4px'
                }}>
                  {testimonials[currentTestimonial].name}
                </div>
                
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: '8px'
                }}>
                  {testimonials[currentTestimonial].location} • {testimonials[currentTestimonial].project}
                </div>

                <div style={{
                  fontSize: '12px',
                  color: '#9ca3af'
                }}>
                  {testimonials[currentTestimonial].date}
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '32px'
              }}>
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: currentTestimonial === index ? '#3b82f6' : '#d1d5db',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            <div style={{
              backgroundColor: '#f9fafb',
              padding: '40px',
              borderRadius: '20px',
              textAlign: 'center',
              border: '1px solid #e5e7eb',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '20px',
                opacity: 0.7
              }}>
                ⭐
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                margin: '0 0 12px 0',
                color: '#111827'
              }}>
                Premiers avis en attente...
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                lineHeight: '1.6',
                margin: '0'
              }}>
                Dès que nos premiers clients auront terminé leurs projets, 
                leurs avis apparaîtront ici pour vous aider à faire le meilleur choix.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '700',
            textAlign: 'center',
            margin: '0 0 16px 0',
            color: '#111827'
          }}>
            Comment ça fonctionne ?
          </h2>
          <p style={{
            fontSize: '18px',
            textAlign: 'center',
            color: '#6b7280',
            margin: '0 0 60px 0'
          }}>
            En 3 étapes simples, trouvez le professionnel idéal
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '32px 24px',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb',
              transition: 'transform 0.3s ease'
            }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '36px'
              }}>
                📝
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 16px 0', color: '#111827' }}>
                1. Décrivez votre projet
              </h3>
              <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: '1.6' }}>
                Remplissez notre formulaire en détaillant vos besoins, votre budget et vos préférences.
              </p>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '32px 24px',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb',
              transition: 'transform 0.3s ease'
            }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '36px'
              }}>
                🔍
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 16px 0', color: '#111827' }}>
                2. Recevez des devis
              </h3>
              <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: '1.6' }}>
                Les professionnels qualifiés de votre région vous envoient leurs propositions personnalisées.
              </p>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '32px 24px',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb',
              transition: 'transform 0.3s ease'
            }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#f59e0b',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '36px'
              }}>
                ⭐
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 16px 0', color: '#111827' }}>
                3. Choisissez et réalisez
              </h3>
              <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: '1.6' }}>
                Comparez les offres et suivez l'avancement de vos travaux.
              </p>
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            marginTop: '40px'
          }}>
            <Link
              to="/how-it-works"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#3b82f6',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                border: '2px solid #3b82f6',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#3b82f6';
              }}
            >
              En savoir plus sur le processus
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{
                fontSize: '48px',
                fontWeight: '700',
                color: '#3b82f6',
                marginBottom: '8px'
              }}>
                {portfolioItems.length || '0'}+
              </div>
              <div style={{
                fontSize: '18px',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                Projets réalisés
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '48px',
                fontWeight: '700',
                color: '#10b981',
                marginBottom: '8px'
              }}>
                50+
              </div>
              <div style={{
                fontSize: '18px',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                Professionnels vérifiés
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '48px',
                fontWeight: '700',
                color: '#f59e0b',
                marginBottom: '8px'
              }}>
                {testimonials.length || '0'}+
              </div>
              <div style={{
                fontSize: '18px',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                Clients satisfaits
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '48px',
                fontWeight: '700',
                color: '#8b5cf6',
                marginBottom: '8px'
              }}>
                4.8/5
              </div>
              <div style={{
                fontSize: '18px',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                Note moyenne
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            margin: '0 0 16px 0'
          }}>
            Prêt à commencer vos travaux ?
          </h2>
          <p style={{
            fontSize: '18px',
            margin: '0 0 32px 0',
            lineHeight: '1.6',
            opacity: 0.9
          }}>
            Rejoignez des milliers de clients satisfaits qui ont trouvé leur professionnel idéal sur Pinsart Déco.
          </p>
          
          {!user ? (
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/register"
                style={{
                  padding: '16px 32px',
                  backgroundColor: 'white',
                  color: '#667eea',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 6px rgba(255, 255, 255, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 12px rgba(255, 255, 255, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 6px rgba(255, 255, 255, 0.3)';
                }}
              >
                🚀 Créer mon compte
              </Link>
              <Link
                to="/work-requests"
                style={{
                  padding: '16px 32px',
                  backgroundColor: 'transparent',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                📋 Demander un devis gratuit
              </Link>
            </div>
          ) : (
            <Link
              to="/work-requests"
              style={{
                padding: '16px 32px',
                backgroundColor: 'white',
                color: '#667eea',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 6px rgba(255, 255, 255, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 12px rgba(255, 255, 255, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 6px rgba(255, 255, 255, 0.3)';
              }}
            >
              📋 Créer une nouvelle demande
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#111827',
        color: 'white',
        padding: '60px 20px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px',
            marginBottom: '40px'
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '8px',
                  fontSize: '16px'
                }}>
                  🏠
                </div>
                <span style={{ fontSize: '20px', fontWeight: '700' }}>Pinsart Déco</span>
              </div>
              <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.6' }}>
                La plateforme de référence pour trouver les meilleurs professionnels du bâtiment et de la rénovation.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Services</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/about" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>À propos</Link>
                <Link to="/how-it-works" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Comment ça marche</Link>
                <Link to="/work-requests" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Demander un devis</Link>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Support</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/contact" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Contact</Link>
                <Link to="/help" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Aide</Link>
                <Link to="/terms" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Conditions d'utilisation</Link>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Professionnels</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/register" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Devenir partenaire</Link>
                <Link to="/professionals" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Espace Pro</Link>
              </div>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid #374151',
            paddingTop: '20px',
            fontSize: '14px',
            color: '#9ca3af'
          }}>
            © 2025 Pinsart Déco. Tous droits réservés.
          </div>
        </div>
      </footer>

      {/* Styles pour les animations */}
      <style>
        {`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Home;