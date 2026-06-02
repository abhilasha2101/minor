import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { User, LogOut, Bookmark, History, Settings, Trash2, Search, CheckCircle, XCircle, AlertTriangle, HelpCircle, RefreshCw } from 'lucide-react';
import './Profile.css';

const INTERESTS_MAP = {
  National: '🇮🇳 National',
  International: '🌐 International',
  Science: '🧬 Science',
  Technology: '💻 Tech',
  Business: '📈 Business',
  Sports: '⚽ Sports'
};

export default function Profile() {
  const { user, logout, bookmarks, removeBookmark, history, clearHistory, login, updateUserProfile } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'saved', 'history', 'settings'
  const [historySearch, setHistorySearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarSeeds, setAvatarSeeds] = useState(['Oliver', 'Jack', 'Harry', 'Jacob', 'Charlie', 'Thomas']);
  const [editForm, setEditForm] = useState({ username: '', bio: '', location: '' });

  const shuffleSeeds = () => {
    setAvatarSeeds(Array.from({length: 6}, () => Math.random().toString(36).substring(7)));
  };

  const handleEditClick = () => {
    setEditForm({
      username: user.username || '',
      bio: user.bio || '',
      location: user.location || ''
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      await updateUserProfile(editForm);
      setIsEditing(false);
    } catch (e) {
      alert('Failed to update profile: ' + e.message);
    }
  };

  if (!user) {
    // If not logged in, show a call to action redirect panel
    return (
      <div className="profile-logged-out-container glass-card animate-scale">
        <User size={48} className="user-icon-muted" />
        <h2>Profile Dashboard</h2>
        <p>Sign in to view your verification history logs, save bookmarks, and customize news interest recommendations.</p>
        <button onClick={() => navigate('/auth')} className="btn btn-primary">
          Sign In / Register
        </button>
      </div>
    );
  }

  // Handle Logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Toggle user interests
  const handleInterestToggle = (id) => {
    const currentInterests = user.interests || [];
    const updated = currentInterests.includes(id)
      ? currentInterests.filter(x => x !== id)
      : [...currentInterests, id];
    
    // Save updated interests back to auth context
    login({
      ...user,
      interests: updated
    });
  };

  // Filter history based on search query
  const filteredHistory = history.filter(item => 
    item.claim.toLowerCase().includes(historySearch.toLowerCase()) || 
    item.result.verdict.toLowerCase().includes(historySearch.toLowerCase())
  );

  const handleReviewClaim = (claimText) => {
    navigate('/verifier', { state: { claim: claimText } });
  };

  // Get Verdict label colors
  const getVerdictLabelColor = (verdict) => {
    if (verdict === 'TRUE') return 'var(--color-true)';
    if (verdict === 'FALSE') return 'var(--color-false)';
    if (verdict === 'MISLEADING') return 'var(--color-misleading)';
    return 'var(--color-unverified)';
  };

  // Calculate fact-checking accuracy score (mock value based on profile history + mock inputs)
  const calculateAccuracy = () => {
    if (history.length === 0) return 0;
    const verities = history.filter(h => h.result?.verdict === 'TRUE' || h.result?.verdict === 'FALSE').length;
    return Math.round((verities / history.length) * 100);
  };

  const getTrustLevel = (score) => {
    if (score >= 500) return 'Expert Analyst';
    if (score >= 200) return 'Fact Checker';
    if (score >= 50) return 'Skeptic';
    return 'Novice';
  };

  return (
    <div className="profile-page-container">
      {/* User Header Profile */}
      <div className="profile-hero-header glass-card" style={{ zIndex: 50 }}>
        <div className="profile-info-left" style={{ position: 'relative', zIndex: 9999 }}>
          <div 
            className="profile-avatar avatar-3d" 
            style={{ overflow: 'hidden', cursor: 'pointer', pointerEvents: 'auto' }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log("Avatar clicked, toggling modal");
              setIsAvatarModalOpen(prev => !prev);
            }}
            title="Click to change avatar"
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
            ) : (
              <span style={{ pointerEvents: 'none' }}>{user.username.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          
          {isAvatarModalOpen && (
            <div className="avatar-edit-modal glass-card" style={{ zIndex: 9999, backgroundColor: 'var(--bg-primary)', display: 'block', opacity: 1, width: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', margin: 0 }}>Choose Avatar</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={shuffleSeeds} className="btn-close" title="Shuffle More" style={{ display: 'flex', padding: '4px' }}><RefreshCw size={14} /></button>
                  <button onClick={() => setIsAvatarModalOpen(false)} className="btn-close" style={{ display: 'flex', padding: '4px' }}><XCircle size={16} /></button>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                {avatarSeeds.map(seed => (
                  <img 
                    key={seed}
                    src={`https://api.dicebear.com/9.x/micah/svg?seed=${seed}&radius=50&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                    alt="Avatar Option"
                    title="Select this avatar"
                    style={{ width: '100%', borderRadius: '50%', cursor: 'pointer', border: '2px solid transparent', transition: 'border-color 0.2s' }}
                    onClick={async () => {
                      await updateUserProfile({ avatarUrl: `https://api.dicebear.com/9.x/micah/svg?seed=${seed}&radius=50&backgroundColor=b6e3f4,c0aede,d1d4f9` });
                      setIsAvatarModalOpen(false);
                    }}
                    onMouseEnter={(e) => e.target.style.borderColor = '#7c83ff'}
                    onMouseLeave={(e) => e.target.style.borderColor = 'transparent'}
                  />
                ))}
              </div>

              <div className="avatar-edit-controls" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block', flex: 1 }}>
                  <button className="btn btn-secondary" style={{ width: '100%', padding: '6px 10px', fontSize: '12px' }}>
                    📷 Upload Custom
                  </button>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = async () => {
                          await updateUserProfile({ avatarUrl: reader.result });
                          setIsAvatarModalOpen(false);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ position: 'absolute', top: 0, left: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                  />
                </div>
                
                {user.avatarUrl && (
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '6px 10px', fontSize: '12px', color: 'var(--color-false)' }} 
                    onClick={async () => {
                      await updateUserProfile({ avatarUrl: '' });
                      setIsAvatarModalOpen(false);
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="profile-names">
            <h2>{user.username}</h2>
            <span className="profile-email">{user.email}</span>
            <button onClick={handleEditClick} className="btn btn-secondary edit-profile-btn">
              <Settings size={14} /> Edit Profile
            </button>
          </div>
        </div>
        
        <button onClick={handleLogout} className="btn btn-secondary logout-btn">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

      {isEditing && (
        <div className="edit-profile-modal glass-card animate-fade">
          <h3>Edit Profile</h3>
          
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              value={editForm.username} 
              onChange={e => setEditForm({...editForm, username: e.target.value})} 
            />
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea 
              value={editForm.bio} 
              onChange={e => setEditForm({...editForm, bio: e.target.value})} 
              placeholder="Tell us about yourself"
            />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input 
              type="text" 
              value={editForm.location} 
              onChange={e => setEditForm({...editForm, location: e.target.value})} 
              placeholder="E.g., New Delhi, India"
            />
          </div>
          <div className="edit-modal-actions">
            <button onClick={() => setIsEditing(false)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleSaveProfile} className="btn btn-primary">Save Changes</button>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="profile-metrics-row">
        <div className="metric-card glass-card">
          <span className="metric-value">{history.length}</span>
          <span className="metric-label">Claims Verified</span>
        </div>
        <div className="metric-card glass-card">
          <span className="metric-value">{bookmarks.length}</span>
          <span className="metric-label">Saved Articles</span>
        </div>
        <div className="metric-card glass-card">
          <span className="metric-value">{user.reputationScore || 0}</span>
          <span className="metric-label">Reputation Points</span>
        </div>
        <div className="metric-card glass-card highlight-metric">
          <span className="metric-value trust-level">{getTrustLevel(user.reputationScore || 0)}</span>
          <span className="metric-label">Trust Level</span>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="profile-tabs-strip">
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`profile-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
        >
          <User size={16} />
          <span>Overview</span>
        </button>
        <button 
          onClick={() => setActiveTab('saved')} 
          className={`profile-tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
        >
          <Bookmark size={16} />
          <span>Saved Articles</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          className={`profile-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
        >
          <History size={16} />
          <span>Verification Log</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')} 
          className={`profile-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
        >
          <Settings size={16} />
          <span>News Settings</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="profile-tab-content">
        {activeTab === 'overview' && (
          <div className="profile-overview-panel animate-fade">
            <div className="overview-grid">
              <div className="overview-bio-card glass-card">
                <h3>About Me</h3>
                <p className="bio-text">{user.bio || 'No bio added yet. Tell us about yourself!'}</p>
                <div className="location-info">
                  <strong>Location:</strong> {user.location || 'Not specified'}
                </div>
              </div>
              <div className="overview-stats-card glass-card">
                <h3>Trust Reputation</h3>
                <div className="reputation-badge">
                  <span className="reputation-score">{user.reputationScore || 0}</span>
                  <span className="reputation-label">Pts</span>
                </div>
                <p>Level up by verifying claims and contributing to the community.</p>
              </div>
              <div className="overview-interests-card glass-card">
                <h3>My Interests</h3>
                <div className="interests-tags">
                  {user.interests && user.interests.length > 0 ? (
                    user.interests.map(id => (
                      <span key={id} className="interest-tag">{INTERESTS_MAP[id]}</span>
                    ))
                  ) : (
                    <p>No interests selected. Update in News Settings.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="saved-articles-panel animate-fade">
            {bookmarks.length === 0 ? (
              <div className="empty-tab-state">
                <Bookmark size={36} className="icon-muted" />
                <p>No saved articles. Browse the Feed and bookmark news to read later.</p>
              </div>
            ) : (
              <div className="saved-articles-grid">
                {bookmarks.map(art => (
                  <div key={art.id} className="saved-article-card glass-card">
                    <img src={art.imageUrl} alt={art.title} className="saved-thumb" />
                    <div className="saved-card-body">
                      <span className="saved-card-category">{art.category}</span>
                      <h4 onClick={() => navigate('/', { state: { openArticle: art } })}>{art.title}</h4>
                      <div className="saved-card-footer">
                        <span>{art.date}</span>
                        <button 
                          onClick={() => removeBookmark(art.id)} 
                          className="delete-bookmark-btn"
                          title="Remove Bookmark"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-log-panel animate-fade">
            <div className="history-controls-row">
              {/* Search Log */}
              <div className="history-search-wrapper">
                <Search size={16} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search verification logs..." 
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                />
              </div>

              {history.length > 0 && (
                <button onClick={clearHistory} className="btn btn-secondary clear-hist-btn">
                  <Trash2 size={14} />
                  <span>Clear Log</span>
                </button>
              )}
            </div>

            {filteredHistory.length === 0 ? (
              <div className="empty-tab-state">
                <History size={36} className="icon-muted" />
                <p>{history.length === 0 ? 'No verification log available.' : 'No matches found.'}</p>
              </div>
            ) : (
              <div className="history-list-stack">
                {filteredHistory.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => handleReviewClaim(item.claim)}
                    className="history-log-item glass-card"
                  >
                    <div className="hist-item-left">
                      <p className="hist-claim">"{item.claim}"</p>
                      <span className="hist-time">{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                    
                    <div className="hist-item-right">
                      <span 
                        className="hist-verdict-badge"
                        style={{ 
                          color: getVerdictLabelColor(item.result?.verdict),
                          borderColor: getVerdictLabelColor(item.result?.verdict) + '44',
                          backgroundColor: getVerdictLabelColor(item.result?.verdict) + '11'
                        }}
                      >
                        {item.result?.verdict || 'UNVERIFIED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="news-settings-panel glass-card animate-fade">
            <h4>Customize Feed Interests</h4>
            <p className="settings-desc">Select categories to prioritize when browsing the news feed.</p>
            
            <div className="settings-interests-grid">
              {Object.entries(INTERESTS_MAP).map(([id, label]) => {
                const active = user.interests?.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => handleInterestToggle(id)}
                    className={`settings-interest-chip ${active ? 'active' : ''}`}
                  >
                    <span>{label}</span>
                    {active && <span className="check-dot">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
