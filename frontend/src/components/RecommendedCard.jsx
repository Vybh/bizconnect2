import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendFriendRequest } from "../lib/api.js";
import { UserPlus, Loader } from "lucide-react";
import toast from "react-hot-toast";

export default function RecommendedCard({ user, outgoingIds = [] }) {
  const queryClient = useQueryClient();
  const hasPending = outgoingIds.includes(user._id);

  const { mutate, isPending } = useMutation({
    mutationFn: () => sendFriendRequest(user._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingRequests"] });
      toast.success(`Request sent to ${user.fullName}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to send request");
    },
  });

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

      <button
        className="btn btn-secondary btn-sm"
        style={{ alignSelf: "flex-start" }}
        onClick={() => mutate()}
        disabled={isPending || hasPending}
      >
        {isPending ? <Loader size={14} className="spinner" /> : <UserPlus size={14} />}
        {hasPending ? "Pending" : "Connect"}
      </button>
    </div>
  );
}
