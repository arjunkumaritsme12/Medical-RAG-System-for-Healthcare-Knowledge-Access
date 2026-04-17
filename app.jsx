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
