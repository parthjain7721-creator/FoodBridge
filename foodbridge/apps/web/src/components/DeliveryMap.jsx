import React, { useState, useEffect } from 'react';
import { Navigation, Thermometer, MapPin, AlertTriangle } from 'lucide-react';

const DeliveryMap = () => {
  const [temp, setTemp] = useState(4.2);
  const [alert, setAlert] = useState(false);

  useEffect(() => {
    // Simulate IoT Temperature variations
    const interval = setInterval(() => {
      setTemp(prev => {
        const next = prev + (Math.random() * 1.5 - 0.5);
        if (next > 6.5) setAlert(true);
        else setAlert(false);
        return parseFloat(next.toFixed(1));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Active Delivery Route</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className={`glass-card ${alert ? 'animate-pulse' : ''}`} style={{ 
            padding: '0.5rem 1rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            border: alert ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid var(--color-border)',
            background: alert ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'
          }}>
            {alert ? <AlertTriangle color="#ef4444" /> : <Thermometer color="var(--color-primary)" />}
            <span style={{ fontWeight: 600, fontSize: '1.1rem', color: alert ? '#ef4444' : 'var(--color-primary)' }}>
              {temp}°C (IoT Sensor)
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem', flex: 1 }}>
        {/* Simulated Map Area */}
        <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden', minHeight: '400px' }}>
          <div style={{ 
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'url(https://via.placeholder.com/1000x800?text=Map+Simulation) center/cover',
            opacity: 0.2
          }}></div>
          
          {/* Simulated Route Line */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <path d="M 200 150 Q 400 100 500 300 T 700 450" fill="transparent" stroke="var(--color-primary)" strokeWidth="4" strokeDasharray="10 10" className="animate-pulse" />
          </svg>

          <div style={{ position: 'absolute', top: '130px', left: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <MapPin color="var(--color-highlight)" size={32} fill="var(--color-bg-deep)" />
            <span style={{ background: 'rgba(0,0,0,0.8)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', marginTop: '4px' }}>Donor</span>
          </div>

          <div style={{ position: 'absolute', top: '430px', left: '680px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <MapPin color="var(--color-primary)" size={32} fill="var(--color-bg-deep)" />
            <span style={{ background: 'rgba(0,0,0,0.8)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', marginTop: '4px' }}>NGO Shelter</span>
          </div>

          {/* Volunteer Pin (Animated) */}
          <div style={{ position: 'absolute', top: '250px', left: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'all 2s ease' }}>
            <div style={{ width: 20, height: 20, background: 'var(--color-accent)', borderRadius: '50%', border: '3px solid white', boxShadow: '0 0 15px var(--color-accent)' }}></div>
            <span style={{ background: 'var(--color-accent)', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', marginTop: '8px', fontWeight: 600 }}>En Route</span>
          </div>
        </div>

        {/* Route Details Panel */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Current Task</h3>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>20 Portions Baked Pasta</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '11px', top: '20px', bottom: '20px', width: '2px', background: 'var(--color-border)' }}></div>
            
            <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '4px solid var(--color-bg-deep)' }}></div>
              <div>
                <div style={{ fontWeight: 600 }}>Pickup</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Luigi's Italian, 14 Main St.</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '4px solid var(--color-bg-deep)' }}></div>
              <div>
                <div style={{ fontWeight: 600 }}>Drop-off</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Hope Shelter, 42 West Ave.</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Est. Arrival</span>
              <span style={{ fontWeight: 600 }}>14 mins</span>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
              <Navigation size={18} /> Open Navigation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryMap;
