import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthUser } from '../types';
import { authService } from '../services/api';
import { LifeBuoy, User as UserIcon, LogOut, ShieldCheck, UserCheck } from 'lucide-react';
import './Navbar.css';

interface Props {
  user: AuthUser | null;
  onLogout: () => void;
}

export const Navbar: React.FC<Props> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    onLogout();
    navigate('/login');
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return <span className="nav-role-badge role-admin"><ShieldCheck size={12} /> ADMIN</span>;
      case 'ROLE_AGENT':
        return <span className="nav-role-badge role-agent"><UserCheck size={12} /> SUPPORT AGENT</span>;
      default:
        return <span className="nav-role-badge role-customer">CUSTOMER</span>;
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <LifeBuoy className="brand-icon" size={24} />
          <div className="brand-text">
            <span className="brand-title">Nexoraa Support Portal</span>
            <span className="brand-subtitle">Customer Ticket Management</span>
          </div>
        </Link>

        {user ? (
          <div className="navbar-actions">
            <div className="user-profile-summary">
              <UserIcon size={16} className="user-avatar-icon" />
              <div className="user-meta">
                <span className="user-name">{user.name}</span>
                {getRoleBadge(user.role)}
              </div>
            </div>

            <Link to="/profile" className="profile-btn" title="View User Profile">
              Profile
            </Link>

            <button className="logout-btn" onClick={handleLogout} title="Sign Out">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="navbar-auth-links">
            <Link to="/login" className="nav-login-link">Login</Link>
            <Link to="/register" className="nav-register-btn">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};
