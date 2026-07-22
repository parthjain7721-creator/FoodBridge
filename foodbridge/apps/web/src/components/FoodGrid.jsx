import React, { useState } from 'react';
import { MapPin, Clock, ShieldCheck, Heart } from 'lucide-react';

const FoodGrid = ({ donations, setDonations }) => {
  const [filter, setFilter] = useState('all');

  const handleClaim = (id) => {
    setDonations(prev => prev.map(d => d.id === id ? { ...d, status: 'claimed' } : d));
  };

  const availableDonations = donations.filter(d => d.status === 'available');

  return (
    <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Available Surplus Food</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(0,0,0,0.3)',
              color: 'white',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              outline: 'none'
            }}
          >
            <option value="all">All Categories</option>
            <option value="cooked">Cooked Food</option>
            <option value="bakery">Bakery</option>
            <option value="produce">Raw Produce</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {availableDonations.map(item => (
          <div key={item.id} className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '160px', background: 'rgba(16, 185, 129, 0.1)', position: 'relative' }}>
              <img src={`https://via.placeholder.com/400x200?text=${item.title.replace(/ /g, '+')}`} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
              <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)' }}>
                <ShieldCheck size={14} /> AI Score: {item.qualityScore}%
              </div>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{item.title}</h3>
                <div style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{item.quantity}</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {item.distance} away</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {item.expiry}</div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem' }}>{item.donor}</span>
                <button className="btn btn-primary" onClick={() => handleClaim(item.id)}>
                  <Heart size={16} /> Claim
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {availableDonations.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No surplus food available nearby at the moment.
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodGrid;
