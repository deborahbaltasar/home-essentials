import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useHomes } from "../hooks/useHomes";
import { updatePalette } from "../services/firestore";
import { defaultPalette, presetPalettes } from "../constants/palettes";
import type { Palette } from "../types";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useToast } from "../components/ui/Toast";

export const PalettePage = () => {
  const { activeHome } = useHomes();
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const { t } = useTranslation();
  const [draft, setDraft] = useState<Palette>(activeHome?.palette ?? defaultPalette);

  useEffect(() => {
    if (activeHome?.palette) {
      setDraft(activeHome.palette);
    }
  }, [activeHome?.palette]);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: () => updatePalette(activeHome!.id, draft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homes"] });
      notify({ title: t("toasts.paletteSaved"), description: t("toasts.paletteSavedDesc") });
    },
  });

  const handlePreset = (palette: Palette) => {
    setDraft(palette);
  };

  const handleChange = (key: keyof Palette, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  if (!activeHome) return null;

  return (
    <div className="space-y-6">
      <Card className="bg-white/80">
        <h2 className="text-lg font-semibold">{t("palette.title")}</h2>
        <p className="mt-1 text-sm text-slate-500">{t("palette.subtitle")}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {presetPalettes.map((palette) => (
            <button
              key={palette.name}
              type="button"
              onClick={() => handlePreset(palette.palette)}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
            >
              <div>
                <p className="text-sm font-semibold">{palette.name}</p>
                <p className="text-xs text-slate-500">
                  {t("palette.primary")} {palette.palette.primary}
                </p>
              </div>
              <div className="flex gap-2">
                {Object.values(palette.palette).map((color) => (
                  <span key={color} className="h-6 w-6 rounded-full border border-slate-200" style={{ background: color }} />
                ))}
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="bg-white/80">
        <h2 className="text-lg font-semibold">{t("palette.customTitle")}</h2>
        <p className="mt-1 text-sm text-slate-500">{t("palette.customSubtitle")}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {(["primary", "secondary", "accent", "neutral"] as Array<keyof Palette>).map((key) => (
            <label key={key} className="flex flex-col gap-2 text-sm font-medium text-slate-600">
              {key.toUpperCase()}
              <div className="flex items-center gap-3">
                <Input type="color" value={draft[key]} onChange={(event) => handleChange(key, event.target.value)} />
                <Input value={draft[key]} onChange={(event) => handleChange(key, event.target.value)} />
              </div>
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => mutateAsync()} disabled={isPending}>
            {t("palette.apply")}
          </Button>
        </div>
      </Card>
    </div>
  );
};
