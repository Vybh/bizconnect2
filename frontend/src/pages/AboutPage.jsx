import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <header style={{ padding: "1.25rem 2rem", borderBottom: "1px solid var(--border)" }}>
        <Link to="/" style={{ color: "var(--primary)", fontWeight: 700, fontSize: "1.1rem" }}>← BizConnect</Link>
      </header>
      <div style={{ maxWidth: "700px", margin: "3rem auto", padding: "0 1rem" }}>
        <h1 className="page-title">About BizConnect</h1>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.8, marginTop: "1rem" }}>
          BizConnect is a professional networking and expert marketplace that lets you find, connect, and collaborate with business professionals worldwide. Our platform combines a rich expert directory, real-time messaging with translation, and HD video calling.
        </p>
      </div>
    </div>
  );
}
