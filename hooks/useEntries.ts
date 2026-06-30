import { useApp } from "@/contexts/AppContext";
import { entryService, type VoiceLang } from "@/services/entryService";
import { entryIsComplete } from "@/types";
import type { Entry } from "@/types";

export function useEntries() {
  const { state, dispatch } = useApp();

  // ── Filtered list based on search query ──────────────────────────────────
  const filteredEntries = state.searchQuery.trim()
    ? state.entries.filter((e) => {
        const q = state.searchQuery.toLowerCase();
        return (
          e.english?.toLowerCase().includes(q) ||
          e.englishExample?.toLowerCase().includes(q) ||
          e.hindi?.toLowerCase().includes(q) ||
          e.hindiPronunciation?.toLowerCase().includes(q) ||
          e.hindiExample?.toLowerCase().includes(q) ||
          e.filipino?.toLowerCase().includes(q) ||
          e.filipinoExample?.toLowerCase().includes(q) ||
          e.notes?.toLowerCase().includes(q)
        );
      })
    : state.entries;

  // ── Current entry ─────────────────────────────────────────────────────────
  const currentEntry = state.currentEntryId
    ? state.entries.find((e) => e.id === state.currentEntryId) ?? null
    : null;

  // ── Actions ───────────────────────────────────────────────────────────────
  async function addEntry(payload: Partial<Entry>) {
    if (!state.book) return;
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_SYNC_STATUS", payload: "syncing" });
    try {
      const entry = await entryService.createEntry(state.book.id, payload);
      dispatch({ type: "ADD_ENTRY", payload: entry });
    } catch (e) {
      dispatch({ type: "SET_ERROR", payload: (e as Error).message });
      dispatch({ type: "SET_SYNC_STATUS", payload: "error" });
    }
  }

  async function updateEntry(entryId: string, payload: Partial<Entry>) {
    dispatch({ type: "SET_SYNC_STATUS", payload: "syncing" });
    try {
      const updated = await entryService.updateEntry(entryId, payload);
      dispatch({ type: "UPDATE_ENTRY", payload: updated });
    } catch (e) {
      dispatch({ type: "SET_ERROR", payload: (e as Error).message });
      dispatch({ type: "SET_SYNC_STATUS", payload: "error" });
    }
  }

  async function deleteEntry(entryId: string) {
    dispatch({ type: "SET_SYNC_STATUS", payload: "syncing" });
    try {
      await entryService.deleteEntry(entryId);
      dispatch({ type: "DELETE_ENTRY", payload: entryId });
    } catch (e) {
      dispatch({ type: "SET_ERROR", payload: (e as Error).message });
      dispatch({ type: "SET_SYNC_STATUS", payload: "error" });
    }
  }

  async function uploadVoice(entryId: string, lang: VoiceLang, blob: Blob) {
    dispatch({ type: "SET_SYNC_STATUS", payload: "syncing" });
    try {
      await entryService.uploadVoice(entryId, lang, blob);
      // Reflect the R2 key in local state immediately
      const key = entryService.getVoiceUrl(entryId, lang);
      const voiceField = `${lang}Voice` as keyof Entry;
      const entry = state.entries.find((e) => e.id === entryId);
      if (entry) {
        dispatch({
          type: "UPDATE_ENTRY",
          payload: { ...entry, [voiceField]: key },
        });
      }
    } catch (e) {
      dispatch({ type: "SET_ERROR", payload: (e as Error).message });
      dispatch({ type: "SET_SYNC_STATUS", payload: "error" });
    }
  }

  function selectEntry(entryId: string) {
    dispatch({ type: "SET_CURRENT_ENTRY", payload: entryId });
    dispatch({ type: "SET_SCREEN", payload: "entry" });
  }

  function setSearch(query: string) {
    dispatch({ type: "SET_SEARCH", payload: query });
  }

  return {
    entries: state.entries,
    filteredEntries,
    currentEntry,
    searchQuery: state.searchQuery,
    loading: state.loading,
    syncStatus: state.syncStatus,
    isComplete: (e: Entry) => entryIsComplete(e),
    addEntry,
    updateEntry,
    deleteEntry,
    uploadVoice,
    selectEntry,
    setSearch,
  };
}
