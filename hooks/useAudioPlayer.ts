"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type PlayerState = "idle" | "loading" | "playing" | "paused" | "error";

export function useAudioPlayer(src: string | null) {
  const [playerState, setPlayerState] = useState<PlayerState>("idle");
  const [progress, setProgress]       = useState(0); // 0–1
  const [duration, setDuration]       = useState(0);
  const audio = useRef<HTMLAudioElement | null>(null);
  const raf   = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audio.current?.pause();
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const tick = useCallback(() => {
    const a = audio.current;
    if (!a) return;
    setProgress(a.duration ? a.currentTime / a.duration : 0);
    if (!a.paused) raf.current = requestAnimationFrame(tick);
  }, []);

  const play = useCallback(() => {
    if (!src) return;

    // If same audio is paused, resume
    if (audio.current && playerState === "paused") {
      audio.current.play();
      setPlayerState("playing");
      raf.current = requestAnimationFrame(tick);
      return;
    }

    // Fresh load
    const a = new Audio(src);
    audio.current = a;
    setPlayerState("loading");
    setProgress(0);

    a.onloadedmetadata = () => setDuration(a.duration);
    a.onplay    = () => { setPlayerState("playing"); raf.current = requestAnimationFrame(tick); };
    a.onpause   = () => { setPlayerState("paused"); if (raf.current) cancelAnimationFrame(raf.current); };
    a.onended   = () => { setPlayerState("idle"); setProgress(0); };
    a.onerror   = () => setPlayerState("error");

    a.play().catch(() => setPlayerState("error"));
  }, [src, playerState, tick]);

  const pause = useCallback(() => {
    audio.current?.pause();
  }, []);

  const stop = useCallback(() => {
    if (audio.current) {
      audio.current.pause();
      audio.current.currentTime = 0;
    }
    setPlayerState("idle");
    setProgress(0);
  }, []);

  return { playerState, progress, duration, play, pause, stop };
}
