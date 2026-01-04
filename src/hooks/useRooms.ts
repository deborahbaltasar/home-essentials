import { useQuery } from "@tanstack/react-query";
import { fetchRooms } from "../services/firestore";

export const useRooms = (homeId?: string) => {
  return useQuery({
    queryKey: ["rooms", homeId],
    queryFn: () => fetchRooms(homeId!),
    enabled: !!homeId,
  });
};
