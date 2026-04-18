import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import Intelligence from './pages/Intelligence';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './index.css';

export const UserContext = createContext();

export default function App() {
  const [theme, setTheme] = useState('light');
  const [uiLanguage, setUiLanguage] = useState('en-IN');
  const [userProfile, setUserProfile] = useState({
    id: null, name: '', age: '', gender: 'Not specified', role: 'Self', bp: '', history: ''
  });
  
  // SOS State
  const [sosActive, setSosActive] = useState(false);
  const [sosData, setSosData] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <UserContext.Provider value={{ userProfile, setUserProfile, theme, setTheme, setSosActive, setSosData, uiLanguage, setUiLanguage }}>
      <Router>
        <div className="app-container" style={{display: 'flex', position: 'relative'}}>
          { sosActive && sosData && (
             <div className="sos-overlay-modal" style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(239, 68, 68, 0.95)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                 <div className="sos-card" style={{background: 'var(--card-bg)', color: 'var(--text-primary)', padding: '3rem', borderRadius: '24px', width: '90%', maxWidth: '800px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', textAlign: 'center'}}>
                     <h1 style={{color: '#ef4444', fontSize: '2.5rem', marginBottom: '1rem'}}>
                        🚨 EMERGENCY SOS DISPATCHED
                     </h1>
                     <p style={{fontSize: '1.2rem', marginBottom: '2rem'}}>Your exact coordinates have been sent to emergency response networks.</p>
                     
                     <div style={{height: '300px', width: '100%', borderRadius: '16px', overflow: 'hidden', marginBottom: '2rem'}}>
                        <MapContainer center={[sosData.coordinates.lat, sosData.coordinates.lng]} zoom={15} style={{height: '100%', width: '100%'}}>
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Circle center={[sosData.coordinates.lat, sosData.coordinates.lng]} pathOptions={{color: '#ef4444', fillColor: '#ef4444'}} radius={200} />
                          <Marker position={[sosData.coordinates.lat, sosData.coordinates.lng]}>
                             <Popup>RESPONDERS DIRECTED HERE</Popup>
                          </Marker>
                        </MapContainer>
                     </div>

                     <div style={{display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem', textAlign: 'left'}}>
                        <div style={{background: 'var(--chip-bg)', padding: '1.5rem', borderRadius: '12px', flex: 1, minWidth: '200px'}}>
                           <h3 style={{margin: '0 0 10px 0'}}>🚑 Responding Unit</h3>
                           <div style={{fontSize: '1.1rem'}}>{sosData.hospital}</div>
                           <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Dispatch ID: {sosData.dispatchId}</div>
                        </div>
                        <div style={{background: 'var(--chip-bg)', padding: '1.5rem', borderRadius: '12px', flex: 1, minWidth: '200px'}}>
                           <h3 style={{margin: '0 0 10px 0'}}>⏱️ ETA & Contact</h3>
                           <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444'}}>{sosData.etaMins} Minutes</div>
                           <div style={{fontSize: '1rem', marginTop: '5px'}}>Driver: {sosData.driverName}</div>
                           <div style={{fontSize: '1rem'}}>{sosData.driverPhone}</div>
                           <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{sosData.hospitalEmail}</div>
                        </div>
                     </div>

                     <button className="primary-btn" onClick={() => {setSosActive(false); setSosData(null);}} style={{background: '#ef4444', color: 'white', border: 'none', padding: '1rem 3rem', fontSize: '1.2rem', boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)'}}>
                         CANCEL SOS SIGNAL
                     </button>
                 </div>
             </div>
          )}
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
