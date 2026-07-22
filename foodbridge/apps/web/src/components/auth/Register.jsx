import React, { useState } from 'react';
import {
  Mail, Lock, User, Building2, MapPin, Leaf,
  AlertCircle, Loader, Truck, ChevronRight
} from 'lucide-react';
import { registerUser, loginUser } from '../../api/auth';

const ROLES = [
  {
    key: 'donor',
    label: 'Donor',
    emoji: '🍽️',
    description: 'Restaurant, hotel, catering, or event organiser donating surplus food.',
    color: 'var(--color-primary)',
  },
  {
    key: 'ngo',
    label: 'NGO / Recipient',
    emoji: '🏠',
    description: 'Shelter, food bank, or orphanage receiving donated food.',
    color: 'var(--color-accent)',
  },
  {
    key: 'volunteer',
    label: 'Volunteer Driver',
    emoji: '🚴',
    description: 'Volunteer delivering food from donors to NGOs.',
    color: 'var(--color-highlight)',
  },
];

const ORG_TYPES = ['restaurant', 'hostel', 'event', 'catering', 'other'];
const VEHICLE_TYPES = ['bike', 'car', 'van', 'cycle', 'walk'];

const Register = ({ onLogin, onSwitchToLogin }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [step, setStep] = useState('role'); // 'role' | 'form'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Common fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Donor / NGO fields
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('restaurant');
  const [address, setAddress] = useState('');

  // Volunteer fields
  const [vehicleType, setVehicleType] = useState('bike');
  const [maxLoadKg, setMaxLoadKg] = useState(20);

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setStep('form');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      email,
      password,
      full_name: fullName,
      phone: phone || undefined,
      role: selectedRole,
    };

    if (selectedRole === 'donor') {
      payload.org_name = orgName;
      payload.org_type = orgType;
      payload.address = address;
    } else if (selectedRole === 'ngo') {
      payload.org_name = orgName;
      payload.address = address;
    } else if (selectedRole === 'volunteer') {
      payload.vehicle_type = vehicleType;
      payload.max_load_kg = Number(maxLoadKg);
    }

    try {
      // Register then immediately log in (backend returns user, not token on register)
      await registerUser(payload);
      // Auto-login after registration using statically-imported loginUser
      const loginData = await loginUser(email, password);
      localStorage.setItem('fb_token', loginData.token);
      localStorage.setItem('fb_user', JSON.stringify(loginData.user));
      onLogin(loginData.user, loginData.token);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const roleInfo = ROLES.find(r => r.key === selectedRole);

  return (
    <div className="auth-page animate-fade-in">
      {/* Left Branding Panel */}
      <div className="auth-brand">
        <div className="auth-brand-inner">
          <div className="auth-logo">
            <Leaf size={36} color="var(--color-primary)" />
          </div>
          <h1 className="auth-brand-title">Join FoodBridge</h1>
          <p className="auth-brand-subtitle">
            Choose your role and start making an impact today.
          </p>
          <div className="auth-role-cards-sidebar">
            {ROLES.map((r) => (
              <div
                key={r.key}
                className={`auth-role-card-side ${selectedRole === r.key ? 'active' : ''}`}
                style={{ '--role-color': r.color }}
              >
                <span className="role-emoji">{r.emoji}</span>
                <div>
                  <div className="role-name">{r.label}</div>
                  <div className="role-desc">{r.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-card glass-panel animate-slide-up">

          {step === 'role' ? (
            <>
              <div className="auth-form-header">
                <h2>Create your account</h2>
                <p>Select the role that best describes you</p>
              </div>
              <div className="role-selector-grid">
                {ROLES.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    className="role-selector-btn"
                    style={{ '--role-color': r.color }}
                    onClick={() => handleRoleSelect(r.key)}
                  >
                    <span className="role-selector-emoji">{r.emoji}</span>
                    <span className="role-selector-label">{r.label}</span>
                    <span className="role-selector-desc">{r.description}</span>
                    <ChevronRight size={18} className="role-selector-arrow" />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="auth-form-header">
                <button
                  type="button"
                  className="auth-back-btn"
                  onClick={() => { setStep('role'); setError(''); }}
                >
                  ← Back
                </button>
                <h2>
                  {roleInfo?.emoji} Register as {roleInfo?.label}
                </h2>
                <p>Fill in your details to get started</p>
              </div>

              {error && (
                <div className="auth-error">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                {/* Common Fields */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <div className="input-with-icon">
                      <User size={18} className="input-icon" />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone (optional)</label>
                    <div className="input-with-icon">
                      <span className="input-icon" style={{ fontSize: '16px' }}>📞</span>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

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
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {/* Donor Fields */}
                {selectedRole === 'donor' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Organisation Name</label>
                        <div className="input-with-icon">
                          <Building2 size={18} className="input-icon" />
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Luigi's Italian Kitchen"
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Organisation Type</label>
                        <select
                          className="form-input form-select"
                          value={orgType}
                          onChange={(e) => setOrgType(e.target.value)}
                        >
                          {ORG_TYPES.map(t => (
                            <option key={t} value={t}>
                              {t.charAt(0).toUpperCase() + t.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Address</label>
                      <div className="input-with-icon">
                        <MapPin size={18} className="input-icon" />
                        <input
                          type="text"
                          className="form-input"
                          placeholder="123 Main St, Mumbai"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* NGO Fields */}
                {selectedRole === 'ngo' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Organisation Name</label>
                      <div className="input-with-icon">
                        <Building2 size={18} className="input-icon" />
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Helping Hands Foundation"
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Address</label>
                      <div className="input-with-icon">
                        <MapPin size={18} className="input-icon" />
                        <input
                          type="text"
                          className="form-input"
                          placeholder="456 Shelter Road, Mumbai"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Volunteer Fields */}
                {selectedRole === 'volunteer' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Vehicle Type</label>
                      <select
                        className="form-input form-select"
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                      >
                        {VEHICLE_TYPES.map(v => (
                          <option key={v} value={v}>
                            {v.charAt(0).toUpperCase() + v.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Max Carry Load (kg)</label>
                      <div className="input-with-icon">
                        <Truck size={18} className="input-icon" />
                        <input
                          type="number"
                          className="form-input"
                          placeholder="20"
                          value={maxLoadKg}
                          onChange={(e) => setMaxLoadKg(e.target.value)}
                          min={1}
                          max={1000}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader size={18} className="spin" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    `Create ${roleInfo?.label} Account`
                  )}
                </button>
              </form>
            </>
          )}

          <div className="auth-switch">
            <span>Already have an account?</span>
            <button
              type="button"
              className="auth-switch-btn"
              onClick={onSwitchToLogin}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
