"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { useBook } from "@/hooks/useBook";
import { useNav } from "@/hooks/useNav";

export function CreateScreen() {
  const [name, setName] = useState("");
  const { createBook, loading, error } = useBook();
  const { goBack } = useNav();

  async function handleCreate() {
    await createBook(name.trim() || "Our Dictionary");
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
        Name your book.
      </h1>
      <p
        className="text-[13.5px] leading-[1.6] mb-8"
        style={{ color: "var(--ink-light)" }}
      >
        You can always change this later in Settings.
      </p>

      <div
        className="rounded-2xl border mb-4 px-4 py-3"
        style={{ background: "var(--paper)", borderColor: "var(--rule)" }}
      >
        <Input
          label="Book name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Our Dictionary"
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          autoFocus
        />
      </div>

      {error && (
        <p className="text-[13px] text-red-400 mb-4">{error}</p>
      )}

      <Button fullWidth onClick={handleCreate} disabled={loading}>
        {loading ? "Creating…" : "Create our book"}
      </Button>
    </div>
  );
}
