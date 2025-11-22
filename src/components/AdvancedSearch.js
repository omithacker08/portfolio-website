import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import './AdvancedSearch.css';

const AdvancedSearch = ({ onResults, placeholder = "Search everything..." }) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all', // all, blogs, projects, ai
    category: 'all',
    dateRange: 'all'
  });
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { blogs, projects, aiProjects } = useData();

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    const results = [];

    // Search blogs
    if (filters.type === 'all' || filters.type === 'blogs') {
      blogs.filter(blog => blog.approved).forEach(blog => {
        const score = calculateRelevance(blog, searchTerm, 'blog');
        if (score > 0) {
          results.push({ ...blog, type: 'blog', score });
        }
      });
    }

    // Search projects
    if (filters.type === 'all' || filters.type === 'projects') {
      projects.forEach(project => {
        const score = calculateRelevance(project, searchTerm, 'project');
        if (score > 0) {
          results.push({ ...project, type: 'project', score });
        }
      });
    }

    // Search AI projects
    if (filters.type === 'all' || filters.type === 'ai') {
      aiProjects.forEach(aiProject => {
        const score = calculateRelevance(aiProject, searchTerm, 'ai');
        if (score > 0) {
          results.push({ ...aiProject, type: 'ai', score });
        }
      });
    }

    // Sort by relevance score
    return results.sort((a, b) => b.score - a.score).slice(0, 10);
  }, [query, filters, blogs, projects, aiProjects]);

  const calculateRelevance = (item, searchTerm, type) => {
    let score = 0;
    
    // Title/Name match (highest priority)
    const title = (item.title || item.name || item.useCase || '').toLowerCase();
    if (title.includes(searchTerm)) {
      score += title.startsWith(searchTerm) ? 100 : 50;
    }

    // Content/Description match
    const content = (item.content || item.problemStatement || item.summary || '').toLowerCase();
    if (content.includes(searchTerm)) {
      score += 20;
    }

    // Tags/Technologies match
    const tags = (item.tags || item.technologies || '').toLowerCase();
    if (tags.includes(searchTerm)) {
      score += 30;
    }

    // Exact word matches get bonus
    const words = searchTerm.split(' ');
    words.forEach(word => {
      if (title.split(' ').includes(word)) score += 10;
      if (content.split(' ').includes(word)) score += 5;
    });

    return score;
  };

  useEffect(() => {
    if (onResults) {
      onResults(searchResults);
    }
  }, [searchResults, onResults]);

  return (
    <div className={`advanced-search ${isExpanded ? 'expanded' : ''}`}>
      <div className="search-input-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="search-input"
        />
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="search-filter-toggle"
          title="Advanced filters"
        >
          🔍
        </button>
      </div>

      {isExpanded && (
        <div className="search-filters">
          <div className="filter-group">
            <label>Content Type</label>
            <select 
              value={filters.type} 
              onChange={(e) => setFilters({...filters, type: e.target.value})}
            >
              <option value="all">All Content</option>
              <option value="blogs">Blog Posts</option>
              <option value="projects">Projects</option>
              <option value="ai">AI Solutions</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Date Range</label>
            <select 
              value={filters.dateRange} 
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
            >
              <option value="all">All Time</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="year">Past Year</option>
            </select>
          </div>
        </div>
      )}

      {query && searchResults.length > 0 && (
        <div className="search-results">
          <div className="results-header">
            <span>{searchResults.length} results found</span>
          </div>
          {searchResults.map((result, index) => (
            <div key={`${result.type}-${result.id}`} className="search-result-item">
              <div className="result-type">{result.type}</div>
              <div className="result-content">
                <h4>{result.title || result.name || result.useCase}</h4>
                <p>{(result.excerpt || result.problemStatement || result.summary || '').substring(0, 120)}...</p>
              </div>
              <div className="result-score">{Math.round(result.score)}%</div>
            </div>
          ))}
        </div>
      )}

      {query && searchResults.length === 0 && (
        <div className="no-results">
          <p>No results found for "{query}"</p>
          <small>Try different keywords or check your spelling</small>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;