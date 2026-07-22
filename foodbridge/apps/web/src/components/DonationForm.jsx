import React, { useState } from 'react';
import EcoBot from './EcoBot';
import FreshnessEstimator from './FreshnessEstimator';
import { Download } from 'lucide-react';

const DonationForm = ({ setDonations }) => {
  const [formData, setFormData] = useState({
    title: '',
    quantity: '',
    type: 'Cooked Food',
    expiry: ''
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleEcoBotParsed = (data) => {
    setFormData({ ...formData, ...data });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setDonations(prev => [
      {
        id: Math.random(),
        ...formData,
        donor: 'Demo Restaurant',
        distance: '0 km',
        qualityScore: 85,
        status: 'available'
      },
      ...prev
    ]);
    setIsSubmitted(true);
  };

  return (
    <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>List Surplus Food</h2>
      
      {!isSubmitted ? (
        <>
          <EcoBot onParsed={handleEcoBotParsed} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Food Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} 
                  required 
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Quantity</label>
                  <input 
                    type="text" 
                    value={formData.quantity} 
                    onChange={e => setFormData({...formData, quantity: e.target.value})} 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} 
                    required 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Expiry Time</label>
                  <input 
                    type="text" 
                    value={formData.expiry} 
                    onChange={e => setFormData({...formData, expiry: e.target.value})} 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} 
                    required 
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '1rem' }}>Submit Donation Listing</button>
            </form>

            <FreshnessEstimator />
          </div>
        </>
      ) : (
        <div className="glass-card animate-fade-in" style={{ padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
            <Download size={40} />
          </div>
          <h2 style={{ color: 'var(--color-primary)' }}>Donation Listed Successfully!</h2>
          
          <div className="glass-panel" style={{ padding: '1.5rem', width: '100%', textAlign: 'left', marginTop: '1rem' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Corporate ESG & Tax Certificate</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Carbon Emissions Avoided</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary)' }}>~ 25 kg CO₂</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Food Value Saved</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary)' }}>$ 120.00</div>
              </div>
            </div>
            <button className="btn btn-outline" style={{ width: '100%' }}>
              <Download size={18} /> Download ESG Certificate (PDF)
            </button>
          </div>
          
          <button className="btn btn-primary" onClick={() => setIsSubmitted(false)}>List Another Item</button>
        </div>
      )}
    </div>
  );
};

export default DonationForm;
