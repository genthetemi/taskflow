import { Component } from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected application error.'
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-error-boundary" role="alert" aria-live="assertive">
          <section className="app-error-card">
            <h1>Something went wrong</h1>
            <p>
              The app hit an unexpected error. You can return home or reload this page.
            </p>
            <details>
              <summary>Technical details</summary>
              <pre>{this.state.errorMessage}</pre>
            </details>
            <div className="app-error-actions">
              <button type="button" onClick={this.handleReload}>
                Reload
              </button>
              <Link to="/">Go Home</Link>
            </div>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
