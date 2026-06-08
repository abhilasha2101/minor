import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Bookmark, BookmarkCheck, ChevronUp, ChevronDown, CheckCircle2, AlertTriangle, HelpCircle, XCircle, ExternalLink, RefreshCw, Clock, TrendingUp, Flame, Zap } from 'lucide-react';
import './Feed.css';

const CATEGORIES = ['All', 'Last 24 Hours', 'National', 'International', 'Science', 'Technology', 'Business', 'Sports'];

// ── Trending "Last 24 Hours" articles — hot topics from the past day ──
const TRENDING_24H_ARTICLES = [
  {
    id: 'trend-1',
    title: 'Iran-Israel Tensions Escalate: Missile Shield Activated After Drone Swarm Near Strait of Hormuz',
    category: 'International',
    trendingTag: 'Iran War',
    summary: 'Iran\'s IRGC launched a fleet of Shahed-136 UAVs over the Strait of Hormuz in what officials describe as a "defensive exercise." Israel activated the Arrow-3 missile defense system and put Dimona on high alert. The US deployed USS Eisenhower to the Persian Gulf. Oil prices surged 8% to $112/barrel.',
    fullArticle: 'Tensions between Iran and Israel have reached their highest point since the April 2024 strikes. Iran\'s Islamic Revolutionary Guard Corps conducted a large-scale drone and missile exercise in the Strait of Hormuz, flying over 40 Shahed-136 UAVs. Israel\'s IDF responded by activating the Arrow-3 exo-atmospheric missile defense system and moving Iron Dome batteries to the northern border. The Pentagon confirmed the USS Dwight D. Eisenhower carrier strike group has been redeployed to the Persian Gulf. India\'s Ministry of External Affairs issued an advisory for Indian nationals in the region. Crude oil futures on the ICE exchange surged by 8% to touch $112/barrel, impacting Indian import costs significantly.',
    imageUrl: 'https://images.unsplash.com/photo-1573511860302-28c524319d2a?auto=format&fit=crop&w=800&q=80',
    date: '2026-06-14',
    author: 'Global Security Desk',
    verifiedStatus: 'TRUE',
    confidence: 88,
    source: 'Reuters / AP / Pentagon Press Briefing',
    isHot: true,
    hoursAgo: 3
  },
  {
    id: 'trend-2',
    title: 'NEET-UG 2026 Results Declared — Supreme Court Orders CBI Probe into Alleged Paper Leak in 3 States',
    category: 'National',
    trendingTag: 'NEET',
    summary: 'NTA declared NEET-UG 2026 results with 67 students scoring a perfect 720/720. The Supreme Court ordered a CBI investigation into alleged paper leak complaints from Bihar, Rajasthan, and Gujarat. NSUI and ABVP staged nationwide protests. Education Ministry convened an emergency review committee.',
    fullArticle: 'The National Testing Agency (NTA) released the NEET-UG 2026 examination results. A record 67 candidates achieved a perfect score of 720/720, raising suspicions of irregularities. The Supreme Court, taking suo motu cognizance, ordered the CBI to investigate paper leak complaints from three states — Bihar, Rajasthan, and Gujarat. Multiple FIRs were registered in Patna and Jaipur. Student organizations, including NSUI and ABVP, staged protests outside NTA headquarters in Delhi. The Union Education Ministry constituted a High-Level Review Committee under a retired Supreme Court judge to examine the integrity of the examination process and recommend systemic reforms. Experts demand replacing NTA with a more robust digital examination framework using AI proctoring.',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    date: '2026-06-14',
    author: 'Education Desk, New Delhi',
    verifiedStatus: 'MISLEADING',
    confidence: 82,
    source: 'NTA Official Portal / SC Order Diary',
    isHot: true,
    hoursAgo: 6
  },
  {
    id: 'trend-3',
    title: 'Mamata Banerjee Announces Opposition Alliance Rally in Kolkata — "INDIA Bloc Will Form Govt in 2029"',
    category: 'National',
    trendingTag: 'Mamata Banerjee',
    summary: 'TMC Supremo Mamata Banerjee held a mega opposition rally at Brigade Parade Ground, Kolkata, attended by leaders of 14 opposition parties. She declared her intent to lead the INDIA bloc as PM candidate for 2029 Lok Sabha elections. Over 5 lakh attended.',
    fullArticle: 'West Bengal Chief Minister and TMC supremo Mamata Banerjee organized a massive opposition rally at the iconic Brigade Parade Ground in Kolkata. Leaders from 14 opposition parties, including the Congress, NCP (Sharad Pawar faction), RJD, DMK, and AAP, shared the stage. Banerjee declared her intent to be the PM face of the INDIA bloc for the 2029 Lok Sabha elections. The rally, attended by an estimated 5 lakh supporters, featured sharp attacks on the ruling BJP over unemployment, inflation, and the NEET controversy. Political analysts note the rally could reshape opposition dynamics, though Congress leadership expressed preference for a "collective leadership" model over a single PM face.',
    imageUrl: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=800&q=80',
    date: '2026-06-14',
    author: 'Political Bureau, Kolkata',
    verifiedStatus: 'TRUE',
    confidence: 91,
    source: 'ANI / PTI / TMC Official',
    isHot: true,
    hoursAgo: 8
  },
  {
    id: 'trend-4',
    title: 'RBI Keeps Repo Rate Unchanged at 6.0% — GDP Growth Projected at 6.7% for FY27',
    category: 'Business',
    trendingTag: 'RBI Policy',
    summary: 'The Reserve Bank of India\'s Monetary Policy Committee voted 4-2 to keep the repo rate at 6.0%, maintaining a neutral stance. RBI Governor projected GDP growth at 6.7% for FY27 and CPI inflation at 4.4%, citing global crude oil volatility as a key risk.',
    fullArticle: 'The RBI\'s Monetary Policy Committee (MPC) in its June 2026 review decided to keep the benchmark repo rate unchanged at 6.0%, with a 4-2 vote. Two external members voted for a 25 bps cut. RBI Governor Shaktikanta Das projected real GDP growth at 6.7% for FY2026-27, up from the earlier estimate of 6.5%, driven by strong rural demand and government capex. CPI inflation is projected at 4.4%, within the 2-6% target band. However, the governor flagged risks from rising crude oil prices (above $110/barrel), geopolitical tensions, and erratic monsoon patterns. The Standing Deposit Facility (SDF) rate remains at 5.75% and the Marginal Standing Facility (MSF) at 6.25%.',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    date: '2026-06-14',
    author: 'Finance Desk, Mumbai',
    verifiedStatus: 'TRUE',
    confidence: 97,
    source: 'RBI Press Conference / MPC Resolution',
    isHot: false,
    hoursAgo: 5
  },
  {
    id: 'trend-5',
    title: 'Paris Olympics 2028 Qualifier: Neeraj Chopra Breaks Own Javelin National Record with 90.18m Throw',
    category: 'Sports',
    trendingTag: 'Neeraj Chopra',
    summary: 'Olympic gold medalist Neeraj Chopra set a new national record with a 90.18m throw at the Diamond League meet in Stockholm, securing automatic qualification for the 2028 LA Olympics. He became the first Indian to cross the 90m mark in competition.',
    fullArticle: 'Neeraj Chopra delivered a historic performance at the Stockholm Diamond League, throwing 90.18 meters to break his own national record of 89.94m set in 2022. The throw makes him the first Indian to officially breach the 90-meter barrier in competition. The mark automatically qualifies him for the 2028 Los Angeles Olympics (qualification standard: 85.50m). Neeraj\'s throw ranks him 4th globally in the 2026 season. The performance came despite a nagging adductor injury that required rehabilitation at a Munich sports medicine facility. PM Modi congratulated Neeraj on social media.',
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-bd45ba31a747?auto=format&fit=crop&w=800&q=80',
    date: '2026-06-14',
    author: 'Sports Desk',
    verifiedStatus: 'TRUE',
    confidence: 96,
    source: 'World Athletics / Diamond League Official',
    isHot: true,
    hoursAgo: 10
  },
  {
    id: 'trend-6',
    title: 'Chandrayaan-4 Mission Gets Cabinet Approval — ₹2,104 Crore Budget for Lunar Sample Return',
    category: 'Science',
    trendingTag: 'Chandrayaan-4',
    summary: 'The Union Cabinet approved ISRO\'s Chandrayaan-4 mission with a budget of ₹2,104 crore. The mission will land on the Moon, collect lunar soil samples, and bring them back to Earth — making India only the 4th country to achieve a lunar sample return.',
    fullArticle: 'The Indian government approved ISRO\'s ambitious Chandrayaan-4 Lunar Sample Return Mission at a cost of ₹2,104 crore. The mission involves two launch vehicles (LVM3 and PSLV), five modules (Propulsion, Descender, Ascender, Transfer, and Re-entry), and plans to collect about 3 kg of lunar regolith from near the south pole. If successful, India will become the fourth nation after the USA, Russia, and China to return samples from the Moon. The mission is targeted for launch in 2028. ISRO Chairman S. Somanath said the mission builds on Chandrayaan-3\'s successful soft landing and will provide unprecedented data on lunar geology and water-ice presence.',
    imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80',
    date: '2026-06-13',
    author: 'Science Desk, Bengaluru',
    verifiedStatus: 'TRUE',
    confidence: 95,
    source: 'PIB / ISRO Official Release',
    isHot: true,
    hoursAgo: 18
  },
  {
    id: 'trend-7',
    title: 'UGC-NET June 2026 Exam Cancelled Hours Before Start — Data Breach Suspected',
    category: 'National',
    trendingTag: 'UGC-NET',
    summary: 'The UGC-NET June 2026 exam was cancelled just 4 hours before commencement over a suspected data breach. NTA cited "integrity concerns" in a late-night notification. Over 9 lakh registered candidates were affected. Fresh dates to be announced within a week.',
    fullArticle: 'In a shocking move, the National Testing Agency cancelled the UGC-NET June 2026 examination just hours before it was set to begin at test centers across the country. An official statement cited "inputs from the Indian Computer Emergency Response Team (CERT-In) regarding potential compromise of question paper integrity." Over 9 lakh candidates had registered for the exam across 1,200+ centers. The cancellation adds to a series of examination controversies including the NEET-UG irregularities. Student unions demanded the dissolution of NTA. The Education Ministry assured fresh exam dates within one week and ordered a security audit of NTA\'s digital infrastructure.',
    imageUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80',
    date: '2026-06-14',
    author: 'Education Bureau',
    verifiedStatus: 'TRUE',
    confidence: 93,
    source: 'NTA Official Notification / PIB',
    isHot: true,
    hoursAgo: 2
  },
  {
    id: 'trend-8',
    title: 'Heat Wave Red Alert in Delhi-NCR — Temperature Crosses 49°C, Schools Shut for 3 Days',
    category: 'National',
    trendingTag: 'Heat Wave',
    summary: 'IMD issued a red alert as Delhi-NCR recorded 49.1°C at Mungeshpur weather station, the highest ever for June. All schools and outdoor construction banned for 3 days. Over 40 heatstroke fatalities reported across North India. Power demand hit all-time high of 8,647 MW.',
    fullArticle: 'The India Meteorological Department (IMD) issued a red alert for Delhi-NCR as temperatures soared to 49.1°C at the Mungeshpur automatic weather station — the highest June temperature ever recorded in the capital. The Delhi government ordered closure of all schools for three days and banned outdoor construction between 12 PM and 4 PM. Multiple hospitals reported a surge in heatstroke cases, with over 40 fatalities across Uttar Pradesh, Rajasthan, and Haryana. Power demand in Delhi peaked at 8,647 MW, leading to scheduled load-shedding in parts of East Delhi. The NDMA activated its heat action plan. IMD forecasts relief from the heat wave by June 17 as the monsoon advances towards northwestern India.',
    imageUrl: 'https://images.unsplash.com/photo-1561484930-998b6a7b22e8?auto=format&fit=crop&w=800&q=80',
    date: '2026-06-14',
    author: 'Metro Desk, Delhi',
    verifiedStatus: 'TRUE',
    confidence: 94,
    source: 'IMD Official / Delhi Govt Order',
    isHot: true,
    hoursAgo: 4
  }
];

