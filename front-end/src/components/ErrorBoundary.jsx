import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050508] flex items-center 
                        justify-center flex-col gap-4">
          <h2 className="text-2xl font-bold gradient-text">
            Something went wrong
          </h2>
          <p className="text-[#71717a] text-sm">
            Please refresh the page
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary">
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
