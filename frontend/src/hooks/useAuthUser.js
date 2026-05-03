import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api.js";

export function useAuthUser() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await getAuthUser();
      return res.data.user;
    },
    retry: false,
    staleTime: Infinity,
  });

  return { authUser: data, isLoading, error };
}
