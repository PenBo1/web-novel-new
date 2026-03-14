import type { ScraperRule } from "@/types/novel"

/**
 * 内置小说书源规则库
 * 聚合全网优质文学站点解析规则
 *
 * TODO: 这里的解析规则是从 `demo/web-novel-dev` 迁移而来，部分站点的反爬虫策略可能已经改变。
 * 在后续可作为基础书源测试，推荐提供 UI 供用户自定义导入更新。
 */
export const BUILTIN_RULES: ScraperRule[] = [
  {
    id: "xbiqugu",
    name: "香书小说",
    url: "http://www.xbiqugu.la/",
    search: {
      url: "http://www.xbiqugu.la/modules/article/waps.php",
      method: "post",
      data: "{searchkey: %s}",
      result: "#checkform > table > tbody > tr",
      bookName: "td.even > a",
      author: "td:nth-of-type(3)",
      latestChapter: "td.odd > a",
      lastUpdateTime: "td:nth-of-type(4)",
    },
    book: {
      bookName: "meta[property=\"og:novel:book_name\"]",
      author: "meta[property=\"og:novel:author\"]",
      intro: "meta[property=\"og:description\"]",
      category: "meta[property=\"og:novel:category\"]",
      coverUrl: "meta[property=\"og:image\"]",
    },
    toc: {
      item: "#list > dl > dd > a",
    },
    chapter: {
      title: ".bookname > h1",
      content: "#content",
      filterTxt:
                "一秒记住【文学巴士&nbsp;】，精彩无弹窗免费阅读！|(www.xbiquge.la 新笔趣阁)，高速全文字在线阅读！|天才一秒记住本站地址：.+。手机版阅读网址：m.|手机用户请浏览阅读，更优质的阅读体验。|天才壹秒記住.+，為您提供精彩小说阅读。|\\(本章完\\)",
      filterTag: "div p script",
    },
  },
  {
    id: "shuhaige",
    name: "书海阁小说网",
    url: "https://www.shuhaige.net/",
    search: {
      url: "https://www.shuhaige.net/search.html",
      method: "post",
      data: "{searchkey: %s, searchtype: all}",
      result: "#sitembox > dl",
      bookName: "dd > h3 > a",
      author: "dd:nth-child(3) > span:nth-child(1)",
      category: "dd:nth-child(3) > span:nth-child(3)",
      latestChapter: "dd:nth-child(5) > a",
      lastUpdateTime: "dd:nth-child(5) > span",
      status: "dd:nth-child(3) > span:nth-child(2)",
    },
    book: {
      bookName: "meta[property=\"og:novel:book_name\"]",
      author: "meta[property=\"og:novel:author\"]",
      intro: "#intro > p:nth-child(1)",
      category: "meta[property=\"og:novel:category\"]",
      coverUrl: "meta[property=\"og:image\"]",
      latestChapter: "meta[property=\"og:novel:latest_chapter_name\"]",
      lastUpdateTime: "meta[property=\"og:novel:update_time\"]",
      status: "meta[property=\"og:novel:status\"]",
    },
    toc: {
      item: "dl > dt:nth-of-type(2) ~ dd > a",
    },
    chapter: {
      title: ".bookname > h1",
      content: "#content",
      filterTxt:
                "本小章还未完，请点击下一页继续阅读后面精彩内容！|小主，这个章节后面还有哦，请点击下一页继续阅读，后面更精彩！|这章没有结束，请点击下一页继续阅读！|喜欢(.+?)请大家收藏：\\(([^)]+)\\)\\1书海阁小说网更新速度全网最快。|\\(本章完\\)",
      filterTag: "div hr script table",
    },
  },
  {
    id: "mcxs",
    name: "梦书中文",
    url: "http://www.mcxs.info/",
    search: {
      url: "http://www.mcxs.info/search.html",
      method: "post",
      data: "{name: %s}",
      result: ".novelslist2 > ul > li",
      bookName: "span.s2.wid > a",
      author: "span.s4.wid > a",
      latestChapter: "span.s3.wid3 > a",
      lastUpdateTime: "span.s6.wid6",
    },
    book: {
      bookName: "meta[property=\"og:novel:book_name\"]",
      author: "meta[property=\"og:novel:author\"]",
      intro: "meta[property=\"og:description\"]",
      category: "meta[property=\"og:novel:category\"]",
      coverUrl: "meta[property=\"og:image\"]@js:r='http://www.mcxs.info'+r",
      latestChapter: "meta[property=\"og:novel:latest_chapter_name\"]",
      lastUpdateTime: "meta[property=\"og:novel:update_time\"]",
    },
    toc: {
      item: "dl > dt:nth-of-type(2) ~ dd > a",
    },
    chapter: {
      title: ".bookname > h1",
      content: "#content",
      filterTxt:
                "天才一秒记住本站地址：[.+] .+最快更新！无广告！|(.+)，高速全文字在线阅读！|一秒记住【.+】，精彩无弹窗免费阅读！|《.+》.+全文字更新，牢记网址：([a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)*\\.[a-zA-Z]{2,})|\\(本章完\\)",
      filterTag: "div p script",
    },
  },
  {
    id: "99xs",
    name: "鸟书网",
    url: "http://www.99xs.info/",
    search: {
      url: "http://www.99xs.info/read/search/",
      method: "post",
      data: "{searchkey: %s}",
      result: "div.wrap > div > div > div",
      bookName: "div.bookinfo > h4 > a",
      author: "div.bookinfo > div.author@js:r=r.replace('作者：', '');",
      latestChapter: "div.bookinfo > div.update > a",
    },
    book: {
      bookName: "meta[property=\"og:novel:book_name\"]",
      author: "meta[property=\"og:novel:author\"]",
      intro: "meta[property=\"og:description\"]",
      category: "meta[property=\"og:novel:category\"]",
      coverUrl: "meta[property=\"og:image\"]",
      latestChapter: "meta[property=\"og:novel:latest_chapter_name\"]",
      lastUpdateTime: "meta[property=\"og:novel:update_time\"]",
      status: "meta[property=\"og:novel:status\"]",
    },
    toc: {
      item: "dl > dt:nth-of-type(2) ~ dd > a",
    },
    chapter: {
      title: ".content > h1",
      content: "#content",
      filterTxt:
                "请记住本书首发域名：.+。鸟书网手机版阅读网址：.+|7017k|\\(本章完\\)",
      filterTag: "",
    },
  },
  {
    id: "22biqu",
    name: "笔趣阁22",
    url: "https://www.22biqu.com/",
    search: {
      url: "https://www.22biqu.com/ss/",
      method: "post",
      data: "{searchkey: %s, Submit: 搜索}",
      result: "body > div.container > div > div > ul > li",
      bookName: "span.s2 > a",
      author: "span.s4",
      category: "span.s1",
      latestChapter: "span.s3",
      lastUpdateTime: "span.s5",
    },
    book: {
      bookName: "meta[property=\"og:novel:book_name\"]",
      author: "meta[property=\"og:novel:author\"]",
      intro: "meta[property=\"og:description\"]",
      category: "meta[property=\"og:novel:category\"]",
      coverUrl: "meta[property=\"og:image\"]",
      latestChapter: "meta[property=\"og:novel:lastest_chapter_name\"]",
      lastUpdateTime: "meta[property=\"og:novel:update_time\"]",
    },
    toc: {
      item: "div:nth-child(4) > ul > li > a",
    },
    chapter: {
      title: ".title",
      content: "#content",
      filterTxt: "\\(本章完\\)",
      filterTag: "",
    },
  },
]
