"use client";

import { useState, useEffect, useRef } from "react";
import { useEntries } from "@/hooks/useEntries";
import { useNav } from "@/hooks/useNav";
import { LangCard, LangHeader, SyncBadge } from "@/components/ui";
import { VoiceButton } from "@/components/ui/VoiceButton";
import { entryIsComplete } from "@/types";
import type { Entry } from "@/types";
import { entryService, type VoiceLang } from "@/services/entryService";

export function EntryScreen() {
  const { currentEntry, updateEntry, deleteEntry, syncStatus } = useEntries();
  const { goBack } = useNav();

  // Can't call goBack() during render — use effect instead
  useEffect(() => {
    if (!currentEntry) goBack();
  }, [currentEntry]);

  if (!currentEntry) return null;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-1 pb-0 flex-shrink-0">
        <button
          onClick={goBack}
          className="text-[13px] py-2 mb-3 flex items-center gap-1 bg-transparent border-none cursor-pointer"
          style={{ color: "var(--mauve)" }}
        >
          ← All words
        </button>
        <div className="flex items-start justify-between mb-[5px]">
          <h1
            className="font-['Playfair_Display'] text-[30px] font-normal leading-[1.15] flex-1 mr-2"
            style={{ color: "var(--ink)" }}
          >
            {currentEntry.english}
          </h1>
          <SyncBadge status={syncStatus} />
        </div>
        <div
          className="flex items-center gap-2 mb-[18px] text-[11.5px]"
          style={{ color: "var(--ink-light)" }}
        >
          <div
            className="w-[7px] h-[7px] rounded-full"
            style={{ background: entryIsComplete(currentEntry) ? "var(--sage)" : "var(--wheat)" }}
          />
          <span>{entryIsComplete(currentEntry) ? "Complete" : "In progress"}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-20 flex flex-col gap-[14px]">

        <LangSection
          entry={currentEntry}
          lang="english"
          label="English"
          fields={["english", "englishExample"]}
          onUpdate={updateEntry}
        />

        <LangSection
          entry={currentEntry}
          lang="hindi"
          label="Hindi"
          fields={["hindi", "hindiPronunciation", "hindiExample"]}
          onUpdate={updateEntry}
        />

        <LangSection
          entry={currentEntry}
          lang="filipino"
          label="Filipino"
          fields={["filipino", "filipinoExample"]}
          onUpdate={updateEntry}
        />

        <NotesCard entry={currentEntry} onUpdate={updateEntry} />

        <button
          onClick={async () => {
            if (confirm("Delete this entry?")) {
              await deleteEntry(currentEntry.id);
            }
          }}
          className="text-[12px] text-center py-3 bg-transparent border-none cursor-pointer transition-opacity hover:opacity-70"
          style={{ color: "var(--ink-light)" }}
        >
          Delete entry
        </button>
      </div>
    </div>
  );
}

// ─── LangSection ─────────────────────────────────────────────────────────────

const fieldLabels: Partial<Record<keyof Entry, string>> = {
  english:            "Word or phrase",
  englishExample:     "Example sentence",
  hindi:              "Word or phrase",
  hindiPronunciation: "Pronunciation",
  hindiExample:       "Example sentence",
  filipino:           "Word or phrase",
  filipinoExample:    "Example sentence",
};

const fieldStyles: Partial<Record<keyof Entry, { className?: string; placeholder?: string }>> = {
  hindiPronunciation: {
    className:   "font-['IBM_Plex_Mono'] text-[13px]",
    placeholder: "e.g. mu-jhe yad aa-ti hai",
  },
};

function LangSection({
  entry,
  lang,
  label,
  fields,
  onUpdate,
}: {
  entry:    Entry;
  lang:     VoiceLang;
  label:    string;
  fields:   (keyof Entry)[];
  onUpdate: (id: string, payload: Partial<Entry>) => void;
}) {
  const hasWord  = !!entry[lang as keyof Entry];
  const voiceKey = `${lang}Voice` as keyof Entry;
  const voiceSrc = entry[voiceKey]
    ? entryService.getVoiceUrl(entry.id, lang)
    : null;

  async function handleSave(blob: Blob) {
    await entryService.uploadVoice(entry.id, lang, blob);
    onUpdate(entry.id, { [voiceKey]: entryService.getVoiceUrl(entry.id, lang) } as Partial<Entry>);
  }

  async function handleDelete() {
    await entryService.deleteVoice(entry.id, lang);
    onUpdate(entry.id, { [voiceKey]: null } as Partial<Entry>);
  }

  return (
    <LangCard>
      <LangHeader label={label} complete={hasWord} />
      <div className="px-4 py-3 flex flex-col gap-3">
        {fields.map((field) => (
          <EditableField
            key={field}
            entry={entry}
            field={field}
            onUpdate={onUpdate}
          />
        ))}
        <VoiceButton
          src={voiceSrc}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      </div>
    </LangCard>
  );
}

