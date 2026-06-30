"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { useBook } from "@/hooks/useBook";
import { useNav } from "@/hooks/useNav";

export function JoinScreen() {
  const [code, setCode] = useState("");
  const { joinBook, loading, error } = useBook();
  const { goBack } = useNav();

  function handleChange(value: string) {
    // Auto-format as XXX-XXX
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (clean.length <= 3) {
      setCode(clean);
    } else {
      setCode(`${clean.slice(0, 3)}-${clean.slice(3, 6)}`);
    }
  }

  async function handleJoin() {
    if (code.replace("-", "").length < 6) return;
    await joinBook(code);
  }

  return (
    <div className="flex flex-col flex-1 px-8 py-0">
      <button
        onClick={goBack}
        className="text-[13px] self-start py-2 mb-7 flex items-center gap-1 bg-transparent border-none cursor-pointer"
        style={{ color: "var(--mauve)" }}
      >
        ← Back
      </button>

      <h1
        className="font-['Playfair_Display'] text-[28px] font-normal mb-2"
        style={{ color: "var(--ink)" }}
      >
        Enter your code.
      </h1>
      <p
        className="text-[13.5px] leading-[1.6] mb-8"
        style={{ color: "var(--ink-light)" }}
      >
        Your partner should have shared a short code with you.
      </p>

      <input
        value={code}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="ABC-DEF"
        maxLength={7}
        autoFocus
        onKeyDown={(e) => e.key === "Enter" && handleJoin()}
        className="w-full text-center rounded-2xl border py-5 mb-4 outline-none tracking-[0.22em] uppercase transition-colors"
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 30,
          fontWeight: 500,
          color: "var(--ink)",
          background: "var(--paper)",
          borderColor: "var(--rule)",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--mauve)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--rule)")}
      />

      {error && (
        <p className="text-[13px] text-red-400 mb-4">{error}</p>
      )}

      <Button
        fullWidth
        onClick={handleJoin}
        disabled={loading || code.replace("-", "").length < 6}
      >
        {loading ? "Joining…" : "Open our dictionary"}
      </Button>
    </div>
  );
}
