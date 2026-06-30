import type { Book, Entry } from "@/types";

// ─── State ────────────────────────────────────────────────────────────────────

export type Screen =
  | "onboarding"
  | "create"
  | "join"
  | "home"
  | "entry"
  | "add"
  | "settings";

export type SyncStatus = "idle" | "syncing" | "error" | "offline";

export type Theme = "light"; // future-proof

export interface AppState {
  screen: Screen;
  book: Book | null;
  entries: Entry[];
  currentEntryId: string | null;
  searchQuery: string;
  syncStatus: SyncStatus;
  loading: boolean;
  error: string | null;
  theme: Theme;
}

export const initialState: AppState = {
  screen: "onboarding",
  book: null,
  entries: [],
  currentEntryId: null,
  searchQuery: "",
  syncStatus: "idle",
  loading: false,
  error: null,
  theme: "light",
};

// ─── Actions ──────────────────────────────────────────────────────────────────

export type AppAction =
  | { type: "SET_SCREEN"; payload: Screen }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_SYNC_STATUS"; payload: SyncStatus }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_CURRENT_ENTRY"; payload: string | null }
  | { type: "LOAD_BOOK"; payload: { book: Book; entries: Entry[] } }
  | { type: "CREATE_BOOK"; payload: Book }
  | { type: "JOIN_BOOK"; payload: { book: Book; entries: Entry[] } }
  | { type: "ADD_ENTRY"; payload: Entry }
  | { type: "UPDATE_ENTRY"; payload: Entry }
  | { type: "DELETE_ENTRY"; payload: string }  // entryId
  | { type: "CLEAR_BOOK" };

// ─── Reducer ──────────────────────────────────────────────────────────────────

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {

    case "SET_SCREEN":
      return { ...state, screen: action.payload, error: null };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };

    case "SET_SYNC_STATUS":
      return { ...state, syncStatus: action.payload };

    case "SET_SEARCH":
      return { ...state, searchQuery: action.payload };

    case "SET_CURRENT_ENTRY":
      return { ...state, currentEntryId: action.payload };

    case "CREATE_BOOK":
      return {
        ...state,
        book: action.payload,
        entries: [],
        screen: "home",
        loading: false,
        error: null,
      };

    case "LOAD_BOOK":
    case "JOIN_BOOK":
      return {
        ...state,
        book: action.payload.book,
        entries: action.payload.entries,
        screen: "home",
        loading: false,
        error: null,
      };

    case "ADD_ENTRY":
      return {
        ...state,
        entries: [action.payload, ...state.entries],
        screen: "home",
        loading: false,
        syncStatus: "idle",
      };

    case "UPDATE_ENTRY":
      return {
        ...state,
        entries: state.entries.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
        syncStatus: "idle",
        loading: false,
      };

    case "DELETE_ENTRY":
      return {
        ...state,
        entries: state.entries.filter((e) => e.id !== action.payload),
        currentEntryId:
          state.currentEntryId === action.payload
            ? null
            : state.currentEntryId,
        screen:
          state.currentEntryId === action.payload ? "home" : state.screen,
      };

    case "CLEAR_BOOK":
      return { ...initialState };

    default:
      return state;
  }
}
