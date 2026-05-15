import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { User, LogOut, Bookmark, History, Settings, Trash2, Search, CheckCircle, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';
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
  const { user, logout, bookmarks, removeBookmark, history, clearHistory, login } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('saved'); // 'saved' or 'history' or 'settings'
  const [historySearch, setHistorySearch] = useState('');

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
    // Just a fun mock calculation: more true/false verified claims gives higher accuracy
    const verities = history.filter(h => h.result.verdict === 'TRUE' || h.result.verdict === 'FALSE').length;
    return Math.round((verities / history.length) * 100);
  };

  return (
    <div className="profile-page-container">
      {/* User Header Profile */}
      <div className="profile-hero-header glass-card">
        <div className="profile-info-left">
          <div className="profile-avatar">
            {user.username.slice(0, 2).toUpperCase()}
          </div>
          <div className="profile-names">
            <h2>{user.username}</h2>
            <span className="profile-email">{user.email}</span>
          </div>
        </div>
        
        <button onClick={handleLogout} className="btn btn-secondary logout-btn">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

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
          <span className="metric-value">{history.length > 0 ? `${calculateAccuracy()}%` : 'N/A'}</span>
          <span className="metric-label">Skepticism Score</span>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="profile-tabs-strip">
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
                          color: getVerdictLabelColor(item.result.verdict),
                          borderColor: getVerdictLabelColor(item.result.verdict) + '44',
                          backgroundColor: getVerdictLabelColor(item.result.verdict) + '11'
                        }}
                      >
                        {item.result.verdict}
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
