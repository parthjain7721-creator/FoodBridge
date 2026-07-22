import React from 'react';
import { Bell, Search, User } from 'lucide-react';

const Header = ({ activeRole, handleRoleChange }) => {
  return (
    <header className="glass-panel" style={{ 
      margin: '1rem 1rem 0 0', 
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
        <Search size={18} color="var(--color-text-muted)" />
        <input 
          type="text" 
          placeholder="Search..." 
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            outline: 'none',
            fontSize: '0.9rem'
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Demo Role:</span>
          <select 
            value={activeRole}
            onChange={(e) => handleRoleChange(e.target.value)}
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-primary)',
              padding: '0.4rem 1rem',
              borderRadius: '6px',
              outline: 'none',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <option value="donor">Donor (Restaurant)</option>
            <option value="recipient">Recipient (NGO)</option>
            <option value="volunteer">Volunteer (Driver)</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative' }}>
            <Bell color="var(--color-text-muted)" size={22} />
            <span style={{ 
              position: 'absolute', top: -2, right: -2, 
              width: 10, height: 10, 
              background: 'var(--color-highlight)', 
              borderRadius: '50%',
              boxShadow: '0 0 10px var(--color-highlight)'
            }}></span>
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 40, height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <User color="white" size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Demo User</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>ID: 8492</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
