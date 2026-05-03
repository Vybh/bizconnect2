import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "1.25rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--primary)" }}>BizConnect</div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link to="/about" className="btn btn-ghost btn-sm">About</Link>
          <Link to="/support" className="btn btn-ghost btn-sm">Support</Link>
          <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <div className="hero">
          <h1 className="hero-title">
            Connect with the Best Business Experts
          </h1>
          <p className="hero-subtitle">
            Browse professionals across industries, chat in real-time, and schedule video calls — all in one place.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary">Get Started Free</Link>
            <Link to="/about" className="btn btn-secondary">Learn More</Link>
          </div>
        </div>

        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 1rem 4rem", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem" }}>
          {[
            { title: "Expert Network", desc: "Connect with professionals across 14+ industries worldwide." },
            { title: "Real-Time Chat", desc: "Instant messaging with translation support for global collaboration." },
            { title: "Video Calls", desc: "HD video calls directly from the chat — no third-party apps needed." },
          ].map(({ title, desc }) => (
            <div key={title} className="card" style={{ textAlign: "center" }}>
              <h3 style={{ marginBottom: "0.5rem" }}>{title}</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "1.5rem 2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
        © {new Date().getFullYear()} BizConnect. All rights reserved.
      </footer>
    </div>
  );
}
