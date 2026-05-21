import React from 'react';
import './ErrorBoundary.css';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-card">
            <h2>⚠️ Something went wrong</h2>
            <p className="error-message">{this.state.error?.message}</p>
            <button onClick={this.reset} className="btn-retry">
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
