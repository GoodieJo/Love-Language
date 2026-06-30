import {
  createEntry,
  updateEntry,
  deleteEntry,
  uploadVoice,
  deleteVoice,
  voiceUrl,
} from "@/lib/api";
import type { Entry } from "@/types";

export type VoiceLang = "english" | "hindi" | "filipino";

export const entryService = {

  async createEntry(bookId: string, payload: Partial<Entry>): Promise<Entry> {
    return createEntry(bookId, payload);
  },

  async updateEntry(entryId: string, payload: Partial<Entry>): Promise<Entry> {
    return updateEntry(entryId, payload);
  },

  async deleteEntry(entryId: string): Promise<void> {
    return deleteEntry(entryId);
  },

  async uploadVoice(entryId: string, lang: VoiceLang, blob: Blob): Promise<{ key: string }> {
    return uploadVoice(entryId, lang, blob);
  },

  async deleteVoice(entryId: string, lang: VoiceLang): Promise<void> {
    return deleteVoice(entryId, lang);
  },

  getVoiceUrl(entryId: string, lang: VoiceLang): string {
    return voiceUrl(entryId, lang);
  },
};
