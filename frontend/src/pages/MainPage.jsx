import { useQuery } from "@tanstack/react-query";
import { getRecommendedUsers, getOutgoingRequests, getFriends } from "../lib/api.js";
import Sidebar from "../components/Sidebar.jsx";
import FriendCard from "../components/FriendCard.jsx";
import RecommendedCard from "../components/RecommendedCard.jsx";
import { useAuthUser } from "../hooks/useAuthUser.js";

export default function MainPage() {
  const { authUser } = useAuthUser();

  const { data: recommended, isLoading: loadingRec } = useQuery({
    queryKey: ["recommendedUsers"],
    queryFn: async () => (await getRecommendedUsers()).data.users,
  });

  const { data: friends, isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => (await getFriends()).data.friends,
  });

  const { data: outgoingData } = useQuery({
    queryKey: ["outgoingRequests"],
    queryFn: async () => (await getOutgoingRequests()).data.requests,
  });

  const outgoingIds = outgoingData?.map((r) => r.recipient._id) || [];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Welcome, {authUser?.fullName?.split(" ")[0]}!</h1>
          <p className="page-subtitle">Here&apos;s your professional network</p>
        </div>

        {(friends?.length || 0) > 0 && (
          <section style={{ marginBottom: "3rem" }}>
            <h2 style={{ marginBottom: "1rem", fontSize: "1.1rem", fontWeight: 600 }}>Your Connections</h2>
            {loadingFriends ? (
              <div className="spinner" />
            ) : (
              <div className="grid grid-3">
                {friends.map((f) => <FriendCard key={f._id} user={f} />)}
              </div>
            )}
          </section>
        )}

        <section>
          <h2 style={{ marginBottom: "1rem", fontSize: "1.1rem", fontWeight: 600 }}>People You May Know</h2>
          {loadingRec ? (
            <div className="spinner" />
          ) : recommended?.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <p>No recommendations right now — check back later!</p>
            </div>
          ) : (
            <div className="grid grid-3">
              {recommended?.map((u) => (
                <RecommendedCard key={u._id} user={u} outgoingIds={outgoingIds} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
