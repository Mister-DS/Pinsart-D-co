import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';   // Importation du Dashboard Admin
// import EmployeeDashboard from './pages/EmployeeDashboard'; // Décommentez lorsque vous créerez ce fichier

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Page d'accueil */}
          <Route path="/" element={<Home />} />
          
          {/* Authentification */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Dashboards */}
          <Route path="/admin" element={<AdminDashboard />} />     {/* Route pour le Dashboard Admin */}
          {/* <Route path="/employee-dashboard" element={<EmployeeDashboard />} /> */} {/* Décommentez pour le Dashboard Employé */}
          
          {/* Route par défaut - redirige vers home */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
