import React, { useState, useRef } from 'react';
import { ScanFace, CheckCircle, AlertTriangle, Upload, Image as ImageIcon, RefreshCw, X, Sparkles, Camera } from 'lucide-react';

const FreshnessEstimator = ({ onComplete }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Sample food images for quick testing
  const sampleImages = [
    { name: 'Cooked Meal', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80' },
    { name: 'Bakery Surplus', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80' },
    { name: 'Fresh Produce', url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80' }
  ];

  const handleFileChange = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileChange(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startScan = () => {
    if (!imagePreview) return;
    setIsScanning(true);
    setResult(null);

    // Simulate AI vision analysis
    setTimeout(() => {
      setIsScanning(false);
      const res = {
        score: Math.floor(Math.random() * 15) + 82, // 82-96 score range
        grade: 'A',
        shelfLife: '18 - 24 hours',
        action: 'Refrigerate immediately (below 4°C). Optimal for distribution today.',
        breakdown: {
          visualFreshness: '95%',
          packagingIntegrity: 'Good',
          spoilageRisk: 'Low'
        }
      };
      setResult(res);
      if (onComplete) onComplete(res);
    }, 2200);
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
          <ScanFace size={22} />
          <h3 style={{ fontWeight: 600, fontSize: '1.1rem' }}>AI Freshness Estimator</h3>
        </div>
        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(16,185,129,0.15)', color: 'var(--color-primary)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Sparkles size={12} /> Computer Vision
        </span>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
        Attach a photo of the surplus food to analyze quality, safety score, and estimated shelf life using AI.
      </p>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleInputChange} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />

      {/* Image Preview / Upload Area */}
      <div 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{ 
          minHeight: '220px', 
          background: isDragging ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0,0,0,0.3)', 
          borderRadius: '12px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: isDragging ? '2px dashed var(--color-primary)' : '1px dashed var(--color-border)',
          transition: 'all 0.2s ease',
          padding: imagePreview ? '0' : '1.5rem'
        }}
      >
        {/* State 1: No Image Attached */}
        {!imagePreview && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textAlign: 'center' }}>
            <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
              <Upload size={26} />
            </div>
            <div>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={triggerFileInput}
                style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', marginBottom: '0.5rem' }}
              >
                <Camera size={16} /> Attach Food Photo
              </button>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                or drag & drop JPEG/PNG here
              </div>
            </div>

            {/* Quick Sample Selector */}
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Try Sample:</span>
              {sampleImages.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setImagePreview(sample.url); setResult(null); }}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--color-text-main)',
                    padding: '0.25rem 0.55rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <ImageIcon size={12} /> {sample.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* State 2: Image Attached & Previewing */}
        {imagePreview && (
          <div style={{ width: '100%', height: '100%', position: 'relative', minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src={imagePreview} 
              alt="Attached Food Preview" 
              style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }} 
            />

            {/* Remove / Change Buttons Overlay */}
            {!isScanning && (
              <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '0.5rem', zIndex: 5 }}>
                <button
                  type="button"
                  onClick={triggerFileInput}
                  title="Change Photo"
                  style={{ background: 'rgba(0,0,0,0.7)', border: 'none', color: 'white', padding: '0.4rem 0.6rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', backdropFilter: 'blur(4px)' }}
                >
                  <RefreshCw size={12} /> Change
                </button>
                <button
                  type="button"
                  onClick={removeImage}
                  title="Remove Photo"
                  style={{ background: 'rgba(239, 68, 68, 0.8)', border: 'none', color: 'white', padding: '0.4rem 0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', backdropFilter: 'blur(4px)' }}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Laser Scanning Animation */}
            {isScanning && (
              <>
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(16, 185, 129, 0.2)',
                  zIndex: 2
                }} />
                <div style={{ 
                  position: 'absolute', 
                  top: 0, left: 0, right: 0, 
                  height: '4px', 
                  background: 'var(--color-primary)',
                  boxShadow: '0 0 20px var(--color-primary), 0 0 10px #fff',
                  animation: 'laserScan 2s ease-in-out infinite alternate',
                  zIndex: 3
                }} />
                <style>{`
                  @keyframes laserScan {
                    0% { top: 0%; }
                    100% { top: 98%; }
                  }
                `}</style>
                <div style={{ position: 'absolute', zIndex: 4, background: 'rgba(0,0,0,0.85)', padding: '0.6rem 1.2rem', borderRadius: '20px', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} className="spin" /> Analyzing Freshness & Safety...
                </div>
              </>
            )}

            {/* Scan Overlay Result */}
            {result && !isScanning && (
              <div className="animate-fade-in" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 15, 10, 0.82)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 3 }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-primary)', textShadow: '0 0 20px rgba(16,185,129,0.6)', lineHeight: 1 }}>
                  {result.score}%
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', fontWeight: 600, marginTop: '0.25rem' }}>
                  Safety Quality Score (Grade {result.grade})
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Button: Scan Attached Image */}
      {imagePreview && !result && !isScanning && (
        <button 
          type="button" 
          className="btn btn-primary" 
          onClick={startScan}
          style={{ padding: '0.8rem', fontSize: '0.95rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <Sparkles size={18} /> Analyze Freshness with AI
        </button>
      )}

      {/* Assessment Results Details */}
      {result && (
        <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                <CheckCircle size={15} /> Estimated Shelf Life
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{result.shelfLife}</div>
            </div>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-highlight)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                <AlertTriangle size={15} /> Visual Freshness
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{result.breakdown.visualFreshness}</div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Storage & Action Advice:</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--color-text-main)', lineHeight: 1.4 }}>{result.action}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreshnessEstimator;

