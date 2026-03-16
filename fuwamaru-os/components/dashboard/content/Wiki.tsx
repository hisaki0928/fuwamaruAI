"use client";

import { useState } from "react";
import { BookOpen, ChevronRight, Eye, Clock, ArrowLeft, Search } from "lucide-react";
import type { WikiCategory, WikiArticle } from "@/lib/types";
import { useStore } from "@/lib/store";

const CAT_COLORS: Record<WikiCategory, string> = {
  "接客マニュアル": "var(--c-blue)",
  "ドリンクレシピ": "var(--c-xp)",
  "衛生管理":       "var(--c-green)",
  "緊急対応":       "var(--c-red)",
  "新人研修":       "var(--c-fp)",
};

const CATS: (WikiCategory | "ALL")[] = ["ALL", "接客マニュアル", "ドリンクレシピ", "衛生管理", "緊急対応", "新人研修"];

function ArticleView({ article, onBack }: { article: WikiArticle; onBack: () => void }) {
  const color = CAT_COLORS[article.category];
  return (
    <div style={{ padding: "24px", maxWidth: 720 }}>
      <button onClick={onBack} style={{
        display: "flex", alignItems: "center", gap: 5, background: "none", border: "none",
        cursor: "pointer", fontSize: 12, color: "var(--c-t2)", marginBottom: 20, padding: 0,
      }}>
        <ArrowLeft size={13} /> 記事一覧に戻る
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <span style={{
          fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
          background: `${color}15`, color, border: `1px solid ${color}30`,
        }}>{article.category}</span>
      </div>
      <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 900, color: "var(--c-t0)", lineHeight: 1.3 }}>
        {article.title}
      </h1>
      <div style={{ display: "flex", gap: 16, fontSize: 11, color: "var(--c-t2)", marginBottom: 24 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Eye size={11} /> {article.views} 閲覧</span>
        <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock size={11} /> {article.updatedAt} 更新</span>
        <span>✍ {article.author}</span>
      </div>

      <div style={{
        background: "var(--c-bg2)", border: "1px solid var(--c-border)", borderRadius: 14, padding: "24px",
        fontSize: 14, color: "var(--c-t0)", lineHeight: 1.8,
      }}>
        {article.content.split("\n").map((line, i) => {
          if (line.startsWith("## ")) return <h2 key={i} style={{ fontSize: 16, fontWeight: 800, color: "var(--c-t0)", margin: "16px 0 8px" }}>{line.slice(3)}</h2>;
          if (line.startsWith("### ")) return <h3 key={i} style={{ fontSize: 14, fontWeight: 700, color: "var(--c-t0)", margin: "12px 0 6px" }}>{line.slice(4)}</h3>;
          if (line.startsWith("- ")) return <div key={i} style={{ padding: "2px 0 2px 16px", color: "var(--c-t1)" }}>• {line.slice(2)}</div>;
          if (line.startsWith("- [ ] ")) return <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0 3px 16px" }}>
            <input type="checkbox" readOnly style={{ accentColor: "var(--c-xp)" }} />
            <span style={{ color: "var(--c-t1)" }}>{line.slice(6)}</span>
          </div>;
          if (line.trim() === "") return <div key={i} style={{ height: 8 }} />;
          return <p key={i} style={{ margin: "4px 0", color: "var(--c-t1)" }}>{line}</p>;
        })}
      </div>
    </div>
  );
}

export function Wiki() {
  const { wiki } = useStore();
  const [cat, setCat] = useState<WikiCategory | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<WikiArticle | null>(null);

  if (selected) return <ArticleView article={selected} onBack={() => setSelected(null)} />;

  const filtered = wiki.filter((a) => {
    if (cat !== "ALL" && a.category !== cat) return false;
    if (query && !a.title.includes(query) && !a.summary.includes(query)) return false;
    return true;
  });

  return (
    <div style={{ padding: "24px", maxWidth: 760 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 11,
          background: "rgba(181,100,10,0.1)", border: "1px solid rgba(181,100,10,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <BookOpen size={18} color="var(--c-xp)" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--c-t0)" }}>Wiki ナレッジ</h1>
          <p style={{ margin: 0, fontSize: 12, color: "var(--c-t2)" }}>{wiki.length} 記事</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 14 }}>
        <Search size={13} color="var(--c-t2)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="記事を検索..."
          style={{
            width: "100%", padding: "10px 12px 10px 34px", borderRadius: 10, fontSize: 13,
            background: "var(--c-bg2)", border: "1px solid var(--c-border)", color: "var(--c-t0)", outline: "none",
            boxSizing: "border-box",
          }} />
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {CATS.map((c) => {
          const active = cat === c;
          const color = c !== "ALL" ? CAT_COLORS[c] : "var(--c-xp)";
          return (
            <button key={c} onClick={() => setCat(c)} style={{
              padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 11.5, fontWeight: 600,
              background: active ? `${color}15` : "var(--c-bg2)",
              color: active ? color : "var(--c-t1)",
              border: `1px solid ${active ? color + "40" : "var(--c-border)"}`,
            }}>
              {c === "ALL" ? "すべて" : c}
            </button>
          );
        })}
      </div>

      {/* Article list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((article) => {
          const color = CAT_COLORS[article.category];
          return (
            <button
              key={article.id}
              onClick={() => setSelected(article)}
              style={{
                display: "flex", alignItems: "center", gap: 14, padding: "16px 18px",
                borderRadius: 12, cursor: "pointer", textAlign: "left", width: "100%",
                background: "var(--c-bg2)", border: "1px solid var(--c-border)", transition: "all 0.15s",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                    background: `${color}12`, color, border: `1px solid ${color}25`,
                  }}>{article.category}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--c-t0)", marginBottom: 4, lineHeight: 1.3 }}>
                  {article.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--c-t2)", lineHeight: 1.5 }}>{article.summary}</div>
                <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 10.5, color: "var(--c-t2)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Eye size={10} /> {article.views}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock size={10} /> {article.updatedAt}</span>
                  <span>✍ {article.author}</span>
                </div>
              </div>
              <ChevronRight size={14} color="var(--c-t2)" style={{ flexShrink: 0 }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
