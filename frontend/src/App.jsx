import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { CategoryProvider } from "./context/CategoryContext.jsx";
import Layout from "./components/Layout.jsx";
import PageTransition from "./components/PageTransition.jsx";
import Login from "./pages/Login.jsx";
import Wardrobe from "./pages/Wardrobe.jsx";
import Outfits from "./pages/Outfits.jsx";
import Settings from "./pages/Settings.jsx";
import AIRecommendations from "./pages/AIRecommendations.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import { useWidgetSync } from "./hooks/useWidgetSync.js";

function WidgetSyncer() {
  useWidgetSync();
  return null;
}

function PrivateRoute({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CategoryProvider>
          <WidgetSyncer />
          <PageTransition>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Wardrobe />
                </PrivateRoute>
              }
            />
            <Route
              path="/outfits"
              element={
                <PrivateRoute>
                  <Outfits />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              }
            />
            <Route
              path="/ai"
              element={
                <PrivateRoute>
                  <AIRecommendations />
                </PrivateRoute>
              }
            />
            <Route
              path="/search"
              element={
                <PrivateRoute>
                  <SearchPage />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PageTransition>
        </CategoryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
