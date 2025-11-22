import React, { useState, useEffect } from 'react';
import ApiService from '../utils/api';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState({
    pageViews: 0,
    uniqueVisitors: 0,
    blogViews: 0,
    projectViews: 0,
    popularContent: []
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await ApiService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Fallback to mock data
      const mockData = {
        pageViews: 1000,
        uniqueVisitors: 500,
        blogViews: 300,
        projectViews: 200,
        totalContent: 0,
        popularContent: []
      };
      setAnalytics(mockData);
    }
  };

  return (
    <div className="analytics-dashboard">
      <h2>Analytics Overview</h2>
      
      <div className="analytics-grid">
        <div className="metric-card">
          <h3>{analytics.pageViews.toLocaleString()}</h3>
          <p>Total Page Views</p>
          <span className="trend positive">+12%</span>
        </div>
        
        <div className="metric-card">
          <h3>{analytics.uniqueVisitors.toLocaleString()}</h3>
          <p>Unique Visitors</p>
          <span className="trend positive">+8%</span>
        </div>
        
        <div className="metric-card">
          <h3>{analytics.blogViews.toLocaleString()}</h3>
          <p>Blog Views</p>
          <span className="trend positive">+15%</span>
        </div>
        
        <div className="metric-card">
          <h3>{analytics.projectViews.toLocaleString()}</h3>
          <p>Project Views</p>
          <span className="trend neutral">+3%</span>
        </div>
      </div>

      <div className="popular-content">
        <h3>Popular Content</h3>
        <div className="content-list">
          {analytics.popularContent.map((item, index) => (
            <div key={index} className="content-item">
              <div className="content-info">
                <span className="content-title">{item.title}</span>
                <span className="content-type">{item.type}</span>
              </div>
              <span className="content-views">{item.views} views</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;