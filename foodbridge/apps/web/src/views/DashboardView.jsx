import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, HeartHandshake, Leaf } from 'lucide-react';

const data = [
  { name: 'Jan', co2: 400 },
  { name: 'Feb', co2: 800 },
  { name: 'Mar', co2: 1200 },
  { name: 'Apr', co2: 1500 },
  { name: 'May', co2: 2300 },
  { name: 'Jun', co2: 3400 },
];

const StatCard = ({ title, value, icon, trend }) => (
  <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <h3 style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>{title}</h3>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{value}</div>
      </div>
      <div style={{ 
        background: 'rgba(16, 185, 129, 0.1)', 
        padding: '0.75rem', 
        borderRadius: '12px',
        color: 'var(--color-primary)'
      }}>
        {icon}
      </div>
    </div>
    <div style={{ fontSize: '0.875rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      <TrendingUp size={16} /> {trend} this month
    </div>
  </div>
);

const DashboardView = ({ role }) => {
  return (
    <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <StatCard title="Meals Rescued" value="12,450" icon={<HeartHandshake size={24} />} trend="+15%" />
        <StatCard title="CO₂ Saved (kg)" value="31,125" icon={<Leaf size={24} />} trend="+22%" />
        <StatCard title="Active Pickups" value="24" icon={<TrendingUp size={24} />} trend="+5%" />
        <StatCard title="Shelters Supported" value="18" icon={<Users size={24} />} trend="+2" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Chart Section */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Impact Overview: Carbon Emission Savings</h2>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-text-muted)" axisLine={false} tickLine={false} />
                <YAxis stroke="var(--color-text-muted)" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--color-primary)' }}
                />
                <Line type="monotone" dataKey="co2" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 6, fill: 'var(--color-bg-deep)', strokeWidth: 2 }} activeDot={{ r: 8, fill: 'var(--color-primary)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Match Feed */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Live Match Feed</h2>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
            {[1, 2, 3, 4].map((item) => (
              <div key={item} style={{ 
                padding: '1rem', 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: '8px',
                borderLeft: '4px solid var(--color-primary)'
              }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>2 mins ago</div>
                <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>20kg Baked Goods matched!</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-accent)' }}>Donor: Royal Bakery → NGO: Hope Shelter</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Business Model Widget */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--color-highlight)' }}>Zero-Cost for Recipients Model</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Logistics are 100% sponsored by Corporate ESG Funds. Donors receive automated tax deductions.
          </p>
        </div>
        <button className="btn btn-outline" style={{ borderColor: 'var(--color-highlight)', color: 'var(--color-highlight)' }}>
          View Transparency Report
        </button>
      </div>

    </div>
  );
};

export default DashboardView;
