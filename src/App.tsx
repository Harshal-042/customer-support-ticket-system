import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthUser } from './types';
import { authService, api } from './services/api';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastNotification } from './components/ToastNotification';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { AgentDashboard } from './pages/AgentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { CreateTicket } from './pages/CreateTicket';
import { TicketDetails } from './pages/TicketDetails';
import { Profile } from './pages/Profile';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getUser());
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Logged out successfully', 'info');
  };

  const renderDashboardByRole = () => {
    if (!currentUser) return <Navigate to="/login" replace />;
    switch (currentUser.role) {
      case 'ROLE_ADMIN':
        return <AdminDashboard currentUser={currentUser} showToast={showToast} />;
      case 'ROLE_AGENT':
        return <AgentDashboard currentUser={currentUser} showToast={showToast} />;
      case 'ROLE_CUSTOMER':
      default:
        return <CustomerDashboard currentUser={currentUser} showToast={showToast} />;
    }
  };

  return (
    <BrowserRouter>
      <div className="app-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar
          user={currentUser}
          onLogout={handleLogout}
        />

        {toast && (
          <ToastNotification
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <div className="app-body" style={{ display: 'flex', flex: 1 }}>
          {currentUser && <Sidebar user={currentUser} />}

          <main className="app-content" style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            <Routes>
              {/* Public Auth Routes */}
              <Route
                path="/login"
                element={
                  currentUser ? (
                    <Navigate to="/" replace />
                  ) : (
                    <Login onLoginSuccess={handleLoginSuccess} showToast={showToast} />
                  )
                }
              />
              <Route
                path="/register"
                element={
                  currentUser ? (
                    <Navigate to="/" replace />
                  ) : (
                    <Register onLoginSuccess={handleLoginSuccess} showToast={showToast} />
                  )
                }
              />

              {/* Role-Aware Main Dashboard */}
              <Route path="/" element={renderDashboardByRole()} />

              {/* Protected Routes */}
              <Route
                path="/create-ticket"
                element={
                  currentUser ? (
                    <CreateTicket showToast={showToast} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/my-tickets"
                element={
                  currentUser ? (
                    <CustomerDashboard currentUser={currentUser} showToast={showToast} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/agent-tickets"
                element={
                  currentUser ? (
                    <AgentDashboard currentUser={currentUser} showToast={showToast} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/admin-tickets"
                element={
                  currentUser ? (
                    <AdminDashboard currentUser={currentUser} showToast={showToast} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/tickets/:id"
                element={
                  currentUser ? (
                    <TicketDetails currentUser={currentUser} showToast={showToast} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/profile"
                element={
                  currentUser ? <Profile user={currentUser} /> : <Navigate to="/login" replace />
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
