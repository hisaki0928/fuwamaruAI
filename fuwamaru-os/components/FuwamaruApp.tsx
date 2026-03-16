"use client";

import { useState } from "react";
import type { Screen, User } from "@/lib/types";
import { USERS_BY_ID } from "@/lib/mock-data";
import { LoginScreen } from "./auth/LoginScreen";
import { Dashboard } from "./dashboard/Dashboard";

export function FuwamaruApp() {
  const [screen, setScreen] = useState<Screen>("login");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  function handleLogin(userId: string) {
    const user = USERS_BY_ID[userId];
    if (user) {
      setCurrentUser(user);
      setScreen("dashboard");
    }
  }

  function handleLogout() {
    setCurrentUser(null);
    setScreen("login");
  }

  if (screen === "dashboard" && currentUser) {
    return <Dashboard user={currentUser} onLogout={handleLogout} />;
  }

  return <LoginScreen onLogin={handleLogin} />;
}
