import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Login from './components/Login';
import POS from './components/POS';
import Admin from './components/Admin';
import { AuthProvider, useAuth } from './services/AuthContext';
import { CartProvider } from './services/CartContext';
import './App.css';

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <Header />
      <main className="container py-4">
        {!user ? (
          <Login />
        ) : (
          <Routes>
            <Route path="/" element={<POS />} />
            <Route path="/admin" element={
              user.role === 'admin' ? <Admin /> : <Navigate to="/" replace />
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>
      <footer className="text-center text-muted py-3 text-sm">
        Shawarma Boss • Modern MERN Stack POS
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;