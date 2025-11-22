import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import SearchBar from './SearchBar';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { siteConfig } = useData();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/projects', label: 'Work' },
    { path: '/ai', label: 'AI' },
    { path: '/blog', label: 'Blog' },
    { path: '/resume', label: 'Resume' },
    { path: '/contact', label: 'Contact' }
  ];

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="header-content">
          <Link to="/" className="logo">
            <div className="logo-avatar">
              <span>JD</span>
            </div>
            <div className="logo-info">
              <span className="logo-name">{siteConfig?.site_name || 'John Doe'}</span>
              <span className="logo-title">{siteConfig?.tagline || 'Full Stack Developer'}</span>
            </div>
          </Link>

          <nav className={`nav ${isMobileMenuOpen ? 'nav-open' : ''}`}>
            <div className="nav-backdrop" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="nav-content">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="header-search">
            <SearchBar placeholder="Search..." />
          </div>

          <div className="header-actions">
            <button 
              onClick={toggleTheme} 
              className="theme-toggle"
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {isAuthenticated ? (
              <div className="user-menu">
                <div className="user-avatar">
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="user-dropdown">
                  <div className="dropdown-content">
                    <div className="user-info">
                      <span className="user-name">{user.name}</span>
                      <span className="user-role">{user.role}</span>
                    </div>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="dropdown-item">
                        <span>⚙️</span>
                        Admin Panel
                      </Link>
                    )}
                    <button onClick={logout} className="dropdown-item logout">
                      <span>👋</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/auth" className="auth-button">
                Sign In
              </Link>
            )}

            <button
              className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;