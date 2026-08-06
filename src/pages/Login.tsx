import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, authService } from '../services/api';
import { AuthUser } from '../types';
import { LifeBuoy, LogIn, Key, Mail } from 'lucide-react';
import './Login.css';

interface Props {
  onLoginSuccess: (user: AuthUser) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const Login: React.FC<Props> = ({ onLoginSuccess, showToast }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      authService.setAuth(token, user);
      onLoginSuccess(user);
      showToast(`Welcome back, ${user.name}!`, 'success');

      // Navigate based on role
      if (user.role === 'ROLE_ADMIN') {
        navigate('/');
      } else if (user.role === 'ROLE_AGENT') {
        navigate('/');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card-header">
          <div className="login-logo">
            <LifeBuoy size={28} />
          </div>
          <h2 className="login-title">Nexoraa Support Portal</h2>
          <p className="login-subtitle">Secure Customer Support Portal</p>
        </div>

        {error && <div className="login-error-alert">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="e.g. customer@example.com"
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
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            <LogIn size={16} />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="login-card-footer">
          Don't have an account? <Link to="/register">Register New Account</Link>
        </div>
      </div>
    </div>
  );
};
