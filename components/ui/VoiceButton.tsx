"use client";

import { useCallback, useEffect } from "react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useAudioPlayer }   from "@/hooks/useAudioPlayer";

export type VoiceLang = "english" | "hindi" | "filipino";

interface VoiceButtonProps {
  /** R2-backed URL if a recording already exists, null otherwise */
  src:      string | null;
  /** Called with the recorded blob — should upload to R2 and return */
  onSave:   (blob: Blob) => Promise<void>;
  /** Called when user taps delete */
  onDelete?: () => void;
}

export function VoiceButton({ src, onSave, onDelete }: VoiceButtonProps) {
  const recorder = useVoiceRecorder({ onRecorded: onSave });
  const player   = useAudioPlayer(src);

  // Stop player when recording starts
  useEffect(() => {
    if (recorder.state === "recording") player.stop();
  }, [recorder.state]);

  // ── States ────────────────────────────────────────────────────────────────

  const isRecording  = recorder.state === "recording";
  const isUploading  = recorder.state === "uploading";
  const hasRecording = !!src;
  const isPlaying    = player.playerState === "playing";
  const isLoading    = player.playerState === "loading";

  // ── Hold handlers ─────────────────────────────────────────────────────────

  function handlePointerDown(e: React.PointerEvent) {
    e.preventDefault();
    if (isUploading || isRecording) return;
    recorder.start();
  }

  function handlePointerUp(e: React.PointerEvent) {
    e.preventDefault();
    if (isRecording) recorder.stop();
  }

  // Also stop if pointer leaves while held
  function handlePointerLeave(e: React.PointerEvent) {
    e.preventDefault();
    if (isRecording) recorder.stop();
  }

  // ── Play / pause ──────────────────────────────────────────────────────────

  function handlePlay() {
    if (isPlaying) player.pause();
    else player.play();
  }

  // ── Seconds formatter ─────────────────────────────────────────────────────
  function fmt(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-2">

      {/* Error message */}
      {recorder.error && (
        <p className="text-[11.5px]" style={{ color: "#B05050" }}>
          {recorder.error}
        </p>
      )}

      <div className="flex items-center gap-2 flex-wrap">

        {/* ── Playback row — only shown when recording exists ── */}
        {hasRecording && (
          <div
            className="flex items-center gap-2 rounded-[10px] border px-3 py-[6px]"
            style={{ background: "var(--rose-tint)", borderColor: "var(--rule)" }}
          >
            {/* Play/pause button */}
            <button
              onClick={handlePlay}
              disabled={isLoading}
              className="flex items-center justify-center w-6 h-6 rounded-full border-none bg-transparent cursor-pointer transition-opacity disabled:opacity-40"
              style={{ color: "var(--ink-mid)" }}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isLoading ? (
                <SpinnerIcon />
              ) : isPlaying ? (
                <PauseIcon />
              ) : (
                <PlayIcon />
              )}
            </button>

            {/* Progress bar */}
            <div
              className="relative h-[3px] rounded-full overflow-hidden"
              style={{ width: 64, background: "var(--rule)" }}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-100"
                style={{
                  width: `${player.progress * 100}%`,
                  background: "var(--mauve)",
                }}
              />
            </div>

            {/* Duration */}
            <span
              className="text-[11px] tabular-nums"
              style={{ fontFamily: "'IBM Plex Mono', monospace", color: "var(--ink-light)" }}
            >
              {isPlaying
                ? fmt(player.duration * player.progress)
                : player.duration
                ? fmt(player.duration)
                : "···"}
            </span>

            {/* Delete */}
            {onDelete && (
              <button
                onClick={() => { player.stop(); onDelete(); }}
                className="ml-1 text-[11px] bg-transparent border-none cursor-pointer transition-opacity hover:opacity-60"
                style={{ color: "var(--ink-light)" }}
                title="Delete recording"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* ── Record button ── */}
        <button
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          disabled={isUploading}
          className="flex items-center gap-[6px] rounded-[10px] border px-3 py-[6px] text-[12px] cursor-pointer select-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            fontFamily: "'Inter', sans-serif",
            background:   isRecording ? "rgba(176,80,80,0.08)" : "var(--rose-tint)",
            borderColor:  isRecording ? "rgba(176,80,80,0.35)" : "var(--rule)",
            color:        isRecording ? "#B05050"              : "var(--ink-mid)",
            transform:    isRecording ? "scale(1.03)"          : "scale(1)",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          {isUploading ? (
            <>
              <SpinnerIcon />
              <span>Saving…</span>
            </>
          ) : isRecording ? (
            <>
              <RecordingDot />
              <span>{fmt(recorder.duration)} — Release to save</span>
            </>
          ) : (
            <>
              <MicIcon />
              <span>{hasRecording ? "Re-record" : "Hold to record"}</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
}

// ─── Tiny SVG icons ───────────────────────────────────────────────────────────

function PlayIcon() {
  return (
    <svg width="10" height="11" viewBox="0 0 10 11" fill="currentColor">
      <path d="M1 1.5l8 4-8 4V1.5z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="10" height="11" viewBox="0 0 10 11" fill="currentColor">
      <rect x="1" y="1.5" width="3" height="8" rx="1" />
      <rect x="6" y="1.5" width="3" height="8" rx="1" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="11" height="13" viewBox="0 0 11 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <rect x="3.5" y="1" width="4" height="6" rx="2" />
      <path d="M1 6.5a4.5 4.5 0 009 0" />
      <line x1="5.5" y1="11" x2="5.5" y2="12.5" />
    </svg>
  );
}

function RecordingDot() {
  return (
    <span
      className="inline-block w-2 h-2 rounded-full"
      style={{ background: "#B05050", animation: "pulse 1s infinite" }}
    />
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="12" height="12" viewBox="0 0 12 12"
      fill="none" stroke="currentColor" strokeWidth="1.5"
      style={{ animation: "spin 0.8s linear infinite" }}
    >
      <circle cx="6" cy="6" r="4.5" strokeOpacity="0.25" />
      <path d="M6 1.5a4.5 4.5 0 014.5 4.5" strokeLinecap="round" />
    </svg>
  );
}
