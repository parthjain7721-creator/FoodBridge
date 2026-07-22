import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import DashboardView from './DashboardView';
import DonationForm from '../components/DonationForm';
import FoodGrid from '../components/FoodGrid';
import DeliveryMap from '../components/DeliveryMap';
import FreshnessEstimator from '../components/FreshnessEstimator';
import EcoRecipes from '../components/EcoRecipes';
import Leaderboard from '../components/Leaderboard';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';

const App = () => {
  // ─── Auth State ────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);      // { id, email, full_name, role }
  const [token, setToken] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'

  // ─── App State ─────────────────────────────────────────────────────────────
  const [activeView, setActiveView] = useState('dashboard');
  const [donations, setDonations] = useState([
    {
      id: 1,
      title: 'Baked Ziti & Garlic Bread',
      quantity: '20 portions',
      type: 'Cooked Food',
      expiry: 'Tonight 9:00 PM',
      donor: 'Luigi\'s Italian',
      distance: '1.2 km',
      qualityScore: 92,
      status: 'available',
    },
    {
      id: 2,
      title: 'Assorted Pastries',
      quantity: '15 items',
      type: 'Bakery',
      expiry: 'Tomorrow 10:00 AM',
      donor: 'Morning Bakehouse',
      distance: '3.4 km',
      qualityScore: 85,
      status: 'available',
    },
  ]);

  // ─── Restore session on mount ───────────────────────────────────────────────
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('fb_token');
      const savedUser = localStorage.getItem('fb_user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch {
      localStorage.removeItem('fb_token');
      localStorage.removeItem('fb_user');
    }
  }, []);

  // ─── Auth Handlers ─────────────────────────────────────────────────────────
  const handleLogin = (loggedInUser, authToken) => {
    setUser(loggedInUser);
    setToken(authToken);
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('fb_token');
    localStorage.removeItem('fb_user');
    setUser(null);
    setToken(null);
    setAuthView('login');
  };

  // ─── Role mapping: backend role → UI role ─────────────────────────────────
  // Backend: 'donor' | 'ngo' | 'volunteer' | 'admin'
  // UI:      'donor' | 'recipient' | 'volunteer'
  const uiRole = user?.role === 'ngo' ? 'recipient' : (user?.role || 'donor');

  // ─── View Router ───────────────────────────────────────────────────────────
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView role={uiRole} user={user} token={token} />;
      case 'post-surplus':
        return <DonationForm setDonations={setDonations} user={user} token={token} />;
      case 'claim-food':
        return <FoodGrid donations={donations} setDonations={setDonations} user={user} token={token} />;
      case 'deliveries':
        return <DeliveryMap user={user} token={token} />;
      case 'ai-freshness':
        return <FreshnessEstimator />;
      case 'ai-recipes':
        return <EcoRecipes />;
      case 'leaderboard':
        return <Leaderboard />;
      default:
        return <DashboardView role={uiRole} user={user} token={token} />;
    }
  };

  // ─── Auth Gate ─────────────────────────────────────────────────────────────
  if (!user) {
    return authView === 'login' ? (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => setAuthView('register')}
      />
    ) : (
      <Register
        onLogin={handleLogin}
        onSwitchToLogin={() => setAuthView('login')}
      />
    );
  }

  // ─── Main App Layout ───────────────────────────────────────────────────────
  return (
    <div className="app-layout animate-fade-in">
      <Sidebar activeRole={uiRole} activeView={activeView} setActiveView={setActiveView} />
      <div className="main-content">
        <Header user={user} onLogout={handleLogout} />
        <main className="page-content">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
