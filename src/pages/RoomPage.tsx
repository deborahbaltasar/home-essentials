import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useOutletContext, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AppLayoutContext } from "../components/layout/AppLayout";
import { FiltersBar } from "../components/shared/FiltersBar";
import { ItemRow } from "../components/shared/ItemRow";
import { EmptyState } from "../components/shared/EmptyState";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { createItem, deleteItem, updateItem } from "../services/firestore";
import type { ChecklistItem } from "../types";
import { sortItems } from "../utils/checklist";
import { useToast } from "../components/ui/Toast";
import { normalizeName } from "../utils/normalize";

export const RoomPage = () => {
  const { roomId } = useParams();
  const { homeId, rooms, items, isLoading } = useOutletContext<AppLayoutContext>();
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const { t } = useTranslation();
  const [newItem, setNewItem] = useState("");
  const [necessityLevel, setNecessityLevel] = useState<ChecklistItem["necessityLevel"]>("high");
  const [statusFilter, setStatusFilter] = useState("all");
  const [necessityFilter, setNecessityFilter] = useState("all");
  const [sortByStatus, setSortByStatus] = useState(false);

  const room = rooms?.find((roomItem) => roomItem.id === roomId);

  const { mutateAsync: addItem } = useMutation({
    mutationFn: () =>
      createItem({
        homeId: homeId!,
        roomId: roomId!,
        name: newItem.trim(),
        necessityLevel,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", homeId] });
      setNewItem("");
      notify({ title: t("toasts.itemAdded"), description: t("toasts.itemAddedDesc") });
    },
  });

  const { mutateAsync: updateItemMutation } = useMutation({
    mutationFn: (payload: { itemId: string; data: Partial<ChecklistItem> }) =>
      updateItem(payload.itemId, payload.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items", homeId] }),
  });

  const { mutateAsync: removeItem } = useMutation({
    mutationFn: (itemId: string) => deleteItem(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items", homeId] }),
  });

  const roomItemsAll = useMemo(() => {
    return (items ?? []).filter((item) => item.roomId === roomId);
  }, [items, roomId]);

  const roomItems = useMemo(() => {
    const filtered = roomItemsAll;
    const byStatus = filtered.filter((item) => {
      if (statusFilter === "done") return item.done;
      if (statusFilter === "pending") return !item.done;
      return true;
    });
    const byNecessity = byStatus.filter((item) => {
      if (necessityFilter === "all") return true;
      return item.necessityLevel === necessityFilter;
    });
    return sortItems(byNecessity, sortByStatus);
  }, [roomItemsAll, statusFilter, necessityFilter, sortByStatus]);

  const doneCount = roomItemsAll.filter((item) => item.done).length;

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-3xl bg-white/70" />;
  }

  if (!room) {
    return (
      <EmptyState
        title={t("room.selectTitle")}
        description={t("room.selectDesc")}
      />
    );
  }

  return (
    <div className="flex h-[calc(100vh-220px)] flex-col gap-6">
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">{room.name}</h2>
            <p className="text-sm text-slate-500">
              {t("room.itemsDone", { done: doneCount, total: roomItems.length })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder={t("room.newItem")}
              value={newItem}
              onChange={(event) => setNewItem(event.target.value)}
            />
            <Select
              value={necessityLevel}
              onChange={(event) =>
                setNecessityLevel(event.target.value as ChecklistItem["necessityLevel"])
              }
            >
              <option value="high">{t("filters.high")}</option>
              <option value="medium">{t("filters.medium")}</option>
              <option value="low">{t("filters.low")}</option>
            </Select>
            <Button
              size="sm"
              onClick={() => {
                const name = newItem.trim();
                if (!name) return;
                const exists = roomItemsAll.some(
                  (roomItem) => normalizeName(roomItem.name) === normalizeName(name)
                );
                if (exists) {
                  notify({
                    title: t("toasts.duplicateTitle"),
                    description: t("toasts.duplicateItem"),
                  });
                  return;
                }
                addItem();
              }}
            >
              {t("room.addItem")}
            </Button>
          </div>
        </div>
      </div>

      <FiltersBar
        statusFilter={statusFilter}
        necessityFilter={necessityFilter}
        sortByStatus={sortByStatus}
        onStatusChange={setStatusFilter}
        onNecessityChange={setNecessityFilter}
        onToggleSort={() => setSortByStatus((prev) => !prev)}
      />

      {roomItems.length === 0 ? (
        <EmptyState
          title={t("room.emptyTitle")}
          description={t("room.emptyDesc")}
        />
      ) : (
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-3">
          {roomItems.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onToggle={(target) =>
                updateItemMutation({ itemId: target.id, data: { done: !target.done } })
              }
              onDelete={(target) => removeItem(target.id)}
              onRename={(target, name) => {
                const exists = roomItemsAll.some(
                  (roomItem) =>
                    roomItem.id !== target.id &&
                    normalizeName(roomItem.name) === normalizeName(name)
                );
                if (exists) {
                  notify({
                    title: t("toasts.duplicateTitle"),
                    description: t("toasts.duplicateItem"),
                  });
                  return;
                }
                updateItemMutation({ itemId: target.id, data: { name } });
              }}
              onChangeNecessity={(target, level) =>
                updateItemMutation({ itemId: target.id, data: { necessityLevel: level } })
              }
            />
          ))}
          </div>
        </div>
      )}
    </div>
  );
};
