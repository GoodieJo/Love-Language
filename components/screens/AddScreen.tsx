"use client";

import { useState } from "react";
import { Button, FieldSection, FieldRow, Input, Textarea } from "@/components/ui";
import { VoiceButton } from "@/components/ui/VoiceButton";
import { useEntries } from "@/hooks/useEntries";
import { useApp } from "@/contexts/AppContext";
import { useNav } from "@/hooks/useNav";
import { entryService } from "@/services/entryService";

interface FormState {
  english:            string;
  englishExample:     string;
  hindi:              string;
  hindiPronunciation: string;
  hindiExample:       string;
  filipino:           string;
  filipinoExample:    string;
  notes:              string;
}

const empty: FormState = {
  english:            "",
  englishExample:     "",
  hindi:              "",
  hindiPronunciation: "",
  hindiExample:       "",
  filipino:           "",
  filipinoExample:    "",
  notes:              "",
};

type PendingVoices = {
  english:  Blob | null;
  hindi:    Blob | null;
  filipino: Blob | null;
};

export function AddScreen() {
  const { state, dispatch }         = useApp();
  const { goBack }                  = useNav();
  const [form, setForm]             = useState<FormState>(empty);
  const [pending, setPending]       = useState<PendingVoices>({ english: null, hindi: null, filipino: null });
  const [previewUrls, setPreviewUrls] = useState<PendingVoices & Record<string, string | null>>({ english: null, hindi: null, filipino: null });
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState<string | null>(null);

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  // Store blob locally for preview; upload after entry is created
  function makePendingSaver(lang: "english" | "hindi" | "filipino") {
    return async (blob: Blob) => {
      // Revoke old preview URL to avoid memory leaks
      const old = previewUrls[lang];
      if (old) URL.revokeObjectURL(old);

      const url = URL.createObjectURL(blob);
      setPending((p) => ({ ...p, [lang]: blob }));
      setPreviewUrls((p) => ({ ...p, [lang]: url }));
    };
  }

  function clearPending(lang: "english" | "hindi" | "filipino") {
    const old = previewUrls[lang];
    if (old) URL.revokeObjectURL(old);
    setPending((p) => ({ ...p, [lang]: null }));
    setPreviewUrls((p) => ({ ...p, [lang]: null }));
  }

  async function handleSave() {
    if (!form.english.trim() || !state.book) return;
    setSaving(true);
    setError(null);

    try {
      // 1 — create the entry via the Worker
      const entry = await entryService.createEntry(state.book.id, {
        english:            form.english.trim()             || null,
        englishExample:     form.englishExample.trim()      || null,
        hindi:              form.hindi.trim()               || null,
        hindiPronunciation: form.hindiPronunciation.trim()  || null,
        hindiExample:       form.hindiExample.trim()        || null,
        filipino:           form.filipino.trim()            || null,
        filipinoExample:    form.filipinoExample.trim()     || null,
        notes:              form.notes.trim()               || null,
      } as any);

      // 2 — upload any pending voice blobs to R2
      const langs = ["english", "hindi", "filipino"] as const;
      await Promise.all(
        langs
          .filter((l) => pending[l] !== null)
          .map((l) => entryService.uploadVoice(entry.id, l, pending[l]!))
      );

      // 3 — push the final entry into global state and go home
      dispatch({ type: "ADD_ENTRY", payload: entry });

      // Cleanup
      langs.forEach((l) => {
        const url = previewUrls[l];
        if (url) URL.revokeObjectURL(url);
      });
      setForm(empty);
      setPending({ english: null, hindi: null, filipino: null });
      setPreviewUrls({ english: null, hindi: null, filipino: null });

    } catch (e) {
      setError((e as Error).message ?? "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-1 pb-0 flex-shrink-0">
        <button
          onClick={goBack}
          className="text-[13px] py-2 mb-3 flex items-center gap-1 bg-transparent border-none cursor-pointer"
          style={{ color: "var(--mauve)" }}
        >
          ← Cancel
        </button>
        <h1
          className="font-['Playfair_Display'] text-[26px] font-normal mb-[18px]"
          style={{ color: "var(--ink)" }}
        >
          New entry
        </h1>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-6 pb-28 flex flex-col gap-[14px]">

        {/* ── English ── */}
        <FieldSection label="English">
          <FieldRow>
            <Input
              label="Word or phrase"
              value={form.english}
              onChange={set("english")}
              placeholder="e.g. Good night"
              autoFocus
            />
          </FieldRow>
          <FieldRow>
            <Input
              label="Example sentence"
              value={form.englishExample}
              onChange={set("englishExample")}
              placeholder="Optional"
            />
          </FieldRow>
          <FieldRow last>
            <span className="text-[10.5px] font-medium tracking-[0.04em]" style={{ color: "var(--ink-light)" }}>
              Voice recording
            </span>
            <VoiceButton
              src={previewUrls.english}
              onSave={makePendingSaver("english")}
              onDelete={() => clearPending("english")}
            />
          </FieldRow>
        </FieldSection>

        {/* ── Hindi ── */}
        <FieldSection label="Hindi">
          <FieldRow>
            <Input
              label="Word or phrase"
              value={form.hindi}
              onChange={set("hindi")}
              placeholder="e.g. शुभ रात्रि"
            />
          </FieldRow>
          <FieldRow>
            <Input
              label="Pronunciation"
              value={form.hindiPronunciation}
              onChange={set("hindiPronunciation")}
              placeholder="shubh raa-tri"
              mono
            />
          </FieldRow>
          <FieldRow>
            <Input
              label="Example sentence"
              value={form.hindiExample}
              onChange={set("hindiExample")}
              placeholder="Optional"
            />
          </FieldRow>
          <FieldRow last>
            <span className="text-[10.5px] font-medium tracking-[0.04em]" style={{ color: "var(--ink-light)" }}>
              Voice recording
            </span>
            <VoiceButton
              src={previewUrls.hindi}
              onSave={makePendingSaver("hindi")}
              onDelete={() => clearPending("hindi")}
            />
          </FieldRow>
        </FieldSection>

        {/* ── Filipino ── */}
        <FieldSection label="Filipino">
          <FieldRow>
            <Input
              label="Word or phrase"
              value={form.filipino}
              onChange={set("filipino")}
              placeholder="e.g. Magandang gabi"
            />
          </FieldRow>
          <FieldRow>
            <Input
              label="Example sentence"
              value={form.filipinoExample}
              onChange={set("filipinoExample")}
              placeholder="Optional"
            />
          </FieldRow>
          <FieldRow last>
            <span className="text-[10.5px] font-medium tracking-[0.04em]" style={{ color: "var(--ink-light)" }}>
              Voice recording
            </span>
            <VoiceButton
              src={previewUrls.filipino}
              onSave={makePendingSaver("filipino")}
              onDelete={() => clearPending("filipino")}
            />
          </FieldRow>
        </FieldSection>

        {/* ── Notes ── */}
        <FieldSection label="Shared notes">
          <FieldRow last>
            <Textarea
              value={form.notes}
              onChange={set("notes")}
              placeholder="A memory, a story, why this word matters…"
              rows={3}
            />
          </FieldRow>
        </FieldSection>

        {error && (
          <p className="text-[13px] text-center" style={{ color: "#B05050" }}>{error}</p>
        )}

      </div>

      {/* Save bar */}
      <div
        className="px-6 pt-[14px] pb-[22px] border-t flex-shrink-0"
        style={{
          background: "rgba(251,248,245,0.94)",
          backdropFilter: "blur(16px)",
          borderColor: "var(--rule-soft)",
        }}
      >
        <Button
          fullWidth
          onClick={handleSave}
          disabled={saving || !form.english.trim()}
        >
          {saving ? "Saving…" : "Save entry"}
        </Button>
      </div>
    </div>
  );
}
