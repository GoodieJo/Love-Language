import { useApp } from "@/contexts/AppContext";
import { bookService } from "@/services/bookService";

export function useBook() {
  const { state, dispatch } = useApp();

  async function createBook(name: string) {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });
    try {
      const book = await bookService.createBook(name);
      dispatch({ type: "CREATE_BOOK", payload: book });
    } catch (e) {
      dispatch({ type: "SET_ERROR", payload: (e as Error).message });
    }
  }

  async function joinBook(shareCode: string) {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });
    try {
      const { book, entries } = await bookService.joinBook(shareCode);
      dispatch({ type: "JOIN_BOOK", payload: { book, entries } });
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Book not found. Check your code and try again." });
    }
  }

  function forgetBook() {
    bookService.forgetBook();
    dispatch({ type: "CLEAR_BOOK" });
  }

  return {
    book: state.book,
    loading: state.loading,
    error: state.error,
    createBook,
    joinBook,
    forgetBook,
  };
}
