import { useQuery } from "@tanstack/react-query";
import { fetchItems } from "../services/firestore";

export const useItems = (homeId?: string) => {
  return useQuery({
    queryKey: ["items", homeId],
    queryFn: () => fetchItems(homeId!),
    enabled: !!homeId,
  });
};
