import React, { useState, useEffect } from 'react';
import ApiService from '../utils/api';
import toast from 'react-hot-toast';

const BackupRestore = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getBackups();
      setBackups(data);
    } catch (error) {
      console.error('Failed to load backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      setCreating(true);
      await ApiService.createBackup();
      toast.success('Backup created successfully');
      loadBackups();
    } catch (error) {
      toast.error('Failed to create backup');
    } finally {
      setCreating(false);
    }
  };

  const restoreBackup = async (backupName) => {
    if (!window.confirm(`Are you sure you want to restore from ${backupName}? This will overwrite all current data.`)) {
      return;
    }

    try {
      await ApiService.restoreBackup(backupName);
      toast.success('Database restored successfully');
    } catch (error) {
      toast.error('Failed to restore backup');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="backup-restore">
      <div className="backup-header">
        <h2>Database Backup & Restore</h2>
        <button 
          onClick={createBackup}
          disabled={creating}
          className="btn btn-primary"
        >
          {creating ? 'Creating...' : 'Create Backup'}
        </button>
      </div>

      <div className="backup-info">
        <div className="info-card">
          <h3>⚠️ Important Notes</h3>
          <ul>
            <li>Backups include all database content (users, blogs, projects, etc.)</li>
            <li>Restoring will overwrite ALL current data</li>
            <li>Always create a backup before major changes</li>
            <li>Backups are stored locally on the server</li>
          </ul>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading backups...</div>
      ) : (
        <div className="backups-list">
          <h3>Available Backups ({backups.length})</h3>
          
          {backups.length === 0 ? (
            <div className="no-backups">
              <p>No backups available. Create your first backup above.</p>
            </div>
          ) : (
            <div className="backups-table">
              <table>
                <thead>
                  <tr>
                    <th>Backup Name</th>
                    <th>Size</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {backups.map(backup => (
                    <tr key={backup.name}>
                      <td className="backup-name">{backup.name}</td>
                      <td>{formatFileSize(backup.size)}</td>
                      <td>{new Date(backup.created).toLocaleString()}</td>
                      <td>
                        <button 
                          onClick={() => restoreBackup(backup.name)}
                          className="btn btn-warning btn-sm"
                        >
                          Restore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="backup-schedule">
        <h3>Backup Schedule</h3>
        <p>Consider setting up automated backups:</p>
        <ul>
          <li>Daily backups for active sites</li>
          <li>Weekly backups for stable sites</li>
          <li>Before major updates or changes</li>
        </ul>
      </div>
    </div>
  );
};

export default BackupRestore;