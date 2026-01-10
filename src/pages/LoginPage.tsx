import { useTranslation } from "react-i18next";
import { useAuth } from "../state/AuthContext";
import { Button } from "../components/ui/Button";

export const LoginPage = () => {
  const { login } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-10 px-6 py-12 lg:flex-row lg:items-stretch lg:justify-between">
        <div className="flex max-w-xl flex-col justify-center gap-6 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
            {t("app.title")}
          </p>
          <h1 className="animate-float-up text-4xl font-semibold text-slate-900 sm:text-5xl">
            {t("login.headline")}
          </h1>
          <p className="animate-float-up animate-delay-1 text-base text-slate-500">
            {t("login.subheadline")}
          </p>
          <div className="animate-float-up animate-delay-2 flex flex-col gap-3">
            <p className="text-sm text-slate-500">{t("login.motivationOne")}</p>
            <p className="text-sm text-slate-500">{t("login.motivationTwo")}</p>
            <p className="text-sm text-slate-500">{t("login.motivationThree")}</p>
          </div>
          <div className="animate-float-up animate-delay-3 mt-2 flex w-full max-w-sm flex-col gap-3 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-soft">
            <Button onClick={() => login()}>{t("login.google")}</Button>
            <p className="text-xs text-slate-400">{t("login.safe")}</p>
          </div>
        </div>

        <div className="relative flex w-full max-w-md flex-1 items-center justify-center">
          <div className="hero-glow absolute inset-0 rounded-[40px] opacity-80" />
          <div className="glass-card relative grid w-full gap-4 rounded-[40px] border border-white/60 p-6 shadow-soft">
            <div className="animate-float-up rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                {t("app.progress")}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-2xl font-semibold text-slate-900">62%</p>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  +12%
                </span>
              </div>
              <div className="mt-4 h-2 w-full rounded-full bg-slate-200">
                <div className="h-full w-[62%] rounded-full bg-primary" />
              </div>
            </div>
            <div className="animate-float-up animate-delay-1 grid gap-3 sm:grid-cols-2">
              {["Sala", "Cozinha", "Quarto", "Banho"].map((room) => (
                <div
                  key={room}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  {room}
                  <p className="mt-1 text-xs text-slate-400">Checklist pronto</p>
                </div>
              ))}
            </div>
            <div className="animate-float-up animate-delay-2 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              {t("login.motivationTwo")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
