import React, { useState, useEffect } from 'react';
import './DarkModeToggle.css';

const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return saved ? JSON.parse(saved) : prefersDark;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('darkMode', JSON.stringify(isDark));
  }, [isDark]);

  return (
    <button 
      className={`dark-mode-toggle ${isDark ? 'dark' : 'light'}`}
      onClick={() => setIsDark(!isDark)}
      aria-label="Toggle dark mode"
    >
      <span className="toggle-icon">
        {isDark ? '☀️' : '🌙'}
      </span>
    </button>
  );
};

export default DarkModeToggle;