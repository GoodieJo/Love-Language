"use client";

import { Button } from "@/components/ui";
import { useNav } from "@/hooks/useNav";

export function OnboardingScreen() {
  const { goTo } = useNav();

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-9 py-12 text-center">
      <div className="text-3xl mb-5 opacity-60">✦</div>

      <p
        className="text-[10.5px] font-medium tracking-[0.22em] uppercase mb-3"
        style={{ color: "var(--mauve)" }}
      >
        Our Dictionary
      </p>

      <h1
        className="font-['Playfair_Display'] text-[36px] font-normal leading-[1.2] mb-4"
        style={{ color: "var(--ink)" }}
      >
        A book that<br />
        belongs to<br />
        <em className="italic" style={{ color: "var(--mauve)" }}>both of you.</em>
      </h1>

      <p
        className="text-[14px] leading-[1.65] mb-11 max-w-[230px]"
        style={{ color: "var(--ink-light)" }}
      >
        Build a private multilingual notebook together, one word at a time.
      </p>

      <div
        className="w-8 h-px mb-9"
        style={{ background: "var(--rule)" }}
      />

      <div className="w-full flex flex-col gap-[10px]">
        <Button fullWidth onClick={() => goTo("create")}>
          Create our book
        </Button>
        <Button fullWidth variant="secondary" onClick={() => goTo("join")}>
          Join with a code
        </Button>
      </div>
    </div>
  );
}
