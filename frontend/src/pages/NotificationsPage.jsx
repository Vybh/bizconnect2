import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFriendRequests, acceptFriendRequest } from "../lib/api.js";
import Sidebar from "../components/Sidebar.jsx";
import { Check, UserCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: async () => (await getFriendRequests()).data,
  });

  const { mutate: accept, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast.success("Connection accepted!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Notifications</h1>
        </div>

        {isLoading ? (
          <div className="spinner" />
        ) : (
          <>
            {(data?.incoming?.length || 0) > 0 && (
              <section style={{ marginBottom: "2rem" }}>
                <h2 style={{ marginBottom: "1rem", fontSize: "1.1rem", fontWeight: 600 }}>
                  Pending Requests ({data.incoming.length})
                </h2>
                {data.incoming.map((req) => (
                  <div key={req._id} className="notification-item">
                    <img src={req.sender.profilePic} alt={req.sender.fullName} className="avatar" />
                    <div>
                      <div style={{ fontWeight: 600 }}>{req.sender.fullName}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        {req.sender.industry} · wants to connect
                      </div>
                    </div>
                    <div className="notification-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => accept(req._id)}
                        disabled={isPending}
                      >
                        <Check size={14} />
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {(data?.accepted?.length || 0) > 0 && (
              <section>
                <h2 style={{ marginBottom: "1rem", fontSize: "1.1rem", fontWeight: 600 }}>
                  Recent Connections
                </h2>
                {data.accepted.map((req) => {
                  const other = req.sender._id === req.recipient._id ? req.sender : req.sender;
                  return (
                    <div key={req._id} className="notification-item">
                      <UserCheck size={20} style={{ color: "var(--success)" }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{other.fullName}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Connected</div>
                      </div>
                    </div>
                  );
                })}
              </section>
            )}

            {!data?.incoming?.length && !data?.accepted?.length && (
              <div className="empty-state">
                <div className="empty-state-icon">🔔</div>
                <p>No notifications yet.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
