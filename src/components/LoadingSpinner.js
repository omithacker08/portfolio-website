import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', text, className }) => {
  return (
    <div className={`loading-spinner-container ${className || ''}`}>
      <div className={`loading-spinner ${size}`}>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export const SkeletonCard = ({ className }) => (
  <div className={`skeleton-card ${className || ''}`}>
    <div className="skeleton-header">
      <div className="skeleton-avatar"></div>
      <div className="skeleton-lines">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line skeleton-subtitle"></div>
      </div>
    </div>
    <div className="skeleton-content">
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line skeleton-short"></div>
    </div>
  </div>
);

export const SkeletonList = ({ count = 3, className }) => (
  <div className={`skeleton-list ${className || ''}`}>
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
);

export default LoadingSpinner;