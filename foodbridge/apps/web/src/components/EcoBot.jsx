import React, { useState } from 'react';
import { Mic, Send, Bot, Sparkles } from 'lucide-react';

const EcoBot = ({ onParsed }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const simulateParse = () => {
    if (!input) return;
    setIsProcessing(true);
    
    // Simulate AI thinking and parsing
    setTimeout(() => {
      setIsProcessing(false);
      onParsed({
        title: 'Baked Pasta',
        quantity: '20 portions',
        expiry: 'Tonight 9:00 PM',
        type: 'Cooked Food'
      });
      setInput('');
    }, 1500);
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
        <Bot size={20} />
        <h3 style={{ fontWeight: 600 }}>EcoBot Assistant</h3>
      </div>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
        Type or use speech-to-text to list food instantly. Example: "I have 20 portions of baked pasta expiring tonight at 9 PM."
      </p>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What do you have to donate?"
          style={{
            flex: 1,
            padding: '0.75rem',
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            color: 'white',
            outline: 'none'
          }}
          onKeyDown={(e) => e.key === 'Enter' && simulateParse()}
        />
        <button className="btn btn-outline" style={{ padding: '0.75rem' }} onClick={() => setInput('I have 20 portions of baked pasta expiring tonight at 9 PM')}>
          <Mic size={18} />
        </button>
        <button className="btn btn-primary" style={{ padding: '0.75rem' }} onClick={simulateParse} disabled={isProcessing}>
          {isProcessing ? <Sparkles size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
      
      {isProcessing && (
        <div style={{ fontSize: '0.875rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
          <Sparkles size={16} /> AI is parsing your listing...
        </div>
      )}
    </div>
  );
};

export default EcoBot;
