import { franc } from 'franc';

export class LanguageDetector {
    /**
     * Detects the language of a given text.
     * Returns ISO 639-3 code (e.g., 'eng', 'cmn').
     */
    static detect(text: string): string {
        const code = franc(text, { minLength: 3 });
        return code === 'und' ? 'unknown' : code;
    }

    /**
     * More user-friendly detection for common Chinese/English cases.
     */
    static isChinese(text: string): boolean {
        const code = this.detect(text);
        return code === 'cmn' || code === 'zho';
    }
}
