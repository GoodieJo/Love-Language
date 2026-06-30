"use client";

import { useState, useRef, useCallback } from "react";

export type RecorderState = "idle" | "requesting" | "recording" | "uploading" | "done" | "error";

export interface UseVoiceRecorderOptions {
  onRecorded: (blob: Blob) => Promise<void>;
}

export function useVoiceRecorder({ onRecorded }: UseVoiceRecorderOptions) {
  const [state, setState]       = useState<RecorderState>("idle");
  const [duration, setDuration] = useState(0);
  const [error, setError]       = useState<string | null>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks        = useRef<BlobPart[]>([]);
  const stream        = useRef<MediaStream | null>(null);
  const timer         = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime     = useRef<number>(0);

  const start = useCallback(async () => {
    setError(null);
    setState("requesting");

    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = s;

      // Pick the best supported format
      const mimeType =
        MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";

      const mr = new MediaRecorder(s, { mimeType });
      chunks.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      mr.onstop = async () => {
        // Stop all mic tracks
        stream.current?.getTracks().forEach((t) => t.stop());

        const blob = new Blob(chunks.current, { type: mimeType });
        setState("uploading");

        try {
          await onRecorded(blob);
          setState("done");
        } catch {
          setState("error");
          setError("Upload failed. Try again.");
        }
      };

      mr.start(100); // collect data every 100ms
      mediaRecorder.current = mr;
      startTime.current = Date.now();
      setState("recording");

      // Live duration counter
      timer.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime.current) / 1000));
      }, 500);

    } catch (e) {
      setState("error");
      setError(
        (e as Error).name === "NotAllowedError"
          ? "Microphone access denied. Please allow it in your browser settings."
          : "Could not access microphone."
      );
    }
  }, [onRecorded]);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    setDuration(0);
    if (mediaRecorder.current?.state === "recording") {
      mediaRecorder.current.stop();
    }
  }, []);

  return { state, duration, error, start, stop };
}
