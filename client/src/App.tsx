import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import ClientDashboard from './pages/ClientDashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requiredRole="client">
                <ClientDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;