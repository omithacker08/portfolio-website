import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes, applyTheme, applyTechnicalTheme } from '../themes/themes';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('technical');

  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    const savedDarkMode = localStorage.getItem('theme');
    
    if (savedDarkMode) {
      setIsDark(savedDarkMode === 'dark');
    } else {
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
      if (savedTheme === 'technical') {
        applyTechnicalTheme();
      } else {
        applyTheme(savedTheme);
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const changeTheme = (themeKey) => {
    if (themes[themeKey]) {
      setCurrentTheme(themeKey);
      
      // Clear all theme classes first
      document.body.className = document.body.className.replace(/theme-\w+/g, '');
      
      if (themeKey === 'technical') {
        applyTechnicalTheme();
      } else {
        applyTheme(themeKey);
      }
    }
  };

  const value = {
    isDark,
    toggleTheme,
    currentTheme,
    changeTheme,
    themes,
    availableThemes: Object.keys(themes).map(key => ({
      key,
      ...themes[key]
    }))
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};