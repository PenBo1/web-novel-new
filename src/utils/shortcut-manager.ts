import hotkeys from 'hotkeys-js';

export class ShortcutManager {
    static bind(key: string, callback: (event: KeyboardEvent) => void) {
        hotkeys(key, (event: KeyboardEvent) => {
            event.preventDefault();
            callback(event);
        });
    }

    static unbind(key: string) {
        hotkeys.unbind(key);
    }

    /**
     * Set up default navigation shortcuts for the reader.
     */
    static setupReaderShortcuts(actions: {
        nextPage: () => void;
        prevPage: () => void;
        nextChapter: () => void;
        prevChapter: () => void;
        toggleReader: () => void;
    }) {
        this.bind('right, space', actions.nextPage);
        this.bind('left', actions.prevPage);
        this.bind('ctrl+right', actions.nextChapter);
        this.bind('ctrl+left', actions.prevChapter);
        this.bind('esc', actions.toggleReader);
    }
}
