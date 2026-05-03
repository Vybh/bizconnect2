import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthUser } from "./hooks/useAuthUser.js";

import HomePage from "./pages/HomePage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import MainPage from "./pages/MainPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ExpertsPage from "./pages/ExpertsPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import SupportPage from "./pages/SupportPage.jsx";

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="spinner" />
    </div>
  );
}

export default function App() {
  const { authUser, isLoading } = useAuthUser();

  if (isLoading) return <LoadingScreen />;

  const isLoggedIn = Boolean(authUser);
  const isOnBoarded = authUser?.isOnBoarded;

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/support" element={<SupportPage />} />

      <Route
        path="/signup"
        element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <SignupPage />}
      />
      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      <Route
        path="/onboarding"
        element={
          !isLoggedIn ? (
            <Navigate to="/login" replace />
          ) : isOnBoarded ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <OnboardingPage />
          )
        }
      />

      <Route
        path="/experts"
        element={!isLoggedIn ? <Navigate to="/login" replace /> : isOnBoarded ? <ExpertsPage /> : <Navigate to="/onboarding" replace />}
      />
      <Route
        path="/dashboard"
        element={
          !isLoggedIn ? (
            <Navigate to="/login" replace />
          ) : !isOnBoarded ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <MainPage />
          )
        }
      />
      <Route
        path="/notifications"
        element={
          !isLoggedIn ? (
            <Navigate to="/login" replace />
          ) : !isOnBoarded ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <NotificationsPage />
          )
        }
      />
      <Route
        path="/chat/:id"
        element={
          !isLoggedIn ? (
            <Navigate to="/login" replace />
          ) : !isOnBoarded ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <ChatPage />
          )
        }
      />
      <Route
        path="/call/:id"
        element={
          !isLoggedIn ? (
            <Navigate to="/login" replace />
          ) : !isOnBoarded ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <CallPage />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
