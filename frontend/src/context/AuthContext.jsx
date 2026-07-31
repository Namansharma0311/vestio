import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, setToken, getStoredToken, setOnUnauthorized } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem("ck_email");
    setUser(null);
  }, []);

  useEffect(() => {
    setOnUnauthorized(logout);
    return () => setOnUnauthorized(null);
  }, [logout]);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setReady(true);
      return;
    }
    api.me()
      .then((me) => setUser(me))
      .catch(() => {
        setToken(null);
        localStorage.removeItem("ck_email");
      })
      .finally(() => setReady(true));
  }, []);

  async function register(email, password) {
    const data = await api.register(email, password);
    if (!data || !data.token) throw new Error("Registration failed");
    setToken(data.token);
    localStorage.setItem("ck_email", data.user.email);
    setUser(data.user);
  }

  async function login(email, password) {
    const data = await api.login(email, password);
    if (!data || !data.token) throw new Error("Login failed");
    setToken(data.token);
    localStorage.setItem("ck_email", data.user.email);
    setUser(data.user);
  }

  async function updateProfile(fields) {
    const updated = await api.updateProfile(fields);
    setUser((prev) => ({ ...prev, ...updated }));
  }

  async function changePassword(currentPassword, newPassword) {
    return api.changePassword(currentPassword, newPassword);
  }

  async function deleteAccount() {
    await api.deleteAccount();
    logout();
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout, updateProfile, changePassword, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
