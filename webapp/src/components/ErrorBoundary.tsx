import React from 'react';

type ErrorBoundaryState = { hasError: boolean, error?: Error };

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="card" style={{ margin: 20, padding: 20 }}>
          <h2>Something went wrong.</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}