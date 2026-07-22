import React from 'react';
import { Bell, Search, User, LogOut } from 'lucide-react';

const ROLE_LABELS = {
  donor: '🍽️ Donor',
  ngo: '🏠 NGO',
  volunteer: '🚴 Volunteer',
  admin: '🛡️ Admin',
};

const Header = ({ user, onLogout }) => {
  const roleLabel = ROLE_LABELS[user?.role] || user?.role || 'User';
  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <header
      className="glass-panel"
      style={{
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
        {/* Notification bell */}
        <button
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative' }}
        >
          <Bell color="var(--color-text-muted)" size={22} />
          <span
            style={{
              position: 'absolute', top: -2, right: -2,
              width: 10, height: 10,
              background: 'var(--color-highlight)',
              borderRadius: '50%',
              boxShadow: '0 0 10px var(--color-highlight)',
            }}
          />
        </button>

        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Avatar circle with initials */}
          <div
            style={{
              width: 40, height: 40,
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
            <div style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.2 }}>
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
        </div>

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
