/**
 * Thin wrapper around localStorage to persist the user's book session.
 * All keys are prefixed to avoid collisions.
 */

const KEY_BOOK_ID   = "od:bookId";
const KEY_BOOK_NAME = "od:bookName";
const KEY_SHARE_CODE = "od:shareCode";

export function saveBook(bookId: string, name: string, shareCode: string) {
  localStorage.setItem(KEY_BOOK_ID, bookId);
  localStorage.setItem(KEY_BOOK_NAME, name);
  localStorage.setItem(KEY_SHARE_CODE, shareCode);
}

export function loadBook(): { bookId: string; name: string; shareCode: string } | null {
  const bookId    = localStorage.getItem(KEY_BOOK_ID);
  const name      = localStorage.getItem(KEY_BOOK_NAME);
  const shareCode = localStorage.getItem(KEY_SHARE_CODE);

  if (!bookId || !name || !shareCode) return null;
  return { bookId, name, shareCode };
}

export function clearBook() {
  localStorage.removeItem(KEY_BOOK_ID);
  localStorage.removeItem(KEY_BOOK_NAME);
  localStorage.removeItem(KEY_SHARE_CODE);
}
