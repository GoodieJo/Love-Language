"use client";

import { type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import type { SyncStatus } from "@/reducers/appReducer";

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  fullWidth?: boolean;
  type?: "button" | "submit";
}

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  fullWidth,
  type = "button",
}: ButtonProps) {
  const base =
    "rounded-[14px] font-['Inter'] text-[14.5px] font-medium tracking-[0.02em] transition-opacity duration-150 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed";

  const variants = {
    primary:   "bg-[var(--ink)] text-[var(--base)] py-[15px] px-5",
    secondary: "bg-transparent text-[var(--ink-mid)] border border-[var(--rule)] py-[15px] px-5 hover:border-[var(--mauve)] hover:text-[var(--ink)]",
    ghost:     "bg-transparent text-[var(--mauve)] text-[13px] py-2 px-0 font-normal",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""}`}
    >
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  mono?: boolean;
}

export function Input({ label, mono, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-[10.5px] text-[var(--ink-light)] font-medium tracking-[0.04em]">
          {label}
        </span>
      )}
      <input
        className={`bg-transparent border-none outline-none text-[var(--ink)] placeholder:text-[var(--mauve-dim)] placeholder:italic w-full
          ${mono ? "font-['IBM_Plex_Mono'] text-[13px] text-[var(--wheat)]" : "font-['Inter'] text-[14.5px]"}
          ${className}`}
        {...props}
      />
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className = "", ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-[10.5px] text-[var(--ink-light)] font-medium tracking-[0.04em]">
          {label}
        </span>
      )}
      <textarea
        className={`bg-transparent border-none outline-none resize-none text-[var(--ink)] font-['Inter'] text-[14.5px] leading-[1.65] placeholder:text-[var(--mauve-dim)] placeholder:italic w-full ${className}`}
        {...props}
      />
    </div>
  );
}

// ─── StatusDot ────────────────────────────────────────────────────────────────

export function StatusDot({ complete }: { complete: boolean }) {
  return (
    <div
      className="w-2 h-2 rounded-full flex-shrink-0 mt-[3px]"
      style={{ background: complete ? "var(--sage)" : "var(--wheat)" }}
    />
  );
}

// ─── SyncBadge ────────────────────────────────────────────────────────────────

const syncLabels: Record<SyncStatus, string | null> = {
  idle:    null,
  syncing: "Saving…",
  error:   "Error saving",
  offline: "Offline",
};

export function SyncBadge({ status }: { status: SyncStatus }) {
  const label = syncLabels[status];
  if (!label) return null;

  const color =
    status === "error"   ? "text-red-400" :
    status === "offline" ? "text-[var(--wheat)]" :
                           "text-[var(--mauve)]";

  return (
    <span className={`text-[11px] tracking-[0.04em] ${color}`}>
      {label}
    </span>
  );
}

// ─── LangCard ─────────────────────────────────────────────────────────────────

export function LangCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-[var(--rule)] overflow-hidden relative ${className}`}
      style={{ background: "var(--paper)" }}
    >
      {/* Ruled lines */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, var(--rule) 27px, var(--rule) 28px)",
          opacity: 0.25,
        }}
      />
      {/* Left margin */}
      <div
        className="absolute top-11 bottom-0 w-px pointer-events-none"
        style={{ left: 48, background: "rgba(196,168,130,0.18)" }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ─── LangHeader ───────────────────────────────────────────────────────────────

export function LangHeader({ label, complete }: { label: string; complete: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--rule-soft)]">
      <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[var(--mauve)]">
        {label}
      </span>
      <div
        className="w-[6px] h-[6px] rounded-full"
        style={{ background: complete ? "var(--sage)" : "var(--wheat)" }}
      />
    </div>
  );
}

// ─── FieldSection ─────────────────────────────────────────────────────────────

export function FieldSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--rule)] overflow-hidden" style={{ background: "var(--paper)" }}>
      <div className="px-4 py-[10px] border-b border-[var(--rule-soft)] text-[10px] font-semibold tracking-[0.18em] uppercase text-[var(--mauve)]">
        {label}
      </div>
      {children}
    </div>
  );
}

export function FieldRow({ children, last }: { children: ReactNode; last?: boolean }) {
  return (
    <div className={`px-4 py-[10px] flex flex-col gap-1 ${!last ? "border-b border-[rgba(232,224,216,0.5)]" : ""}`}>
      {children}
    </div>
  );
}

export function RecordRow({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 py-[10px] flex items-center justify-between border-b border-[rgba(232,224,216,0.5)]">
      {children}
    </div>
  );
}
