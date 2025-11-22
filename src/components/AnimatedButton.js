import React, { useState } from 'react';
import './AnimatedButton.css';

const AnimatedButton = ({ children, onClick, className = '', variant = 'primary', ...props }) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e) => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);
    if (onClick) onClick(e);
  };

  return (
    <button
      className={`animated-btn ${variant} ${className} ${isClicked ? 'clicked' : ''}`}
      onClick={handleClick}
      {...props}
    >
      <span className="btn-content">{children}</span>
      <div className="btn-ripple"></div>
    </button>
  );
};

export default AnimatedButton;