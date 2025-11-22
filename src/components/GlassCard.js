import React from 'react';
import './GlassCard.css';

const GlassCard = ({ children, className = '', blur = 'medium', ...props }) => {
  return (
    <div className={`glass-card blur-${blur} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default GlassCard;