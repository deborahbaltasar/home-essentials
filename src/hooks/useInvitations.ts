import { useQuery } from "@tanstack/react-query";
import { fetchInvitationsForEmail, fetchInvitationsForHome } from "../services/firestore";

export const useInvitationsForHome = (homeId?: string) => {
  return useQuery({
    queryKey: ["invitations", "home", homeId],
    queryFn: () => fetchInvitationsForHome(homeId!),
    enabled: !!homeId,
    refetchOnWindowFocus: true,
  });
};

export const useInvitationsForEmail = (emailLower?: string) => {
  return useQuery({
    queryKey: ["invitations", "email", emailLower],
    queryFn: () => fetchInvitationsForEmail(emailLower!),
    enabled: !!emailLower,
    refetchOnWindowFocus: true,
  });
};
