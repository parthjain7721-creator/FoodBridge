import React, { useState } from 'react';
import { Mail, Lock, Leaf, AlertCircle, Loader } from 'lucide-react';
import { loginUser } from '../../api/auth';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginUser(email.trim().toLowerCase(), password);
      // Persist session
      localStorage.setItem('fb_token', data.token);
      localStorage.setItem('fb_user', JSON.stringify(data.user));
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fade-in">
      {/* Left Branding Panel */}
      <div className="auth-brand">
        <div className="auth-brand-inner">
          <div className="auth-logo">
            <Leaf size={36} color="var(--color-primary)" />
          </div>
          <h1 className="auth-brand-title">FoodBridge</h1>
          <p className="auth-brand-subtitle">
            Connecting surplus food to communities in need, powered by AI.
          </p>
          <div className="auth-stats">
            <div className="auth-stat">
              <span className="auth-stat-value">12,400+</span>
              <span className="auth-stat-label">Meals Rescued</span>
            </div>
            <div className="auth-stat">
              <span className="auth-stat-value">31 tonnes</span>
              <span className="auth-stat-label">CO₂ Saved</span>
            </div>
            <div className="auth-stat">
              <span className="auth-stat-value">180+</span>
              <span className="auth-stat-label">Active NGOs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-card glass-panel animate-slide-up">
          <div className="auth-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your FoodBridge account</p>
          </div>

          {error && (
            <div className="auth-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size={18} className="spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="auth-switch">
            <span>Don't have an account?</span>
            <button
              type="button"
              className="auth-switch-btn"
              onClick={onSwitchToRegister}
            >
              Create Account
            </button>
          </div>

          {/* Role hint pills */}
          <div className="auth-role-hint">
            <span>Register as:</span>
            <span className="role-pill donor">🍽️ Donor</span>
            <span className="role-pill ngo">🏠 NGO</span>
            <span className="role-pill volunteer">🚴 Volunteer</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
