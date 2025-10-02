import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="skeleton-card mb-3">
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text" style={{ width: '70%' }}></div>
          </div>
        );
      
      case 'menu-item':
        return (
          <div className="card mb-3">
            <div className="card-body">
              <div className="skeleton skeleton-title mb-3"></div>
              <div className="skeleton skeleton-text mb-2"></div>
              <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
              <div className="d-flex gap-2 mt-3">
                <div className="skeleton" style={{ width: '80px', height: '36px' }}></div>
                <div className="skeleton flex-grow-1" style={{ height: '36px' }}></div>
              </div>
            </div>
          </div>
        );
      
      case 'table-row':
        return (
          <tr>
            <td><div className="skeleton skeleton-text"></div></td>
            <td><div className="skeleton skeleton-text"></div></td>
            <td><div className="skeleton skeleton-text"></div></td>
            <td><div className="skeleton skeleton-text"></div></td>
          </tr>
        );
      
      case 'list-item':
        return (
          <div className="d-flex align-items-center gap-3 p-3 border-bottom">
            <div className="skeleton skeleton-avatar"></div>
            <div className="flex-grow-1">
              <div className="skeleton skeleton-text mb-2"></div>
              <div className="skeleton skeleton-text" style={{ width: '70%' }}></div>
            </div>
          </div>
        );
      
      case 'kpi-card':
        return (
          <div className="card">
            <div className="card-body">
              <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '12px', marginBottom: '1rem' }}></div>
              <div className="skeleton skeleton-title mb-2" style={{ width: '80%' }}></div>
              <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className="skeleton skeleton-text"></div>
        );
      
      default:
        return (
          <div className="skeleton skeleton-text"></div>
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="fade-in">
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};

export default SkeletonLoader;
