import { Link } from 'react-router-dom';
import { SearchX, ArrowLeft, RefreshCw } from 'lucide-react';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="notfound-container">
      <div className="notfound-content glass-card">
        <div className="glitch-wrapper">
          <h1 className="glitch" data-text="404">404</h1>
        </div>
        
        <div className="notfound-icon-wrapper">
          <SearchX size={64} className="notfound-icon" />
        </div>
        
        <h2 className="notfound-title">Fact Not Found</h2>
        <p className="notfound-desc">
          We ran a deep agentic audit on this URL... and it's completely fake. 
          The page you are looking for doesn't exist in our verified database.
        </p>

        <div className="notfound-actions">
          <Link to="/" className="btn btn-primary notfound-btn">
            <ArrowLeft size={18} />
            <span>Return to Safe Feed</span>
          </Link>
          <Link to="/verifier" className="btn btn-secondary notfound-btn">
            <RefreshCw size={18} />
            <span>Verify a Claim</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
