import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import DashboardView from './DashboardView';
import DonationForm from '../components/DonationForm';
import FoodGrid from '../components/FoodGrid';
import DeliveryMap from '../components/DeliveryMap';
import FreshnessEstimator from '../components/FreshnessEstimator';
import EcoRecipes from '../components/EcoRecipes';
import Leaderboard from '../components/Leaderboard';

const App = () => {
  // Global App State for Demo
  const [activeRole, setActiveRole] = useState('donor'); // 'donor', 'recipient', 'volunteer'
  const [activeView, setActiveView] = useState('dashboard');
  
  // Simulated Global Data
  const [donations, setDonations] = useState([
    {
      id: 1,
      title: 'Baked Ziti & Garlic Bread',
      quantity: '20 portions',
      type: 'Cooked Food',
      expiry: 'Tonight 9:00 PM',
      donor: 'Luigi’s Italian',
      distance: '1.2 km',
      qualityScore: 92,
      status: 'available'
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
      status: 'available'
    }
  ]);

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setActiveView('dashboard'); // reset view on role change
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView role={activeRole} />;
      case 'post-surplus':
        return <DonationForm setDonations={setDonations} />;
      case 'claim-food':
        return <FoodGrid donations={donations} setDonations={setDonations} />;
      case 'deliveries':
        return <DeliveryMap />;
      case 'ai-freshness':
        return <FreshnessEstimator />;
      case 'ai-recipes':
        return <EcoRecipes />;
      case 'leaderboard':
        return <Leaderboard />;
      default:
        return <DashboardView role={activeRole} />;
    }
  };

  return (
    <div className="app-layout animate-fade-in">
      <Sidebar activeRole={activeRole} activeView={activeView} setActiveView={setActiveView} />
      <div className="main-content">
        <Header activeRole={activeRole} handleRoleChange={handleRoleChange} />
        <main className="page-content">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
