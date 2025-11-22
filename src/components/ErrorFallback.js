import React from 'react';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div style={{
      padding: '20px',
      textAlign: 'center',
      background: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      margin: '20px'
    }}>
      <h2>Something went wrong</h2>
      <p>We're sorry, but something unexpected happened.</p>
      <button 
        onClick={resetErrorBoundary}
        style={{
          padding: '8px 16px',
          background: 'var(--primary-color)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Try again
      </button>
    </div>
  );
};

export default ErrorFallback;