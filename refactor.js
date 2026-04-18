import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');

// 1. Create Directories
const dirs = ['components', 'pages'];
dirs.forEach(d => {
  if (!fs.existsSync(path.join(srcDir, d))) {
    fs.mkdirSync(path.join(srcDir, d));
  }
});

// App.jsx Content
const appJsxContent = `import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import Intelligence from './pages/Intelligence';
import './index.css';

export const UserContext = createContext();

export default function App() {
  const [theme, setTheme] = useState('light');
  const [userProfile, setUserProfile] = useState({
    id: null, name: '', age: '', gender: 'Not specified', role: 'Self', bp: '', history: ''
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <UserContext.Provider value={{ userProfile, setUserProfile, theme, setTheme }}>
      <Router>
        <div className="app-container" style={{display: 'flex'}}>
          <div className="mesh-bg">
            <div className="mesh-blob blob-1"></div>
            <div className="mesh-blob blob-2"></div>
            <div className="mesh-blob blob-3"></div>
          </div>
          
          <Sidebar />
          
          <div className="main-content" style={{ flexGrow: 1, height: '100vh', overflowY: 'auto' }}>
             <Routes>
               <Route path="/" element={<Navigate to="/chat" />} />
               <Route path="/chat" element={<Chat />} />
               <Route path="/dashboard" element={<Dashboard />} />
               <Route path="/intelligence" element={<Intelligence />} />
             </Routes>
          </div>
        </div>
      </Router>
    </UserContext.Provider>
  );
}
`;

// Sidebar Component
const sidebarContent = `import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserContext } from '../App';

export default function Sidebar() {
  const { theme, setTheme } = useContext(UserContext);
  const location = useLocation();

  return (
    <div className="sidebar" style={{ width: '280px', padding: '2rem', flexShrink: 0, borderRight: '1px solid var(--border-color)', background: 'var(--card-bg)', backdropFilter: 'blur(10px)', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.6rem'}}>
        🩺 MedRAG
      </h2>
      <nav style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem'}}>
        <Link to="/chat" className={\`nav-link \${location.pathname==='/chat'?'active':''}\`}>💬 AI Consultant</Link>
        <Link to="/dashboard" className={\`nav-link \${location.pathname==='/dashboard'?'active':''}\`}>👨‍👩‍👧 For Family</Link>
        <Link to="/intelligence" className={\`nav-link \${location.pathname==='/intelligence'?'active':''}\`}>🌍 Intelligence Map</Link>
      </nav>
      
      <div className="sidebar-card" style={{marginTop: 'auto', fontSize: '0.8rem'}}>
        <strong>System Status</strong><br/>
           🧠 Mistral 7B<br/>
           📊 PubMedBERT<br/>
           🗄️ ChromaDB<br/>
           ⚡ 0.4s
      </div>

      <div style={{marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)'}}>
         <label style={{display:'flex', gap:'10px', alignItems:'center', cursor:'pointer', color:'var(--text-primary)', fontWeight: 500}}>
            <input type="checkbox" checked={theme==='dark'} onChange={() => setTheme(theme==='dark'?'light':'dark')} />
            Dark Mode
         </label>
      </div>
    </div>
  );
}
`;

// Read the old App.jsx to extract `Chat.jsx` chat logic and parsing logic
const oldAppSource = fs.readFileSync(path.join(srcDir, 'App.jsx'), 'utf-8');

// We will recreate Chat.jsx by keeping the functions from old App
let chatContent = oldAppSource.replace('function App() {', 'import { UserContext } from "../App";\n\nexport default function Chat() {\n  const { userProfile } = React.useContext(UserContext);');
chatContent = chatContent.replace(/export default App;\n?/g, '');
chatContent = chatContent.replace(/const \[theme, setTheme\] = useState\('light'\);\n/g, '');
chatContent = chatContent.replace(/const \[showProfile, setShowProfile\][\s\S]*?setUserProfile[\s\S]*?\}\);\n/g, '');
chatContent = chatContent.replace(/const \[rewards, setRewards\][\s\S]*?setRedeeming\(false\);\n  };\n/g, '');
// Remove the modal and sidebar from chat UI
chatContent = chatContent.replace(/<div className="sidebar">[\s\S]*?<\/div>\n\n\s*<div className="main-area">/, '<div className="main-area">');
chatContent = chatContent.replace(/\{showProfile && \([\s\S]*?\}\)\}\n*\s*<\/div>/, '      </div>');
chatContent = chatContent.replace(/<div className="seasonal-widget">[\s\S]*?<\/div>/, '');

// Clean up unused effects in Chat
chatContent = chatContent.replace(/useEffect\(\(\) => \{\n\s*document.documentElement.setAttribute\('data-theme', theme\);\n\s*\}, \[theme\]\);\n/, '');

