import { useState, useEffect, useCallback } from "react";
import { StorageManager } from "@/lib/core/storage";
import type { Book } from "@/types/novel";

export function useBookshelf() {
    const [books, setBooks] = useState<Book[]>([]);
    const [activeBookId, setActiveBookId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadBooks = useCallback(async () => {
        setIsLoading(true);
        try {
            const list = await StorageManager.getBookshelf();
            const activeId = await StorageManager.getActiveBookId();
            setBooks(list);
            setActiveBookId(activeId);
        } catch (e) {
            console.error("Failed to load bookshelf:", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBooks();
    }, [loadBooks]);

    const refresh = useCallback(() => {
        loadBooks();
    }, [loadBooks]);

    return { books, activeBookId, isLoading, refresh, setActiveBookId };
}
