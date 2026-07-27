import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, X, Sparkles, Truck, Utensils, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

const INITIAL_NOTIFICATIONS = {
  donor: [
    {
      id: 'notif-1',
      title: 'Donation Matched! 🎉',
      message: 'Hope Shelter claimed your 20 portions of Baked Ziti & Garlic Bread.',
      time: '2 mins ago',
      type: 'food',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Volunteer Pickup Assigned 🚴',
      message: 'Volunteer Rajesh K. is en route to pick up surplus from your kitchen.',
      time: '15 mins ago',
      type: 'delivery',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'AI Freshness Score Verified ✨',
      message: 'Your listed food passed with a 94% Safety Grade A rating.',
      time: '1 hour ago',
      type: 'ai',
      read: true,
    },
  ],
  recipient: [
    {
      id: 'notif-4',
      title: 'New Surplus Food Available 🍲',
      message: 'Morning Bakehouse posted 15 bakery items 1.2 km away from your shelter.',
      time: 'Just now',
      type: 'food',
      read: false,
    },
    {
      id: 'notif-5',
      title: 'Delivery Arriving Soon 🚚',
      message: 'Driver Amit S. is 5 minutes away with your claimed food package.',
      time: '8 mins ago',
      type: 'delivery',
      read: false,
    },
    {
      id: 'notif-6',
      title: 'AI Recipe Recommendation 🤖',
      message: 'New Zero-Waste recipe generated for bulk surplus vegetables.',
      time: '2 hours ago',
      type: 'ai',
      read: true,
    },
  ],
  volunteer: [
    {
      id: 'notif-7',
      title: 'Urgent Pickup Request 📍',
      message: 'New pickup assigned at Luigi’s Italian Kitchen (2.4 km away).',
      time: 'Just now',
      type: 'alert',
      read: false,
    },
    {
      id: 'notif-8',
      title: 'Cold Chain Temp Safe ❄️',
      message: 'IoT sensor reading 3.6°C — cargo temperature is optimal.',
      time: '10 mins ago',
      type: 'delivery',
      read: false,
    },
    {
      id: 'notif-9',
      title: 'Badge Unlocked! 🏆',
      message: 'Congratulations! You earned the "CO₂ Saver Gold" badge.',
      time: '3 hours ago',
      type: 'ai',
      read: true,
    },
  ],
};

