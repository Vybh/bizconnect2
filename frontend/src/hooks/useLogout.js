import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../lib/api.js";
import toast from "react-hot-toast";

export function useLogout() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["authUser"], null);
      queryClient.clear();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Logout failed");
    },
  });

  return { logoutMutation: mutate, isPending };
}
