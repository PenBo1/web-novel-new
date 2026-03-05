import { type Novel, type Volume, type Chapter } from './types';
import { extractBiliNovelId, resolveUrl } from './url';
import { cleanBiliContent, replaceImageSrc, removeElements, removeElementsByPattern } from './html-cleaner';
import { Scheduler } from '../scheduler';

const BILI_DOMAIN = "https://www.bilinovel.com";
const scheduler = new Scheduler(15, 60000);

const getShuffleParams = (doc: Document) => {
    const chapterIdMatch = doc.documentElement.outerHTML.match(/chapterid:'(\d+)'/);
    const chapterId = chapterIdMatch ? parseInt(chapterIdMatch[1]) : null;
    if (!chapterId) return null;
    return { fixedLength: 20, seed: chapterId * 126 + 232, a: 9302, c: 49397, mod: 233280 };
};

const shuffleArray = (arr: number[], params: any) => {
    let seed = params.seed;
    for (let i = arr.length - 1; i > 0; i--) {
        seed = (seed * params.a + params.c) % params.mod;
        const j = Math.floor((seed / params.mod) * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
};

const shuffleContent = (content: Element, params: any) => {
    const pElements = Array.from(content.querySelectorAll("p")).filter(p => p.textContent?.trim());
    if (pElements.length === 0) return;

    const fixed = Array.from({ length: Math.min(pElements.length, params.fixedLength) }, (_, i) => i);
    const shuffled = Array.from({ length: Math.max(0, pElements.length - params.fixedLength) }, (_, i) => i + params.fixedLength);
    if (shuffled.length > 0) shuffleArray(shuffled, params);

    const indices = [...fixed, ...shuffled];
    const mapped = new Array(pElements.length);
    for (let i = 0; i < pElements.length; i++) mapped[indices[i]] = pElements[i];

    let replacedIndex = 0;
    Array.from(content.children).forEach(node => {
        if (node.tagName.toLowerCase() === "p" && node.textContent?.trim()) {
            content.replaceChild(mapped[replacedIndex++].cloneNode(true), node);
        }
    });
};

export async function parseBilibiliNovel(input: string): Promise<Novel> {
    const novelId = extractBiliNovelId(input);
    const infoUrl = `${BILI_DOMAIN}/novel/${novelId}.html`;

    const html = await scheduler.run(async () => {
        const res = await fetch(infoUrl);
        return res.text();
    });

    const doc = new DOMParser().parseFromString(html, "text/html");
    const title = doc.querySelector(".book-title")?.textContent?.trim() || "Unknown";

    const catalogUrl = `${BILI_DOMAIN}/novel/${novelId}/catalog`;
    const catalogHtml = await scheduler.run(async () => {
        const res = await fetch(catalogUrl);
        return res.text();
    });

    const catalogDoc = new DOMParser().parseFromString(catalogHtml, "text/html");
    const volumes: Volume[] = [];
    let currentVolume: Volume | null = null;

    catalogDoc.querySelectorAll(".volume-chapters > li").forEach((item) => {
        if (item.classList.contains("chapter-bar")) {
            if (currentVolume) volumes.push(currentVolume);
            currentVolume = { title: item.textContent?.trim() || "", chapters: [] };
        } else if (item.classList.contains("jsChapter") && currentVolume) {
            const a = item.querySelector("a");
            if (a) {
                currentVolume.chapters.push({
                    title: a.textContent?.trim() || "",
                    url: resolveUrl(BILI_DOMAIN, a.getAttribute("href") || ""),
                });
            }
        }
    });
    if (currentVolume) volumes.push(currentVolume);

    return { id: novelId, title, author: "Unknown", volumes, source: "bili" };
}

export async function fetchBiliChapter(url: string): Promise<string> {
    let fullContent = "";
    let nextUrl: string | undefined = url;

    while (nextUrl) {
        const html = await scheduler.run(async () => {
            const res = await fetch(nextUrl!);
            return res.text();
        });

        const doc = new DOMParser().parseFromString(html, "text/html");
        const content = doc.querySelector("#acontent") || doc.querySelector(".bcontent");
        if (!content) break;

        removeElements(Array.from(content.querySelectorAll("div, ins, figure, fig, br, script, .tp, .bd")));
        removeElementsByPattern(content, "[a-z]\\d{4}", { matchId: true });

        const params = getShuffleParams(doc);
        if (params) shuffleContent(content, params);
        replaceImageSrc(content);

        fullContent += content.innerHTML;

        const navMatch = html.match(/url_next:'(.*?)'/);
        const nextPath = navMatch?.[1];
        if (nextPath && nextPath.includes("_")) {
            nextUrl = resolveUrl(BILI_DOMAIN, nextPath);
        } else {
            nextUrl = undefined;
        }
    }

    return fullContent;
}
