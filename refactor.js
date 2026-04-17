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
