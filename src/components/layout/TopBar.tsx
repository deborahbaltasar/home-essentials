import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { useAuth } from "../../state/AuthContext";
import { Button } from "../ui/Button";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../../i18n";

type TopBarProps = {
  homeName: string;
};

export const TopBar = ({ homeName }: TopBarProps) => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {t("app.tagline")}
          </p>
          <h1 className="text-xl font-semibold">{homeName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/app"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            aria-label={t("misc.backHome")}
          >
            <Home size={16} />
          </Link>
          <select
            value={i18n.language}
            onChange={(event) => setLanguage(event.target.value)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
            aria-label={t("misc.language")}
          >
            <option value="pt">PT</option>
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName ?? "Usuario"}
              className="h-9 w-9 rounded-full border border-slate-200"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold">
              {user?.displayName?.[0] ?? "U"}
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => logout()}>
            {t("app.logout")}
          </Button>
        </div>
      </div>
    </header>
  );
};
