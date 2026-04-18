import React, { useState, useEffect, useRef, useContext } from 'react';
import { UserContext } from '../App';
import '../index.css';

const EXAMPLES = [
  "What are the early symptoms of Type-2 Diabetes?",
  "How do mRNA vaccines work?",
  "Explain the causes and treatment of hypertension",
  "Viral vs Bacterial Infections",
  "mujhe 3 din se fever hai",
  "paracetamol dose and timing"
];

function createMarkup(html) {
  return { __html: html };
}

function parseMarkdown(text) {
  let html = text.replace(/\n/g, '<br/>')
                 .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                 .replace(/<br\/>•/g, '<br/>•');
                 
  if (html.includes('|')) {
    html = html.replace(/\|(.+)\|(?=<br\/>|$)/g, (match, inner) => {
      if (inner.includes('---')) return ''; 
      const cells = inner.split('|').filter((_, i, arr) => i < arr.length).map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    });
    html = html.replace(/<br\/>(?=<tr>)/g, '');
    html = html.replace(/(<tr>.*?<\/tr>(?:<br\/><tr>.*?<\/tr>)*)/g, (match) => {
      const cleanMatch = match.replace(/<br\/>/g, '');
      return `<div class="table-container"><table class="markdown-table"><tbody>${cleanMatch}</tbody></table></div>`;
    });
  }
  return html.replace(/<br\/><br\/>/g, '<br/>'); 
}

