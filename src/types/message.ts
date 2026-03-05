export type MessageAction =
    | "GET_BOOK_LIST"
    | "UPDATE_READING_PROGRESS"
    | "FETCH_CHAPTER_CONTENT"
    | "NOTIFY_SETTINGS_CHANGED";

export interface ExtensionMessage<T = any> {
    action: MessageAction;
    payload?: T;
}

export interface ProgressPayload {
    bookId: string;
    chapterIndex: number;
    scrollPosition: number;
}
