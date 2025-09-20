import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    this.setState({ info });
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
          <h1 style={{ color: "#b00020" }}>App crashed — runtime error</h1>
          <pre style={{
            whiteSpace: "pre-wrap",
            background: "#111",
            color: "#fff",
            padding: 12,
            borderRadius: 6,
            overflowX: "auto"
          }}>
            {String(this.state.error.stack || this.state.error)}
          </pre>
          <details style={{ marginTop: 12 }}>
            <summary>More info</summary>
            <pre>{JSON.stringify(this.state.info, null, 2)}</pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}