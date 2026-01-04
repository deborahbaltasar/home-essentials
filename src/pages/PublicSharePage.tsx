import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchShare, fetchShareItems, fetchShareRooms } from "../services/firestore";
import { Progress } from "../components/ui/Progress";
import { Badge } from "../components/ui/Badge";
import { LoadingState } from "../components/shared/LoadingState";

export const PublicSharePage = () => {
  const { shareId } = useParams();
  const { t } = useTranslation();

  const shareQuery = useQuery({
    queryKey: ["share", shareId],
    queryFn: () => fetchShare(shareId!),
    enabled: !!shareId,
  });

  const roomsQuery = useQuery({
    queryKey: ["share-rooms", shareId],
    queryFn: () => fetchShareRooms(shareId!),
    enabled: !!shareId,
  });

  const itemsQuery = useQuery({
    queryKey: ["share-items", shareId],
    queryFn: () => fetchShareItems(shareId!),
    enabled: !!shareId,
  });

  if (shareQuery.isLoading || roomsQuery.isLoading || itemsQuery.isLoading) {
    return <LoadingState message={t("app.loadingShare")} />;
  }

  if (!shareQuery.data) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-2xl font-semibold">{t("public.notFoundTitle")}</h1>
        <p className="text-sm text-slate-500">{t("public.notFoundDesc")}</p>
      </div>
    );
  }

  const rooms = roomsQuery.data ?? [];
  const items = itemsQuery.data ?? [];
  const totalItems = items.length;
  const doneItems = items.filter((item) => item.done).length;
  const percent = totalItems === 0 ? 0 : Math.round((doneItems / totalItems) * 100);

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            {t("public.title")}
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{t("app.title")}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {t("public.progress", { done: doneItems, total: totalItems })}
          </p>
          <Progress value={percent} className="mt-4" />
        </div>

        {rooms.map((room) => {
          const roomItems = items.filter((item) => item.roomId === room.id);
          return (
            <div key={room.id} className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{room.name}</h2>
                <span className="text-xs text-slate-500">
                  {roomItems.filter((item) => item.done).length}/{roomItems.length}
                </span>
              </div>
              <div className="mt-4 space-y-2">
                {roomItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <p className={`text-sm ${item.done ? "line-through text-slate-400" : "text-slate-700"}`}>
                      {item.name}
                    </p>
                    <Badge tone={item.necessityLevel}>
                      {t(
                        item.necessityLevel === "high"
                          ? "filters.high"
                          : item.necessityLevel === "medium"
                          ? "filters.medium"
                          : "filters.low"
                      )}
                    </Badge>
                  </div>
                ))}
                {roomItems.length === 0 && (
                  <p className="text-sm text-slate-400">{t("public.emptyItems")}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
