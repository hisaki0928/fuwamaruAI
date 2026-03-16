"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type {
  Mission, Badge, ShopItem, POSItem, InventoryItem, WikiArticle, Proposal,
} from "./types";
import {
  MOCK_MISSIONS, MOCK_BADGES, MOCK_SHOP_ITEMS, MOCK_POS_ITEMS,
  MOCK_INVENTORY, MOCK_WIKI_ARTICLES, MOCK_PROPOSALS,
} from "./mock-data";

// ─────────────────────────────────────────────────────────
// Store interface
// ─────────────────────────────────────────────────────────
export interface DataStore {
  missions:  Mission[];
  badges:    Badge[];
  shopItems: ShopItem[];
  posItems:  POSItem[];
  inventory: InventoryItem[];
  wiki:      WikiArticle[];
  proposals: Proposal[];

  setMissions:  (v: Mission[])       => void;
  setBadges:    (v: Badge[])         => void;
  setShopItems: (v: ShopItem[])      => void;
  setPosItems:  (v: POSItem[])       => void;
  setInventory: (v: InventoryItem[]) => void;
  setWiki:      (v: WikiArticle[])   => void;
  setProposals: (v: Proposal[])      => void;
}

// ─────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────
const StoreCtx = createContext<DataStore | null>(null);

const LS_KEY = "fuwa_store_v2";

type Saved = {
  missions?: Mission[];
  badges?: Badge[];
  shopItems?: ShopItem[];
  posItems?: POSItem[];
  inventory?: InventoryItem[];
  wiki?: WikiArticle[];
  proposals?: Proposal[];
};

function loadLS(): Saved {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Saved) : {};
  } catch {
    return {};
  }
}

// ─────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────
export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready,     setReady]     = useState(false);
  const [missions,  setMissions]  = useState<Mission[]>([]);
  const [badges,    setBadges]    = useState<Badge[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [posItems,  setPosItems]  = useState<POSItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [wiki,      setWiki]      = useState<WikiArticle[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  // Hydrate from localStorage (fallback to mock data)
  useEffect(() => {
    const s = loadLS();
    setMissions (s.missions  ?? MOCK_MISSIONS);
    setBadges   (s.badges    ?? MOCK_BADGES);
    setShopItems(s.shopItems ?? MOCK_SHOP_ITEMS);
    setPosItems (s.posItems  ?? MOCK_POS_ITEMS);
    setInventory(s.inventory ?? MOCK_INVENTORY);
    setWiki     (s.wiki      ?? MOCK_WIKI_ARTICLES);
    setProposals(s.proposals ?? MOCK_PROPOSALS);
    setReady(true);
  }, []);

  // Persist on every change (skip first render before hydration)
  useEffect(() => {
    if (!ready) return;
    const data: Saved = { missions, badges, shopItems, posItems, inventory, wiki, proposals };
    try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch { /* quota exceeded */ }
  }, [ready, missions, badges, shopItems, posItems, inventory, wiki, proposals]);

  return (
    <StoreCtx.Provider value={{
      missions, badges, shopItems, posItems, inventory, wiki, proposals,
      setMissions, setBadges, setShopItems, setPosItems, setInventory, setWiki, setProposals,
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
