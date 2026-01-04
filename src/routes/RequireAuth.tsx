import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { LoadingState } from "../components/shared/LoadingState";
import { useTranslation } from "react-i18next";

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return <LoadingState message={t("app.verifyingAccess")} />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
