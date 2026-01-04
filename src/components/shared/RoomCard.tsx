import React from "react";
import type { Room } from "../../types";
import { Progress } from "../ui/Progress";
import { useTranslation } from "react-i18next";

type RoomCardProps = {
  room: Room;
  doneCount: number;
  totalCount: number;
  onOpen?: () => void;
};

export const RoomCard = ({ room, doneCount, totalCount, onOpen }: RoomCardProps) => {
  const percent = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">{room.name}</h3>
        <span className="text-xs text-slate-500">
          {doneCount}/{totalCount}
        </span>
      </div>
      <Progress value={percent} />
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {t("app.percentDone", { percent })}
      </p>
    </button>
  );
};
