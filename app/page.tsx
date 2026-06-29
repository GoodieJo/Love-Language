"use client";

/**
 * Root page — shell only.
 * Phase 2 will replace this with the full screen router
 * (Onboarding → Home → Entry → Add).
 */
export default function Page() {
  return (
    <main
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100svh",
        background: "var(--base)",
        fontFamily: "'Playfair Display', serif",
        fontSize: "2rem",
        color: "var(--ink)",
      }}
    >
      Our Dictionary ✦
    </main>
  );
}
