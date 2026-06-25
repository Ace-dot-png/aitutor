"use client";
import { Component, ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="card p-6 text-center max-w-md mx-auto mt-20">
          <div className="text-lg text-text-primary mb-2">Something went wrong</div>
          <div className="text-sm text-text-muted mb-4">{this.state.error?.message || "An unexpected error occurred"}</div>
          <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }} className="btn-primary text-sm">Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}
