import React, { useState } from 'react';
import ApiService from '../utils/api';
import toast from 'react-hot-toast';

const BulkOperations = ({ items, type, onUpdate }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(items.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleBulkAction = async (action) => {
    if (selectedItems.length === 0) {
      toast.error('Please select items first');
      return;
    }

    if (!window.confirm(`Are you sure you want to ${action} ${selectedItems.length} items?`)) {
      return;
    }

    setIsProcessing(true);
    try {
      await ApiService.bulkOperation(type, action, selectedItems);
      toast.success(`${selectedItems.length} items ${action}d successfully`);
      setSelectedItems([]);
      onUpdate();
    } catch (error) {
      toast.error(`Failed to ${action} items: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bulk-operations">
      <div className="bulk-header">
        <label className="select-all">
          <input
            type="checkbox"
            checked={selectedItems.length === items.length && items.length > 0}
            onChange={handleSelectAll}
          />
          Select All ({selectedItems.length} selected)
        </label>
        
        {selectedItems.length > 0 && (
          <div className="bulk-actions">
            {type === 'blogs' && (
              <>
                <button 
                  onClick={() => handleBulkAction('approve')}
                  disabled={isProcessing}
                  className="btn btn-success btn-sm"
                >
                  Approve Selected
                </button>
                <button 
                  onClick={() => handleBulkAction('reject')}
                  disabled={isProcessing}
                  className="btn btn-warning btn-sm"
                >
                  Reject Selected
                </button>
              </>
            )}
            <button 
              onClick={() => handleBulkAction('delete')}
              disabled={isProcessing}
              className="btn btn-danger btn-sm"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      <div className="items-list">
        {items.map(item => (
          <div key={item.id} className={`item-row ${selectedItems.includes(item.id) ? 'selected' : ''}`}>
            <label className="item-checkbox">
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={() => handleSelectItem(item.id)}
              />
            </label>
            <div className="item-content">
              <h4>{item.title || item.name}</h4>
              <p>{item.excerpt || item.description}</p>
              <span className="item-meta">
                {item.created_at && new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BulkOperations;