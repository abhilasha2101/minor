import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, HelpCircle, Award, CheckCircle, XCircle, ArrowRight, RotateCcw, ChevronLeft, ChevronRight, Filter, GraduationCap, Bookmark, Clock } from 'lucide-react';
import './CurrentAffairs.css';

// ── Category definitions with icons and colors ──
const FLASHCARD_CATEGORIES = [
  { id: 'All', label: 'All Topics', emoji: '📋' },
  { id: 'Polity & Governance', label: 'Polity & Governance', emoji: '🏛️' },
  { id: 'Economy & Finance', label: 'Economy & Finance', emoji: '💰' },
  { id: 'Science & Technology', label: 'Science & Tech', emoji: '🔬' },
  { id: 'International Relations', label: 'International Relations', emoji: '🌐' },
  { id: 'Environment & Ecology', label: 'Environment & Ecology', emoji: '🌿' },
  { id: 'Defence & Security', label: 'Defence & Security', emoji: '🛡️' },
  { id: 'Art & Culture', label: 'Art & Culture', emoji: '🎭' },
  { id: 'Social Issues', label: 'Social Issues', emoji: '👥' },
  { id: 'Sports', label: 'Sports', emoji: '🏅' }
];

const EXAM_TAGS = [
  { id: 'All', label: 'All Exams' },
  { id: 'UPSC Prelims', label: 'UPSC Prelims' },
  { id: 'UPSC Mains', label: 'UPSC Mains' },
  { id: 'SSC', label: 'SSC' },
  { id: 'Banking', label: 'Banking' },
  { id: 'State PCS', label: 'State PCS' }
];

