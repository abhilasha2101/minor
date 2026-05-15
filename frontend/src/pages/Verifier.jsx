import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { verifyNewsClaim, parseVerificationResponse, verifyImageClaim, submitFeedback } from '../services/api';
import { ShieldCheck, Upload, Trash2, HelpCircle, Check, ThumbsUp, ThumbsDown, ArrowRight, Share2, Clipboard, AlertCircle } from 'lucide-react';
import './Verifier.css';

const VERDICT_CONFIG = {
  TRUE: {
    color: 'var(--color-true)',
    bg: 'var(--color-true-glow)',
    border: 'rgba(0, 230, 118, 0.3)',
    icon: '✓',
    label: 'VERIFIED TRUE',
    description: 'This claim is supported by multiple reputable sources and matches official declarations.'
  },
  FALSE: {
    color: 'var(--color-false)',
    bg: 'var(--color-false-glow)',
    border: 'rgba(255, 23, 68, 0.3)',
    icon: '✗',
    label: 'LIKELY FALSE',
    description: 'This claim is contradicted by facts, official reports, or physical evidence.'
  },
  MISLEADING: {
    color: 'var(--color-misleading)',
    bg: 'var(--color-misleading-glow)',
    border: 'rgba(255, 145, 0, 0.3)',
    icon: '⚠',
    label: 'MISLEADING / CONTEXT',
    description: 'This claim contains elements of truth but is presented out of context or exaggerated.'
  },
  UNVERIFIED: {
    color: 'var(--color-unverified)',
    bg: 'var(--color-unverified-glow)',
    border: 'rgba(124, 131, 255, 0.3)',
    icon: '?',
    label: 'UNVERIFIED',
    description: 'There is insufficient reliable source evidence online to support or deny this claim.'
  }
};

const STAGES = [
  '🔍 Parsing input elements and extracting key claims...',
  '🌐 Initiating agentic web searches across authoritative fact databases...',
  '📰 Aggregating reports and cross-checking primary source credentials...',
  '🧠 Executing semantic credibility evaluations and anomaly checks...',
  '⚖️ Compiling final verdict and synthesizing structural brief...'
];

