import React, { useState } from 'react';
import FormField from './FormField';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';
import ApiService from '../utils/api';
import './NewsletterSignup.css';

const NewsletterSignup = ({ className }) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      await ApiService.subscribeNewsletter(email);
      setIsSubscribed(true);
      toast.success('Successfully subscribed to newsletter!');
      setEmail('');
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className={`newsletter-signup success ${className || ''}`}>
        <div className="success-content">
          <div className="success-icon">✅</div>
          <h3>You're all set!</h3>
          <p>Thank you for subscribing. You'll receive updates about new posts and projects.</p>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setIsSubscribed(false)}
          >
            Subscribe Another Email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`newsletter-signup ${className || ''}`}>
      <div className="newsletter-content">
        <div className="newsletter-header">
          <h3>Stay Updated</h3>
          <p>Get notified about new blog posts, projects, and insights</p>
        </div>

        <form onSubmit={handleSubmit} className="newsletter-form">
          <div className="form-row">
            <FormField
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              validation={{
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
              }}
              required
            />
            <button 
              type="submit" 
              className="btn btn-primary newsletter-btn"
              disabled={loading || !email}
            >
              {loading ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  Subscribe
                  <span className="btn-icon">📧</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="newsletter-benefits">
          <div className="benefit-item">
            <span className="benefit-icon">📝</span>
            <span>New blog posts</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🚀</span>
            <span>Project updates</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">💡</span>
            <span>Tech insights</span>
          </div>
        </div>

        <p className="newsletter-privacy">
          No spam, unsubscribe anytime. Your privacy is important to us.
        </p>
      </div>
    </div>
  );
};

export default NewsletterSignup;