// ─── EditableField ────────────────────────────────────────────────────────────

function EditableField({
  entry,
  field,
  onUpdate,
}: {
  entry:    Entry;
  field:    keyof Entry;
  onUpdate: (id: string, payload: Partial<Entry>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue]     = useState((entry[field] as string) ?? "");
  const inputRef              = useRef<HTMLInputElement>(null);

  const label     = fieldLabels[field] ?? String(field);
  const style     = fieldStyles[field] ?? {};
  const isPronunc = field === "hindiPronunciation";
  const isExample = String(field).includes("Example");

  // Keep local value in sync when entry updates from context
  useEffect(() => {
    if (!editing) setValue((entry[field] as string) ?? "");
  }, [entry, field, editing]);

  function handleBlur() {
    setEditing(false);
    const trimmed = value.trim();
    if (trimmed !== ((entry[field] as string) ?? "")) {
      onUpdate(entry.id, { [field]: trimmed || null });
    }
  }

  const displayValue = entry[field] as string | null;

  if (editing) {
    return (
      <div className="flex flex-col gap-1">
        <span
          className="text-[10.5px] font-medium tracking-[0.04em]"
          style={{ color: "var(--ink-light)" }}
        >
          {label}
        </span>
        <input
          ref={inputRef}
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.blur()}
          className={`bg-transparent border-none outline-none w-full ${
            style.className ?? "font-['Inter'] text-[14.5px]"
          }`}
          style={{ color: isPronunc ? "var(--wheat)" : "var(--ink)" }}
          placeholder={style.placeholder ?? ""}
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => { setEditing(true); setValue(displayValue ?? ""); }}
      className="text-left bg-transparent border-none cursor-text w-full flex flex-col gap-1"
    >
      <span
        className="text-[10.5px] font-medium tracking-[0.04em]"
        style={{ color: "var(--ink-light)" }}
      >
        {label}
      </span>
      {displayValue ? (
        <span
          className={`
            ${isPronunc ? "font-['IBM_Plex_Mono'] text-[12px]" : "font-['Playfair_Display'] text-[19px]"}
            ${isExample ? "!text-[12.5px] !font-['Inter'] italic border-l-2 pl-[10px]" : ""}
          `}
          style={{
            color:       isPronunc ? "var(--wheat)" : isExample ? "var(--ink-light)" : "var(--ink)",
            borderColor: isExample ? "var(--rule)"  : undefined,
          }}
        >
          {displayValue}
        </span>
      ) : (
        <span className="text-[13px] italic" style={{ color: "var(--mauve-dim)" }}>
          Tap to add {label.toLowerCase()}…
        </span>
      )}
    </button>
  );
}

// ─── NotesCard ────────────────────────────────────────────────────────────────

function NotesCard({
  entry,
  onUpdate,
}: {
  entry:    Entry;
  onUpdate: (id: string, payload: Partial<Entry>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue]     = useState(entry.notes ?? "");

  // Keep in sync when entry updates from context
  useEffect(() => {
    if (!editing) setValue(entry.notes ?? "");
  }, [entry.notes, editing]);

  function handleBlur() {
    setEditing(false);
    const trimmed = value.trim();
    if (trimmed !== (entry.notes ?? "")) {
      onUpdate(entry.id, { notes: trimmed || null });
    }
  }

  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        background:  "var(--rose-tint)",
        borderColor: "var(--mauve-dim)",
        borderStyle: "dashed",
      }}
    >
      <p
        className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-3"
        style={{ color: "var(--mauve)" }}
      >
        ✦ Shared notes
      </p>
      {editing ? (
        <textarea
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          rows={3}
          className="w-full bg-transparent border-none outline-none resize-none text-[13.5px] leading-[1.7] italic"
          style={{ fontFamily: "'Inter', sans-serif", color: "var(--ink-mid)" }}
          placeholder="A memory, a story, why this word matters…"
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="w-full text-left bg-transparent border-none cursor-text"
        >
          <p
            className="text-[13.5px] leading-[1.7] italic"
            style={{
              color:       entry.notes ? "var(--ink-mid)" : "var(--mauve-dim)",
              fontFamily:  "'Inter', sans-serif",
            }}
          >
            {entry.notes ?? "Tap to add a memory or note…"}
          </p>
        </button>
      )}
    </div>
  );
}
