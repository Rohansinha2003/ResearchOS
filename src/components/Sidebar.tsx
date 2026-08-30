import { useState, useRef, useEffect } from 'react';
import type { ChatSession } from './types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AuthModal from './AuthModal';
import FeatureModal from './FeatureModal';
import PricingPlans from './PricingPlans';
import UserProfile from './UserProfile';
import './Sidebar.css';

interface SidebarProps {
  sessions: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({
  sessions,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isOpen,
  onToggle,
}: SidebarProps) {
  const { user, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onToggle} />}

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-dot" />
            <span className="sidebar-logo-text">ResearchOS</span>
          </div>
          <button className="sidebar-toggle-btn" onClick={onToggle} title="Close sidebar">
            ←
          </button>
        </div>

        {/* New Chat button */}
        <button className="new-chat-btn" onClick={onNewChat}>
          <span className="new-chat-icon">＋</span>
          New Chat
        </button>

        {/* Chat list */}
        <div className="sidebar-sessions">
          {sessions.length === 0 ? (
            <p className="sidebar-empty">No chats yet.<br />Ask your first question!</p>
          ) : (
            <ul className="session-list">
              {sessions.map((session) => (
                <li
                  key={session.id}
                  className={`session-item ${session.id === activeChatId ? 'session-item--active' : ''}`}
                >
                  <button
                    className="session-btn"
                    onClick={() => onSelectChat(session.id)}
                    title={session.title}
                  >
                    <span className="session-icon">💬</span>
                    <div className="session-info">
                      <span className="session-title">{session.title}</span>
                      <span className="session-date">
                        {new Date(session.updatedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </button>
                  <button
                    className="session-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(session.id);
                    }}
                    title="Delete chat"
                  >
                    🗑
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          {loading ? (
            <div className="auth-loading">Loading...</div>
          ) : user ? (
            <div className="user-menu-container" ref={menuRef}>
              {isMenuOpen && (
                <div className="user-menu-popover">
                  <div className="user-menu-header">
                    <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
                    <div className="user-menu-info">
                      <span className="user-menu-name">{user.username}</span>
                      <span className="user-menu-plan">Pro</span>
                    </div>
                  </div>
                  
                  <div className="user-menu-divider" />
                  
                  <button className="user-menu-item" onClick={() => { setActiveModal('Upgrade plan'); setIsMenuOpen(false); }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    Upgrade plan
                  </button>
                  <button className="user-menu-item" onClick={() => { setActiveModal('Personalization'); setIsMenuOpen(false); }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    Personalization
                  </button>
                  <button className="user-menu-item" onClick={() => { setActiveModal('Profile'); setIsMenuOpen(false); }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Profile
                  </button>
                  <button className="user-menu-item" onClick={() => { setActiveModal('Settings'); setIsMenuOpen(false); }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    Settings
                  </button>

                  <div className="user-menu-divider" />
                  
                  <button className="user-menu-item" onClick={() => { setActiveModal('Help'); setIsMenuOpen(false); }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4"></path>
                      <path d="M12 8h.01"></path>
                    </svg>
                    Help
                  </button>
                  <button className="user-menu-item" onClick={logout}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Log out
                  </button>
                </div>
              )}
              
              <button 
                className="user-profile-btn" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
              >
                <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
                <span className="user-name">{user.username}</span>
                <span className="user-profile-chevron">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </button>
            </div>
          ) : (
            <button className="login-btn" onClick={() => setIsAuthModalOpen(true)}>
              <span className="login-icon">👤</span> Log In / Sign Up
            </button>
          )}
          <p className="sidebar-footer-text">Powered by Llama 3.1</p>
        </div>
      </aside>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      
      <FeatureModal 
        isOpen={activeModal !== null} 
        onClose={() => setActiveModal(null)} 
        title={activeModal || ''}
      >
        {activeModal === 'Settings' ? (
          <div className="settings-modal-content">
            <div className="settings-options" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="settings-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="settings-item-info">
                  <span className="settings-item-title" style={{ display: 'block', fontSize: '1.05rem', fontWeight: 500 }}>Theme</span>
                  <span className="settings-item-desc" style={{ fontSize: '0.85rem', color: '#888' }}>Toggle dark/light mode</span>
                </div>
                <button 
                  onClick={toggleTheme} 
                  style={{
                    padding: '8px 14px', 
                    background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    border: '1px solid ' + (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                    color: theme === 'dark' ? '#fff' : '#111',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                </button>
              </div>
            </div>
          </div>
        ) : activeModal === 'Upgrade plan' ? (
          <PricingPlans />
        ) : activeModal === 'Profile' ? (
          <UserProfile />
        ) : (
          <div className="coming-soon-message">
            <span className="coming-soon-icon">🚧</span>
            <p>The <strong>{activeModal}</strong> feature is currently under construction and will be available in a future update!</p>
          </div>
        )}
      </FeatureModal>

      {/* Collapsed toggle button (when sidebar is closed) */}
      {!isOpen && (
        <button className="sidebar-open-btn" onClick={onToggle} title="Open sidebar">
          ☰
        </button>
      )}
    </>
  );
}
