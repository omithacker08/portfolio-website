import React, { useState, useEffect } from 'react';
import ApiService from '../utils/api';
import toast from 'react-hot-toast';

const ContactMessagesTab = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const data = await ApiService.getContactMessages();
      setMessages(data);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await ApiService.markMessageAsRead(messageId);
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, read_status: 1 } : msg
      ));
      toast.success('Message marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  if (loading) {
    return <div className="loading">Loading messages...</div>;
  }

  return (
    <div className="contact-messages">
      <h2>Contact Messages</h2>
      <div className="messages-stats">
        <div className="stat-card">
          <h3>{messages.length}</h3>
          <p>Total Messages</p>
        </div>
        <div className="stat-card">
          <h3>{messages.filter(msg => !msg.read_status).length}</h3>
          <p>Unread</p>
        </div>
        <div className="stat-card">
          <h3>{messages.filter(msg => msg.read_status).length}</h3>
          <p>Read</p>
        </div>
      </div>

      <div className="messages-list">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>No messages yet</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`message-item ${!message.read_status ? 'unread' : ''}`}
            >
              <div className="message-header">
                <div className="message-info">
                  <h4>{message.name}</h4>
                  <p>{message.email}</p>
                  <span className="message-date">
                    {new Date(message.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="message-actions">
                  {!message.read_status && (
                    <button
                      onClick={() => markAsRead(message.id)}
                      className="btn btn-primary btn-sm"
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedMessage(selectedMessage?.id === message.id ? null : message)}
                    className="btn btn-secondary btn-sm"
                  >
                    {selectedMessage?.id === message.id ? 'Hide' : 'View'}
                  </button>
                </div>
              </div>
              
              <div className="message-subject">
                <strong>Subject:</strong> {message.subject}
              </div>
              
              {selectedMessage?.id === message.id && (
                <div className="message-content">
                  <div className="message-body">
                    <strong>Message:</strong>
                    <p>{message.message}</p>
                  </div>
                  <div className="message-reply">
                    <a 
                      href={`mailto:${message.email}?subject=Re: ${message.subject}`}
                      className="btn btn-primary"
                    >
                      Reply via Email
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ContactMessagesTab;