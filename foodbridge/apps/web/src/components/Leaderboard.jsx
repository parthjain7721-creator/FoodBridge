import React from 'react';
import { Medal, Star, Shield, Award, Trophy, Zap } from 'lucide-react';

const Leaderboard = () => {
  return (
    <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }} className="text-gradient">
          <Trophy size={32} color="var(--color-highlight)" /> Eco-Karma Leaderboard
        </h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Celebrating the heroes fighting food waste</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Corporate Donors */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
            <Star size={20} /> Top Corporate Donors
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { name: 'Spice Garden', amount: '450 kg', rank: 1 },
              { name: 'Royal Bakery', amount: '380 kg', rank: 2 },
              { name: 'Grand Hotel', amount: '290 kg', rank: 3 },
            ].map(donor => (
              <div key={donor.rank} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: donor.rank === 1 ? 'var(--color-highlight)' : 'rgba(255,255,255,0.1)', color: donor.rank === 1 ? '#000' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {donor.rank}
                  </div>
                  <span style={{ fontWeight: 600 }}>{donor.name}</span>
                </div>
                <span style={{ color: 'var(--color-primary)' }}>{donor.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Volunteer Heroes */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--color-accent)' }}>
            <Zap size={20} /> Volunteer Heroes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { name: 'Rahul S.', amount: '25 deliveries', rank: 1 },
              { name: 'Vikram K.', amount: '19 deliveries', rank: 2 },
              { name: 'Anita P.', amount: '14 deliveries', rank: 3 },
            ].map(vol => (
              <div key={vol.rank} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: vol.rank === 1 ? 'var(--color-highlight)' : 'rgba(255,255,255,0.1)', color: vol.rank === 1 ? '#000' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {vol.rank}
                  </div>
                  <span style={{ fontWeight: 600 }}>{vol.name}</span>
                </div>
                <span style={{ color: 'var(--color-accent)' }}>{vol.amount}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Badges Chest */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Your Badges Chest</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', width: '120px' }}>
            <div style={{ width: 80, height: 80, margin: '0 auto 1rem', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', border: '2px solid var(--color-primary)' }}>
              <Shield size={40} />
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>CO₂ Saver Gold</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Saved 500+ kg CO₂</div>
          </div>
          
          <div style={{ textAlign: 'center', width: '120px' }}>
            <div style={{ width: 80, height: 80, margin: '0 auto 1rem', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-highlight)', border: '2px solid var(--color-highlight)' }}>
              <Award size={40} />
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Midnight Hero</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Delivered after 9 PM</div>
          </div>

          <div style={{ textAlign: 'center', width: '120px', opacity: 0.5 }}>
            <div style={{ width: 80, height: 80, margin: '0 auto 1rem', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', border: '2px dashed var(--color-text-muted)' }}>
              <Medal size={40} />
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Waste Zero Master</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Locked</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
