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
          background: isOpen ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
          border: isOpen ? '1px solid var(--color-primary)' : '1px solid rgba(255, 255, 255, 0.1)',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          boxShadow: isOpen ? '0 0 12px rgba(16, 185, 129, 0.25)' : 'none',
        }}
      >
        <Bell color={unreadCount > 0 ? 'var(--color-primary)' : 'var(--color-text-muted)'} size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: 'var(--color-primary)',
              color: '#000000',
              fontWeight: 800,
              fontSize: '0.65rem',
              padding: '0 5px',
              minWidth: '18px',
              height: '18px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)',
              border: '2px solid #060d08',
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
            width: '350px',
            zIndex: 99999,
            padding: '1rem 1.25rem',
            borderLeft: '4px solid var(--color-primary)',
            borderTop: '1px solid rgba(16, 185, 129, 0.25)',
            borderRight: '1px solid rgba(16, 185, 129, 0.25)',
            borderBottom: '1px solid rgba(16, 185, 129, 0.25)',
            background: '#09180e',
            backgroundColor: '#09180e',
            borderRadius: '12px',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.9), 0 0 20px rgba(16, 185, 129, 0.25)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem',
          }}
        >
          <div style={{ padding: '0.5rem', borderRadius: '50%', background: 'rgba(16,185,129,0.18)', flexShrink: 0, marginTop: '2px' }}>
            {getIcon(toastNotification.type)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#ffffff', lineHeight: 1.25 }}>
              {toastNotification.title}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.3rem', lineHeight: 1.4 }}>
              {toastNotification.message}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 600, marginTop: '0.4rem' }}>
              ⚡ Real-Time Update
            </div>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '3px' }}
          >
            <X size={15} />
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
            top: 'calc(100% + 12px)',
            right: 0,
            width: '380px',
            maxHeight: '480px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 99999,
            isolation: 'isolate',
            background: '#09180e',
            backgroundColor: '#09180e',
            borderRadius: '16px',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95), 0 0 30px rgba(16, 185, 129, 0.2)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            className="notification-popover-header"
            style={{
              padding: '1.1rem 1.25rem',
              background: '#0e2416',
              backgroundColor: '#0e2416',
              borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.98rem', color: '#ffffff', margin: 0 }}>
                Notifications
              </h4>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: 'rgba(16,185,129,0.2)',
                    color: 'var(--color-primary)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.18rem 0.6rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(16,185,129,0.35)',
                  }}
                >
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
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
                  gap: '0.35rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  transition: 'background 0.2s ease',
                }}
              >
                <CheckCircle2 size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* Segmented Filter Pills */}
          <div
            className="notification-popover-tabs"
            style={{
              display: 'flex',
              padding: '0.6rem 1rem',
              gap: '0.5rem',
              background: '#06110a',
              backgroundColor: '#06110a',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              style={{
                flex: 1,
                background: activeFilter === 'all' ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.04)',
                backgroundColor: activeFilter === 'all' ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.04)',
                color: activeFilter === 'all' ? '#000000' : '#94a3b8',
                border: activeFilter === 'all' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'center',
              }}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('unread')}
              style={{
                flex: 1,
                background: activeFilter === 'unread' ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.04)',
                backgroundColor: activeFilter === 'unread' ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.04)',
                color: activeFilter === 'unread' ? '#000000' : '#94a3b8',
                border: activeFilter === 'unread' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'center',
              }}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div
            className="notification-popover-list"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0.75rem',
              background: '#09180e',
              backgroundColor: '#09180e',
            }}
          >
            {filteredNotifications.length === 0 ? (
              <div
                style={{
                  padding: '3rem 1rem',
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <CheckCircle2 size={28} color="rgba(16, 185, 129, 0.4)" />
                <span>No notifications found</span>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.85rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    background: n.read ? '#0b1f13' : '#122c1b',
                    backgroundColor: n.read ? '#0b1f13' : '#122c1b',
                    border: n.read ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(16, 185, 129, 0.35)',
                    borderLeft: n.read ? '1px solid rgba(255, 255, 255, 0.06)' : '4px solid var(--color-primary)',
                    boxShadow: n.read ? 'none' : '0 4px 14px rgba(0, 0, 0, 0.35)',
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: n.read ? 'rgba(255,255,255,0.05)' : 'rgba(16, 185, 129, 0.15)',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {!n.read && (
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: 'var(--color-primary)',
                            display: 'inline-block',
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <div
                        style={{
                          fontWeight: n.read ? 600 : 700,
                          fontSize: '0.88rem',
                          color: n.read ? '#cbd5e1' : '#ffffff',
                          lineHeight: 1.25,
                        }}
                      >
                        {n.title}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: n.read ? '#64748b' : '#94a3b8',
                        marginTop: '0.25rem',
                        lineHeight: 1.4,
                      }}
                    >
                      {n.message}
                    </div>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: n.read ? '#475569' : '#64748b',
                        marginTop: '0.35rem',
                        fontWeight: 500,
                      }}
                    >
                      {n.time}
                    </div>
                  </div>

                  {/* Delete / Dismiss button */}
                  <button
                    type="button"
                    onClick={(e) => deleteNotification(n.id, e)}
                    title="Dismiss notification"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      position: 'absolute',
                      right: '10px',
                      top: '10px',
                      padding: '4px',
                      borderRadius: '4px',
                      transition: 'color 0.15s ease, background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ef4444';
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#64748b';
                      e.currentTarget.style.background = 'none';
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
              padding: '0.65rem 1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              textAlign: 'center',
              background: '#06110a',
              backgroundColor: '#06110a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
              Live real-time feed active
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
