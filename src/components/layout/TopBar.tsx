import { Link } from "react-router-dom";
import { Home, Menu } from "lucide-react";
import { useAuth } from "../../state/AuthContext";
import { Button } from "../ui/Button";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../../i18n";
import type { Home as HomeType } from "../../types";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

type TopBarProps = {
  homeName: string;
  homes?: HomeType[];
  activeHomeId?: string;
  onHomeChange?: (homeId: string) => void;
};

export const TopBar = ({ homeName, homes = [], activeHomeId, onHomeChange }: TopBarProps) => {
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
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to="/app"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              aria-label={t("misc.backHome")}
            >
              <Home size={16} />
            </Link>
            <Link
              to="/app/palette"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:bg-slate-50"
            >
              {t("app.palette")}
            </Link>
            <Link
              to="/app/share"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:bg-slate-50"
            >
              {t("app.share")}
            </Link>
            {homes.length > 1 && (
              <select
                value={activeHomeId}
                onChange={(event) => onHomeChange?.(event.target.value)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
                aria-label={t("misc.selectHome")}
              >
                {homes.map((home) => (
                  <option key={home.id} value={home.id}>
                    {home.name}
                  </option>
                ))}
              </select>
            )}
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
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  aria-label="Menu"
                >
                  <Menu size={18} />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  className="z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-soft"
                >
                  <DropdownMenu.Item asChild>
                    <Link
                      to="/app"
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <Home size={16} />
                      {t("misc.backHome")}
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <Link
                      to="/app/palette"
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      {t("app.palette")}
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <Link
                      to="/app/share"
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      {t("app.share")}
                    </Link>
                  </DropdownMenu.Item>
                  <div className="my-2 h-px bg-slate-200" />
                  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {t("misc.language")}
                  </div>
                  <div className="flex gap-2 px-3 pb-2">
                    {["pt", "en", "es"].map((lng) => (
                      <button
                        key={lng}
                        onClick={() => setLanguage(lng)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                          i18n.language === lng
                            ? "border-primary text-primary"
                            : "border-slate-200 text-slate-500"
                        }`}
                      >
                        {lng}
                      </button>
                    ))}
                  </div>
                  {homes.length > 1 && (
                    <>
                      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        {t("misc.selectHome")}
                      </div>
                      <div className="flex flex-col gap-2 px-3 pb-2">
                        {homes.map((home) => (
                          <button
                            key={home.id}
                            onClick={() => onHomeChange?.(home.id)}
                            className={`rounded-xl px-3 py-2 text-left text-sm ${
                              activeHomeId === home.id
                                ? "bg-slate-100 text-slate-900"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {home.name}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  <DropdownMenu.Item asChild>
                    <button
                      onClick={() => logout()}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      {t("app.logout")}
                    </button>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>

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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout()}
            className="hidden lg:inline-flex"
          >
            {t("app.logout")}
          </Button>
        </div>
      </div>
    </header>
  );
};