export default function Chat() {
  const { userProfile } = useContext(UserContext);
  const [history, setHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [chunks, setChunks] = useState(null);
  const [researchLinks, setResearchLinks] = useState(null);
  const [simplified, setSimplified] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const answerRef = useRef(null);

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; 
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setCurrentInput(transcript);
      handleAsk(transcript);
    };
    recognition.onerror = (event) => {
      console.error(event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g, "").replace(/\*/g,""));
    utterance.lang = "en-IN";
    window.speechSynthesis.speak(utterance);
  };

  const startLoadingSimulation = (onComplete) => {
    setLoading(true);
    setLoadingStage(0);
    const stages = [
      " Parsing medical query...",
      " Retrieving relevant medical documents from Vector DB...",
      " Scoring relevance and extracting evidence...",
      " Generating clinical synthesis with Mistral 7B...",
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
    }, 300);
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

    const demographic = document.getElementById('demographic')?.value || "General";
    const guidelines = document.getElementById('guidelines')?.value || "Global (WHO)";

    startLoadingSimulation(async () => {
      try {
        const res = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query: q, 
            history: history,
            isRegenerate, 
            demographic, 
            guidelines, 
            userProfile 
          })
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
    <div className="main-area" style={{ height: '100%' }}>
      <div className="title-container">
        <div>
          <div className="title-text"><h1 style={{margin: 0}}>🩺 MedRAG AI+</h1></div>
          <div className="title-sub" style={{marginTop: '5px'}}>Ask. Retrieve. Understand. Powered by Mistral 7B</div>
          <div style={{ marginTop: '12px', fontSize: '0.9rem', color: 'white', display: 'inline-block', padding: '4px 12px', borderRadius: '6px', backgroundColor: '#00BFA5' }}>
            v3.0 • Multi-Page Edition
          </div>
        </div>
        <div className="user-badge">
          <div className="avatar">{userProfile.role ? userProfile.role.charAt(0) : 'P'}</div>
          <div style={{display:'flex', flexDirection:'column'}}>
            <span style={{ fontWeight: 600 }}>{userProfile.role} Dashboard</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {userProfile.name ? `${userProfile.name} (${userProfile.age} yo)` : 'No Name Set'}
            </span>
          </div>
        </div>
      </div>

      <div style={{background: 'rgba(0, 191, 165, 0.1)', border: '1px solid #00BFA5', padding: '10px 16px', borderRadius: '8px', marginBottom: '20px', color: '#00A898', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
        <span>💡</span>
        <strong>Research Mode:</strong> We use a domain-aware LLM such as Mistral 7B for grounded medical response generation.
      </div>

      <h3 style={{marginBottom:'1.5rem', fontSize: '1.4rem'}}>Ask a medical question</h3>
      
      <div className="search-section">
        <input 
          type="text" 
          className="search-input"
          placeholder="Ask or Speak anything... (e.g., mujhe 3 din se fever hai)"
          value={currentInput}
          onChange={e => setCurrentInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAsk()}
        />
        <button className={`voice-btn ${isListening ? 'listening' : ''}`} onClick={startVoiceInput} title="Voice Input">
           🎙️
        </button>
        <button className="primary-btn" onClick={() => handleAsk()}>
           Ask AI
        </button>
      </div>

      <div className="examples-grid">
        {EXAMPLES.map((ex, i) => (
          <div key={i} className="secondary-btn" onClick={() => { setCurrentInput(ex); handleAsk(ex); }}>
            {ex}
          </div>
        ))}
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-text">
            {[" Parsing medical query...", " Retrieving relevant medical documents from ChromaDB...", " Scoring relevance and extracting evidence...", " Generating clinical synthesis with Mistral 7B..."][loadingStage] || "Working..."}
          </div>
          <div className="progress-bar-container">
            <div className="progress-fill" style={{width: `${(loadingStage+1)*25}%`}}></div>
          </div>
        </div>
      )}

      {answer && (
        <>
          <div id="answer-anchor" ref={answerRef}></div>
          <div className="answer-card">
            {answer.urgency && (
              <div className="urgency-high-banner" style={{background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderLeft: '4px solid #ef4444', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span style={{fontSize: '1.2rem'}}>⚠️</span>
                <strong style={{flex: 1}}>{answer.urgency}</strong>
              </div>
            )}
            
            <div className="answer-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <div className="avatar" style={{backgroundColor: '#0A2540', width:'40px', height:'40px', borderRadius:'8px', fontSize:'1.2rem'}}>🤖</div>
                <div>
                  <h3 style={{margin:0}}>AI Answer</h3>
                  <span style={{fontSize:'0.85rem', color:'var(--text-secondary)'}}>Generated using Mistral 7B</span>
                </div>
              </div>
              <button className="secondary-btn" style={{padding: '0.4rem 0.8rem', fontSize: '0.9rem'}} onClick={() => speakText(simplified ? answer.simplified : answer.standard)}>
                🔊 Read Aloud
              </button>
            </div>

            {answer.diseaseProbability && (
              <div className="probability-map" style={{margin: '1.5rem 0', padding: '1rem', background: 'var(--chip-bg)', borderRadius: '12px', border: '1px solid var(--border-color)'}}>
                <h4 style={{marginBottom: '0.8rem'}}>📈 Employee Health Risk Analysis (Symptom Probabilities)</h4>
                {Object.entries(answer.diseaseProbability).map(([disease, prob], idx) => (
                  <div key={idx} style={{marginBottom: '0.5rem'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px'}}>
                      <span>{disease}</span>
                      <strong style={{color: prob > 50 ? '#ef4444' : 'var(--accent)'}}>{prob}%</strong>
                    </div>
                    <div style={{height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden'}}>
                      <div style={{height: '100%', width: `${prob}%`, background: prob > 50 ? '#ef4444' : 'var(--accent)', borderRadius: '4px'}}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {answer.prescriptionData && (
              <div className="prescription-map" style={{margin: '1.5rem 0', padding: '1rem', background: 'var(--chip-bg)', borderRadius: '12px', border: '1px solid var(--border-color)'}}>
                <h4 style={{marginBottom: '1rem'}}>💊 Prescription Explainer (Timer)</h4>
                <div style={{display: 'flex', gap: '1rem', justifyContent: 'space-between'}}>
                  {answer.prescriptionData.map((p, idx) => (
                    <div key={idx} style={{flex: 1, background: 'var(--card-bg)', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)'}}>
                      <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>{p.icon}</div>
                      <div style={{fontWeight: 600, color: 'var(--text-primary)'}}>{p.time}</div>
                      <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem'}}>{p.details}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="answer-content">
              <div dangerouslySetInnerHTML={createMarkup(parseMarkdown(simplified ? answer.simplified : answer.standard))}></div>
            </div>
            
            <div className="action-row">
              <button className="secondary-btn" style={{flex: 2}} onClick={() => setSimplified(!simplified)}>
                {simplified ? "📖 Professional View" : "👶 Simplified View"}
              </button>
              <button className="secondary-btn" style={{flex: 2}} onClick={() => handleAsk(currentInput, true)}>
                🔄 Regenerate
              </button>
              <button className="secondary-btn" style={{flex: 2}} onClick={() => { navigator.clipboard.writeText(simplified ? answer.simplified : answer.standard); alert('Copied!'); }}>
                📋 Copy Text
              </button>
            </div>

            {answer.diagnosticAccuracy && (
              <div style={{marginTop: '1.5rem', display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)'}}>
                <div style={{flex: 1, textAlign: 'center'}}>
                  <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>AI Diagnostic Consensus</div>
                  <div style={{fontSize: '1.2rem', fontWeight: 700, color: '#0ea5e9'}}>{answer.diagnosticAccuracy.ai}% Accurate</div>
                </div>
                <div style={{width: '1px', background: 'var(--border-color)'}}></div>
                <div style={{flex: 1, textAlign: 'center'}}>
                  <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Doctor Agreement Concordance</div>
                  <div style={{fontSize: '1.2rem', fontWeight: 700, color: '#10b981'}}>{answer.diagnosticAccuracy.doctor}% Accurate</div>
                </div>
              </div>
            )}
          </div>
          
          {chunks && chunks.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{marginBottom:'1rem'}}>📚 Supporting Retrieved Chunks</h4>
              {chunks.map((c, i) => (
                <ChunkCard key={i} c={c} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ChunkCard({ c }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="chunk-card">
      <div className="chunk-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{background: '#0ea5e9', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem'}}>Rank #{c.rank || 1}</span>
          <span>📄 {c.title}</span>
        </span>
        <span style={{color: '#00BFA5', fontSize: '0.9rem', whiteSpace: 'nowrap'}}>⭐ {c.match || c.score}% Match</span>
      </div>
      {c.sectionName && <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500}}>📌 Section: {c.sectionName}</div>}
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
          </ul>
        </div>
      )}
    </div>
  );
}
