import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useHomes } from "../../hooks/useHomes";
import { useRooms } from "../../hooks/useRooms";
import { useItems } from "../../hooks/useItems";
import { Sidebar } from "./Sidebar";
import { MobileRoomNav } from "./MobileRoomNav";
import { TopBar } from "./TopBar";
import { useApplyPalette } from "../../hooks/useApplyPalette";
import { LoadingState } from "../shared/LoadingState";
import { useTranslation } from "react-i18next";

export type AppLayoutContext = {
  homeId?: string;
  rooms: ReturnType<typeof useRooms>["data"];
  items: ReturnType<typeof useItems>["data"];
  isLoading: boolean;
  refetchAll: () => void;
};

export const AppLayout = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    activeHome,
    homes,
    setActiveHome,
    isLoading: homeLoading,
    refetch: refetchHomes,
  } = useHomes();
  const { data: rooms, isLoading: roomsLoading, refetch: refetchRooms } = useRooms(
    activeHome?.id
  );
  const { data: items, isLoading: itemsLoading, refetch: refetchItems } = useItems(
    activeHome?.id
  );

  useApplyPalette(activeHome?.palette);

  useEffect(() => {
    if (!homeLoading && !activeHome) {
      navigate("/onboarding");
    }
  }, [homeLoading, activeHome, navigate]);

  if (homeLoading) {
    return <LoadingState message={t("app.loadingHome")} />;
  }

  if (!activeHome) {
    return <LoadingState message={t("app.preparingHome")} />;
  }

  const isLoading = roomsLoading || itemsLoading;
  const refetchAll = () => {
    refetchHomes();
    refetchRooms();
    refetchItems();
  };

  return (
    <div className="min-h-screen">
      <TopBar
        homeName={activeHome.name}
        homes={homes}
        activeHomeId={activeHome.id}
        onHomeChange={setActiveHome}
      />
      <div className="mx-auto flex w-full max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Sidebar rooms={rooms ?? []} homeId={activeHome.id} />
        <main className="flex-1">
          <MobileRoomNav rooms={rooms ?? []} />
          <Outlet context={{ homeId: activeHome.id, rooms, items, isLoading, refetchAll }} />
        </main>
      </div>
    </div>
  );
};
