import React from 'react';

// Données qu'on peut passer au composant 
interface ServiceCardProps {
    title: string;
    description: string;
}

function ServiceCard({ title, description }: ServiceCardProps) {
    return (
        <div style={{border: '1px solid #ccc', padding: '20px', borderRadius: '8px'}}>
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
}

export default ServiceCard;