/**
 * HTML 内容清理与标准化工具
 * 负责移除小说正文中的广告、干扰元素，并修复乱码
 */

/**
 * 规范化文本内容，处理零宽字符、控制字符及常见乱码
 */
export function normalizeText(text: string): string {
    if (!text) return ""

    // 1. 移除零宽字符 (\u200B-\u200D) 和 BOM (\uFEFF)
    let normalized = text.replace(/[\u200B-\u200D\uFEFF]/g, "")

    // 2. 移除常见的控制字符及替换字符 (\ufffd)
    normalized = normalized
        .replace(/\ufffd/g, "")
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")

    return normalized
}

/**
 * 清理哔哩轻小说内容 (BiliNovel)
 * 逻辑参考 web-novel-dev 提取
 */
export function cleanBiliContent(container: Element) {
    const tagsToRemove = ["div", "ins", "figure", "fig", "br", "script"]
    tagsToRemove.forEach(tag => {
        container.querySelectorAll(tag).forEach(el => el.remove())
    })

    // 移除广告类 class
    container.querySelectorAll(".tp, .bd").forEach(el => el.remove())

    // 根据正则移除特定 ID (常见于干扰元素)
    container.querySelectorAll("*").forEach(el => {
        if (el.id && /[a-z]\d{4}/.test(el.id)) {
            el.remove()
        }
    })

    // 处理图片懒加载
    processImages(container)
}

/**
 * 清理轻小说文库内容 (Wenku8)
 */
export function cleanWenkuContent(container: Element) {
    const idsToRemove = ["#contentdp"]
    idsToRemove.forEach(id => container.querySelector(id)?.remove())

    container.querySelectorAll("br, script").forEach(el => el.remove())
}

/**
 * 通用的图片处理逻辑：修复 src 协议并移除冗余属性
 */
export function processImages(container: Element) {
    const images = container.querySelectorAll("img")
    images.forEach(img => {
        let src = img.getAttribute("data-src") || img.getAttribute("src")
        if (!src || src.includes("<")) {
            img.remove()
            return
        }

        if (src.startsWith("//")) {
            src = `https:${src}`
        }

        img.setAttribute("src", src)

        // 只保留必要的属性，清理干扰
        const allowedAttrs = ["src", "alt", "width", "height"]
        Array.from(img.attributes).forEach(attr => {
            if (!allowedAttrs.includes(attr.name)) {
                img.removeAttribute(attr.name)
            }
        })
    })
}
