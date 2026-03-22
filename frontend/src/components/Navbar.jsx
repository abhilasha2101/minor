import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { checkHealth } from '../services/api';
import { Sun, Moon, Rss, ShieldAlert, BookOpen, Users, User, LogIn, Activity } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { theme, toggleTheme, user } = useApp();
  const location = useLocation();
  const [serverHealthy, setServerHealthy] = useState('checking');

  useEffect(() => {
    async function testHealth() {
      try {
        const status = await checkHealth();
        if (status.status === 'ok') {
          setServerHealthy('online');
        } else {
          setServerHealthy('offline');
        }
      } catch {
        setServerHealthy('offline');
      }
    }
    testHealth();
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand">
          <span className="brand-logo-icon">V</span>
          <span className="brand-name">
            Veritas<span className="brand-accent">AI</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            <Rss size={18} />
            <span>Feed</span>
          </Link>
          <Link to="/verifier" className={`nav-link ${isActive('/verifier') ? 'active' : ''}`}>
            <ShieldAlert size={18} />
            <span>Verifier</span>
          </Link>
          <Link to="/current-affairs" className={`nav-link ${isActive('/current-affairs') ? 'active' : ''}`}>
            <BookOpen size={18} />
            <span>Current Affairs</span>
          </Link>
          <Link to="/community" className={`nav-link ${isActive('/community') ? 'active' : ''}`}>
            <Users size={18} />
            <span>Community</span>
          </Link>
        </div>

        {/* Action Controls */}
        <div className="navbar-actions">
          {/* Server Health Badge */}
          <div className={`health-badge ${serverHealthy}`} title={`Server: ${serverHealthy}`}>
            <Activity size={14} className="health-icon" />
            <span className="health-dot" />
            <span className="health-text">{serverHealthy === 'online' ? 'API ONLINE' : serverHealthy === 'offline' ? 'API OFFLINE' : 'CHECKING'}</span>
          </div>

          {/* Theme Toggle Button */}
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={20} className="icon-spin-hover" /> : <Moon size={20} className="icon-spin-hover" />}
          </button>

          {/* Auth/Profile Action */}
          {user ? (
            <Link to="/profile" className={`profile-nav-btn ${isActive('/profile') ? 'active' : ''}`}>
              <div className="avatar-mini">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <span className="username-text">{user.username}</span>
            </Link>
          ) : (
            <Link to="/auth" className="login-nav-btn">
              <LogIn size={16} />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
