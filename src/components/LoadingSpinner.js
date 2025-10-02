import React from 'react';

const LoadingSpinner = ({ size = 'normal', centered = false, overlay = false, message = '' }) => {
  const sizeClass = {
    small: 'loading-spinner-small',
    normal: '',
    large: 'loading-spinner-large',
  }[size] || '';

  const spinner = (
    <div className={`loading-spinner ${sizeClass}`}></div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay fade-in">
        <div className="text-center">
          {spinner}
          {message && <div className="mt-3 text-muted">{message}</div>}
        </div>
      </div>
    );
  }

  if (centered) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center p-4">
        {spinner}
        {message && <div className="mt-3 text-muted">{message}</div>}
      </div>
    );
  }

  return (
    <div className="d-inline-flex align-items-center gap-2">
      {spinner}
      {message && <span className="text-muted">{message}</span>}
    </div>
  );
};

export default LoadingSpinner;
