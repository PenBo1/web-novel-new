export function extractWenkuNovelId(url: string): string {
    const match = url.match(/book\/(\d+)\.htm/) || url.match(/(\d+)$/);
    return match ? match[1] : url;
}

export function extractBiliNovelId(url: string): string {
    const match = url.match(/detail\/(\d+)/) || url.match(/(\d+)$/);
    return match ? match[1] : url;
}

export function resolveUrl(base: string, relative: string): string {
    return new URL(relative, base).toString();
}
