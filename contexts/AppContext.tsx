"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";

import { appReducer, initialState, type AppState, type AppAction } from "@/reducers/appReducer";
import { loadBook } from "@/lib/storage";
import { bookService } from "@/services/bookService";

// ─── Context shape ────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // On mount — check localStorage for a saved book and reload it
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = loadBook();
    if (!saved) return;

    dispatch({ type: "SET_LOADING", payload: true });

    bookService
      .loadBook(saved.bookId)
      .then(({ book, entries }) => {
        dispatch({ type: "LOAD_BOOK", payload: { book, entries } });
      })
      .catch(() => {
        // Saved book no longer exists or network error — go to onboarding
        dispatch({ type: "CLEAR_BOOK" });
      });
  }, []);

  // Sync status — listen to online/offline browser events
  useEffect(() => {
    function handleOnline() {
      dispatch({ type: "SET_SYNC_STATUS", payload: "idle" });
    }
    function handleOffline() {
      dispatch({ type: "SET_SYNC_STATUS", payload: "offline" });
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
