import React, { useState } from 'react';
import { User, Mail, Shield, Calendar, Award, TrendingUp, Edit3, Save, X } from 'lucide-react';

const ROLE_COLORS = {
  donor: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', text: 'var(--color-primary)' },
  ngo: { bg: 'rgba(20, 184, 166, 0.15)', border: 'rgba(20, 184, 166, 0.4)', text: 'var(--color-accent)' },
  volunteer: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: 'var(--color-highlight)' },
  admin: { bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.4)', text: '#a855f7' },
};

const ROLE_LABELS = {
  donor: '🍽️ Food Donor',
  ngo: '🏠 NGO / Shelter',
  volunteer: '🚴 Volunteer Driver',
  admin: '🛡️ Administrator',
};

const ROLE_STATS = {
  donor: [
    { label: 'Meals Donated', value: '248', icon: <TrendingUp size={18} /> },
    { label: 'CO₂ Saved', value: '31 kg', icon: <Award size={18} /> },
    { label: 'Active Listings', value: '3', icon: <TrendingUp size={18} /> },
  ],
  ngo: [
    { label: 'Meals Received', value: '1,240', icon: <TrendingUp size={18} /> },
    { label: 'People Served', value: '620', icon: <Award size={18} /> },
    { label: 'Active Claims', value: '5', icon: <TrendingUp size={18} /> },
  ],
  volunteer: [
    { label: 'Deliveries Completed', value: '87', icon: <TrendingUp size={18} /> },
    { label: 'Distance Covered', value: '342 km', icon: <Award size={18} /> },
    { label: 'Avg Rating', value: '4.9 ⭐', icon: <TrendingUp size={18} /> },
  ],
};

const ProfilePage = ({ user }) => {
  const role = user?.role || 'donor';
  const colors = ROLE_COLORS[role] || ROLE_COLORS.donor;
  const stats = ROLE_STATS[role] || ROLE_STATS.donor;

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.full_name || '');
  const [saved, setSaved] = useState(false);

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleSave = () => {
    // Update localStorage with new name
    try {
      const savedUser = JSON.parse(localStorage.getItem('fb_user') || '{}');
      savedUser.full_name = editName;
      localStorage.setItem('fb_user', JSON.stringify(savedUser));
    } catch { /* ignore */ }
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const memberSince = new Date(
    parseInt(user?.id?.split('_')[1] || Date.now())
  ).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Page Title */}
      <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <User size={24} color="var(--color-primary)" />
        My Profile
      </h2>

      {/* Profile Card */}
      <div
        className="glass-card"
        style={{
          padding: '2rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '2rem',
          alignItems: 'center',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.8rem',
            color: 'white',
            flexShrink: 0,
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.35)',
          }}
        >
          {initials}
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            {isEditing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--color-primary)',
                    borderRadius: '8px',
                    padding: '0.5rem 0.85rem',
                    color: 'white',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    outline: 'none',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                />
                <button
                  onClick={handleSave}
                  style={{
                    background: 'var(--color-primary)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.45rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Save size={16} color="#000" />
                </button>
                <button
                  onClick={() => { setIsEditing(false); setEditName(user?.full_name || ''); }}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    padding: '0.45rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={16} color="#94a3b8" />
                </button>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>
                  {user?.full_name || 'User'}
                </h3>
                <button
                  onClick={() => setIsEditing(true)}
                  title="Edit name"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                >
                  <Edit3 size={15} />
                </button>
              </>
            )}
          </div>

          {saved && (
            <div style={{ color: 'var(--color-primary)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              ✓ Profile name updated (refresh to see in header)
            </div>
          )}

          {/* Role badge */}
          <span
            style={{
              display: 'inline-block',
              padding: '0.25rem 0.85rem',
              borderRadius: '999px',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: colors.bg,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              marginBottom: '0.75rem',
            }}
          >
            {ROLE_LABELS[role] || role}
          </span>

          {/* Details Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#94a3b8' }}>
              <Mail size={15} color="#64748b" />
              {user?.email || 'No email'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#94a3b8' }}>
              <Shield size={15} color="#64748b" />
              Account verified
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#94a3b8' }}>
              <Calendar size={15} color="#64748b" />
              Member since {memberSince}
            </div>
          </div>
        </div>
      </div>

      {/* Impact Stats */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#e2e8f0' }}>
        Your Impact
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {stats.map((stat, i) => (
          <div
            key={i}
            className="glass-card"
            style={{
              padding: '1.25rem',
              textAlign: 'center',
            }}
          >
            <div style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
              {stat.icon}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.3rem' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Account Settings */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#e2e8f0' }}>
        Account Details
      </h3>
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
              Full Name
            </div>
            <div style={{ fontSize: '0.95rem', color: '#e2e8f0', fontWeight: 500 }}>
              {user?.full_name || 'N/A'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
              Email Address
            </div>
            <div style={{ fontSize: '0.95rem', color: '#e2e8f0', fontWeight: 500 }}>
              {user?.email || 'N/A'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
              Role
            </div>
            <div style={{ fontSize: '0.95rem', color: colors.text, fontWeight: 600, textTransform: 'capitalize' }}>
              {role}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
              User ID
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontFamily: 'monospace' }}>
              {user?.id?.slice(0, 20) || 'N/A'}...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
