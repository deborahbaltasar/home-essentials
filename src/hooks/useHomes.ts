import { useQuery } from "@tanstack/react-query";
import { fetchHomesForUser } from "../services/firestore";
import { useAuth } from "../state/AuthContext";

export const useHomes = () => {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["homes", user?.uid],
    queryFn: () => fetchHomesForUser(user!.uid),
    enabled: !!user,
  });

  const activeHome = query.data?.[0];

  return {
    ...query,
    activeHome,
  };
};
