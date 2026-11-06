import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Container } from 'react-bootstrap';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Last-resort error boundary around the whole application – catches render
 * errors so users see a friendly page instead of a blank screen.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Replace with structured logging/reporting (e.g. Sentry) as the app grows.
    console.error('Unhandled application error', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error !== null) {
      return (
        <Container className="py-5 text-center">
          <h1 className="h3 mb-3">Nastala neočekávaná chyba</h1>
          <p className="text-secondary">{this.state.error.message}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Načíst stránku znovu
          </Button>
        </Container>
      );
    }
    return this.props.children;
  }
}
