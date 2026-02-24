import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            background: "var(--neutral-0)",
            borderRadius: "12px",
            border: "1px solid var(--gray-200)",
            margin: "20px",
          }}
        >
          <h2 style={{ color: "var(--gray-800)", marginBottom: "8px" }}>
            Algo salió mal
          </h2>
          <p style={{ color: "var(--gray-500)", marginBottom: "16px" }}>
            Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: "1px solid var(--gray-300)",
              background: "var(--neutral-0)",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
