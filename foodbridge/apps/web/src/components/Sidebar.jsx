import React from 'react';
import { LayoutDashboard, PlusCircle, ShoppingBasket, Truck, Leaf, Sparkles, Trophy } from 'lucide-react';

const Sidebar = ({ activeRole, activeView, setActiveView }) => {
  const getNavItems = () => {
    const common = [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    ];
    
    const roleSpecific = {
      donor: [
        { id: 'post-surplus', label: 'List Surplus', icon: <PlusCircle size={20} /> },
        { id: 'ai-freshness', label: 'AI Freshness', icon: <Sparkles size={20} /> }
      ],
      recipient: [
        { id: 'claim-food', label: 'Claim Food', icon: <ShoppingBasket size={20} /> },
        { id: 'ai-recipes', label: 'EcoRecipes', icon: <Leaf size={20} /> }
      ],
      volunteer: [
        { id: 'deliveries', label: 'Deliveries', icon: <Truck size={20} /> }
      ]
    };

    const global = [
      { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={20} /> }
    ];

    return [...common, ...(roleSpecific[activeRole] || []), ...global];
  };

  return (
    <aside className="glass-panel" style={{ width: '260px', margin: '1rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ 
          width: '40px', height: '40px', 
          borderRadius: '10px', 
          background: 'var(--color-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(16,185,129,0.4)'
        }}>
          <Leaf color="white" size={24} />
        </div>
        <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }} className="text-gradient">FoodBridge</h1>
      </div>

      <nav style={{ flex: 1, padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {getNavItems().map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              width: '100%',
              padding: '0.875rem 1rem',
              background: activeView === item.id ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: activeView === item.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '1rem',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
        <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Active Profile</p>
          <div style={{ 
            display: 'inline-block',
            padding: '4px 12px', 
            borderRadius: '12px',
            background: 'var(--color-primary)',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'capitalize'
          }}>
            {activeRole}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
