import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useOutletContext } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import type { AppLayoutContext } from "../components/layout/AppLayout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Checkbox } from "../components/ui/Checkbox";
import { useHomes } from "../hooks/useHomes";
import { inviteMember, createShare } from "../services/firestore";
import { useAuth } from "../state/AuthContext";
import { useToast } from "../components/ui/Toast";

export const SharePage = () => {
  const { rooms, items } = useOutletContext<AppLayoutContext>();
  const { activeHome } = useHomes();
  const { user } = useAuth();
  const { notify } = useToast();
  const { t } = useTranslation();
  const isOwner = activeHome?.ownerId === user?.uid;
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [shareLink, setShareLink] = useState<string | null>(null);

  useEffect(() => {
    if (rooms) {
      setSelectedRooms(new Set(rooms.map((room) => room.id)));
    }
    if (items) {
      setSelectedItems(new Set(items.map((item) => item.id)));
    }
  }, [rooms, items]);

  const { mutateAsync: sendInvite, isPending: isInviting } = useMutation({
    mutationFn: () => inviteMember({ homeId: activeHome!.id, email: inviteEmail }),
    onSuccess: () => {
      notify({ title: t("toasts.inviteSent"), description: t("toasts.inviteSentDesc") });
      setInviteEmail("");
    },
  });

  const { mutateAsync: generateShare, isPending: isSharing } = useMutation({
    mutationFn: () =>
      createShare({
        homeId: activeHome!.id,
        createdBy: user!.uid,
        rooms: (rooms ?? []).filter((room) => selectedRooms.has(room.id)),
        items: (items ?? []).filter((item) => selectedItems.has(item.id)),
      }),
    onSuccess: (shareId) => {
      const link = `${window.location.origin}/share/${shareId}`;
      setShareLink(link);
      notify({ title: t("share.linkCreated"), description: t("toasts.linkCreatedDesc") });
    },
  });

  const roomItemsMap = useMemo(() => {
    const map = new Map<string, typeof items>();
    (items ?? []).forEach((item) => {
      const list = map.get(item.roomId) ?? [];
      list.push(item);
      map.set(item.roomId, list);
    });
    return map;
  }, [items]);

  if (!activeHome) return null;

  return (
    <div className="space-y-6">
      <Card className="bg-white/80">
        <h2 className="text-lg font-semibold">{t("share.inviteTitle")}</h2>
        <p className="mt-1 text-sm text-slate-500">{t("share.inviteDesc")}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Input
            placeholder={t("share.invitePlaceholder")}
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
            disabled={!isOwner}
          />
          <Button
            onClick={() => inviteEmail.trim() && sendInvite()}
            disabled={isInviting || !isOwner}
          >
            {t("share.inviteButton")}
          </Button>
        </div>
        {!isOwner && (
          <p className="mt-2 text-xs text-slate-400">{t("share.ownerOnly")}</p>
        )}
      </Card>

      <Card className="bg-white/80">
        <h2 className="text-lg font-semibold">{t("share.publicTitle")}</h2>
        <p className="mt-1 text-sm text-slate-500">{t("share.publicDesc")}</p>

        <div className="mt-5 space-y-4">
          {(rooms ?? []).map((room) => (
            <div key={room.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <Checkbox
                  checked={selectedRooms.has(room.id)}
                  onChange={() => {
                    const roomItems = roomItemsMap.get(room.id) ?? [];
                    setSelectedRooms((prev) => {
                      const next = new Set(prev);
                      if (next.has(room.id)) {
                        next.delete(room.id);
                      } else {
                        next.add(room.id);
                      }
                      return next;
                    });
                    setSelectedItems((prev) => {
                      const next = new Set(prev);
                      if (selectedRooms.has(room.id)) {
                        roomItems.forEach((item) => next.delete(item.id));
                      } else {
                        roomItems.forEach((item) => next.add(item.id));
                      }
                      return next;
                    });
                  }}
                />
                {room.name}
              </label>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {(roomItemsMap.get(room.id) ?? []).map((item) => (
                  <label key={item.id} className="flex items-center gap-2 text-sm text-slate-600">
                    <Checkbox
                      checked={selectedItems.has(item.id)}
                      onChange={() => {
                        setSelectedItems((prev) => {
                          const next = new Set(prev);
                          if (next.has(item.id)) {
                            next.delete(item.id);
                          } else {
                            next.add(item.id);
                          }
                          return next;
                        });
                      }}
                    />
                    {item.name}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Button
            onClick={() => {
              if (selectedRooms.size === 0 || selectedItems.size === 0) {
                notify({ title: t("toasts.selectItemsTitle"), description: t("toasts.selectItems") });
                return;
              }
              generateShare();
            }}
            disabled={isSharing}
          >
            {t("share.generate")}
          </Button>
          {shareLink && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
              {shareLink}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
