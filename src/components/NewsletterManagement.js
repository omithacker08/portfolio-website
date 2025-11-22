import React, { useState, useEffect } from 'react';
import ApiService from '../utils/api';
import toast from 'react-hot-toast';

const NewsletterTab = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    try {
      const data = await ApiService.getNewsletterSubscribers();
      setSubscribers(data);
    } catch (error) {
      toast.error('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  const exportSubscribers = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Email,Name,Subscribed Date\n"
      + subscribers.map(sub => 
          `${sub.email},${sub.name || ''},${new Date(sub.created_at).toLocaleDateString()}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "newsletter_subscribers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Subscribers exported successfully');
  };

  if (loading) {
    return <div className="loading">Loading subscribers...</div>;
  }

  return (
    <div className="newsletter-management">
      <h2>Newsletter Subscribers</h2>
      
      <div className="newsletter-stats">
        <div className="stat-card">
          <h3>{subscribers.length}</h3>
          <p>Total Subscribers</p>
        </div>
        <div className="stat-card">
          <h3>{subscribers.filter(sub => 
            new Date(sub.created_at) > new Date(Date.now() - 30*24*60*60*1000)
          ).length}</h3>
          <p>This Month</p>
        </div>
        <div className="stat-card">
          <h3>{subscribers.filter(sub => 
            new Date(sub.created_at) > new Date(Date.now() - 7*24*60*60*1000)
          ).length}</h3>
          <p>This Week</p>
        </div>
      </div>

      <div className="newsletter-actions">
        <button 
          onClick={exportSubscribers}
          className="btn btn-primary"
          disabled={subscribers.length === 0}
        >
          Export Subscribers
        </button>
      </div>

      <div className="subscribers-list">
        {subscribers.length === 0 ? (
          <div className="empty-state">
            <p>No subscribers yet</p>
          </div>
        ) : (
          <div className="subscribers-table">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Subscribed Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id}>
                    <td>{subscriber.email}</td>
                    <td>{subscriber.name || 'N/A'}</td>
                    <td>{new Date(subscriber.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${subscriber.subscribed ? 'active' : 'inactive'}`}>
                        {subscriber.subscribed ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterTab;