import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Bell,
  LogOut,
  Briefcase,
} from "lucide-react";
import { useLogout } from "../hooks/useLogout.js";
import { useAuthUser } from "../hooks/useAuthUser.js";

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/experts", label: "Experts", icon: Briefcase },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/experts", label: "Network", icon: Users },
];

export default function Sidebar() {
  const { authUser } = useAuthUser();
  const { logoutMutation, isPending } = useLogout();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">BizConnect</div>

      <nav className="sidebar-nav">
        {navLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {authUser && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <img src={authUser.profilePic} alt={authUser.fullName} className="avatar" />
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{authUser.fullName}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{authUser.industry}</div>
            </div>
          </div>
        )}
        <button
          className="btn btn-ghost btn-full"
          onClick={() => logoutMutation()}
          disabled={isPending}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
