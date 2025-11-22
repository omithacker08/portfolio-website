import React, { useState } from 'react';
import toast from 'react-hot-toast';
import './SocialShare.css';

const SocialShare = ({ url, title, description, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  const shareUrl = url || window.location.href;
  const shareTitle = title || document.title;
  const shareDescription = description || 'Check out this amazing content!';

  const shareOptions = [
    {
      name: 'Twitter',
      icon: '🐦',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
      color: '#1DA1F2'
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: '#0077B5'
    },
    {
      name: 'Facebook',
      icon: '📘',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: '#1877F2'
    },
    {
      name: 'WhatsApp',
      icon: '💬',
      url: `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`,
      color: '#25D366'
    }
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl
        });
        toast.success('Content shared successfully!');
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast.error('Failed to share content');
        }
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleSocialShare = (option) => {
    window.open(option.url, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  return (
    <div className={`social-share ${className || ''}`}>
      <button 
        className="share-trigger"
        onClick={handleNativeShare}
        title="Share this content"
      >
        <span className="share-icon">📤</span>
        <span className="share-text">Share</span>
      </button>

      {isOpen && !navigator.share && (
        <div className="share-dropdown">
          <div className="share-header">
            <h4>Share this content</h4>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="share-options">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                className="share-option"
                onClick={() => handleSocialShare(option)}
                style={{ '--option-color': option.color }}
              >
                <span className="option-icon">{option.icon}</span>
                <span className="option-name">{option.name}</span>
              </button>
            ))}
          </div>

          <div className="share-actions">
            <button 
              className="copy-link-btn"
              onClick={handleCopyLink}
            >
              <span className="copy-icon">🔗</span>
              Copy Link
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div 
          className="share-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default SocialShare;