export default function Feed() {
  const { articles, user, bookmarks, addBookmark, removeBookmark } = useApp();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTrendTag, setActiveTrendTag] = useState(null);

  // Detailed view state
  const [detailedArticle, setDetailedArticle] = useState(null);

  const isLast24Hours = selectedCategory === 'Last 24 Hours';

  // Trending tags extracted from 24h articles
  const trendingTags = useMemo(() => {
    const tags = [...new Set(TRENDING_24H_ARTICLES.map(a => a.trendingTag))];
    return tags;
  }, []);

  // Combine articles based on category selection
  const displayArticles = useMemo(() => {
    if (isLast24Hours) {
      let trending = [...TRENDING_24H_ARTICLES];
      if (activeTrendTag) {
        trending = trending.filter(a => a.trendingTag === activeTrendTag);
      }
      return trending.sort((a, b) => a.hoursAgo - b.hoursAgo);
    }

    const filtered = articles.filter(art => {
      if (selectedCategory === 'All') return true;
      return art.category.toLowerCase() === selectedCategory.toLowerCase();
    });

    return [...filtered].sort((a, b) => {
      if (selectedCategory === 'All' && user?.interests) {
        const aMatch = user.interests.includes(a.category);
        const bMatch = user.interests.includes(b.category);
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
      }
      return 0;
    });
  }, [articles, selectedCategory, activeTrendTag, user, isLast24Hours]);

  const isBookmarked = (id) => bookmarks.some(b => b.id === id || b.articleId === id);

  const handleBookmarkToggle = (e, article) => {
    e.stopPropagation();
    if (isBookmarked(article.id)) {
      removeBookmark(article.id);
    } else {
      addBookmark(article);
    }
  };

  const triggerVerificationRedirect = (claimText) => {
    navigate('/verifier', { state: { claim: claimText } });
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    if (cat !== 'Last 24 Hours') {
      setActiveTrendTag(null);
    }
  };

  const renderVerdictBadge = (status, conf) => {
    switch (status) {
      case 'TRUE':
        return (
          <div className="verdict-tag true">
            <CheckCircle2 size={14} />
            <span>VERIFIED TRUE ({conf}%)</span>
          </div>
        );
      case 'FALSE':
        return (
          <div className="verdict-tag false">
            <XCircle size={14} />
            <span>LIKELY FALSE ({conf}%)</span>
          </div>
        );
      case 'MISLEADING':
        return (
          <div className="verdict-tag misleading">
            <AlertTriangle size={14} />
            <span>MISLEADING ({conf}%)</span>
          </div>
        );
      default:
        return (
          <div className="verdict-tag unverified">
            <HelpCircle size={14} />
            <span>UNVERIFIED</span>
          </div>
        );
    }
  };

  return (
    <div className="feed-page-container">
      {/* Categories Filter Strip */}
      <div className="category-strip">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategorySelect(cat)}
            className={`category-pill ${selectedCategory === cat ? 'active' : ''} ${cat === 'Last 24 Hours' ? 'trending-pill' : ''}`}
          >
            {cat === 'Last 24 Hours' && <Flame size={13} className="pill-icon-fire" />}
            {cat}
          </button>
        ))}
      </div>

      {/* Trending Tags Bar — only visible when "Last 24 Hours" is active */}
      {isLast24Hours && (
        <div className="trending-tags-bar animate-fade">
          <div className="trending-tags-header">
            <TrendingUp size={14} />
            <span>Trending Now</span>
          </div>
          <div className="trending-tags-scroll">
            <button
              onClick={() => setActiveTrendTag(null)}
              className={`trending-tag-chip ${activeTrendTag === null ? 'active' : ''}`}
            >
              <Zap size={11} />
              <span>All Hot Topics</span>
              <span className="tag-chip-count">{TRENDING_24H_ARTICLES.length}</span>
            </button>
            {trendingTags.map(tag => {
              const count = TRENDING_24H_ARTICLES.filter(a => a.trendingTag === tag).length;
              const isHot = TRENDING_24H_ARTICLES.find(a => a.trendingTag === tag)?.isHot;
              return (
                <button
                  key={tag}
                  onClick={() => setActiveTrendTag(tag === activeTrendTag ? null : tag)}
                  className={`trending-tag-chip ${activeTrendTag === tag ? 'active' : ''}`}
                >
                  {isHot && <Flame size={11} className="tag-fire" />}
                  <span>{tag}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Vertical Snap Scroll Cards Container */}
      <div className="news-feed-scroller">
        {displayArticles.length === 0 ? (
          <div className="empty-feed glass-card">
            <h3>No articles available</h3>
            <p>Check back later or change your category filter.</p>
          </div>
        ) : (
          displayArticles.map((article, index) => (
            <div key={article.id} className="news-snap-card">
              <div className={`news-card-inner glass-card ${article.isHot ? 'hot-card' : ''}`}>
                {/* Left Side: Thumbnail cover image */}
                <div className="news-card-media">
                  <img src={article.imageUrl} alt={article.title} loading="lazy" />
                  <div className="media-overlay">
                    <span className="category-badge">{article.category}</span>
                    {article.isHot && (
                      <span className="hot-badge">
                        <Flame size={10} />
                        HOT
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Side: News details */}
                <div className="news-card-content">
                  <div className="news-card-header">
                    <div className="header-meta">
                      {article.hoursAgo !== undefined ? (
                        <span className="news-date live-time">
                          <Clock size={11} />
                          {article.hoursAgo}h ago
                        </span>
                      ) : (
                        <span className="news-date">{article.date}</span>
                      )}
                      <span className="meta-dot">&middot;</span>
                      <span className="news-author">{article.author}</span>
                    </div>
                    <button
                      onClick={(e) => handleBookmarkToggle(e, article)}
                      className="bookmark-card-btn"
                      title={isBookmarked(article.id) ? 'Remove Bookmark' : 'Save Article'}
                    >
                      {isBookmarked(article.id) ? <BookmarkCheck size={20} className="icon-saved" /> : <Bookmark size={20} />}
                    </button>
                  </div>

                  <h2 className="news-title">{article.title}</h2>

                  {/* Trending Tag + Verdict */}
                  <div className="verdict-sticker-row">
                    {article.trendingTag && (
                      <span className="trending-inline-tag">
                        <TrendingUp size={10} />
                        {article.trendingTag}
                      </span>
                    )}
                    {renderVerdictBadge(article.verifiedStatus, article.confidence)}
                  </div>

                  <p className="news-summary">{article.summary}</p>

                  <div className="news-card-actions">
                    <button
                      onClick={() => setDetailedArticle(article)}
                      className="btn btn-secondary card-read-btn"
                    >
                      <span>Read Full Story</span>
                      <ExternalLink size={14} />
                    </button>
                    <button
                      onClick={() => triggerVerificationRedirect(article.title)}
                      className="btn btn-primary card-verify-btn"
                    >
                      <RefreshCw size={14} className="verify-spin-icon" />
                      <span>Verify via AI</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Pagination helper */}
              <div className="snap-indicator">
                <span className="snap-indicator-text">Card {index + 1} of {displayArticles.length}</span>
                <div className="snap-arrows">
                  <ChevronUp size={16} />
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Side-Drawer detailed article panel */}
      {detailedArticle && (
        <div className="detailed-drawer-overlay" onClick={() => setDetailedArticle(null)}>
          <div className="detailed-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <button className="close-drawer-btn" onClick={() => setDetailedArticle(null)}>
              <XCircle size={24} />
            </button>

            <div className="drawer-hero-media">
              <img src={detailedArticle.imageUrl} alt={detailedArticle.title} />
              <div className="drawer-hero-overlay">
                <span className="category-badge">{detailedArticle.category}</span>
                {detailedArticle.isHot && (
                  <span className="hot-badge">
                    <Flame size={10} />
                    TRENDING
                  </span>
                )}
              </div>
            </div>

            <div className="drawer-body-content">
              <div className="drawer-meta">
                {detailedArticle.hoursAgo !== undefined ? (
                  <span className="live-time"><Clock size={11} /> {detailedArticle.hoursAgo}h ago</span>
                ) : (
                  <span>Published on {detailedArticle.date}</span>
                )}
                <span>&bull;</span>
                <span>By {detailedArticle.author}</span>
              </div>

              <h2 className="drawer-title">{detailedArticle.title}</h2>

              {/* Trending tag in drawer */}
              {detailedArticle.trendingTag && (
                <div className="drawer-trending-tag">
                  <TrendingUp size={12} />
                  <span>Trending: {detailedArticle.trendingTag}</span>
                </div>
              )}

              {/* Verification box */}
              <div className="drawer-verdict-box glass-card">
                <div className="verdict-box-header">
                  <h3>Fact-Checking Report</h3>
                  {renderVerdictBadge(detailedArticle.verifiedStatus, detailedArticle.confidence)}
                </div>
                <div className="verdict-box-detail">
                  <p><strong>Primary Citation Source:</strong> {detailedArticle.source}</p>
                  <div className="confidence-meter-mini">
                    <div className="meter-label">
                      <span>Verification Confidence Score</span>
                      <span>{detailedArticle.confidence}%</span>
                    </div>
                    <div className="meter-bar-outer">
                      <div
                        className={`meter-bar-inner ${detailedArticle.verifiedStatus.toLowerCase()}`}
                        style={{ width: `${detailedArticle.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <p className="drawer-article-text">{detailedArticle.fullArticle}</p>

              <div className="drawer-call-to-action">
                <p>Want to cross-check this headline using our live agentic internet queries?</p>
                <button
                  onClick={() => triggerVerificationRedirect(detailedArticle.title)}
                  className="btn btn-primary verify-cta-btn"
                >
                  <RefreshCw size={16} />
                  <span>Run Live Agentic Verification</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
