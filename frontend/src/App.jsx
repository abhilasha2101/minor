import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Feed from './pages/Feed';
import Verifier from './pages/Verifier';
import CurrentAffairs from './pages/CurrentAffairs';
import Community from './pages/Community';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import { ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const { theme } = useApp();
  const location = useLocation();

  // Determine if it is a mobile feed page. If so, we can hide the footer or adjust styles.
  const isFeedPage = location.pathname === '/';

  return (
    <div className="app-container">
      {/* Floating Animated Mesh Background (configured in index.css) */}
      <div className="mesh-bg">
        <div className="mesh-blob mesh-blob-1" />
        <div className="mesh-blob mesh-blob-2" />
      </div>

      {/* Global Navigation Header */}
      <Navbar />

      {/* Main Pages Content Switcher */}
      <main className={`main-content ${isFeedPage ? 'feed-layout' : ''}`}>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/verifier" element={<Verifier />} />
          <Route path="/current-affairs" element={<CurrentAffairs />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<Feed />} />
        </Routes>
      </main>

      {/* Footer (Hidden on mobile feed to optimize scrolling snap experience) */}
      {!isFeedPage && (
        <footer className="footer-bar">
          <div className="footer-container">
            <div className="footer-branding">
              <ShieldCheck size={18} className="brand-icon" />
              <span>Veritas AI &copy; 2026. Empowering Media Literacy.</span>
            </div>
            <div className="footer-author">
              <span>Made with</span>
              <Heart size={14} className="heart-icon" />
              <span>for Production Excellence</span>
            </div>
          </div>
        </footer>
      )}

      {/* CSS overrides for footer */}
      <style>{`
        .footer-bar {
          background-color: var(--bg-secondary);
          border-top: 1px solid var(--border-light);
          padding: 24px;
          margin-top: 40px;
          transition: all var(--transition-normal);
        }
        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }
        .footer-branding, .footer-author {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .brand-icon {
          color: #7c83ff;
        }
        .heart-icon {
          color: #ff1744;
          animation: pulse-slow 1.5s infinite;
        }
        
        @media (max-width: 768px) {
          .footer-container {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
          .main-content {
            padding: 20px 12px 80px; /* Add bottom padding for mobile navigation bar */
          }
          .main-content.feed-layout {
            padding: 0;
            margin: 0;
            height: calc(100vh - 60px);
            min-height: auto;
          }
        }
      `}</style>
    </div>
  );
}
