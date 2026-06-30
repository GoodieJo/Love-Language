"use client";

import { useApp } from "@/contexts/AppContext";
import { useEntries } from "@/hooks/useEntries";
import { useNav } from "@/hooks/useNav";
import { StatusDot, SyncBadge } from "@/components/ui";
import type { Entry } from "@/types";

export function HomeScreen() {
  const { state } = useApp();
  const { filteredEntries, selectEntry, setSearch, searchQuery, isComplete, syncStatus } = useEntries();
  const { goTo } = useNav();

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-1 pb-0 flex-shrink-0">
        <p
          className="text-[10px] font-medium tracking-[0.18em] uppercase mb-[2px]"
          style={{ color: "var(--mauve)" }}
        >
          Our Dictionary
        </p>
        <div className="flex items-baseline justify-between mb-4">
          <h1
            className="font-['Playfair_Display'] text-[28px] font-normal leading-[1.2]"
            style={{ color: "var(--ink)" }}
          >
            {state.book?.name ?? "Our Dictionary"}
          </h1>
          <SyncBadge status={syncStatus} />
        </div>

        {/* Search + Add */}
        <div className="flex gap-[10px] mb-[18px]">
          <div
            className="flex-1 flex items-center gap-2 rounded-[11px] border px-[14px] py-[10px]"
            style={{ background: "var(--paper)", borderColor: "var(--rule)" }}
          >
            <span className="text-[13px]" style={{ color: "var(--mauve-dim)" }}>⌕</span>
            <input
              value={searchQuery}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search words, translations…"
              className="flex-1 bg-transparent border-none outline-none text-[13.5px] placeholder:italic"
              style={{
                fontFamily: "'Inter', sans-serif",
                color: "var(--ink)",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearch("")}
                className="text-[12px] bg-transparent border-none cursor-pointer"
                style={{ color: "var(--mauve-dim)" }}
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={() => goTo("add")}
            className="w-[42px] h-[42px] rounded-[11px] border-none flex items-center justify-center text-xl flex-shrink-0 cursor-pointer transition-opacity hover:opacity-80"
            style={{ background: "var(--ink)", color: "var(--base)" }}
          >
            +
          </button>
        </div>
      </div>

      {/* Entry count */}
      <div
        className="text-[10.5px] tracking-[0.14em] uppercase font-medium px-6 mb-2 flex-shrink-0"
        style={{ color: "var(--mauve)" }}
      >
        {searchQuery
          ? `${filteredEntries.length} result${filteredEntries.length !== 1 ? "s" : ""}`
          : `${state.entries.length} word${state.entries.length !== 1 ? "s" : ""}`}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 pb-24">
        {filteredEntries.length === 0 ? (
          <div className="pt-16 text-center">
            <p
              className="font-['Playfair_Display'] text-[22px] italic mb-2"
              style={{ color: "var(--rule)" }}
            >
              {searchQuery ? "No matches found." : "Your dictionary is empty."}
            </p>
            {!searchQuery && (
              <p className="text-[13px]" style={{ color: "var(--ink-light)" }}>
                Add your first word →
              </p>
            )}
          </div>
        ) : (
          filteredEntries.map((entry: Entry) => (
            <div
              key={entry.id}
              onClick={() => selectEntry(entry.id)}
              className="flex items-center gap-3 py-[13px] border-b cursor-pointer transition-opacity hover:opacity-60"
              style={{ borderColor: "var(--rule-soft)" }}
            >
              <StatusDot complete={isComplete(entry)} />
              <div className="flex-1 min-w-0">
                <p
                  className="font-['Playfair_Display'] text-[17px] font-normal mb-[2px]"
                  style={{ color: "var(--ink)" }}
                >
                  {entry.english}
                </p>
                <p
                  className="text-[12px] truncate"
                  style={{ color: "var(--ink-light)" }}
                >
                  {[entry.hindi, entry.filipino]
                    .filter(Boolean)
                    .join(" · ") || "Not yet translated"}
                </p>
              </div>
              <span style={{ color: "var(--mauve-dim)", fontSize: 16 }}>›</span>
            </div>
          ))
        )}
      </div>

      {/* Bottom nav */}
      <div
        className="flex justify-around px-8 pt-[10px] pb-[22px] flex-shrink-0 border-t"
        style={{
          background: "rgba(251,248,245,0.94)",
          backdropFilter: "blur(16px)",
          borderColor: "var(--rule-soft)",
        }}
      >
        <NavItem icon="📖" label="Dictionary" active />
        <NavItem icon="＋" label="Add" onClick={() => goTo("add")} />
        <NavItem icon="⚙" label="Settings" onClick={() => goTo("settings")} />
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-[3px] bg-transparent border-none cursor-pointer transition-opacity"
      style={{ opacity: active ? 1 : 0.35, color: "var(--ink)" }}
    >
      <span className="text-[19px]">{icon}</span>
      <span className="text-[10px] font-medium tracking-[0.04em]">{label}</span>
    </button>
  );
}
