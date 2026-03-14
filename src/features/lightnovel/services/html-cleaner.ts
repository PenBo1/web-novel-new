/**
 * HTML 清理工具 - 规范化和清理网页内容
 * 移除脚本、样式、广告等不必要的元素
 */

/**
 * 清理 HTML 内容，移除脚本、样式和其他不必要的元素
 */
export function cleanHtmlContent(html: string): string {
  let cleaned = html

  // 移除脚本标签及其内容
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")

  // 移除样式标签及其内容
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")

  // 移除注释
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, "")

  // 移除 iframe、embed、object 标签
  cleaned = cleaned.replace(/<(iframe|embed|object)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, "")

  // 移除事件处理器属性
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "")
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, "")

  // 移除 data 属性（可能包含脚本）
  cleaned = cleaned.replace(/\s*data-\w+\s*=\s*["'][^"']*["']/gi, "")

  return cleaned.trim()
}

/**
 * 转义 HTML 特殊字符
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  }

  return text.replace(/[&<>"']/g, char => map[char] ?? char)
}

/**
 * 反转义 HTML 特殊字符
 */
export function unescapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": "\"",
    "&#39;": "'",
  }

  let result = text
  Object.entries(map).forEach(([escaped, char]) => {
    result = result.replace(new RegExp(escaped, "g"), char)
  })

  return result
}

/**
 * 提取纯文本内容（移除所有 HTML 标签）
 */
export function extractPlainText(html: string): string {
  // 创建临时 DOM 元素
  const temp = document.createElement("div")
  temp.innerHTML = cleanHtmlContent(html)

  // 获取文本内容
  let text = temp.textContent || ""

  // 清理多余空白
  text = text
    .replace(/\s+/g, " ") // 多个空白符合并为一个
    .replace(/\n\s*\n/g, "\n") // 多个换行符合并为一个
    .trim()

  return text
}

/**
 * 规范化 HTML 内容
 * 确保内容格式一致
 */
export function normalizeHtmlContent(html: string): string {
  let normalized = cleanHtmlContent(html)

  // 移除多余的空白符
  normalized = normalized.replace(/>\s+</g, "><")

  // 规范化段落标签
  normalized = normalized.replace(/<p>\s*<\/p>/gi, "")
  normalized = removeBreakOnlyParagraphs(normalized)

  // 规范化换行符
  normalized = normalized.replace(/<br\s*\/?>/gi, "<br/>")

  return normalized
}

function removeBreakOnlyParagraphs(html: string): string {
  const container = document.createElement("div")
  container.innerHTML = html

  const paragraphs = Array.from(container.querySelectorAll("p"))
  for (const paragraph of paragraphs) {
    const nodes = Array.from(paragraph.childNodes)
    const hasOnlyBreaks = nodes.every((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent?.trim() === ""
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        return (node as HTMLElement).tagName === "BR"
      }
      return false
    })

    if (hasOnlyBreaks) {
      paragraph.remove()
    }
  }

  return container.innerHTML
}

/**
 * 提取文本中的段落
 */
export function extractParagraphs(text: string): string[] {
  return text
    .split(/\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
}

/**
 * 合并段落为 HTML
 */
export function paragraphsToHtml(paragraphs: string[]): string {
  return paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join("\n")
}
