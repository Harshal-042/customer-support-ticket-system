import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, authService } from '../services/api';
import { AuthUser, UserRole } from '../types';
import { UserPlus, User, Mail, Key, Shield, LifeBuoy } from 'lucide-react';
import './Register.css';

interface Props {
  onLoginSuccess: (user: AuthUser) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const Register: React.FC<Props> = ({ onLoginSuccess, showToast }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('ROLE_CUSTOMER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { token, user } = response.data;
      authService.setAuth(token, user);
      onLoginSuccess(user);
      showToast(`Account registered successfully as ${role.replace('ROLE_', '')}!`, 'success');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-card-header">
          <div className="register-logo">
            <LifeBuoy size={28} />
          </div>
          <h2 className="register-title">Create New Account</h2>
          <p className="register-subtitle">Nexoraa Support Portal Registration</p>
        </div>

        {error && <div className="register-error-alert">{error}</div>}

        <form onSubmit={handleRegister} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-with-icon">
              <User size={16} className="input-icon" />
              <input
                id="name"
                type="text"
                placeholder="e.g. Ananya Roy"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="e.g. ananya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Key size={16} className="input-icon" />
              <input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role">Select User Role</label>
            <div className="input-with-icon">
              <Shield size={16} className="input-icon" />
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="role-select"
              >
                <option value="ROLE_CUSTOMER">Customer (Submits tickets)</option>
                <option value="ROLE_AGENT">Support Agent (Resolves tickets)</option>
              </select>
            </div>
          </div>

          <button type="submit" className="register-submit-btn" disabled={loading}>
            <UserPlus size={16} />
            <span>{loading ? 'Registering...' : 'Register Account'}</span>
          </button>
        </form>

        <div className="register-card-footer">
          Already registered? <Link to="/login">Sign In Here</Link>
        </div>
      </div>
    </div>
  );
};
