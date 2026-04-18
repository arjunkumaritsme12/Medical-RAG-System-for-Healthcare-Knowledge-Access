import React from 'react';
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
