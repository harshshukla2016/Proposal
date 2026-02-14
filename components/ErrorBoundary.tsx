
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: _, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    // You could also log error to an error reporting service here
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950 bg-opacity-90 text-white z-50 p-4">
          <h1 className="text-4xl font-bold text-red-400 mb-4">
            Oops! Something went wrong in the galaxy.
          </h1>
          <p className="text-xl text-red-200 mb-6 text-center">
            We're experiencing cosmic turbulence. Please try reloading the app.
          </p>
          <details className="text-sm text-red-100 max-w-lg overflow-auto bg-red-800 p-3 rounded-md">
            <summary className="cursor-pointer font-semibold mb-2">Error Details</summary>
            {this.state.error && <p className="font-bold">Error: {this.state.error.toString()}</p>}
            {this.state.errorInfo && (
              <pre className="mt-2 whitespace-pre-wrap break-all">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </details>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md transition-colors duration-200"
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
