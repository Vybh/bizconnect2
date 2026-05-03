import { Link } from "react-router-dom";
import { MessageSquare, Star, DollarSign } from "lucide-react";

export default function FriendCard({ user }) {
  return (
    <div className="user-card">
      <div className="user-card-header">
        <img src={user.profilePic} alt={user.fullName} className="avatar" />
        <div>
          <div className="user-card-name">{user.fullName}</div>
          <div className="user-card-meta">
            {user.industry && <span className="badge badge-primary">{user.industry}</span>}
            {user.location && <span>{user.location}</span>}
          </div>
        </div>
      </div>

      {user.description && (
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
          {user.description.slice(0, 100)}{user.description.length > 100 ? "…" : ""}
        </p>
      )}

      <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
        {user.rating > 0 && (
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <Star size={13} style={{ color: "var(--secondary)" }} />
            {user.rating.toFixed(1)}
          </span>
        )}
        {user.pricing > 0 && (
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <DollarSign size={13} />
            {user.pricing}/hr
          </span>
        )}
        {user.experienceYears > 0 && (
          <span>{user.experienceYears}y exp</span>
        )}
      </div>

      <Link to={`/chat/${user._id}`} className="btn btn-primary btn-sm" style={{ alignSelf: "flex-start" }}>
        <MessageSquare size={14} />
        Message
      </Link>
    </div>
  );
}
