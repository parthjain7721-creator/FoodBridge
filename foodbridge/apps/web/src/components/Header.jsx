import React from 'react';
import { Search, User, LogOut } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

const ROLE_LABELS = {
  donor: '🍽️ Donor',
  ngo: '🏠 NGO',
  volunteer: '🚴 Volunteer',
  admin: '🛡️ Admin',
};

const Header = ({ user, onLogout, onNavigate }) => {
  const roleLabel = ROLE_LABELS[user?.role] || user?.role || 'User';
  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <header
      className="glass-panel"
      style={{
        position: 'relative',
        zIndex: 50,
        margin: '1rem 1rem 0 0',
        padding: '0.85rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      }}
    >
      {/* Search bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          background: 'rgba(255,255,255,0.03)',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
        }}
      >
        <Search size={18} color="var(--color-text-muted)" />
        <input
          type="text"
          placeholder="Search..."
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            outline: 'none',
            fontSize: '0.9rem',
          }}
        />
      </div>

      {/* Right section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* Real-time Notification Center */}
        <NotificationCenter user={user} />

        {/* User info — clickable profile button */}
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('profile')}
          title="View Profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '0.4rem 0.85rem 0.4rem 0.4rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            color: 'inherit',
            textAlign: 'left',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
          }}
        >
          {/* Avatar circle with initials */}
          <div
            style={{
              width: 38, height: 38,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: 'white',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.2, color: '#ffffff' }}>
              {user?.full_name || 'User'}
            </div>
            <div
              style={{
                fontSize: '0.78rem',
                color: 'var(--color-primary)',
                fontWeight: 500,
              }}
            >
              {roleLabel}
            </div>
          </div>
        </button>

        {/* Logout button */}
        <button
          onClick={onLogout}
          title="Logout"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '0.4rem 0.9rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 500,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.6)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
          }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;

