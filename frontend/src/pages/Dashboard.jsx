import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../App';

export default function Dashboard() {
  const { userProfile, setUserProfile } = useContext(UserContext);
  const [savedUsers, setSavedUsers] = useState([]);
  const [rewards, setRewards] = useState({ assessment: false, medRecord: false, checkup: false, familyAdded: false });
  const [redeeming, setRedeeming] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'https://medical-rag-system-for-healthcare-f282.onrender.com';

  useEffect(() => {
    fetch(`${API_URL}/api/users`)
      .then(res => res.json())
      .then(data => setSavedUsers(data))
      .catch(err => console.error(err));
  }, [API_URL]);

  const saveProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users`, {
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
      const res = await fetch(`${API_URL}/api/redeem`, {
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
              <div style={{height: '100%', width: `${Math.min(100, (calculateRewardScore()/90)*100)}%`, background: '#10b981', transition: 'width 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'}}></div>
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