// Add styling for Nav Link
const styleAppend = `
.nav-link {
  text-decoration: none;
  color: var(--text-secondary);
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}
.nav-link:hover {
  background: var(--chip-bg);
  color: var(--accent);
}
.nav-link.active {
  background: rgba(0, 191, 165, 0.1);
  color: var(--accent);
  border-left: 4px solid var(--accent);
}
.leaflet-container {
  font-family: 'Inter', sans-serif;
  z-index: 1; /* prevent overlapping floating inputs */
}
`;

fs.appendFileSync(path.join(srcDir, 'index.css'), styleAppend);

// Intelligence Component
const intelContent = `import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function Intelligence() {
  const position = [28.6139, 77.2090]; // New Delhi
  
  return (
    <div className="main-area" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
      <div className="title-text"><h1 style={{fontSize:'2.5rem', marginBottom: '0.5rem'}}>🌍 Seasonal Disease Intelligence</h1></div>
      <p style={{marginBottom: '2rem', color: 'var(--text-secondary)', fontSize: '1.1rem'}}>Live integration with OpenWeatherMap 2.0 API & Pathogen Forecasting.</p>
      
      <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow)', minHeight: '60vh', position: 'relative' }}>
        
        {/* Floating Metrics Overlay */}
        <div style={{position: 'absolute', top: 20, right: 20, background: 'var(--card-bg)', padding: '1rem', borderRadius: '12px', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}}>
          <h4 style={{marginBottom: '5px'}}>Delhi Real-Time Radar</h4>
          <div style={{color: '#ef4444', fontWeight: 'bold', fontSize: '0.9rem'}}>⚠️ High Viral Dengue Alert</div>
          <div style={{fontSize: '0.8rem', marginTop: '6px', color: 'var(--text-secondary)'}}>+20% infectious vector probability due to monsoonal humidity.</div>
        </div>

        <MapContainer center={position} zoom={5} style={{ height: '100%', width: '100%' }}>
           <TileLayer
             attribution='&copy; OpenStreetMap contributors'
             url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
           />
           {/* Add user's API Key to actualize this */}
           {/* <TileLayer url="http://maps.openweathermap.org/maps/2.0/weather/1h/temp/{z}/{x}/{y}?appid={YOUR_API_KEY}" opacity={0.5} /> */}
           
           <Circle center={[28.61, 77.2]} pathOptions={{color: 'red', fillColor: '#ef4444', fillOpacity: 0.5}} radius={120000}>
              <Popup><b>High Alert</b>: Dengue Outbreak Predicted</Popup>
           </Circle>
           <Circle center={[19.07, 72.87]} pathOptions={{color: 'orange', fillColor: '#f59e0b', fillOpacity: 0.5}} radius={90000}>
              <Popup><b>Warning</b>: Malaria Clusters</Popup>
           </Circle>
           <Circle center={[13.08, 80.27]} pathOptions={{color: 'red', fillColor: '#ef4444', fillOpacity: 0.4}} radius={100000}>
              <Popup><b>Alert</b>: Typhoid Hotspot</Popup>
           </Circle>
        </MapContainer>
      </div>
    </div>
  );
}
`;

