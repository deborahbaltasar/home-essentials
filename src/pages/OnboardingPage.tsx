import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../state/AuthContext";
import { acceptInvitation, createHome, declineInvitation } from "../services/firestore";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Checkbox } from "../components/ui/Checkbox";
import { useHomes } from "../hooks/useHomes";
import { LoadingState } from "../components/shared/LoadingState";
import { useToast } from "../components/ui/Toast";
import { useInvitationsForEmail } from "../hooks/useInvitations";

export const OnboardingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeHome, isLoading, setActiveHome } = useHomes();
  const { notify } = useToast();
  const { t } = useTranslation();
  const emailLower = user?.email?.toLowerCase();
  const { data: invitations, refetch: refetchInvites } = useInvitationsForEmail(emailLower);
  const pendingInvites = (invitations ?? []).filter((invite) => invite.status === "pending");
  const [homeName, setHomeName] = useState("Minha Casa");
  const [withSeeds, setWithSeeds] = useState(true);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: () =>
      createHome({
        ownerId: user!.uid,
        name: homeName.trim() || "Minha Casa",
        withSeeds,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["homes", user?.uid] });
      notify({ title: t("toasts.homeCreated"), description: t("toasts.homeCreatedDesc") });
      navigate("/app");
    },
  });

  if (isLoading) {
    return <LoadingState message={t("app.preparingHome")} />;
  }

  if (activeHome) {
    navigate("/app");
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6">
        {pendingInvites.length > 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {t("share.inviteTitle")}
            </p>
            <h2 className="mt-2 text-xl font-semibold">{t("share.statusPending")}</h2>
            <p className="mt-2 text-sm text-slate-500">{t("share.inviteDesc")}</p>
            <div className="mt-4 space-y-3">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{invite.homeName}</p>
                      <p className="text-xs text-slate-400">{invite.email}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      {t("share.statusPending")}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        await acceptInvitation(invite, user!.uid);
                        await queryClient.invalidateQueries({ queryKey: ["homes", user?.uid] });
                        await refetchInvites();
                        notify({ title: t("share.statusAccepted"), description: invite.homeName });
                        setActiveHome(invite.homeId);
                        navigate("/app");
                      }}
                    >
                      {t("share.statusAccepted")}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        await declineInvitation(invite.id);
                        await refetchInvites();
                        notify({ title: t("share.statusDenied"), description: invite.homeName });
                      }}
                    >
                      {t("share.statusDenied")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            {t("onboarding.firstAccess")}
          </p>
          <h1 className="text-3xl font-semibold">{t("onboarding.title")}</h1>
          <p className="mt-2 text-sm text-slate-500">{t("onboarding.subtitle")}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {t("onboarding.label")}
          </label>
          <Input
            className="mt-2"
            value={homeName}
            onChange={(event) => setHomeName(event.target.value)}
          />
          <label className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            <Checkbox checked={withSeeds} onChange={() => setWithSeeds((prev) => !prev)} />
            {t("onboarding.seed")}
          </label>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => mutateAsync()} disabled={isPending}>
              {t("onboarding.create")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
