import React, { useState, useEffect } from 'react';
import { ScanFace, CheckCircle, AlertTriangle } from 'lucide-react';

const FreshnessEstimator = ({ onComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);

  const startScan = () => {
    setIsScanning(true);
    setResult(null);

    // Simulate scan duration
    setTimeout(() => {
      setIsScanning(false);
      const res = {
        score: 85,
        shelfLife: '18 hours',
        action: 'Refrigerate immediately, distribute today.'
      };
      setResult(res);
      if(onComplete) onComplete(res);
    }, 2500);
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
        <ScanFace size={20} />
        <h3 style={{ fontWeight: 600 }}>AI Freshness Estimator</h3>
      </div>
      
      <div 
        style={{ 
          height: '200px', 
          background: 'rgba(0,0,0,0.3)', 
          borderRadius: '8px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--color-border)'
        }}
      >
        {!isScanning && !result && (
          <button className="btn btn-outline" onClick={startScan}>
            Upload Food Photo for AI Scan
          </button>
        )}

        {isScanning && (
          <>
            <div style={{ 
              position: 'absolute', 
              top: 0, left: 0, right: 0, 
              height: '4px', 
              background: 'var(--color-primary)',
              boxShadow: '0 0 15px var(--color-primary)',
              animation: 'scanAnim 2.5s ease-in-out infinite alternate'
            }}></div>
            <style>{`
              @keyframes scanAnim {
                0% { top: 0; }
                100% { top: 100%; }
              }
            `}</style>
            <div style={{ color: 'var(--color-primary)' }}>Scanning image...</div>
          </>
        )}

        {result && (
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <img src="https://via.placeholder.com/400x200?text=Food+Image" alt="Food" style={{ position: 'absolute', top:0, left:0, width:'100%', height:'100%', objectFit: 'cover', opacity: 0.3 }} />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--color-primary)', textShadow: '0 0 20px rgba(16,185,129,0.5)' }}>
                {result.score}%
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-main)' }}>Safety Score</div>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="animate-slide-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
              <CheckCircle size={16} /> Estimated Shelf-Life
            </div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{result.shelfLife}</div>
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-highlight)', marginBottom: '0.25rem' }}>
              <AlertTriangle size={16} /> Suggested Action
            </div>
            <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{result.action}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreshnessEstimator;
