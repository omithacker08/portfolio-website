import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import toast from 'react-hot-toast';

const AdminSimple = () => {
  const { user, isAdmin } = useAuth();
  const { siteConfig, blogs, projects, aiProjects } = useData();
  const [activeTab, setActiveTab] = useState('overview');

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <div className="container">
          <h2>Access Denied</h2>
          <p>You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="container">
        <h1>Admin Dashboard</h1>
        
        <div className="admin-tabs">
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={activeTab === 'blogs' ? 'active' : ''}
            onClick={() => setActiveTab('blogs')}
          >
            Blogs
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'overview' && (
            <div>
              <h2>System Overview</h2>
              <div className="stats">
                <div className="stat-card">
                  <h3>{blogs?.length || 0}</h3>
                  <p>Total Blogs</p>
                </div>
                <div className="stat-card">
                  <h3>{projects?.length || 0}</h3>
                  <p>Projects</p>
                </div>
                <div className="stat-card">
                  <h3>{aiProjects?.length || 0}</h3>
                  <p>AI Projects</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'blogs' && (
            <div>
              <h2>Blog Management</h2>
              <div className="blog-list">
                {blogs?.map(blog => (
                  <div key={blog.id} className="blog-item">
                    <h4>{blog.title}</h4>
                    <p>Status: {blog.approved ? 'Approved' : 'Pending'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSimple;