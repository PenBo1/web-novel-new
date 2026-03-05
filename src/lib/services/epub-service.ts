import JSZip from "jszip";
import type { Book, Chapter } from "@/types/novel";

export class EpubService {
    /**
     * 将本地 EPUB 文件解析为应用内部的 Book 和 Chapters
     */
    static async parseEpub(file: File): Promise<{ book: Book; chapters: Chapter[] }> {
        const zip = new JSZip();
        let contents;
        try {
            contents = await zip.loadAsync(file);
        } catch (e) {
            throw new Error("无法读取文件，它可能不是一个有效的 EPUB。");
        }

        // 1. 寻找 container.xml 然后定位到 OPF
        const containerItem = contents.file("META-INF/container.xml");
        if (!containerItem) throw new Error("无法找到 META-INF/container.xml");

        const containerXml = await containerItem.async("text");
        const containerDoc = new DOMParser().parseFromString(containerXml, "text/xml");
        const rootfileNode = containerDoc.querySelector("rootfile");
        const opfPath = rootfileNode?.getAttribute("full-path");

        if (!opfPath) throw new Error("无法在 container.xml 中找到 OPF 文件路径");

        const opfItem = contents.file(opfPath);
        if (!opfItem) throw new Error(`找不到 OPF 文件: ${opfPath}`);

        const opfXml = await opfItem.async("text");
        const opfDoc = new DOMParser().parseFromString(opfXml, "text/xml");

        // 2. 提取基础元数据
        const titleNode = opfDoc.querySelector("title");
        const authorNode = opfDoc.querySelector("creator");
        const idNode = opfDoc.querySelector("identifier");

        const title = titleNode?.textContent?.trim() || file.name.replace(".epub", "");
        const author = authorNode?.textContent?.trim() || "未知";
        const baseId =
            idNode?.textContent?.trim() ||
            "local_" + Math.random().toString(36).substring(2, 9);

        // 提取封面 (如果存在)
        let coverBase64 = "";
        const metaCoverNode = opfDoc.querySelector('meta[name="cover"]');
        if (metaCoverNode) {
            const coverId = metaCoverNode.getAttribute("content");
            if (coverId) {
                const coverItemRef = opfDoc.getElementById(coverId);
                if (coverItemRef) {
                    const coverHref = coverItemRef.getAttribute("href");
                    if (coverHref) {
                        const basePath = opfPath.substring(0, opfPath.lastIndexOf("/") + 1);
                        const coverFile = contents.file(basePath + coverHref);
                        if (coverFile) {
                            const base64 = await coverFile.async("base64");
                            coverBase64 = `data:image/jpeg;base64,${base64}`;
                        }
                    }
                }
            }
        }

        // 3. 构建章节序列 (Spine -> Manifest)
        const spineNodes = opfDoc.querySelectorAll("spine > itemref");
        const manifestNodes = opfDoc.querySelectorAll("manifest > item");

        const manifestMap = new Map<string, string>();
        manifestNodes.forEach((node) => {
            const id = node.getAttribute("id");
            const href = node.getAttribute("href");
            if (id && href) manifestMap.set(id, href);
        });

        const basePath = opfPath.substring(0, opfPath.lastIndexOf("/") + 1);
        const chapters: Chapter[] = [];

        // 解析依赖的 CSS 以实现基础样式的清洗
        // 这里采取简化的直接清洗策略，不挂载 CSS

        let chapterOrder = 0;
        for (const itemref of Array.from(spineNodes)) {
            const idref = itemref.getAttribute("idref");
            if (!idref) continue;

            const href = manifestMap.get(idref);
            if (!href) continue;

            const chapterFile = contents.file(basePath + href);
            if (!chapterFile) continue;

            chapterOrder++;
            const htmlText = await chapterFile.async("text");
            const htmlDoc = new DOMParser().parseFromString(htmlText, "text/html");

            const chapterTitle = htmlDoc.querySelector("title")?.textContent?.trim() || `第 ${chapterOrder} 章`;
            const bodyNode = htmlDoc.querySelector("body");

            chapters.push({
                bookId: baseId,
                title: chapterTitle,
                url: `local://${baseId}/${href}`, // 防止规则引擎重复抓取
                content: bodyNode?.innerHTML || "",
                order: chapterOrder
            });
        }

        const book: Book = {
            id: baseId,
            title: title,
            author: author,
            source: "local",
            sourceId: "local",
            addedAt: Date.now(),
            cover: coverBase64,
            totalChapters: chapters.length,
            isScraped: true
        };

        return { book, chapters };
    }
}
