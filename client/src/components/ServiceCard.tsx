import React from 'react';

// Données qu'on peut passer au composant 
interface ServiceCardProps {
    title: string;
    description: string;
}

function ServiceCard({ title, description }: ServiceCardProps) {
    return (
        <div 
            style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid #e5e7eb',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.borderColor = '#667eea';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = '#e5e7eb';
            }}
        >
            {/* Effet de gradient en arrière-plan */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px 16px 0 0'
            }} />
            
            {/* Icône décorative */}
            <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
            }}>
                <div style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: '#667eea',
                    borderRadius: '4px',
                    position: 'relative'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        width: '12px',
                        height: '12px',
                        backgroundColor: 'white',
                        borderRadius: '2px'
                    }} />
                </div>
            </div>

            <h3 style={{
                fontSize: '22px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0 0 15px 0',
                lineHeight: '1.3'
            }}>
                {title}
            </h3>
            
            <p style={{
                color: '#6b7280',
                fontSize: '16px',
                lineHeight: '1.6',
                margin: '0 0 20px 0'
            }}>
                {description}
            </p>

            {/* Flèche "En savoir plus" */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                color: '#667eea',
                fontSize: '14px',
                fontWeight: '600'
            }}>
                <span>En savoir plus</span>
                <span style={{
                    marginLeft: '8px',
                    transition: 'transform 0.3s ease'
                }}>
                    →
                </span>
            </div>
        </div>
    );
}

export default ServiceCard;