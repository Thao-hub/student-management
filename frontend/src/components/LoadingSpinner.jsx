import React from 'react';
import './LoadingSpinner.css';

export const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>{text}</p>
      </div>
    </div>
  );
};
