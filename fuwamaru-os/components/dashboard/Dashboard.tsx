"use client";

import { useState } from "react";
import type { User, NavId } from "@/lib/types";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { DashboardHome } from "./content/DashboardHome";
import { Missions } from "./content/Missions";
import { Report } from "./content/Report";
import { Badges } from "./content/Badges";
import { Ranking } from "./content/Ranking";
import { Shop } from "./content/Shop";
import { Shift } from "./content/Shift";
import { Timeclock } from "./content/Timeclock";
import { POS } from "./content/POS";
import { Inventory } from "./content/Inventory";
import { Community } from "./content/Community";
import { Wiki } from "./content/Wiki";
import { Vote } from "./content/Vote";
import { Settings } from "./content/Settings";
import { Admin } from "./content/Admin";
import { StoreProvider } from "@/lib/store";

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeNav, setActiveNav] = useState<NavId>("dashboard");

  function renderContent() {
    switch (activeNav) {
      case "dashboard":  return <DashboardHome user={user} />;
      case "missions":   return <Missions />;
      case "report":     return <Report />;
      case "badges":     return <Badges />;
      case "ranking":    return <Ranking currentUserId={user.id} />;
      case "shop":       return <Shop user={user} />;
      case "shift":      return <Shift />;
      case "timeclock":  return <Timeclock />;
      case "pos":        return <POS />;
      case "inventory":  return <Inventory />;
      case "community":  return <Community user={user} />;
      case "wiki":       return <Wiki />;
      case "vote":       return <Vote />;
      case "settings":   return <Settings user={user} />;
      case "admin":      return <Admin />;
      default:           return <DashboardHome user={user} />;
    }
  }

  return (
    <StoreProvider>
    <div style={{ display: "flex", height: "100vh", background: "var(--c-bg0)" }}>
      <Sidebar activeNav={activeNav} onNav={setActiveNav} onLogout={onLogout} role={user.role} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <Header user={user} />
        <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {renderContent()}
        </main>
      </div>
    </div>
    </StoreProvider>
  );
}