const NotificationCenter = ({ user }) => {
  const role = user?.role === 'ngo' ? 'recipient' : (user?.role || 'donor');
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem(`fb_notifs_${user?.id || 'demo'}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_NOTIFICATIONS[role] || INITIAL_NOTIFICATIONS.donor;
  });

  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread'
  const [toastNotification, setToastNotification] = useState(null);
  const popoverRef = useRef(null);

  // Save to localStorage when notifications change
  useEffect(() => {
    localStorage.setItem(`fb_notifs_${user?.id || 'demo'}`, JSON.stringify(notifications));
  }, [notifications, user?.id]);

  // Real-time Event Simulator (Simulates periodic live push notifications)
  useEffect(() => {
    const liveEventsPool = {
      donor: [
        { title: 'New Impact Milestone! 🌳', message: 'Your total donations have saved 100+ kg of CO₂ emissions.', type: 'ai' },
        { title: 'Shelter Thank-You Note 💌', message: 'Sunnyside Orphanage sent a thank you for your lunch donation!', type: 'food' },
        { title: 'Pickup Completed 🚚', message: 'Volunteer confirmed successful drop-off at St. Jude Shelter.', type: 'delivery' }
      ],
      recipient: [
        { title: 'Surplus Alert 🥖', message: 'Fresh bread & pastries available from Baker Street (0.8 km).', type: 'food' },
        { title: 'Delivery Updated 📍', message: 'Driver is now 2 minutes away from your location.', type: 'delivery' }
      ],
      volunteer: [
        { title: 'Bonus Points Awarded 🌟', message: 'Fast pickup bonus (+50 points) added to your profile.', type: 'ai' },
        { title: 'New Route Optimization 🗺️', message: 'Traffic cleared along Western Highway — saved 8 mins.', type: 'delivery' }
      ]
    };

    const interval = setInterval(() => {
      const pool = liveEventsPool[role] || liveEventsPool.donor;
      const randomEvent = pool[Math.floor(Math.random() * pool.length)];

      const newNotif = {
        id: `realtime-${Date.now()}`,
        title: randomEvent.title,
        message: randomEvent.message,
        time: 'Just now',
        type: randomEvent.type,
        read: false
      };

      setNotifications(prev => [newNotif, ...prev.slice(0, 15)]); // Keep max 15
      setToastNotification(newNotif);

      // Auto-hide toast banner after 4 seconds
      setTimeout(() => {
        setToastNotification(prev => prev?.id === newNotif.id ? null : prev);
      }, 4500);

    }, 24000); // Trigger live notification every 24 seconds

    return () => clearInterval(interval);
  }, [role]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleOpen = () => setIsOpen(prev => !prev);

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.read;
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'food':
        return <Utensils size={16} color="var(--color-primary)" />;
      case 'delivery':
        return <Truck size={16} color="var(--color-accent)" />;
      case 'alert':
        return <AlertTriangle size={16} color="var(--color-highlight)" />;
      case 'ai':
      default:
        return <Sparkles size={16} color="#a855f7" />;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={popoverRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={toggleOpen}
        title="Notifications"
        style={{
          background: isOpen ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
          border: isOpen ? '1px solid var(--color-primary)' : 'none',
          padding: '0.4rem',
          borderRadius: '8px',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
      >
        <Bell color={unreadCount > 0 ? 'var(--color-primary)' : 'var(--color-text-muted)'} size={22} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              minWidth: 16,
              height: 16,
              padding: '0 4px',
              background: 'var(--color-primary)',
              color: '#000',
              fontWeight: 800,
              fontSize: '0.68rem',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px var(--color-primary)',
              animation: 'pulseGlow 2s infinite',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Real-time Toast Banner Popup */}
      {toastNotification && (
        <div
          className="animate-slide-in"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            maxWidth: '360px',
            zIndex: 9999,
            padding: '1.1rem',
            borderLeft: '4px solid var(--color-primary)',
            borderTop: '1px solid rgba(16, 185, 129, 0.4)',
            borderRight: '1px solid rgba(16, 185, 129, 0.4)',
            borderBottom: '1px solid rgba(16, 185, 129, 0.4)',
            background: '#09180e',
            borderRadius: '12px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.9), 0 0 20px rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <div style={{ padding: '0.5rem', borderRadius: '50%', background: 'rgba(16,185,129,0.2)', flexShrink: 0 }}>
            {getIcon(toastNotification.type)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>
              {toastNotification.title}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '0.2rem', lineHeight: 1.35 }}>
              {toastNotification.message}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 600, marginTop: '0.35rem', display: 'inline-block' }}>
              ⚡ Real-Time Alert
            </span>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Notifications Popover Menu */}
      {isOpen && (
        <div
          className="animate-fade-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            right: 0,
            width: '380px',
            maxHeight: '520px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.95), 0 0 25px rgba(16, 185, 129, 0.25)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            background: '#0a170e',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.1rem 1.25rem',
              borderBottom: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#0e2215',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#ffffff' }}>
                Notifications
              </h4>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: 'var(--color-primary)',
                    color: '#000000',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.6rem',
                    borderRadius: '999px',
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: 'var(--color-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '6px',
                }}
              >
                <CheckCircle2 size={13} /> Mark all read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div
            style={{
              display: 'flex',
              padding: '0.6rem 1.25rem',
              gap: '0.6rem',
              borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
              background: '#07120a',
            }}
          >
            <button
              onClick={() => setActiveFilter('all')}
              style={{
                background: activeFilter === 'all' ? 'var(--color-primary)' : 'rgba(255,255,255,0.06)',
                color: activeFilter === 'all' ? '#000000' : '#cbd5e1',
                border: activeFilter === 'all' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                padding: '0.35rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              style={{
                background: activeFilter === 'unread' ? 'var(--color-primary)' : 'rgba(255,255,255,0.06)',
                color: activeFilter === 'unread' ? '#000000' : '#cbd5e1',
                border: activeFilter === 'unread' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                padding: '0.35rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
            {filteredNotifications.length === 0 ? (
              <div
                style={{
                  padding: '3rem 1rem',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '0.9rem',
                }}
              >
                No notifications found
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.8rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    background: n.read ? '#0e2014' : '#142d1e',
                    border: n.read ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(16, 185, 129, 0.45)',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                  className="notif-item"
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    {getIcon(n.type)}
                  </div>
                  <div style={{ flex: 1, paddingRight: '1.4rem' }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        color: '#ffffff',
                      }}
                    >
                      {n.title}
                    </div>
                    <div
                      style={{
                        fontSize: '0.81rem',
                        color: '#cbd5e1',
                        marginTop: '0.2rem',
                        lineHeight: 1.4,
                      }}
                    >
                      {n.message}
                    </div>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--color-primary)',
                        marginTop: '0.35rem',
                        fontWeight: 500,
                      }}
                    >
                      {n.time}
                    </div>
                  </div>

                  {/* Unread Dot Indicator */}
                  {!n.read && (
                    <div
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        background: 'var(--color-primary)',
                        position: 'absolute',
                        right: '30px',
                        top: '16px',
                        boxShadow: '0 0 8px var(--color-primary)',
                      }}
                    />
                  )}

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => deleteNotification(n.id, e)}
                    title="Dismiss"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      position: 'absolute',
                      right: '8px',
                      top: '14px',
                      padding: '3px',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '0.75rem',
              borderTop: '1px solid rgba(16, 185, 129, 0.2)',
              textAlign: 'center',
              background: '#07120a',
            }}
          >
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>
              ⚡ Real-Time Push Notifications Active
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
