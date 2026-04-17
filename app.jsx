import React, { useState, useEffect, useRef } from 'react';
import './index.css';

const EXAMPLES = [
  "What are the early symptoms of Type-2 Diabetes?",
  "How do mRNA vaccines work?",
  "Explain the causes and treatment of hypertension",
  "What is the difference between viral and bacterial infections?"
];

// Helper to render HTML with parsed simple tags directly
function createMarkup(html) {
  return { __html: html };
}

function App() {
  const [theme, setTheme] = useState('light');
  const [history, setHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [chunks, setChunks] = useState(null);
  const [researchLinks, setResearchLinks] = useState(null);
  const [simplified, setSimplified] = useState(false);
  const [feedback, setFeedback] = useState(null);

  
  // User Dashboard State
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState({
    age: '',
    gender: 'Not specified',
    bp: '',
    history: ''
  });

  const answerRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };

  const startLoadingSimulation = (onComplete) => {
    setLoading(true);
    setLoadingStage(0);
    const stages = [
      " Parsing medical query...",
      " Retrieving relevant medical documents from Vector DB...",
      " Scoring relevance and extracting evidence...",
      " Generating clinical synthesis with Grok-4...",
      " Finalizing response formatting..."
    ];
     let current = 0;
    const interval = setInterval(() => {
      current++;
      setLoadingStage(current);
      if (current >= stages.length) {
        clearInterval(interval);
        setLoading(false);
        onComplete();
      }
    }, 400); // match python simulated speed roughly + backend
  };

  const handleAsk = async (queryToAsk, isRegenerate = false) => {
    const q = queryToAsk || currentInput;
    if (!q.trim()) return;

    if (!isRegenerate && !history.includes(q)) {
      setHistory([...history, q]);
    }
    
    setSimplified(false);
    setFeedback(null);
    setAnswer(null);
    setChunks(null);
    setResearchLinks(null);

    const demographic = document.getElementById('demographic')?.value;
    const guidelines = document.getElementById('guidelines')?.value;
    const experimental = document.getElementById('experimental')?.checked;

    startLoadingSimulation(async () => {
      try {
        const res = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: q, isRegenerate, demographic, guidelines, experimental })
        });
        
        const data = await res.json();
        setAnswer(data.answer);
        setChunks(data.chunks);
        setResearchLinks(data.researchLinks);

        setTimeout(() => {
          answerRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } catch (e) {
        alert("Failed to reach backend API. Make sure the Node.js server is running on port 3001.");
      }
    });
  };

  return (
    <div className="app-container">
      <div className="mesh-bg">
        <div className="mesh-blob blob-1"></div>
        <div className="mesh-blob blob-2"></div>
        <div className="mesh-blob blob-3"></div>
      </div>
      {/* Sidebar */}
      <div className="sidebar">
        <div>
          <h3>⚙️ Settings & Info</h3>
          <div className="theme-toggle-row">
            <span>Dark Mode</span>
            <label style={{cursor:'pointer'}}>
              <input 
                type="checkbox" 
                checked={theme === 'dark'} 
                onChange={toggleTheme} 
                style={{marginLeft:'10px'}}
              />
            </label>
          </div>
        </div>
        
        <hr style={{ borderColor: 'var(--border-color)', margin: '5px 0' }}/>
        
        <div>
          <h3>🔬 Advanced Search</h3>
          <div className="advanced-setting">
            <label>Target Demographic</label>
            <select className="styled-select" id="demographic" defaultValue="General">
              <option>General</option>
              <option>Pediatric</option>
              <option>Adult</option>
              <option>Geriatric</option>
            </select>
          </div>
          <div className="advanced-setting">
            <label>Guideline Source</label>
            <select className="styled-select" id="guidelines" defaultValue="Global (WHO)">
              <option>Global (WHO)</option>
              <option>US (NIH/CDC)</option>
              <option>European (EMA)</option>
            </select>
          </div>
          <div className="advanced-setting" style={{marginTop: '1rem'}}>
            <label className="styled-checkbox">
              <input type="checkbox" id="experimental" />
              Include Experimental Trials
            </label>
          </div>
          <button className="primary-btn" style={{marginTop:'1.5rem', width:'100%', padding:'0.6rem', fontSize:'1rem'}} onClick={() => setShowProfile(true)}>
            👤 My Patient Dashboard
          </button>
        </div>

        <hr style={{ borderColor: 'var(--border-color)', margin: '5px 0' }}/>

        <div className="sidebar-card">
          <strong>System Status</strong><br/>
           Model: Grok-4 + Vector DB<br/>
           Avg Response: 0.4s<br/>
           Status: Operational
        </div>

        <div>
          <h3 style={{marginTop: '0.5rem'}}>🕒 History</h3>
          {history.length > 0 ? (
            <>
              {history.slice(-5).reverse().map((h, i) => (
                <button 
                  key={i} 
                  className="history-btn" 
                  onClick={() => {
                    setCurrentInput(h);
                    handleAsk(h);
                  }}
                >
                  🔍 {h.substring(0, 25)}...
                </button>
              ))}
              <button 
                className="clear-history" 
                onClick={() => {
                  setHistory([]);
                  setAnswer(null);
                  setChunks(null);
                  setResearchLinks(null);
                  setCurrentInput('');
                }}
              >
                🗑️ Clear History
              </button>
            </>
          ) : (
            <span style={{color: 'var(--text-secondary)', fontSize: '1rem'}}>No history yet.</span>
          )}
        </div>
      </div>
