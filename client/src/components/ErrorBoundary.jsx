import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // In a real production app, we would log this to Sentry or LogRocket
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-surface-container-low p-8 rounded-2xl border border-outline-variant/20 shadow-2xl">
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} className="text-error" />
            </div>
            <h1 className="text-2xl font-bold text-on-surface mb-3 tracking-tight">Something went wrong</h1>
            <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
              We encountered an unexpected error while rendering this page. Don't worry, your data is safe.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-on-primary font-bold text-sm rounded-xl hover:opacity-90 active:scale-95 transition-all"
              >
                <RotateCcw size={16} />
                Reload Page
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.href = '/';
                }}
                className="w-full py-3 bg-transparent text-primary font-bold text-sm rounded-xl hover:bg-primary/10 active:scale-95 transition-all"
              >
                Return Home
              </button>
            </div>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="mt-8 text-left">
                <p className="text-xs text-error font-mono bg-error/5 p-4 rounded-lg overflow-x-auto">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
