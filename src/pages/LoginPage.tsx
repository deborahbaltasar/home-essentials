import React from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../state/AuthContext";
import { Button } from "../components/ui/Button";

export const LoginPage = () => {
  const { login } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-10 px-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
            {t("app.title")}
          </p>
          <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
            {t("login.headline")}
          </h1>
          <p className="max-w-xl text-base text-slate-500">{t("login.subheadline")}</p>
        </div>
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-soft">
          <Button onClick={() => login()}>{t("login.google")}</Button>
          <p className="text-xs text-slate-400">{t("login.safe")}</p>
        </div>
      </div>
    </div>
  );
};
