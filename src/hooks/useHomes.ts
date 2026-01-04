import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { fetchHomesForUser } from "../services/firestore";
import { useAuth } from "../state/AuthContext";

const STORAGE_KEY = "home-essentials-active-home";

export const useHomes = () => {
  const { user } = useAuth();
  const [activeHomeId, setActiveHomeId] = useState(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY);
  });
  const query = useQuery({
    queryKey: ["homes", user?.uid],
    queryFn: () => fetchHomesForUser(user!.uid),
    enabled: !!user,
  });

  const homes = query.data ?? [];
  const activeHome = useMemo(() => {
    return homes.find((home) => home.id === activeHomeId) ?? homes[0];
  }, [homes, activeHomeId]);

  const setActiveHome = (homeId: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, homeId);
    setActiveHomeId(homeId);
    window.dispatchEvent(
      new CustomEvent("home-essentials:active-home", { detail: homeId })
    );
  };

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handler = (event: Event) => {
      const custom = event as CustomEvent<string>;
      if (custom.detail) {
        setActiveHomeId(custom.detail);
      }
    };
    window.addEventListener("home-essentials:active-home", handler);
    return () => window.removeEventListener("home-essentials:active-home", handler);
  }, []);

  return {
    ...query,
    homes,
    activeHome,
    setActiveHome,
  };
};
