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

      {/* Main Area */}
      <div className="main-area">
        <div className="title-container">
          <div>
            <div className="title-text"><h1>🩺 MedRAG AI</h1></div>
            <div className="title-sub">Ask. Retrieve. Understand. Powered by RAG</div>
            <div style={{ marginTop: '12px', fontSize: '0.9rem', color: 'white', display: 'inline-block', padding: '4px 12px', borderRadius: '6px', backgroundColor: '#00BFA5' }}>
              v1.0 • Hackathon Demo (React+Node)
            </div>
          </div>
          <div className="user-badge" style={{cursor: 'pointer'}} onClick={() => setShowProfile(true)}>
            <div className="avatar">P</div>
            <div style={{display:'flex', flexDirection:'column'}}>
              <span style={{ fontWeight: 600 }}>Patient Profile</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {userProfile.name ? `${userProfile.name} (${userProfile.age} yo)` : (userProfile.age ? `${userProfile.age} yo ${userProfile.gender}` : 'Click to setup')}
              </span>
            </div>
          </div>
        </div>

        <h3 style={{marginBottom:'1.5rem', fontSize: '1.4rem'}}>Ask a medical question</h3>
        
        <div className="search-section">
          <input 
            type="text" 
            className="search-input"
            placeholder="Ask any medical question… (e.g., What causes hypertension?)"
            value={currentInput}
            onChange={e => setCurrentInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAsk()}
          />
          <button className="primary-btn" onClick={() => handleAsk()}>
             Ask AI
          </button>
        </div>

        <div className="examples-grid">
          {EXAMPLES.map((ex, i) => (
            <div key={i} className="secondary-btn" onClick={() => {
              setCurrentInput(ex);
              handleAsk(ex);
            }}>
              {ex}
            </div>
          ))}
        </div>

        {loading && (
          <div className="loading-container">
            <div className="loading-text">
              {[" Parsing medical query...", " Retrieving relevant medical documents from Vector DB...", " Scoring relevance and extracting evidence...", " Generating clinical synthesis with Grok-4...", " Finalizing response formatting..."][loadingStage] || "Working..."}
            </div>
            <div className="progress-bar-container">
              <div className="progress-fill" style={{width: `${(loadingStage+1)*20}%`}}></div>
            </div>
          </div>
        )}

        {answer && (
          <>
            <div id="answer-anchor" ref={answerRef}></div>
            <div className="answer-card">
              <div className="answer-header">
                <div className="avatar" style={{backgroundColor: '#0A2540', width:'40px', height:'40px', borderRadius:'8px', fontSize:'1.2rem'}}>🤖</div>
                <div>
                  <h3 style={{margin:0}}>AI Answer</h3>
                  <span style={{fontSize:'0.85rem', color:'var(--text-secondary)'}}>Generated based on retrieved evidence</span>
                </div>
                {answer.confidence > 0 && (
                  <div className="confidence-meter">
                    <span style={{fontSize:'0.9rem', fontWeight:600, color:'#00BFA5'}}>{answer.confidence}% Confidence</span>
                    <div className="confidence-bar-bg">
                      <div className="confidence-bar-fill" style={{width: `${answer.confidence}%`}}></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="answer-content">
                <p dangerouslySetInnerHTML={createMarkup(simplified ? answer.simplified.replace(/\n•/g, '<br/>•').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') : answer.standard.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'))}></p>
              </div>
              
              <div className="action-row">
                <button className="secondary-btn" style={{flex: 2}} onClick={() => setSimplified(!simplified)}>
                  {simplified ? "📖 Detailed View" : " Simplified View"}
                </button>
                <button className="secondary-btn" style={{flex: 2}} onClick={() => handleAsk(currentInput, true)}>
                  🔄 Regenerate
                </button>
                <button className="secondary-btn" style={{flex: 2}} onClick={() => { navigator.clipboard.writeText(simplified ? answer.simplified : answer.standard); alert('Copied!'); }}>
                  📋 Copy Text
                </button>
                <button className="secondary-btn" style={{flex: 1, borderColor: feedback === 'up' ? 'var(--accent)' : ''}} onClick={() => setFeedback('up')}>👍</button>
                <button className="secondary-btn" style={{flex: 1, borderColor: feedback === 'down' ? 'var(--accent)' : ''}} onClick={() => setFeedback('down')}>👎</button>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
              <div style={{ flex: 2 }}>
                {chunks && chunks.length > 0 && (
                  <>
                    <h4 style={{marginBottom:'1rem'}}>📚 Supporting Retrieved Chunks</h4>
                    {chunks.map((c, i) => (
                      <ChunkCard key={i} c={c} />
                    ))}
                  </>
                )}
              </div>
              <div style={{ flex: 1 }}>
                {researchLinks && researchLinks.length > 0 && (
                  <>
                    <h4 style={{marginBottom:'1rem'}}>🔬 External Research Portals</h4>
                    <div className="chunk-card" style={{ borderLeftColor: '#38bdf8' }}>
                      <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem'}}>
                        Direct queries against international medical databases based on your topic.
                      </p>
                      {researchLinks.map((link, idx) => (
                        <a key={idx} href={link.url} target="_blank" rel="noreferrer" style={{ display: 'block', color: '#0ea5e9', textDecoration: 'none', marginBottom: '0.8rem', fontWeight: 500}}>
                          {link.title} ↗
                        </a>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        <div className="disclaimer">
          <strong>⚠️ Important Medical Disclaimer</strong><br/>
          This AI tool is for informational and educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.
        </div>
        
        <div className="footer">
          Built in &lt;30 mins with ❤️ & React | Delhi Hackathon 2026
        </div>
      </div>

      {showProfile && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Patient Dashboard</h2>
              {savedUsers.length > 0 && (
                <select className="styled-select" style={{ width: 'auto' }} onChange={e => {
                  if (e.target.value === 'new') {
                    setUserProfile({id: null, name: '', age: '', gender: 'Not specified', bp: '', history: ''});
                  } else {
                    const u = savedUsers.find(user => user.id == e.target.value);
                    if (u) setUserProfile(u);
                  }
                }}>
                  <option value="new">+ Create New Patient</option>
                  {savedUsers.map(u => (
                    <option key={u.id} value={u.id} selected={userProfile.id === u.id}>Load: {u.name}</option>
                  ))}
                </select>
              )}
            </div>
            <p style={{color:'var(--text-secondary)', marginBottom: '1.5rem'}}>Update your profile so MedRAG can give you highly contextual medical guidance and references.</p>
            
            <div className="form-group">
              <label>Patient Name</label>
              <input type="text" placeholder="e.g. John Doe" value={userProfile.name || ''} onChange={e => setUserProfile({...userProfile, name: e.target.value})} />
            </div>

            <div className="flex-row">
              <div className="form-group">
                <label>Age</label>
                <input type="number" placeholder="e.g. 45" value={userProfile.age} onChange={e => setUserProfile({...userProfile, age: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select value={userProfile.gender} onChange={e => setUserProfile({...userProfile, gender: e.target.value})}>
                  <option>Not specified</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Current Blood Pressure</label>
              <input type="text" placeholder="e.g. 120/80" value={userProfile.bp} onChange={e => setUserProfile({...userProfile, bp: e.target.value})} />
            </div>

            <div className="form-group">
              <label>Medical History / Conditions</label>
              <textarea rows="3" placeholder="e.g. Type 2 Diabetes, Asthma" value={userProfile.history} onChange={e => setUserProfile({...userProfile, history: e.target.value})}></textarea>
            </div>

            <button className="primary-btn" style={{width: '100%', marginTop: '1rem'}} onClick={saveProfile}>Save to Database</button>
            
            <div style={{ marginTop: '2.5rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                📊 Dynamic Health Metrics (3D)
              </h3>
              
              <div className="dashboard-3d-container">
                {(() => {
                  const age = parseInt(userProfile.age) || 0;
                  const [sys, dia] = (userProfile.bp || '').split('/').map(Number);
                  const sysVal = sys || 0;
                  
                  // Calculate dynamic demo metrics
                  const healthScore = age > 0 ? Math.max(10, 100 - (age * 0.3) - (sysVal > 120 ? (sysVal-120)*0.8 : 0)) : 0;
                  const riskFactor = (sysVal > 130) ? 75 : (age > 40 ? 45 : 20);
                  
                  const charts = [
                    { label: 'Vitality', value: healthScore > 0 ? healthScore : 40, colorBase: '#0ea5e9' },
                    { label: 'BP (Sys)', value: sysVal > 0 ? sysVal : 80, colorBase: '#00BFA5' },
                    { label: 'Risk (%)', value: age > 0 ? riskFactor : 15, colorBase: '#ef4444' }
                  ];

                  return charts.map((c, i) => (
                    <div key={i} className="chart-item">
                      <div className="bar-3d" style={{ '--bar-height': `${c.value * 1.5}px` }}>
                        <div className="bar-3d-face front" style={{ background: c.colorBase }}></div>
                        <div className="bar-3d-face back" style={{ background: c.colorBase, filter: 'brightness(0.7)' }}></div>
                        <div className="bar-3d-face left" style={{ background: c.colorBase, filter: 'brightness(0.85)' }}></div>
                        <div className="bar-3d-face right" style={{ background: c.colorBase, filter: 'brightness(0.85)' }}></div>
                        <div className="bar-3d-face top" style={{ background: c.colorBase, filter: 'brightness(1.3)' }}></div>
                        <span className="chart-value-label" style={{ color: c.colorBase }}>{Math.round(c.value)}</span>
                      </div>
                      <span className="chart-label">{c.label}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChunkCard({ c }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="chunk-card">
      <div className="chunk-title">
        <span>📄 {c.title}</span>
        <span style={{color: '#00BFA5', fontSize: '0.9rem'}}>⭐ Relevance: {c.score}%</span>
      </div>
      <div className="chunk-snippet" dangerouslySetInnerHTML={createMarkup(`"...${c.snippet}..."`)}></div>
      
      <button className="expander-btn" onClick={() => setExpanded(!expanded)}>
        {expanded ? "Hide details" : "View full source \u2192"}
      </button>

      {expanded && (
        <div className="expander-content">
          <strong>Source Metadata</strong>
          <ul>
            <li><strong>Document ID:</strong> doc_{Math.floor(Math.random() * 9000) + 1000}</li>
            <li><strong>Updated Date:</strong> {c.date}</li>
            <li><strong>Extraction Confidence:</strong> {c.score}%</li>
          </ul>
          <br/>
          <strong>Extended Text:</strong><br/>
          The clinical framework requires an understanding of patient history. {c.snippet.replace(/<span class='highlight'>(.*?)<\/span>/gi, '$1')} Furthermore, standard operating procedures dictate that subsequent monitoring occurs on a structured basis to prevent relapse.
        </div>
      )}
    </div>
  );
}

export default App;
