import { type Novel, type Volume, type Chapter } from './types';
import { extractWenkuNovelId, resolveUrl } from './url';
import { cleanWenkuContent } from './html-cleaner';
import { Scheduler } from '../scheduler';

const WENKU_DOMAIN = "https://www.wenku8.net";
const scheduler = new Scheduler(20, 60000);

const decodeGBK = (arrayBuffer: ArrayBuffer): string => {
    const decoder = new TextDecoder("gbk");
    return decoder.decode(arrayBuffer);
};

export async function parseWenkuNovel(input: string): Promise<Novel> {
    const novelId = extractWenkuNovelId(input);
    const infoUrl = `${WENKU_DOMAIN}/book/${novelId}.htm`;

    const html = await scheduler.run(async () => {
        const res = await fetch(infoUrl);
        return decodeGBK(await res.arrayBuffer());
    });

    const doc = new DOMParser().parseFromString(html, "text/html");
    const title = doc.querySelector("#content table:nth-child(1) span b")?.textContent?.trim() || "Unknown";
    const catalogLink = doc.querySelector("legend + div > a")?.getAttribute("href");

    if (!catalogLink) throw new Error("Catalog not found");

    const catalogUrl = resolveUrl(infoUrl, catalogLink);
    const catalogHtml = await scheduler.run(async () => {
        const res = await fetch(catalogUrl);
        return decodeGBK(await res.arrayBuffer());
    });

    const catalogDoc = new DOMParser().parseFromString(catalogHtml, "text/html");
    const volumes: Volume[] = [];
    let currentVolume: Volume | null = null;

    catalogDoc.querySelectorAll("table td").forEach((td) => {
        const className = td.getAttribute("class");
        if (className === "vcss") {
            if (currentVolume) volumes.push(currentVolume);
            currentVolume = { title: td.textContent?.trim() || "", chapters: [] };
        } else if (className === "ccss" && currentVolume) {
            const a = td.querySelector("a");
            if (a) {
                currentVolume.chapters.push({
                    title: a.textContent?.trim() || "",
                    url: resolveUrl(catalogUrl, a.getAttribute("href") || ""),
                });
            }
        }
    });
    if (currentVolume) volumes.push(currentVolume);

    return {
        id: novelId,
        title,
        author: "Unknown", // Simplified for now
        volumes,
        source: "wenku",
    };
}

export async function fetchWenkuChapter(url: string): Promise<string> {
    const html = await scheduler.run(async () => {
        const res = await fetch(url);
        return decodeGBK(await res.arrayBuffer());
    });

    const doc = new DOMParser().parseFromString(html, "text/html");
    const content = doc.querySelector("#content");
    if (!content) throw new Error("Content not found");

    cleanWenkuContent(content);
    return content.innerHTML;
}
