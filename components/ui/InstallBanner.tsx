"use client";

import { useState, useEffect } from "react";
import { useServiceWorker } from "@/hooks/useServiceWorker";

export function InstallBanner() {
  const { canInstall, install } = useServiceWorker();
  const [visible, setVisible]   = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Show banner 4 seconds after mount, only if installable and not dismissed
  useEffect(() => {
    if (!canInstall || dismissed) return;
    const t = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(t);
  }, [canInstall, dismissed]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-24 left-4 right-4 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg"
      style={{
        background:   "var(--paper)",
        borderColor:  "var(--rule)",
        boxShadow:    "0 8px 32px rgba(61,53,48,0.10)",
        maxWidth:     440,
        margin:       "0 auto",
      }}
    >
      <span className="text-xl">📖</span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>
          Add to Home Screen
        </p>
        <p className="text-[11.5px]" style={{ color: "var(--ink-light)" }}>
          Open your dictionary like an app
        </p>
      </div>
      <button
        onClick={async () => { await install(); setVisible(false); }}
        className="text-[12.5px] font-medium px-3 py-1.5 rounded-[8px] border-none cursor-pointer transition-opacity hover:opacity-80"
        style={{ background: "var(--ink)", color: "var(--base)" }}
      >
        Add
      </button>
      <button
        onClick={() => { setVisible(false); setDismissed(true); }}
        className="text-[12px] bg-transparent border-none cursor-pointer"
        style={{ color: "var(--ink-light)" }}
      >
        ✕
      </button>
    </div>
  );
}
