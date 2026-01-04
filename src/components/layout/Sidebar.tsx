import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Room } from "../../types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { createRoom, deleteRoom, reorderRooms, updateRoom } from "../../services/firestore";
import { cn } from "../../utils/cn";
import { Pencil, ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";
import { normalizeName } from "../../utils/normalize";
import { useToast } from "../ui/Toast";
import { useTranslation } from "react-i18next";

type SidebarProps = {
  rooms: Room[];
  homeId: string;
};

export const Sidebar = ({ rooms, homeId }: SidebarProps) => {
  const [newRoom, setNewRoom] = useState("");
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const queryClient = useQueryClient();
  const location = useLocation();
  const { notify } = useToast();
  const { t } = useTranslation();

  const { mutateAsync: addRoom } = useMutation({
    mutationFn: (payload: { name: string; order: number }) =>
      createRoom({ homeId, name: payload.name, order: payload.order }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rooms", homeId] }),
  });

  const { mutateAsync: renameRoom } = useMutation({
    mutationFn: (payload: { roomId: string; name: string }) =>
      updateRoom(payload.roomId, { name: payload.name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rooms", homeId] }),
  });

  const { mutateAsync: removeRoom } = useMutation({
    mutationFn: (roomId: string) => deleteRoom(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms", homeId] });
      queryClient.invalidateQueries({ queryKey: ["items", homeId] });
    },
  });

  const { mutateAsync: reorder } = useMutation({
    mutationFn: (nextRooms: Room[]) => reorderRooms(nextRooms),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rooms", homeId] }),
  });

  const handleCreateRoom = async () => {
    const name = newRoom.trim();
    if (!name) return;
    const exists = rooms.some((room) => normalizeName(room.name) === normalizeName(name));
    if (exists) {
      notify({ title: t("toasts.duplicateTitle"), description: t("toasts.duplicateRoom") });
      return;
    }
    await addRoom({ name, order: rooms.length });
    setNewRoom("");
  };

  const handleRename = async () => {
    if (!editingRoomId) return;
    const name = editingName.trim();
    if (!name) return;
    const exists = rooms.some(
      (room) => room.id !== editingRoomId && normalizeName(room.name) === normalizeName(name)
    );
    if (exists) {
      notify({ title: t("toasts.duplicateTitle"), description: t("toasts.duplicateRoom") });
      return;
    }
    await renameRoom({ roomId: editingRoomId, name });
    setEditingRoomId(null);
    setEditingName("");
  };

  const handleMove = async (roomId: string, direction: "up" | "down") => {
    const index = rooms.findIndex((room) => room.id === roomId);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rooms.length) return;
    const next = [...rooms];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    await reorder(next);
  };

  const activeRoomId = useMemo(() => {
    const match = location.pathname.match(/room\/([^/]+)/);
    return match?.[1];
  }, [location.pathname]);

  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-6 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-soft lg:flex">
      <div>
        <Link to="/app" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          {t("app.home")}
        </Link>
        <div className="mt-3 flex items-center gap-2">
          <Input
            placeholder={t("dashboard.newRoom")}
            value={newRoom}
            onChange={(event) => setNewRoom(event.target.value)}
          />
          <Button size="sm" onClick={handleCreateRoom} aria-label={t("misc.addRoomAria")}>
            <Plus size={16} />
          </Button>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          {t("app.rooms")}
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {rooms.length === 0 && (
            <p className="text-sm text-slate-500">{t("dashboard.emptyDesc")}</p>
          )}
          {rooms.map((room) => (
            <div
              key={room.id}
              className={cn(
                "rounded-2xl border border-transparent bg-white px-3 py-2 text-sm transition hover:border-slate-200 hover:bg-slate-50",
                activeRoomId === room.id && "border-slate-200 bg-slate-50"
              )}
            >
              {editingRoomId === room.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    className="text-sm"
                  />
                  <Button size="sm" variant="secondary" onClick={handleRename}>
                    {t("misc.save")}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <Link to={`/app/room/${room.id}`} className="flex-1">
                    {room.name}
                  </Link>
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
                      onClick={() => handleMove(room.id, "up")}
                      aria-label={t("misc.moveUp")}
                    >
                      <ArrowUp size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMove(room.id, "down")}
                      aria-label={t("misc.moveDown")}
                    >
                      <ArrowDown size={16} />
                    </Button>
                    <ConfirmDialog
                      title={t("misc.removeRoom")}
                      description={t("misc.removeRoomDescConfirm")}
                      confirmLabel={t("misc.removeRoom")}
                      onConfirm={() => removeRoom(room.id)}
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
      </div>

      <div className="mt-auto flex flex-col gap-2 text-sm">
        <Link className="rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-50" to="/app/palette">
          {t("app.palette")}
        </Link>
        <Link className="rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-50" to="/app/share">
          {t("app.share")}
        </Link>
      </div>
    </aside>
  );
};
