import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Login from './components/Login';
import POS from './components/POS';
import Admin from './components/Admin';
import LoadingSpinner from './components/LoadingSpinner';
import { AuthProvider, useAuth } from './services/AuthContext';
import { CartProvider } from './services/CartContext';
import { ToastProvider } from './components/ToastContainer';
import { NotificationProvider } from './services/NotificationContext';
import { PWAProvider } from './services/PWAContext';
import './App.css';

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen fade-in">
        <LoadingSpinner size="large" centered message="Loading Shawarma Boss POS..." />
      </div>
    );
  }

  return (
    <div className="App">
      <Header />
      <main className="container py-4 page-transition-wrapper">
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
        Shawarma Boss • Developed by FulPlan
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <PWAProvider>
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <ToastProvider>
                <AppContent />
              </ToastProvider>
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </PWAProvider>
    </Router>
  );
}

export default App;