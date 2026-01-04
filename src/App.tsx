import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { RoomPage } from "./pages/RoomPage";
import { PalettePage } from "./pages/PalettePage";
import { SharePage } from "./pages/SharePage";
import { PublicSharePage } from "./pages/PublicSharePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { RequireAuth } from "./routes/RequireAuth";
import { AppLayout } from "./components/layout/AppLayout";
import { useAuth } from "./state/AuthContext";

const LoginRoute = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return <LoginPage />;
  }
  if (user) {
    return <Navigate to="/app" replace />;
  }
  return <LoginPage />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginRoute />} />
      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <OnboardingPage />
          </RequireAuth>
        }
      />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="room/:roomId" element={<RoomPage />} />
        <Route path="palette" element={<PalettePage />} />
        <Route path="share" element={<SharePage />} />
      </Route>
      <Route path="/share/:shareId" element={<PublicSharePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
