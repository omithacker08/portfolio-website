import React, { useState, useEffect } from 'react';
import ApiService from '../utils/api';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadLogs();
  }, [page]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getAdminLogs(page);
      setLogs(data);
    } catch (error) {
      console.error('Failed to load admin logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      'CREATE_BLOG': '📝',
      'APPROVE_BLOG': '✅',
      'REJECT_BLOG': '❌',
      'DELETE_BLOG': '🗑️',
      'BULK_APPROVE_BLOGS': '✅📚',
      'BULK_DELETE_BLOGS': '🗑️📚',
      'CREATE_TEMPLATE': '📋',
      'DELETE_TEMPLATE': '🗑️📋',
      'CREATE_BACKUP': '💾',
      'RESTORE_BACKUP': '🔄',
      'UPDATE_CONFIG': '⚙️',
      'CREATE_USER': '👤',
      'DELETE_USER': '🗑️👤'
    };
    return icons[action] || '📋';
  };

  const getActionColor = (action) => {
    if (action.includes('DELETE')) return 'danger';
    if (action.includes('APPROVE')) return 'success';
    if (action.includes('REJECT')) return 'warning';
    if (action.includes('CREATE')) return 'primary';
    return 'secondary';
  };

  if (loading) {
    return <div className="loading">Loading admin logs...</div>;
  }

  return (
    <div className="admin-logs">
      <div className="logs-header">
        <h2>Admin Activity Log</h2>
        <p>Track all administrative actions performed on the system</p>
      </div>

      <div className="logs-list">
        {logs.map(log => (
          <div key={log.id} className="log-entry">
            <div className="log-icon">
              {getActionIcon(log.action)}
            </div>
            
            <div className="log-content">
              <div className="log-main">
                <span className="log-admin">{log.admin_name}</span>
                <span className={`log-action ${getActionColor(log.action)}`}>
                  {log.action.replace(/_/g, ' ').toLowerCase()}
                </span>
                {log.target_type && (
                  <span className="log-target">
                    on {log.target_type} {log.target_id && `#${log.target_id}`}
                  </span>
                )}
              </div>
              
              <div className="log-meta">
                <span className="log-time">
                  {new Date(log.created_at).toLocaleString()}
                </span>
                <span className="log-ip">
                  IP: {log.ip_address}
                </span>
              </div>
              
              {log.details && Object.keys(log.details).length > 0 && (
                <div className="log-details">
                  <details>
                    <summary>View Details</summary>
                    <pre>{JSON.stringify(log.details, null, 2)}</pre>
                  </details>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="logs-pagination">
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="btn btn-secondary"
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button 
          onClick={() => setPage(p => p + 1)}
          disabled={logs.length < 50}
          className="btn btn-secondary"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminLogs;