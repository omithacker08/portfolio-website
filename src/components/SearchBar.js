import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import './SearchBar.css';

const SearchBar = ({ onResults, placeholder = "Search blogs, projects..." }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const { blogs, projects, aiProjects } = useData();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    const searchTimeout = setTimeout(() => {
      performSearch(query);
      setLoading(false);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, blogs, projects, aiProjects]);

  const performSearch = (searchQuery) => {
    const searchTerm = searchQuery.toLowerCase();
    const searchResults = [];

    // Search blogs
    blogs.filter(blog => blog.approved).forEach(blog => {
      const score = calculateRelevance(blog, searchTerm, 'blog');
      if (score > 0) {
        searchResults.push({ ...blog, type: 'blog', score });
      }
    });

    // Search projects
    projects.forEach(project => {
      const score = calculateRelevance(project, searchTerm, 'project');
      if (score > 0) {
        searchResults.push({ ...project, type: 'project', score });
      }
    });

    // Search AI projects
    aiProjects.forEach(aiProject => {
      const score = calculateRelevance(aiProject, searchTerm, 'ai-project');
      if (score > 0) {
        searchResults.push({ ...aiProject, type: 'ai-project', score });
      }
    });

    // Sort by relevance score
    const sortedResults = searchResults
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    setResults(sortedResults);
    setIsOpen(sortedResults.length > 0);
    
    if (onResults) {
      onResults(sortedResults);
    }
  };

  const calculateRelevance = (item, searchTerm, type) => {
    let score = 0;
    
    // Title/Name match (highest priority)
    const title = (item.title || item.name || '').toLowerCase();
    if (title.includes(searchTerm)) {
      score += title.startsWith(searchTerm) ? 10 : 5;
    }

    // Content/Description match
    const content = (item.content || item.problem_statement || item.problemStatement || '').toLowerCase();
    if (content.includes(searchTerm)) {
      score += 3;
    }

    // Tags/Technologies match
    const tags = (item.tags || item.technologies || '').toLowerCase();
    if (tags.includes(searchTerm)) {
      score += 4;
    }

    // Domain match (for projects)
    const domain = (item.domain || '').toLowerCase();
    if (domain.includes(searchTerm)) {
      score += 3;
    }

    return score;
  };

  const handleResultClick = (result) => {
    setIsOpen(false);
    setQuery('');
    
    // Navigate to appropriate page
    const routes = {
      'blog': '/blog',
      'project': '/projects',
      'ai-project': '/ai'
    };
    
    window.location.href = routes[result.type] || '/';
  };

  const getResultIcon = (type) => {
    const icons = {
      'blog': '📝',
      'project': '🚀',
      'ai-project': '🤖'
    };
    return icons[type] || '📄';
  };

  const getResultTitle = (result) => {
    return result.title || result.name || result.use_case || 'Untitled';
  };

  const getResultDescription = (result) => {
    const desc = result.excerpt || result.problem_statement || result.problemStatement || result.content || '';
    return desc.replace(/<[^>]*>/g, '').substring(0, 100) + (desc.length > 100 ? '...' : '');
  };

  return (
    <div className="search-bar" ref={searchRef}>
      <div className="search-input-container">
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
        <div className="search-icon">
          {loading ? (
            <div className="search-spinner">⏳</div>
          ) : (
            <span>🔍</span>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="search-results">
          <div className="search-results-header">
            <span>Search Results ({results.length})</span>
            {query && (
              <button 
                className="clear-search"
                onClick={() => {
                  setQuery('');
                  setIsOpen(false);
                }}
              >
                Clear
              </button>
            )}
          </div>

          <div className="search-results-list">
            {results.map((result, index) => (
              <div
                key={`${result.type}-${result.id}-${index}`}
                className="search-result-item"
                onClick={() => handleResultClick(result)}
              >
                <div className="result-icon">
                  {getResultIcon(result.type)}
                </div>
                <div className="result-content">
                  <h4 className="result-title">
                    {getResultTitle(result)}
                  </h4>
                  <p className="result-description">
                    {getResultDescription(result)}
                  </p>
                  <div className="result-meta">
                    <span className="result-type">
                      {result.type.replace('-', ' ')}
                    </span>
                    {result.tags && (
                      <span className="result-tags">
                        {result.tags.split(',').slice(0, 2).map(tag => tag.trim()).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {results.length === 0 && query.length >= 2 && !loading && (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <p>No results found for "{query}"</p>
              <small>Try different keywords or check spelling</small>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;