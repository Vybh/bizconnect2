import { Link } from "react-router-dom";

export default function SupportPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <header style={{ padding: "1.25rem 2rem", borderBottom: "1px solid var(--border)" }}>
        <Link to="/" style={{ color: "var(--primary)", fontWeight: 700, fontSize: "1.1rem" }}>← BizConnect</Link>
      </header>
      <div style={{ maxWidth: "700px", margin: "3rem auto", padding: "0 1rem" }}>
        <h1 className="page-title">Support</h1>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.8, marginTop: "1rem" }}>
          Need help? Reach us at <strong>support@bizconnect.app</strong>. We typically respond within 24 hours.
        </p>
      </div>
    </div>
  );
}
