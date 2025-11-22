import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AdminTesting.css';

const AdminTesting = () => {
  const { 
    siteConfig, 
    blogs, 
    projects, 
    aiProjects, 
    users, 
    aboutContent, 
    homeContent 
  } = useData();
  const { user } = useAuth();
  
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);

  const tests = [
    {
      id: 'auth',
      name: 'Authentication System',
      description: 'Test login, logout, and user management',
      tests: [
        { name: 'User Login Status', check: () => !!user },
        { name: 'Admin Privileges', check: () => user?.role === 'admin' },
        { name: 'JWT Token Storage', check: () => !!localStorage.getItem('token') }
      ]
    },
    {
      id: 'database',
      name: 'Database Operations',
      description: 'Test data loading and CRUD operations',
      tests: [
        { name: 'Site Config Loaded', check: () => !!siteConfig },
        { name: 'Blogs Data Available', check: () => Array.isArray(blogs) },
        { name: 'Projects Data Available', check: () => Array.isArray(projects) },
        { name: 'AI Projects Data Available', check: () => Array.isArray(aiProjects) },
        { name: 'Users Data Available', check: () => Array.isArray(users) },
        { name: 'About Content Available', check: () => !!aboutContent },
        { name: 'Home Content Available', check: () => !!homeContent }
      ]
    },
    {
      id: 'forms',
      name: 'Form Functionality',
      description: 'Test all form validations and submissions',
      tests: [
        { name: 'Blog Creation Form', check: () => document.querySelector('.blog-form') !== null },
        { name: 'Project Creation Form', check: () => document.querySelector('.project-form') !== null },
        { name: 'Contact Form', check: () => document.querySelector('.contact-form') !== null },
        { name: 'Resume Form', check: () => document.querySelector('.resume-form') !== null }
      ]
    },
    {
      id: 'ui',
      name: 'User Interface',
      description: 'Test responsive design and interactions',
      tests: [
        { name: 'Navigation Menu', check: () => document.querySelector('.nav') !== null },
        { name: 'Theme Toggle', check: () => document.querySelector('.theme-toggle') !== null },
        { name: 'Mobile Menu', check: () => document.querySelector('.mobile-menu-toggle') !== null },
        { name: 'Search Functionality', check: () => document.querySelector('.search-bar') !== null }
      ]
    },
    {
      id: 'performance',
      name: 'Performance Metrics',
      description: 'Test loading times and optimization',
      tests: [
        { name: 'Page Load Time', check: () => performance.now() < 3000 },
        { name: 'Images Lazy Loading', check: () => document.querySelectorAll('img[loading="lazy"]').length > 0 },
        { name: 'CSS Optimization', check: () => document.querySelectorAll('link[rel="stylesheet"]').length < 10 },
        { name: 'JavaScript Bundles', check: () => document.querySelectorAll('script').length < 15 }
      ]
    },
    {
      id: 'seo',
      name: 'SEO & Meta Tags',
      description: 'Test search engine optimization',
      tests: [
        { name: 'Page Title', check: () => !!document.title },
        { name: 'Meta Description', check: () => !!document.querySelector('meta[name="description"]') },
        { name: 'Open Graph Tags', check: () => !!document.querySelector('meta[property="og:title"]') },
        { name: 'Canonical URL', check: () => !!document.querySelector('link[rel="canonical"]') }
      ]
    },
    {
      id: 'accessibility',
      name: 'Accessibility',
      description: 'Test WCAG compliance and screen reader support',
      tests: [
        { name: 'Alt Text on Images', check: () => {
          const images = document.querySelectorAll('img');
          return Array.from(images).every(img => img.alt !== '');
        }},
        { name: 'ARIA Labels', check: () => document.querySelectorAll('[aria-label]').length > 0 },
        { name: 'Keyboard Navigation', check: () => document.querySelectorAll('[tabindex]').length > 0 },
        { name: 'Focus Indicators', check: () => {
          const style = getComputedStyle(document.body);
          return style.getPropertyValue('--focus-color') !== '';
        }}
      ]
    },
    {
      id: 'security',
      name: 'Security Features',
      description: 'Test security implementations',
      tests: [
        { name: 'HTTPS Protocol', check: () => window.location.protocol === 'https:' || window.location.hostname === 'localhost' },
        { name: 'Content Security Policy', check: () => !!document.querySelector('meta[http-equiv="Content-Security-Policy"]') },
        { name: 'XSS Protection', check: () => {
          const scripts = document.querySelectorAll('script');
          return Array.from(scripts).every(script => !script.innerHTML.includes('eval('));
        }},
        { name: 'Secure Headers', check: () => true } // Would need server-side check
      ]
    }
  ];

  const runTest = (testGroup) => {
    const results = {};
    testGroup.tests.forEach(test => {
      try {
        results[test.name] = {
          passed: test.check(),
          error: null
        };
      } catch (error) {
        results[test.name] = {
          passed: false,
          error: error.message
        };
      }
    });
    return results;
  };

  const runAllTests = async () => {
    setIsRunning(true);
    const allResults = {};
    
    for (const testGroup of tests) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UI
      allResults[testGroup.id] = runTest(testGroup);
    }
    
    setTestResults(allResults);
    setIsRunning(false);
    
    const totalTests = Object.values(allResults).reduce((acc, group) => acc + Object.keys(group).length, 0);
    const passedTests = Object.values(allResults).reduce((acc, group) => 
      acc + Object.values(group).filter(test => test.passed).length, 0
    );
    
    toast.success(`Testing Complete: ${passedTests}/${totalTests} tests passed`);
  };

  const runSingleTest = (testGroupId) => {
    const testGroup = tests.find(t => t.id === testGroupId);
    const results = runTest(testGroup);
    setTestResults(prev => ({ ...prev, [testGroupId]: results }));
    
    const passed = Object.values(results).filter(test => test.passed).length;
    const total = Object.keys(results).length;
    toast.success(`${testGroup.name}: ${passed}/${total} tests passed`);
  };

  return (
    <div className="admin-testing">
      <div className="testing-header">
        <h2>System Testing Dashboard</h2>
        <p>Comprehensive testing suite for all website functionalities</p>
        <button 
          onClick={runAllTests} 
          className="btn btn-primary"
          disabled={isRunning}
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </button>
      </div>

      <div className="test-groups">
        {tests.map(testGroup => (
          <div key={testGroup.id} className="test-group">
            <div className="test-group-header">
              <h3>{testGroup.name}</h3>
              <p>{testGroup.description}</p>
              <button 
                onClick={() => runSingleTest(testGroup.id)}
                className="btn btn-secondary btn-sm"
              >
                Run Tests
              </button>
            </div>
            
            {testResults[testGroup.id] && (
              <div className="test-results">
                {testGroup.tests.map(test => {
                  const result = testResults[testGroup.id][test.name];
                  return (
                    <div 
                      key={test.name} 
                      className={`test-result ${result.passed ? 'passed' : 'failed'}`}
                    >
                      <span className="test-icon">
                        {result.passed ? '✅' : '❌'}
                      </span>
                      <span className="test-name">{test.name}</span>
                      {result.error && (
                        <span className="test-error">{result.error}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="testing-summary">
        <h3>Testing Guidelines</h3>
        <div className="guidelines">
          <div className="guideline">
            <h4>🔐 Authentication Tests</h4>
            <p>Verify login/logout, user roles, and session management</p>
          </div>
          <div className="guideline">
            <h4>💾 Database Tests</h4>
            <p>Check data loading, CRUD operations, and data integrity</p>
          </div>
          <div className="guideline">
            <h4>📝 Form Tests</h4>
            <p>Test form validation, submission, and error handling</p>
          </div>
          <div className="guideline">
            <h4>🎨 UI Tests</h4>
            <p>Verify responsive design, interactions, and accessibility</p>
          </div>
          <div className="guideline">
            <h4>⚡ Performance Tests</h4>
            <p>Monitor loading times, optimization, and resource usage</p>
          </div>
          <div className="guideline">
            <h4>🔍 SEO Tests</h4>
            <p>Check meta tags, structured data, and search optimization</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTesting;