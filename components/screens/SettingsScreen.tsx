"use client";

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useBook } from "@/hooks/useBook";
import { useNav } from "@/hooks/useNav";
import { Button, FieldSection, FieldRow, Input } from "@/components/ui";
import { bookService } from "@/services/bookService";
import { updateBook } from "@/lib/api";

export function SettingsScreen() {
  const { state }          = useApp();
  const { forgetBook }     = useBook();
  const { goTo }           = useNav();
  const [copied, setCopied] = useState(false);
  const [bookName, setBookName] = useState(state.book?.name ?? "");
  const [savingName, setSavingName] = useState(false);

  async function handleCopyCode() {
    if (!state.book) return;
    await navigator.clipboard.writeText(state.book.shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSaveName() {
    if (!state.book || !bookName.trim()) return;
    setSavingName(true);
    try {
      await updateBook(state.book.id, bookName.trim());
    } finally {
      setSavingName(false);
    }
  }

  function handleExport() {
    const data = {
      book:    state.book,
      entries: state.entries,
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `our-dictionary-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleForget() {
    if (confirm("This will remove the book from this device. Your words are still saved in the cloud.\n\nContinue?")) {
      forgetBook();
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-1 pb-0 flex-shrink-0">
        <button
          onClick={() => goTo("home")}
          className="text-[13px] py-2 mb-3 flex items-center gap-1 bg-transparent border-none cursor-pointer"
          style={{ color: "var(--mauve)" }}
        >
          ← Back
        </button>
        <h1
          className="font-['Playfair_Display'] text-[26px] font-normal mb-[18px]"
          style={{ color: "var(--ink)" }}
        >
          Settings
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-20 flex flex-col gap-[14px]">

        {/* Book name */}
        <FieldSection label="Book">
          <FieldRow>
            <Input
              label="Book name"
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              placeholder="Our Dictionary"
            />
          </FieldRow>
          <FieldRow last>
            <span
              className="text-[10.5px] font-medium tracking-[0.04em]"
              style={{ color: "var(--ink-light)" }}
            >
              Book code
            </span>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-3 bg-transparent border-none cursor-pointer w-full text-left p-0 mt-1"
            >
              <span
                className="font-['IBM_Plex_Mono'] text-[22px] tracking-[0.18em]"
                style={{ color: "var(--ink)" }}
              >
                {state.book?.shareCode ?? "—"}
              </span>
              <span
                className="text-[11.5px] transition-colors"
                style={{ color: copied ? "var(--sage)" : "var(--mauve)" }}
              >
                {copied ? "Copied ✓" : "Tap to copy"}
              </span>
            </button>
            <p
              className="text-[11.5px] mt-2 leading-[1.5]"
              style={{ color: "var(--ink-light)" }}
            >
              Share this with your partner so they can join on another device.
            </p>
          </FieldRow>
        </FieldSection>

        {/* Stats */}
        <FieldSection label="Your dictionary">
          <FieldRow>
            <div className="flex justify-between items-center py-[2px]">
              <span className="text-[13.5px]" style={{ color: "var(--ink)" }}>Total words</span>
              <span
                className="font-['IBM_Plex_Mono'] text-[15px]"
                style={{ color: "var(--ink-mid)" }}
              >
                {state.entries.length}
              </span>
            </div>
          </FieldRow>
          <FieldRow>
            <div className="flex justify-between items-center py-[2px]">
              <span className="text-[13.5px]" style={{ color: "var(--ink)" }}>Complete</span>
              <span
                className="font-['IBM_Plex_Mono'] text-[15px]"
                style={{ color: "var(--sage)" }}
              >
                {state.entries.filter(e => e.english && e.hindi && e.filipino).length}
              </span>
            </div>
          </FieldRow>
          <FieldRow last>
            <div className="flex justify-between items-center py-[2px]">
              <span className="text-[13.5px]" style={{ color: "var(--ink)" }}>In progress</span>
              <span
                className="font-['IBM_Plex_Mono'] text-[15px]"
                style={{ color: "var(--wheat)" }}
              >
                {state.entries.filter(e => !(e.english && e.hindi && e.filipino)).length}
              </span>
            </div>
          </FieldRow>
        </FieldSection>

        {/* Data */}
        <FieldSection label="Data">
          <FieldRow>
            <button
              onClick={handleExport}
              className="flex items-center justify-between w-full bg-transparent border-none cursor-pointer py-[2px] text-left"
            >
              <span className="text-[13.5px]" style={{ color: "var(--ink)" }}>
                Export as JSON
              </span>
              <span style={{ color: "var(--mauve)" }}>↓</span>
            </button>
          </FieldRow>
          <FieldRow last>
            <button
              onClick={handleForget}
              className="flex items-center justify-between w-full bg-transparent border-none cursor-pointer py-[2px] text-left"
            >
              <span className="text-[13.5px]" style={{ color: "#B05050" }}>
                Remove from this device
              </span>
              <span style={{ color: "#B05050", opacity: 0.5 }}>→</span>
            </button>
          </FieldRow>
        </FieldSection>

        {/* About */}
        <div
          className="text-center py-8 flex flex-col items-center gap-1"
        >
          <p
            className="font-['Playfair_Display'] text-[15px] italic"
            style={{ color: "var(--mauve-dim)" }}
          >
            Our Dictionary
          </p>
          <p
            className="text-[11px] tracking-[0.08em]"
            style={{ color: "var(--rule)" }}
          >
            A private notebook for two.
          </p>
        </div>

      </div>
    </div>
  );
}
