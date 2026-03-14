import type { Book, Chapter } from "@/types/novel"
import { saveAs } from "file-saver"
import JSZip from "jszip"

/**
 * EPUB 生成器服务
 * 纯客户端生成符合 EPUB 3.0 标准的电子书
 */
export class EpubGenerator {
  private zip: JSZip
  private book: Book
  private chapters: Chapter[]
  private coverImageBase64?: string

  constructor(book: Book, chapters: Chapter[]) {
    this.zip = new JSZip()
    this.book = book
    this.chapters = chapters
  }

  /**
   * 将图片 URL 转换为 Base64
   */
  async fetchCoverImage(): Promise<void> {
    if (!this.book.cover)
      return

    try {
      const response = await fetch(this.book.cover)
      const blob = await response.blob()
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          this.coverImageBase64 = (reader.result as string).split(",")[1]
          resolve()
        }
        reader.readAsDataURL(blob)
      })
    }
    catch (e) {
      console.warn("Failed to fetch cover image:", e)
    }
  }

  /**
   * 生成并下载 EPUB 文件
   */
  async generateAndDownload(): Promise<void> {
    await this.fetchCoverImage()

    // 1. mimetype (必须在根目录且不压缩)
    this.zip.file("mimetype", "application/epub+zip", { compression: "STORE" })

    // 2. META-INF 目录
    const metaInf = this.zip.folder("META-INF")
    metaInf?.file(
      "container.xml",
      `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
        <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
    </rootfiles>
</container>`,
    )

    // 3. OEBPS 目录
    const oebps = this.zip.folder("OEBPS")

    // 生成章节 HTML
    const chapterFiles: string[] = []
    this.chapters.forEach((chapter, index) => {
      const fileName = `chapter_${index + 1}.xhtml`
      chapterFiles.push(fileName)

      // 移除不可见字符
      const safeContent = (chapter.content || "")
      // 替换常见的无法在 XML 中解析的字符
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;")
      // 将换行替换为 p 标签
        .split("\n")
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .map(p => `<p>${p}</p>`)
        .join("\n")

      oebps?.file(
        fileName,
        `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
    <title>${chapter.title}</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
    <h1>${chapter.title}</h1>
    <div class="content">${safeContent}</div>
</body>
</html>`,
      )
    })

    // 封面图片
    if (this.coverImageBase64) {
      oebps?.file("images/cover.jpg", this.coverImageBase64, { base64: true })
    }

    // 样式表
    oebps?.file(
      "style.css",
      `body { font-family: sans-serif; margin: 1em; line-height: 1.6; }
h1 { text-align: center; margin-bottom: 2em; }
p { text-indent: 2em; margin: 0.5em 0; }`,
    )

    // 目录流 (TOC)
    let navLis = ""
    let ncxPoints = ""
    this.chapters.forEach((chapter, index) => {
      const href = `chapter_${index + 1}.xhtml`
      navLis += `<li><a href="${href}">${chapter.title}</a></li>\n`
      ncxPoints += `
      <navPoint id="navPoint-${index + 1}" playOrder="${index + 1}">
          <navLabel><text>${chapter.title}</text></navLabel>
          <content src="${href}"/>
      </navPoint>`
    })

    // epub3 navigation
    oebps?.file(
      "toc.xhtml",
      `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
    <title>目录</title>
</head>
<body>
    <nav epub:type="toc" id="toc">
        <h1>目录</h1>
        <ol>
            ${navLis}
        </ol>
    </nav>
</body>
</html>`,
    )

    // epub2 ncx (为了兼容性)
    oebps?.file(
      "toc.ncx",
      `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
    <head>
        <meta name="dtb:uid" content="${this.book.id}"/>
        <meta name="dtb:depth" content="1"/>
        <meta name="dtb:totalPageCount" content="0"/>
        <meta name="dtb:maxPageNumber" content="0"/>
    </head>
    <docTitle>
        <text>${this.book.title}</text>
    </docTitle>
    <navMap>
        ${ncxPoints}
    </navMap>
</ncx>`,
    )

    // OPF (打包文件)
    let manifestItems = ""
    let spineItemrefs = ""

    chapterFiles.forEach((file, index) => {
      manifestItems += `<item id="chapter_${index + 1}" href="${file}" media-type="application/xhtml+xml"/>\n`
      spineItemrefs += `<itemref idref="chapter_${index + 1}"/>\n`
    })

    const coverManifest = this.coverImageBase64
      ? `<item id="cover-image" href="images/cover.jpg" media-type="image/jpeg" properties="cover-image"/>`
      : ""
    const coverMeta = this.coverImageBase64
      ? `<meta name="cover" content="cover-image"/>`
      : ""

    oebps?.file(
      "content.opf",
      `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
        <dc:title>${this.book.title}</dc:title>
        <dc:creator>${this.book.author || "未知"}</dc:creator>
        <dc:language>zh-CN</dc:language>
        <dc:identifier id="BookId">urn:uuid:${this.book.id}</dc:identifier>
        ${coverMeta}
    </metadata>
    <manifest>
        <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
        <item id="toc" href="toc.xhtml" media-type="application/xhtml+xml" properties="nav"/>
        <item id="style" href="style.css" media-type="text/css"/>
        ${coverManifest}
        ${manifestItems}
    </manifest>
    <spine toc="ncx">
        ${spineItemrefs}
    </spine>
</package>`,
    )

    // 4. 打包并下载
    const content = await this.zip.generateAsync({ type: "blob" })
    saveAs(content, `${this.book.title}.epub`)
  }
}
