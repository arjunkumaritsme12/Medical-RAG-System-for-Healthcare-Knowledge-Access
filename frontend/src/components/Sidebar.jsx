import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserContext } from '../App';

export default function Sidebar() {
  const { theme, setTheme, setSosActive, setSosData } = useContext(UserContext);
  const location = useLocation();
  const [sosLoading, setSosLoading] = useState(false);

  const triggerSOS = () => {
    if ("geolocation" in navigator) {
      setSosLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const response = await fetch('/api/sos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lat, lng })
            });
            if (response.ok) {
              const data = await response.json();
              setSosData(data);
              setSosActive(true);
            } else {
              alert("Failed to connect to Dispatch Center.");
            }
          } catch (error) {
            console.error("SOS Fetch Error", error);
            alert("Emergency Dispatch Network Unreachable.");
          } finally {
            setSosLoading(false);
          }
        },
        (error) => {
          console.error(error);
          alert("We couldn't access your location! Please enable Location Services to dispatch an ambulance.");
          setSosLoading(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="sidebar" style={{ width: '280px', padding: '2rem', flexShrink: 0, borderRight: '1px solid var(--border-color)', background: 'var(--card-bg)', backdropFilter: 'blur(10px)', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.6rem'}}>
        🩺 MedRAG
      </h2>
      <nav style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem'}}>
        <Link to="/chat" className={`nav-link ${location.pathname==='/chat'?'active':''}`}>💬 AI Consultant</Link>
        <Link to="/dashboard" className={`nav-link ${location.pathname==='/dashboard'?'active':''}`}>👨‍👩‍👧 For Family</Link>
        <Link to="/intelligence" className={`nav-link ${location.pathname==='/intelligence'?'active':''}`}>🌍 Intelligence Map</Link>
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

      <button onClick={triggerSOS} disabled={sosLoading} style={{
        marginTop: '1.5rem', 
        background: '#ef4444', 
        color: 'white', 
        border: 'none', 
        padding: '1rem', 
        borderRadius: '12px', 
        cursor: sosLoading ? 'not-allowed' : 'pointer',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
        animation: 'pulse 2s infinite'
      }}>
         🚨 {sosLoading ? 'LOCATING...' : 'EMERGENCY SOS'}
      </button>
    </div>
  );
}
