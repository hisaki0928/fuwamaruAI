"use client";

import { useState } from "react";
import { LogOut, ChevronRight, ChevronLeft, Database } from "lucide-react";
import type { NavId, Role } from "@/lib/types";
import { NAV_GROUPS } from "@/lib/mock-data";

interface SidebarProps {
  activeNav: NavId;
  onNav: (id: NavId) => void;
  onLogout: () => void;
  role: Role;
}

export function Sidebar({ activeNav, onNav, onLogout, role }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      style={{
        width: collapsed ? 58 : 232,
        minHeight: "100vh",
        background: "var(--c-bg1)",
        borderRight: "1px solid var(--c-border)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s ease",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 66,
          display: "flex",
          alignItems: "center",
          padding: collapsed ? "0" : "0 18px",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: 10,
          borderBottom: "1px solid var(--c-border)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 33,
            height: 33,
            borderRadius: 9,
            flexShrink: 0,
            background: "linear-gradient(135deg, var(--c-xp), #d97706)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 17,
            boxShadow: "0 0 12px rgba(245,158,11,0.3)",
          }}
        >
          ☕
        </div>
        {!collapsed && (
          <span
            style={{
              fontSize: 14.5,
              fontWeight: 800,
              color: "var(--c-t0)",
              whiteSpace: "nowrap",
            }}
          >
            Fuwamaru{" "}
            <span style={{ color: "var(--c-xp)" }}>OS</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "8px 0",
        }}
      >
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {/* Section label */}
            {group.section && !collapsed && (
              <div
                style={{
                  padding: "12px 18px 3px",
                  fontSize: 9,
                  fontWeight: 800,
                  color: "var(--c-t2)",
                  letterSpacing: 1.8,
                  textTransform: "uppercase",
                }}
              >
                {group.section}
              </div>
            )}

            {/* Nav items */}
            {group.items.map(({ id, label, icon: Icon }) => {
              const isActive = activeNav === id;
              return (
                <button
                  key={id}
                  onClick={() => onNav(id)}
                  title={collapsed ? label : undefined}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: collapsed ? "10px 0" : "8px 18px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    background: isActive ? "rgba(181,100,10,0.1)" : "transparent",
                    borderTop: "none",
                    borderRight: "none",
                    borderBottom: "none",
                    borderLeft: isActive ? "3px solid var(--c-xp)" : "3px solid transparent",
                    cursor: "pointer",
                    color: isActive ? "var(--c-xp)" : "var(--c-t1)",
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    whiteSpace: "nowrap",
                    transition: "color 0.15s, background 0.15s",
                  }}
                >
                  <Icon size={15} />
                  {!collapsed && label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Admin nav — owner/manager only */}
      {(role === "owner" || role === "manager") && (
        <div style={{ padding: "0 0 4px" }}>
          {!collapsed && (
            <div style={{ padding: "10px 18px 3px", fontSize: 9, fontWeight: 800, color: "var(--c-t2)", letterSpacing: 1.8, textTransform: "uppercase" }}>
              管理
            </div>
          )}
          <button
            onClick={() => onNav("admin")}
            title={collapsed ? "データ管理" : undefined}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 9,
              padding: collapsed ? "10px 0" : "8px 18px",
              justifyContent: collapsed ? "center" : "flex-start",
              background: activeNav === "admin" ? "rgba(90,40,176,0.1)" : "transparent",
              borderTop: "none", borderRight: "none", borderBottom: "none",
              borderLeft: activeNav === "admin" ? "3px solid var(--c-fp)" : "3px solid transparent",
              cursor: "pointer",
              color: activeNav === "admin" ? "var(--c-fp)" : "var(--c-t1)",
              fontSize: 13, fontWeight: activeNav === "admin" ? 600 : 400,
              whiteSpace: "nowrap", transition: "color 0.15s, background 0.15s",
            }}
          >
            <Database size={15} />
            {!collapsed && "データ管理"}
          </button>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: "1px solid var(--c-border)", padding: "6px 0" }}>
        <button
          onClick={onLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: collapsed ? "10px 0" : "9px 18px",
            justifyContent: collapsed ? "center" : "flex-start",
            background: "transparent",
            border: "none",
            color: "var(--c-t1)",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          <LogOut size={15} />
          {!collapsed && "ログアウト"}
        </button>
        <button
          onClick={() => setCollapsed((c) => !c)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: collapsed ? "10px 0" : "9px 18px",
            justifyContent: collapsed ? "center" : "flex-start",
            background: "transparent",
            border: "none",
            color: "var(--c-t2)",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          {!collapsed && "折りたたむ"}
        </button>
      </div>
    </aside>
  );
}
