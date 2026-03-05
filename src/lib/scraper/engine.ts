import type { ScraperRule, SearchResult, BookInfo, Chapter } from "@/types/novel";
import { sendMessage } from "@/utils/message";

/**
 * 爬虫解析引擎 ScraperEngine
 * 基于规则配置进行通用的小说搜索与书籍抓取
 */
export class ScraperEngine {
    private rule: ScraperRule;

    constructor(rule: ScraperRule) {
        this.rule = rule;
    }

    /**
     * 委托后台脚本发起跨域网络请求
     */
    async fetchHtml(
        url: string,
        method: "get" | "post" = "get",
        data?: any,
    ): Promise<string> {
        const absoluteUrl = new URL(url, this.rule.url).href;

        try {
            const responseHtml = await sendMessage("fetchHtml", {
                url: absoluteUrl,
                method,
                data,
                headers: {
                    Referer: this.rule.url,
                    Origin: new URL(this.rule.url).origin,
                },
            });
            return responseHtml;
        } catch (error) {
            console.error(`[ScraperEngine] Fetch error for ${absoluteUrl}:`, error);
            throw error;
        }
    }

    /**
     * 核心 DOM 解析器，支持 CSS 选择器、XPath 和动态提取函数
     */
    parseContent(
        html: string | HTMLElement | Document | Element,
        query: string,
        type: "text" | "html" | "attr" = "text",
        attrName?: string,
    ): string {
        if (!query) return "";

        const [selector, jsCode] = query.split("@js:");
        let result = "";

        let root: Document | Element;
        if (typeof html === "string") {
            root = new DOMParser().parseFromString(html, "text/html");
        } else {
            root = html as Document | Element;
        }

        let element: Element | null = null;
        const selTrim = selector.trim();

        if (selTrim.startsWith("/") || selTrim.startsWith("//")) {
            // XPath 支持
            try {
                const ownerDoc = root.ownerDocument || (root as Document);
                const xpathResult = ownerDoc.evaluate(
                    selTrim,
                    root,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null,
                );
                element = xpathResult.singleNodeValue as Element;
            } catch (e) {
                console.warn("XPath parse error:", selector, e);
            }
        } else if (selTrim) {
            // CSS Selector 支持
            try {
                element = root.querySelector(selTrim);
            } catch (e) {
                console.warn("CSS selector parse error:", selector, e);
            }
        } else {
            element = root instanceof Document ? root.documentElement : root;
        }

        if (element) {
            if (type === "text") {
                result = (element as HTMLElement).innerText?.trim() || element.textContent?.trim() || "";
            } else if (type === "html") {
                result = element.innerHTML?.trim() || "";
            } else if (type === "attr" && attrName) {
                result = element.getAttribute(attrName) || "";
            }
        } else if (!selTrim && jsCode) {
            result = typeof html === "string" ? html : (html as any).innerHTML || "";
        }

        // 执行动态计算逻辑脚本
        if (jsCode && result !== undefined) {
            try {
                const fn = new Function(
                    "r",
                    `var result = r; ${jsCode}; return typeof r !== 'undefined' ? r : result;`,
                );
                result = fn(result);
            } catch (e) {
                console.error("Custom rule JS error:", query, e);
            }
        }

        return result;
    }

    /**
     * 按照书源配置中的搜索规则检索站点
     */
    async search(keyword: string): Promise<SearchResult[]> {
        const searchRule = this.rule.search;
        let url = searchRule.url.replace("%s", encodeURIComponent(keyword));

        let html = "";
        try {
            if (searchRule.method === "post") {
                const encodedData = searchRule.data?.replace("%s", encodeURIComponent(keyword));
                html = await this.fetchHtml(url, "post", encodedData);
            } else {
                html = await this.fetchHtml(url, "get");
            }
        } catch (e: any) {
            console.error(`[ScraperEngine] Network error during search:`, e);
            return [];
        }

        if (!html) return [];

        const doc = new DOMParser().parseFromString(html, "text/html");
        const items = doc.querySelectorAll(searchRule.result);
        const results: SearchResult[] = [];

        items.forEach((item) => {
            try {
                const bookName = this.parseContent(item, searchRule.bookName);
                const bookUrlAttribute = this.parseContent(item, searchRule.bookName, "attr", "href");
                const author = this.parseContent(item, searchRule.author);

                if (!bookName || !bookName.trim() || !bookUrlAttribute) return;

                try {
                    const absoluteUrl = new URL(bookUrlAttribute, this.rule.url).href;
                    results.push({
                        sourceId: this.rule.id,
                        bookName: bookName.trim(),
                        url: absoluteUrl,
                        author: author?.trim() || "未知",
                        latestChapter: searchRule.latestChapter ? this.parseContent(item, searchRule.latestChapter) : undefined,
                        lastUpdateTime: searchRule.lastUpdateTime ? this.parseContent(item, searchRule.lastUpdateTime) : undefined,
                        category: searchRule.category ? this.parseContent(item, searchRule.category) : undefined,
                        status: searchRule.status ? this.parseContent(item, searchRule.status) : undefined,
                        wordCount: searchRule.wordCount ? this.parseContent(item, searchRule.wordCount) : undefined,
                    });
                } catch {
                    // Invalid URL format
                }
            } catch (e) {
                console.error(`[ScraperEngine] Parse item error`, e);
            }
        });

        return results;
    }

