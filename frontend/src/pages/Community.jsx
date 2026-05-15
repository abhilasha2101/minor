import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Heart, Send, CheckCircle2, AlertCircle, PlusCircle, ArrowUpCircle } from 'lucide-react';
import './Community.css';

const CATEGORIES = ['National', 'International', 'Science', 'Technology', 'Health', 'Business', 'Sports', 'Other'];

export default function Community() {
  const { communityRequests, addCommunityRequest, upvoteRequest, user } = useApp();
  const navigate = useNavigate();

  const [newClaim, setNewClaim] = useState('');
  const [selectedCat, setSelectedCat] = useState('National');
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState('');

  const handlePostRequest = (e) => {
    e.preventDefault();
    if (!newClaim.trim()) {
      setError('Please provide a claim statement.');
      return;
    }
    if (newClaim.length < 15) {
      setError('Claim is too brief. Please explain in at least 15 characters.');
      return;
    }

    addCommunityRequest(newClaim.trim(), selectedCat);
    setNewClaim('');
    setFormOpen(false);
    setError('');
  };

  const handleUpvote = (id) => {
    if (!user) {
      // Prompt user to sign in
      setError('You must sign in to vote on requests.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    upvoteRequest(id);
  };

  const handleVerifyRequest = (claimText) => {
    navigate('/verifier', { state: { claim: claimText } });
  };

  const isVoted = (req) => {
    if (!user) return false;
    return req.hasUpvoted || false;
  };

  return (
    <div className="community-page-container">
      {/* Hero Header */}
      <div className="community-hero">
        <h1>Community <span className="gradient-text">Board</span></h1>
        <p>Crowdsource the fight against fake news. Post viral rumors you want checked, or upvote active requests.</p>
      </div>

      {error && <div className="community-error animate-fade">⚠ {error}</div>}

      <div className="community-layout-grid">
        {/* Left/Main Column: Requested Claims List */}
        <div className="requests-feed-container">
          <div className="requests-feed-header">
            <h3>Trending Requests</h3>
            {!formOpen && (
              <button onClick={() => setFormOpen(true)} className="btn btn-primary btn-mini add-req-trigger">
                <PlusCircle size={14} />
                <span>Request Verification</span>
              </button>
            )}
          </div>

          {/* Form to submit a request */}
          {formOpen && (
            <form onSubmit={handlePostRequest} className="post-request-form glass-card animate-scale">
              <div className="form-title-row">
                <h4>New Verification Request</h4>
                <button type="button" onClick={() => setFormOpen(false)} className="close-form-btn">✕</button>
              </div>

              <div className="form-inputs-group">
                <textarea
                  placeholder="What viral headline or post did you encounter? Explain what needs verifying (e.g. 'A tweet claiming drinking ginger juice cures malaria in 24 hours')..."
                  value={newClaim}
                  onChange={(e) => {
                    setNewClaim(e.target.value);
                    setError('');
                  }}
                  required
                />
                
                <div className="form-controls-row">
                  <div className="select-cat-wrapper">
                    <label>Category:</label>
                    <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)}>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button type="submit" className="btn btn-primary send-req-btn">
                    <Send size={14} />
                    <span>Post Request</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Requests list */}
          <div className="requests-cards-stack">
            {communityRequests.map((req) => {
              const voted = isVoted(req);
              return (
                <div key={req.id} className="request-card glass-card">
                  {/* Upvote side column */}
                  <div className="request-card-votes">
                    <button 
                      onClick={() => handleUpvote(req.id)}
                      className={`upvote-action-btn ${voted ? 'voted' : ''}`}
                      title={voted ? 'Remove Vote' : 'Upvote Request'}
                    >
                      <ArrowUpCircle size={26} />
                      <span className="votes-count">{req.upvotes}</span>
                    </button>
                  </div>

                  {/* Info right details */}
                  <div className="request-card-info">
                    <div className="request-info-meta">
                      <span className="req-category-badge">{req.category}</span>
                      <span className="req-author">Posted by {req.requestedBy}</span>
                    </div>

                    <p className="request-claim-text">{req.claim}</p>

                    <div className="request-actions-row">
                      {req.status === 'VERIFIED' ? (
                        <div className="req-status-badge verified">
                          <CheckCircle2 size={12} />
                          <span>VERIFIED</span>
                        </div>
                      ) : (
                        <div className="req-status-badge pending">
                          <AlertCircle size={12} />
                          <span>AWAITING CHECKS</span>
                        </div>
                      )}

                      <button 
                        onClick={() => handleVerifyRequest(req.claim)}
                        className="btn btn-secondary btn-mini verify-req-trigger"
                      >
                        <span>Audit via AI</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Information sidebar */}
        <div className="community-info-sidebar glass-card">
          <h4>How it works</h4>
          <ol className="sidebar-steps-list">
            <li>
              <strong>Post a Rumor:</strong> Encountered a suspicious message on WhatsApp or social media? Post it to request verification.
            </li>
            <li>
              <strong>Upvote:</strong> Upvote claims that seem highly viral or dangerous. Higher upvoted items get prioritized.
            </li>
            <li>
              <strong>Trigger Verification:</strong> Any user can click "Audit via AI" to run the claim through our Gemini search engine.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
