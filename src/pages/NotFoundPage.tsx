import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const NotFoundPage = () => {
  const { t } = useTranslation();
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-3xl font-semibold">{t("public.notFoundTitle")}</h1>
      <p className="text-sm text-slate-500">{t("public.notFoundDesc")}</p>
      <Link to="/" className="text-sm font-semibold text-primary">
        {t("misc.goLogin")}
      </Link>
    </div>
  );
};
