import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllUsers, getOutgoingRequests } from "../lib/api.js";
import Sidebar from "../components/Sidebar.jsx";
import RecommendedCard from "../components/RecommendedCard.jsx";
import FriendCard from "../components/FriendCard.jsx";
import { useAuthUser } from "../hooks/useAuthUser.js";
import { INDUSTRIES } from "../constants/index.js";
import { Search } from "lucide-react";

export default function ExpertsPage() {
  const { authUser } = useAuthUser();
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("");
  const [sortBy, setSortBy] = useState("rating");

  const { data: users, isLoading } = useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => (await getAllUsers()).data.users,
  });

  const { data: outgoingData } = useQuery({
    queryKey: ["outgoingRequests"],
    queryFn: async () => (await getOutgoingRequests()).data.requests,
  });

  const outgoingIds = outgoingData?.map((r) => r.recipient._id) || [];
  const friendIds = authUser?.friends?.map((f) => (typeof f === "string" ? f : f._id)) || [];

  const filtered = useMemo(() => {
    if (!users) return [];
    return users
      .filter((u) => {
        const matchSearch =
          !search ||
          u.fullName.toLowerCase().includes(search.toLowerCase()) ||
          u.description?.toLowerCase().includes(search.toLowerCase());
        const matchIndustry = !industry || u.industry === industry;
        return matchSearch && matchIndustry;
      })
      .sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "price_low") return a.pricing - b.pricing;
        if (sortBy === "price_high") return b.pricing - a.pricing;
        if (sortBy === "experience") return b.experienceYears - a.experienceYears;
        return 0;
      });
  }, [users, search, industry, sortBy]);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Expert Directory</h1>
          <p className="page-subtitle">Find and connect with professionals</p>
        </div>

        <div className="filters-bar">
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              className="form-input"
              style={{ paddingLeft: "2.25rem" }}
              placeholder="Search by name or expertise…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="form-input" style={{ width: "180px" }} value={industry} onChange={(e) => setIndustry(e.target.value)}>
            <option value="">All Industries</option>
            {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
          <select className="form-input" style={{ width: "160px" }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="rating">Top Rated</option>
            <option value="price_low">Price: Low</option>
            <option value="price_high">Price: High</option>
            <option value="experience">Most Experienced</option>
          </select>
        </div>

        {isLoading ? (
          <div className="spinner" />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <p>No experts match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {filtered.map((u) =>
              friendIds.includes(u._id) ? (
                <FriendCard key={u._id} user={u} />
              ) : (
                <RecommendedCard key={u._id} user={u} outgoingIds={outgoingIds} />
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}
