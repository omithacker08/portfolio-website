import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import LiveChat from './components/LiveChat';
import BottomNav from './components/BottomNav';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import './themes/theme-styles.css';
import './scrollbar.css';
import './animations.css';

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home'));
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Blog = React.lazy(() => import('./pages/Blog'));
const Projects = React.lazy(() => import('./pages/Projects'));
const AI = React.lazy(() => import('./pages/AI'));
const Resume = React.lazy(() => import('./pages/Resume'));
const Auth = React.lazy(() => import('./pages/Auth'));
const Admin = React.lazy(() => import('./pages/Admin'));

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <Router>
              <div className="App">
                <Header />
                <main>
                <Suspense fallback={
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '60vh' 
                  }}>
                    <LoadingSpinner size="large" text="Loading page..." />
                  </div>
                }>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/ai" element={<AI />} />
                    <Route path="/resume" element={<Resume />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/admin" element={<Admin />} />
                  </Routes>
                </Suspense>
              </main>
              <LiveChat />
              <BottomNav />
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius, 8px)',
                  },
                }}
              />
            </div>
          </Router>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;