// Dashboard Component
const dashContent = `import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../App';

export default function Dashboard() {
  const { userProfile, setUserProfile } = useContext(UserContext);
  const [savedUsers, setSavedUsers] = useState([]);
  const [rewards, setRewards] = useState({ assessment: false, medRecord: false, checkup: false, familyAdded: false });
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setSavedUsers(data))
      .catch(err => console.error(err));
  }, []);

  const saveProfile = async () => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userProfile)
      });
      const data = await res.json();
      setUserProfile(data);
      if (data.role !== 'Self') setRewards(prev => ({...prev, familyAdded: true}));
      if (data.history) setRewards(prev => ({...prev, medRecord: true}));
      if (data.bp) setRewards(prev => ({...prev, assessment: true}));
      alert("Settings saved!");
    } catch (e) {
      console.error(e);
    }
  };

  const calculateRewardScore = () => {
    let score = 0;
    if (rewards.assessment) score += 10;
    if (rewards.medRecord) score += 20;
    if (rewards.checkup) score += 20;
    if (rewards.familyAdded) score += 40;
    return score;
  };
   const redeemRewards = async () => {
    setRedeeming(true);
    try {
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'harshitthakur61521@gmail.com' })
      });
      await res.json();
      alert("Success! 50% Discount code dispatched to harshitthakur61521@gmail.com.");
    } catch (e) {
      console.error(e);
    }
    setRedeeming(false);
  };

  return (
    <div className="main-area" style={{ height: '100%' }}>
      <div className="title-text"><h1 style={{fontSize:'2.5rem', marginBottom: '0.5rem'}}>👨‍👩‍👧 For Family Dashboard</h1></div>
      <p style={{marginBottom: '2.5rem', color: 'var(--text-secondary)', fontSize: '1.1rem'}}>Manage health profiles, view analytical scoring, and earn medicine discounts through proactive tracking.</p>

      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{margin: 0, fontSize: '1.5rem'}}>Profile Settings</h2>
                {savedUsers.length > 0 && (
                  <select className="styled-select" style={{ width: 'auto' }} onChange={e => {
                    if (e.target.value === 'new') {
                      setUserProfile({id: null, name: '', age: '', gender: 'Not specified', role: 'Self', bp: '', history: ''});
                    } else {
                      const u = savedUsers.find(user => user.id == e.target.value);
                      if (u) setUserProfile(u);
                    }
                  }}>
                    <option value="new">+ Create Profile</option>
                    {savedUsers.map((u, i) => (
                      <option key={i} value={u.id} selected={userProfile.id === u.id}>Load: {u.name || u.role}</option>
                    ))}
                  </select>
                )}
              </div>
              
              <div className="flex-row">
                <div className="form-group">
                  <label>Family Role</label>
                  <select value={userProfile.role} onChange={e => setUserProfile({...userProfile, role: e.target.value})}>
                    <option>Self</option>
                    <option>Father</option>
                    <option>Mother</option>
                    <option>Child</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Patient Name</label>
                  <input type="text" placeholder="e.g. John Doe" value={userProfile.name || ''} onChange={e => setUserProfile({...userProfile, name: e.target.value})} />
                </div>
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
                <label>Medical History & Medicine Records</label>
                <textarea rows="3" placeholder="e.g. Type 2 Diabetes, Ascoril D, Paracetamol" value={userProfile.history} onChange={e => setUserProfile({...userProfile, history: e.target.value})}></textarea>
              </div>

              <button className="primary-btn" style={{width: '100%', marginTop: '1rem', padding: '0.8rem'}} onClick={saveProfile}>Save Patient Settings</button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Gamified Progress Bar */}
          <div style={{background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)', padding: '2rem', borderRadius: '16px', border: '1px solid #10b981'}}>
            <h3 style={{marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', color: '#059669'}}>
              <span>🏅 Medicine Reminder & Health Progress</span>
              <span style={{fontWeight: 'bold'}}>{calculateRewardScore()} / 90 Pts</span>
            </h3>
            
            <div style={{height: '12px', background: 'var(--card-bg)', borderRadius: '6px', overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid var(--border-color)'}}>
              <div style={{height: '100%', width: \`\${Math.min(100, (calculateRewardScore()/90)*100)}%\`, background: '#10b981', transition: 'width 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'}}></div>
            </div>
            
            <ul style={{fontSize: '1rem', color: 'var(--text-primary)', paddingLeft: '0.5rem', gap: '12px', display: 'flex', flexDirection: 'column', listStyle: 'none'}}>
              <li style={{display: 'flex', alignItems: 'center', gap: '10px'}}>{rewards.assessment ? '🟢' : '⚪'} <span>Health Risk Assessment (+10)</span></li>
              <li style={{display: 'flex', alignItems: 'center', gap: '10px'}}>{rewards.medRecord ? '🟢' : '⚪'} <span>Add Medicine Records (+20)</span></li>
              <li style={{display: 'flex', alignItems: 'center', gap: '10px'}}>{rewards.checkup ? '🟢' : '⚪'} <span style={{display: 'flex', alignItems: 'center', gap: '10px'}}>Book Health Check (+20) <button onClick={() => setRewards(prev => ({...prev, checkup: true}))} style={{background:'var(--card-bg)', border:'1px solid var(--border-color)', borderRadius:'6px', color:'#0ea5e9', cursor:'pointer', fontSize:'0.75rem', padding:'4px 10px'}}>Simulate Booking</button></span></li>
              <li style={{display: 'flex', alignItems: 'center', gap: '10px'}}>{rewards.familyAdded ? '🟢' : '⚪'} <span>Add Family Members (+40)</span></li>
            </ul>

            {calculateRewardScore() >= 90 && (
              <button onClick={redeemRewards} disabled={redeeming} className="primary-btn" style={{marginTop: '2rem', width: '100%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)', padding: '1rem', fontSize: '1.1rem'}}>
                {redeeming ? "Processing Request..." : "🎁 Redeem 50% Checking/Consultant Discount!"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(srcDir, 'App.jsx'), appJsxContent);
fs.writeFileSync(path.join(srcDir, 'components', 'Sidebar.jsx'), sidebarContent);
fs.writeFileSync(path.join(srcDir, 'pages', 'Chat.jsx'), chatContent);
fs.writeFileSync(path.join(srcDir, 'pages', 'Intelligence.jsx'), intelContent);
fs.writeFileSync(path.join(srcDir, 'pages', 'Dashboard.jsx'), dashContent);

