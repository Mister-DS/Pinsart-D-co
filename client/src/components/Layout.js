import React from 'react';
import Header from './Header';

const Layout = ({ children, showHeader = true }) => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#f9fafb' 
    }}>
      {showHeader && <Header />}
      <main style={{ 
        flex: 1,
        backgroundColor: 'white'
      }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;