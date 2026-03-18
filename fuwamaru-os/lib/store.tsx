"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type {
  Mission, Badge, ShopItem, POSItem, InventoryItem, WikiArticle, Proposal,
  InventoryLog, PendingOrder, ShiftEntry,
} from "./types";
import {
  MOCK_MISSIONS, MOCK_BADGES, MOCK_SHOP_ITEMS, MOCK_POS_ITEMS,
  MOCK_INVENTORY, MOCK_WIKI_ARTICLES, MOCK_PROPOSALS, MOCK_SHIFTS,
  REGISTERED_USERS,
} from "./mock-data";

// ─────────────────────────────────────────────────────────
// Store interface
// ─────────────────────────────────────────────────────────
export interface DataStore {
  missions:       Mission[];
  badges:         Badge[];
  shopItems:      ShopItem[];
  posItems:       POSItem[];
  inventory:      InventoryItem[];
  wiki:           WikiArticle[];
  proposals:      Proposal[];
  inventoryLogs:  InventoryLog[];
  pendingOrders:  PendingOrder[];
  shifts:         ShiftEntry[];
  passwords:      Record<string, string>;

  setMissions:      (v: Mission[])       => void;
  setBadges:        (v: Badge[])         => void;
  setShopItems:     (v: ShopItem[])      => void;
  setPosItems:      (v: POSItem[])       => void;
  setInventory:     (v: InventoryItem[]) => void;
  setWiki:          (v: WikiArticle[])   => void;
  setProposals:     (v: Proposal[])      => void;
  setInventoryLogs: (v: InventoryLog[])  => void;
  setPendingOrders: (v: PendingOrder[])  => void;
  setShifts:        (v: ShiftEntry[])    => void;
  setPasswords:     (v: Record<string, string>) => void;
}

// ─────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────
const StoreCtx = createContext<DataStore | null>(null);

const LS_KEY = "fuwa_store_v2";

type Saved = {
  missions?:      Mission[];
  badges?:        Badge[];
  shopItems?:     ShopItem[];
  posItems?:      POSItem[];
  inventory?:     InventoryItem[];
  wiki?:          WikiArticle[];
  proposals?:     Proposal[];
  inventoryLogs?: InventoryLog[];
  pendingOrders?: PendingOrder[];
  shifts?:        ShiftEntry[];
  passwords?:     Record<string, string>;
};

function loadLS(): Saved {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Saved) : {};
  } catch {
    return {};
  }
}

// Build default passwords from REGISTERED_USERS
function buildDefaultPasswords(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const u of REGISTERED_USERS) {
    if (u.password) {
      map[u.id] = u.password;
    }
  }
  return map;
}

// ─────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────
export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready,         setReady]         = useState(false);
  const [missions,      setMissions]      = useState<Mission[]>([]);
  const [badges,        setBadges]        = useState<Badge[]>([]);
  const [shopItems,     setShopItems]     = useState<ShopItem[]>([]);
  const [posItems,      setPosItems]      = useState<POSItem[]>([]);
  const [inventory,     setInventory]     = useState<InventoryItem[]>([]);
  const [wiki,          setWiki]          = useState<WikiArticle[]>([]);
  const [proposals,     setProposals]     = useState<Proposal[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [shifts,        setShifts]        = useState<ShiftEntry[]>([]);
  const [passwords,     setPasswords]     = useState<Record<string, string>>({});

  // Hydrate from localStorage (fallback to mock data)
  useEffect(() => {
    const s = loadLS();
    setMissions      (s.missions      ?? MOCK_MISSIONS);
    setBadges        (s.badges        ?? MOCK_BADGES);
    setShopItems     (s.shopItems     ?? MOCK_SHOP_ITEMS);
    setPosItems      (s.posItems      ?? MOCK_POS_ITEMS);
    setInventory     (s.inventory     ?? MOCK_INVENTORY);
    setWiki          (s.wiki          ?? MOCK_WIKI_ARTICLES);
    setProposals     (s.proposals     ?? MOCK_PROPOSALS);
    setInventoryLogs (s.inventoryLogs ?? []);
    setPendingOrders (s.pendingOrders ?? []);
    setShifts        (s.shifts        ?? MOCK_SHIFTS);
    setPasswords     (s.passwords     ?? buildDefaultPasswords());
    setReady(true);
  }, []);

  // Persist on every change (skip first render before hydration)
  useEffect(() => {
    if (!ready) return;
    const data: Saved = {
      missions, badges, shopItems, posItems, inventory, wiki, proposals,
      inventoryLogs, pendingOrders, shifts, passwords,
    };
    try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch { /* quota exceeded */ }
  }, [ready, missions, badges, shopItems, posItems, inventory, wiki, proposals,
      inventoryLogs, pendingOrders, shifts, passwords]);

  return (
    <StoreCtx.Provider value={{
      missions, badges, shopItems, posItems, inventory, wiki, proposals,
      inventoryLogs, pendingOrders, shifts, passwords,
      setMissions, setBadges, setShopItems, setPosItems, setInventory, setWiki, setProposals,
      setInventoryLogs, setPendingOrders, setShifts, setPasswords,
    }}>
      {children}
    </StoreCtx.Provider>
  );
}

// ─────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────
export function useStore(): DataStore {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within <StoreProvider>");
  return ctx;
}