export default function CurrentAffairs() {
  const { flashcards, quizzes } = useApp();

  // ── Filter State ──
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeExamTag, setActiveExamTag] = useState('All');
  const [quizCategory, setQuizCategory] = useState('All');

  // ── Filtered Data ──
  const filteredFlashcards = useMemo(() => {
    return flashcards.filter(card => {
      const catMatch = activeCategory === 'All' || card.category === activeCategory;
      const examMatch = activeExamTag === 'All' || card.examTag === activeExamTag;
      return catMatch && examMatch;
    });
  }, [flashcards, activeCategory, activeExamTag]);

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(q => quizCategory === 'All' || q.category === quizCategory);
  }, [quizzes, quizCategory]);

  // ── Flashcards carousel state ──
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // ── Quiz state ──
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Reset flashcard index when filters change
  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setActiveCardIdx(0);
    setIsFlipped(false);
  };

  const handleExamTagChange = (tag) => {
    setActiveExamTag(tag);
    setActiveCardIdx(0);
    setIsFlipped(false);
  };

  // Flashcard carousel navigation
  const nextFlashcard = () => {
    setIsFlipped(false);
    setActiveCardIdx(prev => (prev === filteredFlashcards.length - 1 ? 0 : prev + 1));
  };

  const prevFlashcard = () => {
    setIsFlipped(false);
    setActiveCardIdx(prev => (prev === 0 ? filteredFlashcards.length - 1 : prev - 1));
  };

  // Quiz mechanics
  const handleOptionSelect = (optionIdx) => {
    if (answered) return;
    setSelectedOption(optionIdx);
    setAnswered(true);
    const activeQuestion = filteredQuizzes[currentQuestionIdx];
    if (optionIdx === activeQuestion.answer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setAnswered(false);
    if (currentQuestionIdx === filteredQuizzes.length - 1) {
      setQuizCompleted(true);
    } else {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setAnswered(false);
    setScore(0);
    setQuizCompleted(false);
    setQuizStarted(true);
  };

  const handleQuizCategoryChange = (cat) => {
    setQuizCategory(cat);
    // Reset quiz state when category changes
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setAnswered(false);
    setScore(0);
    setQuizCompleted(false);
    setQuizStarted(false);
  };

  const getPerformanceBadge = (finalScore, total) => {
    const ratio = finalScore / total;
    if (ratio === 1) return { title: 'IAS Topper Material! 🏆', desc: 'Perfect score — your current affairs preparation is exceptional. Keep this up for the real exam!', color: 'var(--color-true)' };
    if (ratio >= 0.7) return { title: 'Strong Aspirant 📚', desc: 'Great performance! Focus on the topics you missed and revise daily for consistent improvement.', color: '#7c83ff' };
    if (ratio >= 0.4) return { title: 'Keep Practicing 💪', desc: 'You\'re building a good foundation. Read newspapers daily (The Hindu, Indian Express) and take more quizzes.', color: 'var(--color-misleading)' };
    return { title: 'Begin Your Journey 🌱', desc: 'Start with NCERT basics and build up to current affairs. Consistency is key — study 30 mins daily.', color: 'var(--color-false)' };
  };

  // Computed values
  const safeCardIdx = Math.min(activeCardIdx, Math.max(0, filteredFlashcards.length - 1));
  const activeCard = filteredFlashcards[safeCardIdx];
  const activeQuestion = filteredQuizzes[currentQuestionIdx];
  const quizBadge = quizCompleted ? getPerformanceBadge(score, filteredQuizzes.length) : null;

  // Category counts for flashcards
  const categoryCounts = useMemo(() => {
    const counts = {};
    flashcards.forEach(card => {
      counts[card.category] = (counts[card.category] || 0) + 1;
    });
    counts['All'] = flashcards.length;
    return counts;
  }, [flashcards]);

  // Quiz category counts
  const quizCategoryCounts = useMemo(() => {
    const counts = {};
    quizzes.forEach(q => {
      counts[q.category] = (counts[q.category] || 0) + 1;
    });
    counts['All'] = quizzes.length;
    return counts;
  }, [quizzes]);

  // Unique categories that have quizzes
  const quizCategoryList = useMemo(() => {
    const cats = new Set(quizzes.map(q => q.category));
    return FLASHCARD_CATEGORIES.filter(c => c.id === 'All' || cats.has(c.id));
  }, [quizzes]);

  return (
    <div className="current-affairs-container">
      {/* Page Header */}
      <div className="current-affairs-hero">
        <h1>Current <span className="gradient-text">Affairs Hub</span></h1>
        <p>Prepare for UPSC, SSC, Banking & State PCS with exam-style flashcards and MCQ quizzes on the latest current affairs.</p>
        <div className="hero-exam-badges">
          <span className="exam-badge-pill">UPSC</span>
          <span className="exam-badge-pill">SSC</span>
          <span className="exam-badge-pill">Banking</span>
          <span className="exam-badge-pill">State PCS</span>
          <span className="exam-badge-pill">Railways</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION 1: Flashcards with Category Filter  */}
      {/* ═══════════════════════════════════════════ */}
      <div className="ca-section-block">
        <div className="ca-section-title-row">
          <div className="section-header">
            <BookOpen size={20} className="icon-blue" />
            <h3>Current Affairs Flashcards</h3>
          </div>
          <span className="section-count-label">{filteredFlashcards.length} cards</span>
        </div>

        {/* Category Filter Chips */}
        <div className="filter-controls-bar">
          <div className="filter-group">
            <div className="filter-label-row">
              <Filter size={12} />
              <span>Topic</span>
            </div>
            <div className="filter-chips-scroll">
              {FLASHCARD_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`filter-chip ${activeCategory === cat.id ? 'active' : ''}`}
                >
                  <span className="chip-emoji">{cat.emoji}</span>
                  <span>{cat.label}</span>
                  {categoryCounts[cat.id] > 0 && (
                    <span className="chip-count">{categoryCounts[cat.id]}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-label-row">
              <GraduationCap size={12} />
              <span>Exam</span>
            </div>
            <div className="filter-chips-scroll">
              {EXAM_TAGS.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleExamTagChange(tag.id)}
                  className={`filter-chip exam-chip ${activeExamTag === tag.id ? 'active' : ''}`}
                >
                  <span>{tag.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Flashcard Display */}
        {filteredFlashcards.length === 0 ? (
          <div className="empty-filter-state glass-card">
            <Filter size={32} className="help-icon-muted" />
            <h4>No flashcards match this filter</h4>
            <p>Try changing the topic or exam filter to see more cards.</p>
          </div>
        ) : (
          <div className="flashcard-display-area">
            <div className="flashcard-wrapper">
              <div
                className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}
                onClick={() => setIsFlipped(prev => !prev)}
              >
                {/* Front side */}
                <div className="flashcard-front">
                  <div className="flashcard-meta-top">
                    <span className="card-category">{activeCard.category}</span>
                    <span className="card-exam-tag">{activeCard.examTag}</span>
                  </div>
                  <h4>{activeCard.title}</h4>
                  {activeCard.date && <span className="card-date-stamp"><Clock size={10} /> {activeCard.date}</span>}
                  <div className="flip-hint">Click Card to Reveal Details</div>
                </div>

                {/* Back side */}
                <div className="flashcard-back">
                  <div className="flashcard-meta-top">
                    <span className="card-category">DETAILED BRIEF</span>
                    <span className="card-exam-tag">{activeCard.examTag}</span>
                  </div>
                  <p>{activeCard.fact}</p>
                  <div className="flip-hint">Click to Flip Back</div>
                </div>
              </div>
            </div>

            {/* Carousel Controls */}
            <div className="flashcard-controls">
              <button onClick={prevFlashcard} className="btn btn-secondary ctrl-btn">
                <ChevronLeft size={16} />
              </button>
              <span className="ctrl-indicator">Card {safeCardIdx + 1} of {filteredFlashcards.length}</span>
              <button onClick={nextFlashcard} className="btn btn-secondary ctrl-btn">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION 2: Quiz with Category Filter        */}
      {/* ═══════════════════════════════════════════ */}
      <div className="ca-section-block">
        <div className="ca-section-title-row">
          <div className="section-header">
            <HelpCircle size={20} className="icon-purple" />
            <h3>Exam-Style Quiz</h3>
          </div>
          <span className="section-count-label">{filteredQuizzes.length} questions</span>
        </div>

        {/* Quiz Category Filter */}
        <div className="filter-controls-bar compact">
          <div className="filter-group">
            <div className="filter-label-row">
              <Filter size={12} />
              <span>Topic</span>
            </div>
            <div className="filter-chips-scroll">
              {quizCategoryList.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleQuizCategoryChange(cat.id)}
                  className={`filter-chip ${quizCategory === cat.id ? 'active' : ''}`}
                >
                  <span className="chip-emoji">{cat.emoji}</span>
                  <span>{cat.label}</span>
                  {quizCategoryCounts[cat.id] > 0 && (
                    <span className="chip-count">{quizCategoryCounts[cat.id]}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quiz Body */}
        <div className="quiz-section glass-card">
          {filteredQuizzes.length === 0 ? (
            <div className="quiz-intro-panel">
              <Filter size={44} className="award-icon-muted" />
              <h4>No questions in this category</h4>
              <p>Try selecting a different topic to find quiz questions.</p>
            </div>
          ) : !quizStarted && !quizCompleted ? (
            <div className="quiz-intro-panel">
              <Award size={44} className="award-icon-muted" />
              <h4>Test Your Current Affairs Knowledge</h4>
              <p>
                {filteredQuizzes.length} MCQ question{filteredQuizzes.length !== 1 ? 's' : ''} in 
                <strong> {quizCategory === 'All' ? 'All Topics' : quizCategory}</strong> — 
                styled like real UPSC/SSC exam questions with statement-based analysis.
              </p>
              <div className="quiz-meta-row">
                {quizCategory !== 'All' && (
                  <span className="quiz-meta-badge">{quizCategory}</span>
                )}
                <span className="quiz-meta-badge">{filteredQuizzes.length} Qs</span>
                <span className="quiz-meta-badge">No Timer</span>
              </div>
              <button onClick={() => setQuizStarted(true)} className="btn btn-primary start-quiz-btn">
                <GraduationCap size={16} />
                <span>Start Quiz</span>
              </button>
            </div>
          ) : quizStarted && !quizCompleted && activeQuestion ? (
            <div className="quiz-active-panel">
              {/* Quiz Stepper */}
              <div className="quiz-stepper">
                <div className="stepper-info-row">
                  <span className="stepper-text">Question {currentQuestionIdx + 1} of {filteredQuizzes.length}</span>
                  {activeQuestion.examTag && (
                    <span className="question-exam-tag">{activeQuestion.examTag}</span>
                  )}
                </div>
                <div className="stepper-track">
                  <div
                    className="stepper-fill"
                    style={{ width: `${((currentQuestionIdx + 1) / filteredQuizzes.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question category badge */}
              <span className="question-category-badge">{activeQuestion.category}</span>

              {/* Question Text — render newlines for statement-based questions */}
              <div className="quiz-question-text">
                {activeQuestion.question.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < activeQuestion.question.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>

              {/* Multiple Choice Options */}
              <div className="quiz-options-list">
                {activeQuestion.options.map((opt, idx) => {
                  let optClass = '';
                  if (answered) {
                    if (idx === activeQuestion.answer) {
                      optClass = 'correct';
                    } else if (idx === selectedOption) {
                      optClass = 'incorrect';
                    } else {
                      optClass = 'disabled';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      className={`quiz-option-btn ${optClass}`}
                      disabled={answered}
                    >
                      <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                      <span className="option-text">{opt}</span>
                      {answered && idx === activeQuestion.answer && <CheckCircle size={16} className="opt-icon-status" />}
                      {answered && idx === selectedOption && idx !== activeQuestion.answer && <XCircle size={16} className="opt-icon-status" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Box */}
              {answered && (
                <div className="quiz-explanation-box glass-card animate-fade">
                  <p className="explanation-verdict-title">
                    {selectedOption === activeQuestion.answer ? (
                      <span className="text-correct">✓ Correct Answer!</span>
                    ) : (
                      <span className="text-incorrect">✗ Incorrect — The correct answer is ({String.fromCharCode(65 + activeQuestion.answer)})</span>
                    )}
                  </p>
                  <p className="explanation-body">{activeQuestion.explanation}</p>
                  <button onClick={handleNextQuestion} className="btn btn-primary next-quiz-btn">
                    <span>{currentQuestionIdx === filteredQuizzes.length - 1 ? 'Show Score' : 'Next Question'}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          ) : null}

          {/* Quiz Completion */}
          {quizCompleted && quizBadge && (
            <div className="quiz-completion-panel animate-scale">
              <div className="completion-badge-graphic" style={{ color: quizBadge.color }}>
                <Award size={48} />
              </div>
              <h3>Quiz Completed!</h3>

              <div className="quiz-final-score">
                <span className="final-value">{score}</span>
                <span className="final-divider">/</span>
                <span className="final-total">{filteredQuizzes.length}</span>
              </div>

              <div className="completion-badge-card glass-card">
                <h4 style={{ color: quizBadge.color }}>{quizBadge.title}</h4>
                <p>{quizBadge.desc}</p>
              </div>

              <button onClick={resetQuiz} className="btn btn-secondary retake-quiz-btn">
                <RotateCcw size={16} />
                <span>Retake Quiz</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
