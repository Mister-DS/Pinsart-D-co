import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';

// Import des pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WorkRequests from './pages/WorkRequests';
import AdminPage from './pages/AdminPage';
import ProfessionalsPage from './pages/ProfessionalsPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Page d'accueil avec son propre header intégré */}
            <Route path="/" element={<Home />} />
            
            {/* Pages avec Layout et Header */}
            <Route path="/login" element={
              <Layout>
                <Login />
              </Layout>
            } />
            <Route path="/register" element={
              <Layout>
                <Register />
              </Layout>
            } />
            <Route path="/dashboard" element={
              <Layout>
                <Dashboard />
              </Layout>
            } />
            <Route path="/work-requests" element={
              <Layout>
                <WorkRequests />
              </Layout>
            } />
            <Route path="/admin" element={
              <Layout>
                <AdminPage />
              </Layout>
            } />
            <Route path="/professionals" element={
              <Layout>
                <ProfessionalsPage />
              </Layout>
            } />
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Pages à créer plus tard */}
            <Route path="/about" element={
              <Layout>
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <h1>À propos de Pinsart Déco</h1>
                  <p>Page en construction...</p>
                </div>
              </Layout>
            } />
            <Route path="/how-it-works" element={
              <Layout>
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <h1>Comment ça marche</h1>
                  <p>Page en construction...</p>
                </div>
              </Layout>
            } />
            <Route path="/profile" element={
              <Layout>
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <h1>Mon Profil</h1>
                  <p>Page en construction...</p>
                </div>
              </Layout>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;