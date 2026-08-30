import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './UserProfile.css';

export default function UserProfile() {
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [editEmail, setEditEmail] = useState(user ? `${user.username}@example.com` : '');
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return <div className="profile-error">Please log in to view your profile.</div>;
  }

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call for saving profile
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    setIsEditing(false);
    // Note: To fully persist this, we would need a backend /update endpoint
    // and a method in AuthContext to update the global user state.
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditUsername(user.username);
    setEditEmail(`${user.username}@example.com`);
  };

  return (
    <div className="user-profile-container">
      <div className="profile-header-banner">
        {!isEditing && (
          <button className="profile-edit-trigger" onClick={() => setIsEditing(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit
          </button>
        )}
      </div>
      
      <div className="profile-details">
        <div className="profile-avatar-large">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h3 className="profile-username">@{user.username}</h3>
          <span className="profile-badge">Pro Plan</span>
        </div>
      </div>

      <div className="profile-sections">
        <div className="profile-section">
          <div className="profile-section-header">
            <h4>Account Details</h4>
          </div>
          <div className="profile-field">
            <span className="field-label">Username</span>
            {isEditing ? (
              <input 
                className="profile-input" 
                value={editUsername} 
                onChange={e => setEditUsername(e.target.value)} 
              />
            ) : (
              <span className="field-value">{user.username}</span>
            )}
          </div>
          <div className="profile-field">
            <span className="field-label">Email</span>
            {isEditing ? (
              <input 
                className="profile-input" 
                type="email"
                value={editEmail} 
                onChange={e => setEditEmail(e.target.value)} 
              />
            ) : (
              <span className="field-value">{user.username}@example.com</span>
            )}
          </div>
          <div className="profile-field">
            <span className="field-label">Member Since</span>
            <span className="field-value">August 2026</span>
          </div>

          {isEditing && (
            <div className="profile-edit-actions">
              <button className="profile-save-btn" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button className="profile-cancel-btn" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="profile-section">
          <h4>Security</h4>
          <button className="profile-action-btn">Change Password</button>
          <button className="profile-action-btn">Enable Two-Factor Auth (2FA)</button>
        </div>

        <div className="profile-section danger-zone">
          <h4>Danger Zone</h4>
          <p className="danger-desc">Once you delete your account, there is no going back. Please be certain.</p>
          <button className="profile-action-btn danger-btn">Delete Account</button>
        </div>
      </div>
    </div>
  );
}
