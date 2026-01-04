import { useTranslation } from "react-i18next";

export const LoadingState = ({ message }: { message?: string }) => {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-500">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-primary" />
      {message && <p className="text-sm">{message}</p>}
      {!message && <p className="text-sm">{t("app.loadingHome")}</p>}
    </div>
  );
};
