import { createBook, getBook, listEntries } from "@/lib/api";
import { saveBook, clearBook } from "@/lib/storage";
import type { Book, Entry } from "@/types";

export const bookService = {

  async createBook(name: string): Promise<Book> {
    const book = await createBook(name);
    saveBook(book.id, book.name, book.shareCode);
    return book;
  },

  async joinBook(shareCode: string): Promise<{ book: Book; entries: Entry[] }> {
    const book = await getBook(shareCode.trim().toUpperCase());
    const entries = await listEntries(book.id);
    saveBook(book.id, book.name, book.shareCode);
    return { book, entries };
  },

  async loadBook(bookId: string): Promise<{ book: Book; entries: Entry[] }> {
    const book = await getBook(bookId);
    const entries = await listEntries(book.id);
    return { book, entries };
  },

  forgetBook(): void {
    clearBook();
  },
};
