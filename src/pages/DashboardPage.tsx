import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { AppLayoutContext } from "../components/layout/AppLayout";
import { Card } from "../components/ui/Card";
import { Progress } from "../components/ui/Progress";
import { RoomCard } from "../components/shared/RoomCard";
import { EmptyState } from "../components/shared/EmptyState";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { createRoom, deleteRoom, reorderRooms, updateRoom } from "../services/firestore";
import type { Room } from "../types";
import { Pencil, ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";
import { normalizeName } from "../utils/normalize";
import { useToast } from "../components/ui/Toast";
import { useTranslation } from "react-i18next";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { homeId, rooms, items, isLoading } = useOutletContext<AppLayoutContext>();
  const [newRoom, setNewRoom] = useState("");
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 animate-pulse rounded-2xl bg-white/70" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-32 animate-pulse rounded-2xl bg-white/70" />
          <div className="h-32 animate-pulse rounded-2xl bg-white/70" />
        </div>
      </div>
    );
  }

  const totalItems = items?.length ?? 0;
  const totalDone = items?.filter((item) => item.done).length ?? 0;
  const totalPercent = totalItems === 0 ? 0 : Math.round((totalDone / totalItems) * 100);

  const roomsWithCounts = (rooms ?? []).map((room) => {
    const roomItems = items?.filter((item) => item.roomId === room.id) ?? [];
    return {
      room,
      total: roomItems.length,
      done: roomItems.filter((item) => item.done).length,
    };
  });

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 bg-white/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{t("app.progress")}</h2>
            <p className="text-sm text-slate-500">
              {t("app.doneCount", { done: totalDone, total: totalItems })}
            </p>
          </div>
          <span className="text-3xl font-semibold text-primary">{totalPercent}%</span>
        </div>
        <Progress value={totalPercent} />
      </Card>

      {roomsWithCounts.length === 0 ? (
        <EmptyState title={t("dashboard.emptyTitle")} description={t("dashboard.emptyDesc")} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {roomsWithCounts.map(({ room, done, total }) => (
            <RoomCard
              key={room.id}
              room={room}
              doneCount={done}
              totalCount={total}
              onOpen={() => navigate(`/app/room/${room.id}`)}
            />
          ))}
        </div>
      )}

      <Card className="bg-white/80 lg:hidden">
        <h2 className="text-lg font-semibold">{t("dashboard.manageTitle")}</h2>
        <p className="mt-1 text-sm text-slate-500">{t("dashboard.manageDesc")}</p>
        <div className="mt-4 flex items-center gap-2">
          <Input
            placeholder={t("dashboard.newRoom")}
            value={newRoom}
            onChange={(event) => setNewRoom(event.target.value)}
          />
          <Button
            size="sm"
            onClick={async () => {
              const name = newRoom.trim();
              if (!name || !homeId) return;
              const exists = (rooms ?? []).some(
                (roomItem) => normalizeName(roomItem.name) === normalizeName(name)
              );
              if (exists) {
                notify({
                  title: t("toasts.duplicateTitle"),
                  description: t("toasts.duplicateRoom"),
                });
                return;
              }
              await createRoom({ homeId, name, order: rooms?.length ?? 0 });
              queryClient.invalidateQueries({ queryKey: ["rooms", homeId] });
              setNewRoom("");
            }}
            aria-label={t("misc.addRoomAria")}
          >
            <Plus size={16} />
          </Button>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {(rooms ?? []).map((room: Room) => (
            <div
              key={room.id}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2"
            >
              {editingRoomId === room.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      const name = editingName.trim();
                      if (!name) return;
                      const exists = (rooms ?? []).some(
                        (item) =>
                          item.id !== room.id &&
                          normalizeName(item.name) === normalizeName(name)
                      );
                      if (exists) {
                        notify({
                          title: t("toasts.duplicateTitle"),
                          description: t("toasts.duplicateRoom"),
                        });
                        return;
                      }
                      await updateRoom(room.id, { name });
                      queryClient.invalidateQueries({ queryKey: ["rooms", homeId] });
                      setEditingRoomId(null);
                      setEditingName("");
                    }}
                  >
                    {t("misc.save")}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium">{room.name}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                    onClick={() => {
                      setEditingRoomId(room.id);
                      setEditingName(room.name);
                    }}
                      aria-label={t("misc.editRoomAria")}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        if (!rooms) return;
                        const index = rooms.findIndex((r) => r.id === room.id);
                        if (index <= 0) return;
                        const next = [...rooms];
                        const [moved] = next.splice(index, 1);
                        next.splice(index - 1, 0, moved);
                        await reorderRooms(next);
                        queryClient.invalidateQueries({ queryKey: ["rooms", homeId] });
                      }}
                      aria-label={t("misc.moveUp")}
                    >
                      <ArrowUp size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        if (!rooms) return;
                        const index = rooms.findIndex((r) => r.id === room.id);
                        if (index === -1 || index >= rooms.length - 1) return;
                        const next = [...rooms];
                        const [moved] = next.splice(index, 1);
                        next.splice(index + 1, 0, moved);
                        await reorderRooms(next);
                        queryClient.invalidateQueries({ queryKey: ["rooms", homeId] });
                      }}
                      aria-label={t("misc.moveDown")}
                    >
                      <ArrowDown size={16} />
                    </Button>
                  <ConfirmDialog
                      title={t("misc.removeRoom")}
                      description={t("misc.removeRoomDesc")}
                      confirmLabel={t("misc.removeRoom")}
                      onConfirm={async () => {
                        await deleteRoom(room.id);
                        queryClient.invalidateQueries({ queryKey: ["rooms", homeId] });
                        queryClient.invalidateQueries({ queryKey: ["items", homeId] });
                      }}
                      trigger={
                        <Button size="sm" variant="ghost" aria-label={t("misc.removeRoom")}>
                          <Trash2 size={16} />
                        </Button>
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
