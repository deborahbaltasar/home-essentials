import React from "react";
import { Link, useLocation } from "react-router-dom";
import type { Room } from "../../types";
import { cn } from "../../utils/cn";
import { useTranslation } from "react-i18next";

type MobileRoomNavProps = {
  rooms: Room[];
};

export const MobileRoomNav = ({ rooms }: MobileRoomNavProps) => {
  const location = useLocation();
  const activeRoomId = location.pathname.match(/room\/([^/]+)/)?.[1];
  const { t } = useTranslation();

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
      <Link
        to="/app"
        className={cn(
          "shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm",
          location.pathname === "/app" && "border-primary text-primary"
        )}
      >
        {t("app.dashboard")}
      </Link>
      {rooms.map((room) => (
        <Link
          key={room.id}
          to={`/app/room/${room.id}`}
          className={cn(
            "shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm",
            activeRoomId === room.id && "border-primary text-primary"
          )}
        >
          {room.name}
        </Link>
      ))}
    </div>
  );
};
