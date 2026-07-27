import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Bell, CheckCircle2, Trash2, X, Sparkles, Truck, Utensils, AlertTriangle } from 'lucide-react';

const INITIAL_NOTIFICATIONS = {
  donor: [
    {
      id: 'notif-1',
      title: 'Donation Claimed 🎉',
      message: 'Hope Shelter claimed your 20 portions of Baked Ziti.',
      time: '2 mins ago',
      type: 'food',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Volunteer Driver Assigned 🚴',
      message: 'Volunteer Rajesh K. is en route for kitchen pickup.',
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
      title: 'New Surplus Available 🍲',
      message: 'Morning Bakehouse posted 15 bakery items (1.2 km away).',
      time: 'Just now',
      type: 'food',
      read: false,
    },
    {
      id: 'notif-5',
      title: 'Delivery Arriving Soon 🚚',
      message: 'Driver Amit S. is 5 minutes away with your claimed food.',
      time: '8 mins ago',
      type: 'delivery',
      read: false,
    },
    {
      id: 'notif-6',
      title: 'AI Recipe Recommendation 🤖',
      message: 'New Zero-Waste recipe generated for surplus vegetables.',
      time: '2 hours ago',
      type: 'ai',
      read: true,
    },
  ],
  volunteer: [
    {
      id: 'notif-7',
      title: 'Urgent Pickup Assigned 📍',
      message: 'New pickup assigned at Luigi’s Italian Kitchen (2.4 km).',
      time: 'Just now',
      type: 'alert',
      read: false,
    },
    {
      id: 'notif-8',
      title: 'Cold Chain Temp Safe ❄️',
      message: 'IoT sensor reading 3.6°C — cargo temperature optimal.',
      time: '10 mins ago',
      type: 'delivery',
      read: false,
    },
    {
      id: 'notif-9',
      title: 'Badge Unlocked 🏆',
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

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem(`fb_notifs_${user?.id || 'demo'}`, JSON.stringify(notifications));
  }, [notifications, user?.id]);

  // Real-time Event Simulator (Push live notification every 35s)
  useEffect(() => {
    const liveEventsPool = {
      donor: [
        { title: 'Impact Milestone Achieved 🌳', message: 'Your total donations have saved 100+ kg of CO₂ emissions.', type: 'ai' },
        { title: 'Shelter Thank-You Note 💌', message: 'Sunnyside Orphanage sent a thank you for your lunch donation!', type: 'food' },
        { title: 'Pickup Completed 🚚', message: 'Volunteer confirmed successful drop-off at St. Jude Shelter.', type: 'delivery' }
      ],
      recipient: [
        { title: 'Surplus Alert 🥖', message: 'Fresh bread & pastries available from Baker Street (0.8 km).', type: 'food' },
        { title: 'Delivery Update 📍', message: 'Driver is now 2 minutes away from your shelter location.', type: 'delivery' }
      ],
      volunteer: [
        { title: 'Bonus Points Awarded 🌟', message: 'Fast pickup bonus (+50 points) added to your profile.', type: 'ai' },
        { title: 'Route Optimized 🗺️', message: 'Traffic cleared along Western Highway — saved 8 mins.', type: 'delivery' }
      ]
    };

    const interval = setInterval(() => {
      const pool = liveEventsPool[role] || liveEventsPool.donor;
      const randomEvent = pool[Math.floor(Math.random() * pool.length)];

      const newNotif = {
        id: `rt-${Date.now()}`,
        title: randomEvent.title,
        message: randomEvent.message,
        time: 'Just now',
        type: randomEvent.type,
        read: false
      };

      setNotifications(prev => [newNotif, ...prev.slice(0, 12)]);
      setToastNotification(newNotif);

      setTimeout(() => {
        setToastNotification(prev => prev?.id === newNotif.id ? null : prev);
      }, 5000);

    }, 35000);

    return () => clearInterval(interval);
  }, [role]);

  // Close when clicking outside
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
        return <Utensils size={15} color="var(--color-primary)" />;
      case 'delivery':
        return <Truck size={15} color="var(--color-accent)" />;
      case 'alert':
        return <AlertTriangle size={15} color="var(--color-highlight)" />;
      case 'ai':
      default:
        return <Sparkles size={15} color="#a855f7" />;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={popoverRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
        style={{
          background: isOpen ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
          border: isOpen ? '1px solid var(--color-primary)' : '1px solid rgba(255, 255, 255, 0.08)',
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
      >
        <Bell color={unreadCount > 0 ? 'var(--color-primary)' : 'var(--color-text-muted)'} size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              background: 'var(--color-primary)',
              color: '#000',
              fontWeight: 800,
              fontSize: '0.65rem',
              padding: '0 4px',
              minWidth: '16px',
              height: '16px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 8px var(--color-primary)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Toast Notification Banner (Rendered via React Portal at Body Root) */}
      {toastNotification && ReactDOM.createPortal(
        <div
          className="animate-slide-in"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '340px',
            zIndex: 99999,
            padding: '1rem 1.2rem',
            borderLeft: '4px solid var(--color-primary)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            borderRight: '1px solid rgba(255,255,255,0.1)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            background: '#0d1d13',
            borderRadius: '10px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.85), 0 0 15px rgba(16,185,129,0.2)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <div style={{ padding: '0.45rem', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', flexShrink: 0, marginTop: '2px' }}>
            {getIcon(toastNotification.type)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#ffffff', lineHeight: 1.2 }}>
              {toastNotification.title}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem', lineHeight: 1.35 }}>
              {toastNotification.message}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 600, marginTop: '0.35rem' }}>
              ⚡ Real-Time Update
            </div>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
          >
            <X size={14} />
          </button>
        </div>,
        document.body
      )}

      {/* Notifications Popover Menu */}
      {isOpen && (
        <div
          className="notification-popover animate-fade-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '360px',
            maxHeight: '460px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            borderRadius: '14px',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            className="notification-popover-header"
            style={{
              padding: '1rem 1.2rem',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff', margin: 0 }}>
                Notifications
              </h4>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: 'rgba(16,185,129,0.2)',
                    color: 'var(--color-primary)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.55rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(16,185,129,0.35)',
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
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: 0,
                }}
              >
                <CheckCircle2 size={13} /> Mark all read
              </button>
            )}
          </div>

          {/* Segmented Filter Pills */}
          <div
            className="notification-popover-tabs"
            style={{
              display: 'flex',
              padding: '0.5rem 1.2rem',
              gap: '0.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <button
              onClick={() => setActiveFilter('all')}
              style={{
                background: activeFilter === 'all' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                color: activeFilter === 'all' ? '#000000' : '#94a3b8',
                border: activeFilter === 'all' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                padding: '0.28rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
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
                background: activeFilter === 'unread' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                color: activeFilter === 'unread' ? '#000000' : '#94a3b8',
                border: activeFilter === 'unread' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                padding: '0.28rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="notification-popover-list" style={{ flex: 1, overflowY: 'auto', padding: '0.6rem 0.75rem' }}>
            {filteredNotifications.length === 0 ? (
              <div
                style={{
                  padding: '2.5rem 1rem',
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: '0.85rem',
                }}
              >
                No notifications found
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={n.read ? 'notif-card-read' : 'notif-card-unread'}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.75rem 0.85rem',
                    borderRadius: '8px',
                    marginBottom: '0.4rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    {getIcon(n.type)}
                  </div>
                  <div style={{ flex: 1, paddingRight: '1.2rem' }}>
                    <div
                      style={{
                        fontWeight: n.read ? 600 : 700,
                        fontSize: '0.85rem',
                        color: n.read ? '#e2e8f0' : '#ffffff',
                      }}
                    >
                      {n.title}
                    </div>
                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: '#94a3b8',
                        marginTop: '0.15rem',
                        lineHeight: 1.35,
                      }}
                    >
                      {n.message}
                    </div>
                    <div
                      style={{
                        fontSize: '0.7rem',
                        color: '#64748b',
                        marginTop: '0.3rem',
                      }}
                    >
                      {n.time}
                    </div>
                  </div>

                  {/* Delete / Dismiss button */}
                  <button
                    type="button"
                    onClick={(e) => deleteNotification(n.id, e)}
                    title="Dismiss"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      position: 'absolute',
                      right: '8px',
                      top: '10px',
                      padding: '2px',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '0.6rem',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              textAlign: 'center',
              background: '#07110a',
            }}
          >
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              ⚡ Real-Time Push Notifications Active
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
