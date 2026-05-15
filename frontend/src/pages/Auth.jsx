import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Mail, Lock, User as UserIcon, Check, ArrowRight, Loader2 } from 'lucide-react';
import './Auth.css';

const NEWS_INTERESTS_LIST = [
  { id: 'National', label: 'National News', desc: 'Local updates & policies', emoji: '🇮🇳' },
  { id: 'International', label: 'International', desc: 'Global events & geopolitics', emoji: '🌐' },
  { id: 'Science', label: 'Science', desc: 'Space, discovery & biology', emoji: '🧬' },
  { id: 'Technology', label: 'Technology', desc: 'Gadgets, software & AI', emoji: '💻' },
  { id: 'Business', label: 'Business & Finance', desc: 'Markets, CBDC & economy', emoji: '📈' },
  { id: 'Sports', label: 'Sports', desc: 'Football, cricket & olympiads', emoji: '⚽' }
];

export default function Auth() {
  const { login, signup } = useApp();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); // 1: Info, 2: Interests (Signup only)
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    interests: []
  });

  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleInterestToggle = (interestId) => {
    setFormData(prev => {
      const current = prev.interests;
      const updated = current.includes(interestId)
        ? current.filter(id => id !== interestId)
        : [...current, interestId];
      return { ...prev, interests: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      // Login validation
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields.');
        return;
      }
      setLoading(true);
      try {
        await login({ email: formData.email, password: formData.password });
        navigate('/');
      } catch (err) {
        setError(err.message || 'Login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // Signup Step 1 validation
      if (step === 1) {
        if (!formData.username || !formData.email || !formData.password) {
          setError('Please fill in all fields.');
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters.');
          return;
        }
        setStep(2);
      } else {
        // Signup Step 2 Complete
        if (formData.interests.length === 0) {
          setError('Please select at least one interest to customize your feed.');
          return;
        }
        setLoading(true);
        try {
          await signup({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            interests: formData.interests
          });
          navigate('/');
        } catch (err) {
          setError(err.message || 'Signup failed. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-box glass-card animate-scale">
        <div className="auth-header">
          <h2>{isLogin ? 'Welcome Back' : step === 1 ? 'Create Account' : 'Choose Your Interests'}</h2>
          <p className="auth-subtitle">
            {isLogin 
              ? 'Access real-time verified news and personalized feeds' 
              : step === 1 
                ? 'Join Veritas AI to fact-check the world' 
                : 'Select the categories you care about most'}
          </p>
        </div>

        {error && <div className="auth-error-badge">⚠ {error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isLogin && (
            /* Login Form */
            <div className="form-fields-group">
              <div className="input-field-wrapper">
                <Mail className="input-field-icon" size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input-field-wrapper">
                <Lock className="input-field-icon" size={18} />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
                {loading ? <Loader2 size={16} className="spin" /> : <><span>Sign In</span><ArrowRight size={16} /></>}
              </button>
            </div>
          )}

          {!isLogin && step === 1 && (
            /* Signup Step 1: Info */
            <div className="form-fields-group">
              <div className="input-field-wrapper">
                <UserIcon className="input-field-icon" size={18} />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required={!isLogin && step === 1}
                />
              </div>
              <div className="input-field-wrapper">
                <Mail className="input-field-icon" size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required={!isLogin && step === 1}
                />
              </div>
              <div className="input-field-wrapper">
                <Lock className="input-field-icon" size={18} />
                <input
                  type="password"
                  name="password"
                  placeholder="Password (min 6 characters)"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!isLogin && step === 1}
                />
              </div>
              <button type="submit" className="btn btn-primary auth-submit-btn">
                <span>Next Step</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {!isLogin && step === 2 && (
            /* Signup Step 2: Interests */
            <div className="form-fields-group">
              <div className="interests-grid">
                {NEWS_INTERESTS_LIST.map((interest) => {
                  const selected = formData.interests.includes(interest.id);
                  return (
                    <div 
                      key={interest.id}
                      className={`interest-selection-card ${selected ? 'selected' : ''}`}
                      onClick={() => handleInterestToggle(interest.id)}
                    >
                      <div className="interest-header">
                        <span className="interest-emoji">{interest.emoji}</span>
                        <div className="interest-checkbox">
                          {selected && <Check size={12} color="#ffffff" />}
                        </div>
                      </div>
                      <h4 className="interest-title">{interest.label}</h4>
                      <p className="interest-desc">{interest.desc}</p>
                    </div>
                  );
                })}
              </div>
              <div className="signup-nav-actions">
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="btn btn-secondary"
                  style={{ flexGrow: 1 }}
                >
                  Back
                </button>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 2 }} disabled={loading}>
                  {loading ? <Loader2 size={16} className="spin" /> : <span>Finish Registration</span>}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="auth-footer-toggle">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button onClick={() => { setIsLogin(false); setStep(1); }} className="auth-toggle-btn">
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button onClick={() => { setIsLogin(true); setStep(1); }} className="auth-toggle-btn">
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
