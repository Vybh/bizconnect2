import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../lib/api.js";
import toast from "react-hot-toast";

export function useSignup() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: (res) => {
      queryClient.setQueryData(["authUser"], res.data.user);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Signup failed");
    },
  });

  return { signupMutation: mutate, isPending, error };
}
