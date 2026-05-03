import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../lib/api.js";
import toast from "react-hot-toast";

export function useLogin() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: (res) => {
      queryClient.setQueryData(["authUser"], res.data.user);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Login failed");
    },
  });

  return { loginMutation: mutate, isPending, error };
}