    /**
     * 获取书籍详情及章节目录
     */
    async getBookInfo(bookUrl: string): Promise<{ info: BookInfo; toc: Chapter[] }> {
        const html = await this.fetchHtml(bookUrl);
        const doc = new DOMParser().parseFromString(html, "text/html");

        const bookRule = this.rule.book;
        const info: BookInfo = {
            url: bookUrl,
            bookName: this.parseContent(doc, bookRule.bookName),
            author: this.parseContent(doc, bookRule.author),
            intro: this.parseContent(doc, bookRule.intro),
            coverUrl: bookRule.coverUrl
                ? this.parseContent(doc, bookRule.coverUrl, "attr", "src") || this.parseContent(doc, bookRule.coverUrl, "attr", "content")
                : undefined,
            category: bookRule.category ? this.parseContent(doc, bookRule.category) : undefined,
            latestChapter: bookRule.latestChapter ? this.parseContent(doc, bookRule.latestChapter) : undefined,
            lastUpdateTime: bookRule.lastUpdateTime ? this.parseContent(doc, bookRule.lastUpdateTime) : undefined,
        };

        if (info.coverUrl) {
            try {
                info.coverUrl = new URL(info.coverUrl, bookUrl).href;
            } catch { /* Ignore malformed URL */ }
        }

        let tocDoc = doc;
        if (this.rule.toc.url) {
            const bookIdMatch = bookUrl.match(/\/(\d+)\/?$/) || bookUrl.split("/").filter(Boolean).pop()?.match(/(\d+)/);
            const bookId = bookIdMatch ? bookIdMatch[1] : "";
            const tocUrl = this.rule.toc.url.replace("%s", bookId);
            const tocHtml = await this.fetchHtml(new URL(tocUrl, bookUrl).href);
            tocDoc = new DOMParser().parseFromString(tocHtml, "text/html");
        }

        let tocContainer: Document | Element = tocDoc;
        if (this.rule.toc.list) {
            const cleanHtml = this.parseContent(tocDoc.documentElement.innerHTML, this.rule.toc.list);
            if (cleanHtml) {
                const temp = document.createElement("div");
                temp.innerHTML = cleanHtml;
                tocContainer = temp;
            }
        }

        const tocItems = tocContainer.querySelectorAll(this.rule.toc.item);
        const toc: Chapter[] = [];
        tocItems.forEach((item, index) => {
            const title = (item as HTMLElement).innerText.trim();
            const url = item.getAttribute("href");
            if (title && url) {
                try {
                    toc.push({
                        bookId: info.bookName, // Placeholder for the actual unique book ID later
                        title,
                        url: new URL(url, bookUrl).href,
                        order: index + 1,
                    });
                } catch { }
            }
        });

        return { info, toc };
    }

    /**
     * 获取并过滤章节正文内容
     */
    async getChapterContent(chapterUrl: string): Promise<string> {
        const html = await this.fetchHtml(chapterUrl);
        const doc = new DOMParser().parseFromString(html, "text/html");

        const chapterRule = this.rule.chapter;
        let content = this.parseContent(doc, chapterRule.content, "html");

        // 过滤不想显示的 DOM 元素
        if (chapterRule.filterTag) {
            const filterTags = chapterRule.filterTag.split(/\s+/);
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = content;
            filterTags.forEach((tag) => {
                const els = tempDiv.querySelectorAll(tag.trim());
                els.forEach((el) => el.remove());
            });
            content = tempDiv.innerHTML;
        }

        // 过滤不想显示的纯文本或者通过正则匹配的数据（例如去广告词）
        if (chapterRule.filterTxt) {
            const filters = chapterRule.filterTxt.split("|");
            filters.forEach((f) => {
                if (!f.trim()) return;
                try {
                    const regex = new RegExp(f, "g");
                    content = content.replace(regex, "");
                } catch (e) {
                    content = content.split(f).join("");
                }
            });
        }

        return content;
    }
}