export default function Verifier() {
  const { addHistoryItem } = useApp();
  const location = useLocation();

  const [claimText, setClaimText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState('');
  
  // Verification Results
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  
  // Feedback Widget states
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const fileInputRef = useRef(null);

  // Auto-populate claim from state navigation redirects
  useEffect(() => {
    if (location.state?.claim) {
      setClaimText(location.state.claim);
    }
  }, [location.state]);

  // Handle stage timer triggers
  const startStageScroller = (stageTimerRef) => {
    let index = 0;
    setStage(STAGES[0]);
    stageTimerRef.current = setInterval(() => {
      index = Math.min(index + 1, STAGES.length - 1);
      setStage(STAGES[index]);
    }, 2800);
  };

  const handleVerify = async () => {
    if (loading) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setFeedbackSubmitted(false);

    const stageTimerRef = { current: null };
    startStageScroller(stageTimerRef);

    try {
      let data;
      if (imageFile) {
        // Upload screenshot visual verification flow
        const base64Data = await convertFileToBase64(imageFile);
        data = await verifyImageClaim(base64Data);
      } else {
        // Simple text verification flow
        if (!claimText.trim()) throw new Error('Please enter a claim text or upload a screenshot.');
        data = await verifyNewsClaim(claimText);
      }

      clearInterval(stageTimerRef.current);
      const parsed = parseVerificationResponse(data);
      setResult(parsed);
      
      // Save item into verification history
      addHistoryItem(imageFile ? `Image check: "${parsed.summary.slice(0, 40)}..."` : claimText, parsed);
    } catch (err) {
      clearInterval(stageTimerRef.current);
      setError(err.message || 'Verification execution failed. Please verify internet connection.');
    } finally {
      setLoading(false);
      setStage('');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setClaimText(''); // Clear text claim to prioritize image OCR
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setClaimText('');
      setError(null);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]); // extract base64 part
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFeedback = async (isPositive) => {
    if (feedbackSubmitted || !result) return;
    try {
      await submitFeedback(result.summary, isPositive);
      setFeedbackSubmitted(true);
    } catch (e) {
      setFeedbackSubmitted(true); // fall-through gracefully for mockup verification
    }
  };

  const handleCopyResult = () => {
    if (!result) return;
    const text = `VERITAS AI VERIFICATION REPORT\nVerdict: ${result.verdict} (${result.confidence}% Confidence)\nSummary: ${result.summary}\nFindings:\n${result.key_findings.map(f => `- ${f}`).join('\n')}\nSources Checked: ${result.sources_checked.join(', ')}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const resetVerifier = () => {
    setClaimText('');
    clearImage();
    setResult(null);
    setError(null);
    setFeedbackSubmitted(false);
  };

  // SVGs for the dynamic confidence circle indicator
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = result ? circumference - (result.confidence / 100) * circumference : circumference;

  const cfg = result ? VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.UNVERIFIED : null;

  return (
    <div className="verifier-page-container">
      <div className="verifier-hero-section">
        <h1>Agentic <span className="gradient-text">Verification</span></h1>
        <p>Submit headlines, rumors, or screenshots of social posts to run deep real-time web audits using AI.</p>
      </div>

      <div className="verifier-grid-layout">
        {/* Left Column: Input Form Card */}
        <div className="verifier-input-card glass-card">
          {!result ? (
            <>
              <h3>Verification Input</h3>
              <p className="input-helper">Provide a headline statement or upload a screenshot to execute OCR verification.</p>

              {/* Text Claim Textarea */}
              <div className="text-claim-section">
                <textarea
                  placeholder="Paste or type a suspicious claim here (e.g. 'NASA discovered natural superfluid helium on the Moon')..."
                  value={claimText}
                  onChange={(e) => {
                    setClaimText(e.target.value);
                    if (imageFile) clearImage();
                  }}
                  disabled={loading}
                />
                <span className="char-count">{claimText.length}/2000</span>
              </div>

              {/* OR Divider */}
              <div className="verifier-divider">
                <span>OR</span>
              </div>

              {/* Drag-and-drop Image Upload Area */}
              <div 
                className={`image-upload-zone ${imageFile ? 'has-file' : ''}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => !loading && fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  style={{ display: 'none' }}
                  disabled={loading}
                />
                
                {imagePreview ? (
                  <div className="upload-preview-container">
                    <img src={imagePreview} alt="Screenshot preview" />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        clearImage();
                      }} 
                      className="clear-img-btn"
                      title="Remove Image"
                      disabled={loading}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <Upload size={32} className="upload-icon-pulse" />
                    <p><strong>Upload screenshot</strong> or drag & drop</p>
                    <span>PNG, JPG up to 5MB</span>
                  </div>
                )}
              </div>

              <button 
                onClick={handleVerify}
                className="btn btn-primary verify-start-btn"
                disabled={loading || (!claimText.trim() && !imageFile)}
              >
                <span>Run Agentic Audit</span>
                <ArrowRight size={16} />
              </button>
            </>
          ) : (
            /* Showing Verification Report Brief in place of input */
            <div className="verifier-report-brief">
              <div className="report-brief-header">
                <h3>Report Status</h3>
                <button onClick={resetVerifier} className="btn btn-secondary btn-mini">
                  Verify New Claim
                </button>
              </div>

              <div className="brief-card-meta glass-card">
                <p className="brief-claim-title">
                  <strong>Input:</strong> {imageFile ? `Image/Screenshot (${imageFile.name})` : `"${claimText}"`}
                </p>
                {imagePreview && (
                  <div className="brief-img-thumb">
                    <img src={imagePreview} alt="Checked resource" />
                  </div>
                )}
              </div>

              {/* Copy Report Button */}
              <div className="report-brief-actions">
                <button onClick={handleCopyResult} className="btn btn-secondary block-btn">
                  {copied ? <Check size={16} color="var(--color-true)" /> : <Clipboard size={16} />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Full Report'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Loading or Verdict Panel */}
        <div className="verifier-results-card">
          {loading && (
            <div className="verifier-loading-panel glass-card">
              <div className="loading-animation-container">
                <div className="outer-pulse-ring" />
                <div className="inner-radar-spin" />
                <ShieldCheck size={40} className="shield-checking" />
              </div>
              <h4>Analyzing Claim Veracity</h4>
              <p className="loading-stage-text">{stage}</p>

              {/* Skeleton brief */}
              <div className="loading-skeletons">
                <div className="skeleton loading-sk-title" />
                <div className="skeleton loading-sk-text" />
                <div className="skeleton loading-sk-text" />
              </div>
            </div>
          )}

          {!loading && !result && !error && (
            <div className="verifier-empty-results glass-card">
              <HelpCircle size={48} className="help-icon-muted" />
              <h3>Awaiting Audit</h3>
              <p>Type a headline claim or upload a news clipping screenshot, then click "Run Agentic Audit" to view reports here.</p>
            </div>
          )}

          {error && (
            <div className="verifier-error-panel glass-card">
              <AlertCircle size={40} className="alert-icon-error" />
              <h3>Verification Aborted</h3>
              <p>{error}</p>
              <button onClick={handleVerify} className="btn btn-primary">
                Try Again
              </button>
            </div>
          )}

          {/* Verification Results Display */}
          {result && cfg && (
            <div className="verifier-results-wrapper animate-fade">
              {/* Verdict Hero Card */}
              <div className="verdict-hero-container glass-card" style={{ borderColor: cfg.border, background: cfg.bg }}>
                <div className="verdict-hero-left">
                  <div className="verdict-badge-row" style={{ color: cfg.color }}>
                    <span className="verdict-icon">{cfg.icon}</span>
                    <span className="verdict-badge-label">{cfg.label}</span>
                  </div>
                  <h3 className="verdict-summary-title">Summary Verdict</h3>
                  <p className="verdict-summary-text">{result.summary}</p>
                </div>

                <div className="verdict-hero-right">
                  {/* Circle Progress Bar */}
                  <div className="confidence-circle-wrapper">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle 
                        cx="60" 
                        cy="60" 
                        r={radius} 
                        className="circle-bg" 
                      />
                      <circle 
                        cx="60" 
                        cy="60" 
                        r={radius} 
                        className="circle-progress"
                        style={{
                          strokeDasharray: circumference,
                          strokeDashoffset: strokeDashoffset,
                          stroke: cfg.color
                        }}
                      />
                    </svg>
                    <div className="circle-score-label">
                      <span className="score-value">{result.confidence}%</span>
                      <span className="score-text">CONFIDENCE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Section for Findings, Sources, Red Flags */}
              <div className="results-breakdown-grid">
                <div className="breakdown-col-findings glass-card">
                  <h4>Key Findings</h4>
                  <ul className="findings-list">
                    {result.key_findings.map((finding, idx) => (
                      <li key={idx}>
                        <span className="bullet" style={{ color: cfg.color }}>▸</span>
                        <p>{finding}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="breakdown-col-details">
                  {/* Red flags if exist */}
                  {result.red_flags?.length > 0 && (
                    <div className="breakdown-red-flags-card glass-card">
                      <h4 className="title-red">⚠ Anomalous Indicators</h4>
                      <ul className="red-flags-list">
                        {result.red_flags.map((flag, idx) => (
                          <li key={idx}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Sources checked cards */}
                  <div className="breakdown-sources-card glass-card">
                    <h4>Sources Verified</h4>
                    <div className="sources-tags-row">
                      {result.sources_checked.map((src, idx) => (
                        <span key={idx} className="source-tag-pill">{src}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Advice and Guidance */}
              {result.advice && (
                <div className="results-advice-card glass-card">
                  <div className="advice-header">
                    <span className="bulb-emoji">💡</span>
                    <h4>Media Literacy Advice</h4>
                  </div>
                  <p>{result.advice}</p>
                </div>
              )}

              {/* Feedback Interactive Survey Widget */}
              <div className="results-feedback-card glass-card">
                {!feedbackSubmitted ? (
                  <div className="feedback-survey-row">
                    <span>Is this AI verification verdict accurate?</span>
                    <div className="feedback-survey-buttons">
                      <button onClick={() => handleFeedback(true)} className="feedback-btn thumbs-up">
                        <ThumbsUp size={16} />
                        <span>Yes</span>
                      </button>
                      <button onClick={() => handleFeedback(false)} className="feedback-btn thumbs-down">
                        <ThumbsDown size={16} />
                        <span>No</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="feedback-survey-submitted">
                    <Check size={16} color="var(--color-true)" />
                    <span>Thank you! Your feedback helps train our verification synthesis filters.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
