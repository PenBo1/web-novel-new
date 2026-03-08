/**
 * 默认书源规则配置
 * 包含常见小说网站的爬虫规则
 * 来自 demo/web-novel-dev 项目
 */

import type { ScraperRule } from '@/types/novel';

/**
 * 香书小说书源规则
 */
const XBIQUGU_RULE: ScraperRule = {
  id: 'xbiqugu',
  name: '香书小说',
  url: 'http://www.xbiqugu.la/',
  search: {
    url: 'http://www.xbiqugu.la/modules/article/waps.php',
    method: 'post',
    data: '{searchkey: %s}',
    result: '#checkform > table > tbody > tr',
    bookName: 'td.even > a',
    author: 'td:nth-of-type(3)',
    latestChapter: 'td.odd > a',
    lastUpdateTime: 'td:nth-of-type(4)',
  },
  book: {
    bookName: 'meta[property="og:novel:book_name"]',
    author: 'meta[property="og:novel:author"]',
    intro: 'meta[property="og:description"]',
    category: 'meta[property="og:novel:category"]',
    coverUrl: 'meta[property="og:image"]',
  },
  toc: {
    item: '#list > dl > dd > a',
  },
  chapter: {
    title: '.bookname > h1',
    content: '#content',
    filterTxt:
      '一秒记住【文学巴士&nbsp;】，精彩无弹窗免费阅读！|(www.xbiquge.la 新笔趣阁)，高速全文字在线阅读！|天才一秒记住本站地址：.+。手机版阅读网址：m.|手机用户请浏览阅读，更优质的阅读体验。|天才壹秒記住.+，為您提供精彩小說閱讀。|\\(本章完\\)',
    filterTag: 'div p script',
  },
};

/**
 * 书海阁小说网书源规则
 */
const SHUHAIGE_RULE: ScraperRule = {
  id: 'shuhaige',
  name: '书海阁小说网',
  url: 'https://www.shuhaige.net/',
  search: {
    url: 'https://www.shuhaige.net/search.html',
    method: 'post',
    data: '{searchkey: %s, searchtype: all}',
    result: '#sitembox > dl',
    bookName: 'dd > h3 > a',
    author: 'dd:nth-child(3) > span:nth-child(1)',
    category: 'dd:nth-child(3) > span:nth-child(3)',
    latestChapter: 'dd:nth-child(5) > a',
    lastUpdateTime: 'dd:nth-child(5) > span',
    status: 'dd:nth-child(3) > span:nth-child(2)',
  },
  book: {
    bookName: 'meta[property="og:novel:book_name"]',
    author: 'meta[property="og:novel:author"]',
    intro: '#intro > p:nth-child(1)',
    category: 'meta[property="og:novel:category"]',
    coverUrl: 'meta[property="og:image"]',
    latestChapter: 'meta[property="og:novel:latest_chapter_name"]',
    lastUpdateTime: 'meta[property="og:novel:update_time"]',
    status: 'meta[property="og:novel:status"]',
  },
  toc: {
    item: 'dl > dt:nth-of-type(2) ~ dd > a',
  },
  chapter: {
    title: '.bookname > h1',
    content: '#content',
    filterTxt:
      '本小章还未完，请点击下一页继续阅读后面精彩内容！|小主，这个章节后面还有哦，请点击下一页继续阅读，后面更精彩！|这章没有结束，请点击下一页继续阅读！|喜欢(.+?)请大家收藏：\\(([^)]+)\\)\\1书海阁小说网更新速度全网最快。|\\(本章完\\)',
    filterTag: 'div hr script table',
  },
};

/**
 * 梦书中文书源规则
 */
const MCXS_RULE: ScraperRule = {
  id: 'mcxs',
  name: '梦书中文',
  url: 'http://www.mcxs.info/',
  search: {
    url: 'http://www.mcxs.info/search.html',
    method: 'post',
    data: '{name: %s}',
    result: '.novelslist2 > ul > li',
    bookName: 'span.s2.wid > a',
    author: 'span.s4.wid > a',
    latestChapter: 'span.s3.wid3 > a',
    lastUpdateTime: 'span.s6.wid6',
  },
  book: {
    bookName: 'meta[property="og:novel:book_name"]',
    author: 'meta[property="og:novel:author"]',
    intro: 'meta[property="og:description"]',
    category: 'meta[property="og:novel:category"]',
    coverUrl: 'meta[property="og:image"]',
    latestChapter: 'meta[property="og:novel:latest_chapter_name"]',
    lastUpdateTime: 'meta[property="og:novel:update_time"]',
  },
  toc: {
    item: 'dl > dt:nth-of-type(2) ~ dd > a',
  },
  chapter: {
    title: '.bookname > h1',
    content: '#content',
    filterTxt:
      '天才一秒记住本站地址：[.+] .+最快更新！无广告！|(.+)，高速全文字在线阅读！|一秒记住【.+】，精彩无弹窗免费阅读！|《.+》.+全文字更新，牢记网址：([a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)*\\.[a-zA-Z]{2,})|\\(本章完\\)',
    filterTag: 'div p script',
  },
};

/**
 * 鸟书网书源规则
 */
const BIRD99XS_RULE: ScraperRule = {
  id: '99xs',
  name: '鸟书网',
  url: 'http://www.99xs.info/',
  search: {
    url: 'http://www.99xs.info/read/search/',
    method: 'post',
    data: '{searchkey: %s}',
    result: 'div.wrap > div > div > div',
    bookName: 'div.bookinfo > h4 > a',
    author: 'div.bookinfo > div.author',
    latestChapter: 'div.bookinfo > div.update > a',
  },
  book: {
    bookName: 'meta[property="og:novel:book_name"]',
    author: 'meta[property="og:novel:author"]',
    intro: 'meta[property="og:description"]',
    category: 'meta[property="og:novel:category"]',
    coverUrl: 'meta[property="og:image"]',
    latestChapter: 'meta[property="og:novel:latest_chapter_name"]',
    lastUpdateTime: 'meta[property="og:novel:update_time"]',
    status: 'meta[property="og:novel:status"]',
  },
  toc: {
    item: 'dl > dt:nth-of-type(2) ~ dd > a',
  },
  chapter: {
    title: '.content > h1',
    content: '#content',
    filterTxt: '请记住本书首发域名：.+。鸟书网手机版阅读网址：.+|7017k|\\(本章完\\)',
    filterTag: '',
  },
};

/**
 * 笔趣阁22书源规则
 */
const BIQU22_RULE: ScraperRule = {
  id: '22biqu',
  name: '笔趣阁22',
  url: 'https://www.22biqu.com/',
  search: {
    url: 'https://www.22biqu.com/ss/',
    method: 'post',
    data: '{searchkey: %s, Submit: 搜索}',
    result: 'body > div.container > div > div > ul > li',
    bookName: 'span.s2 > a',
    author: 'span.s4',
    category: 'span.s1',
    latestChapter: 'span.s3',
    lastUpdateTime: 'span.s5',
  },
  book: {
    bookName: 'meta[property="og:novel:book_name"]',
    author: 'meta[property="og:novel:author"]',
    intro: 'meta[property="og:description"]',
    category: 'meta[property="og:novel:category"]',
    coverUrl: 'meta[property="og:image"]',
    latestChapter: 'meta[property="og:novel:lastest_chapter_name"]',
    lastUpdateTime: 'meta[property="og:novel:update_time"]',
  },
  toc: {
    item: 'div:nth-child(4) > ul > li > a',
  },
  chapter: {
    title: '.title',
    content: '#content',
    filterTxt: '\\(本章完\\)',
    filterTag: '',
  },
};

/**
 * 笔尖中文书源规则
 */
const XBIQUZW_RULE: ScraperRule = {
  id: 'xbiquzw',
  name: '笔尖中文',
  url: 'http://www.xbiquzw.net/',
  search: {
    url: 'http://www.xbiquzw.net/modules/article/search.php',
    method: 'post',
    data: '{searchkey: %s}',
    result: '#wrapper > table > tbody > tr',
    bookName: 'td:nth-child(1) > a',
    author: 'td:nth-child(3)',
    latestChapter: 'td:nth-child(2)',
    lastUpdateTime: 'td:nth-child(5)',
  },
  book: {
    bookName: 'meta[property="og:novel:book_name"]',
    author: 'meta[property="og:novel:author"]',
    intro: 'meta[property="og:description"]',
    category: 'meta[property="og:novel:category"]',
    coverUrl: 'meta[property="og:image"]',
    latestChapter: 'meta[property="og:novel:latest_chapter_name"]',
    lastUpdateTime: 'meta[property="og:novel:update_time"]',
  },
  toc: {
    baseUri: 'http://www.xbiquzw.net/%s/',
    item: '#list > dl > dd > a',
  },
  chapter: {
    title: '.bookname > h1',
    content: '#content',
    filterTxt: '<!--.*?-->|喜欢.+请大家收藏：.+|\\(本章完\\)',
    filterTag: '',
  },
};

/**
 * 书林文学书源规则
 */
const SHU009_RULE: ScraperRule = {
  id: 'shu009',
  name: '书林文学',
  url: 'http://www.shu009.com/',
  search: {
    url: 'http://www.shu009.com/search/',
    method: 'post',
    data: '{searchkey: %s, searchtype: all}',
    result: '.SHsectionThree > div > p',
    bookName: 'span:nth-child(2) > a',
    author: 'span:nth-child(3) > a',
    category: 'span:nth-child(1) > a',
  },
  book: {
    bookName: 'meta[property="og:novel:book_name"]',
    author: 'meta[property="og:novel:author"]',
    intro: '#intro > div',
    category: 'meta[property="og:novel:category"]',
    latestChapter: 'meta[property="og:novel:lastest_chapter_name"]',
    lastUpdateTime: 'meta[property="og:novel:update_time"]',
  },
  toc: {
    url: 'http://www.shu009.com/indexlist/%s/',
    item: 'ol > li > a',
  },
  chapter: {
    title: '#chapterTitle',
    content: '#content',
    filterTxt: '',
    filterTag: 'center',
  },
};

/**
 * 悠久小说网书源规则
 */
const UJXSW_RULE: ScraperRule = {
  id: 'ujxsw',
  name: '悠久小说网',
  url: 'http://www.ujxsw.org/',
  search: {
    url: 'http://www.ujxsw.org/searchbooks.php',
    method: 'post',
    data: '{searchkey: %s}',
    result: '#main > div.shuku_list > div.shulist > ul',
    bookName: 'li.three > a',
    author: 'li.four > a',
    category: 'li.two',
    status: 'li.six',
    latestChapter: 'li.three > span > a',
    lastUpdateTime: 'li.five',
  },
  book: {
    bookName: '#maininfo > div.coverecom.w_770.left > div.tabstit > a:nth-child(4)',
    author: '#bookinfo > div.bookright > div.d_title > h1 > em > a',
    intro: '#bookintro',
    category: '#count > span:nth-child(1)',
    coverUrl: '#bookimg > a > img',
    latestChapter: '#bookinfo > div.bookright > div.new > span.new_t > a',
    lastUpdateTime: '#bookinfo > div.bookright > div.new > span.new_p',
    wordCount: '#count > span:nth-child(5)',
  },
  toc: {
    url: 'http://www.ujxsw.org/read/%s/',
    item: '#readerlist > ul > li > a',
  },
  chapter: {
    title: '#mlfy_main_text > h3',
    content: '#mlfy_main_text > div.read-content > p',
    filterTxt:
      '【悠久小説網ωωω.ＵＪХＳw.ｎｅｔ】，免费小说无弹窗免费阅读！|佰度搜索 【悠久小説網 ＷＷＷ.ＵＪХＳw．ＮＥＴ】 全集TXT电子书免费下载！|《.*》悠久小说网全文字更新,牢记网址:www.ujxsw.org|1秒记住网：',
    filterTag: '',
  },
};

/**
 * 阅读库书源规则
 */
const YEUDUSK_RULE: ScraperRule = {
  id: 'yeudusk',
  name: '阅读库',
  url: 'http://www.yeudusk.com/',
  search: {
    url: 'http://www.yeudusk.com/modules/article/search.php?q=%s',
    method: 'get',
    result: '#jieqi_page_contents > div > div:nth-child(2)',
    bookName: 'div:nth-child(1) > span > a',
    author: 'div:nth-child(2) > span:nth-child(2)',
    category: 'div:nth-child(2) > span:nth-child(4)',
    status: 'span:nth-child(8)',
    latestChapter: 'div:nth-child(4) > span:nth-child(2) > a',
    lastUpdateTime: 'div:nth-child(4) > span:nth-child(4)',
  },
  book: {
    bookName: 'meta[property="og:novel:book_name"]',
    author: 'meta[property="og:novel:author"]',
    intro: '#content > div.divbox.cf > div:nth-child(2) > div:nth-child(3) > div.tabcontent > div:nth-child(1) > div',
    category: 'meta[property="og:novel:category"]',
    coverUrl: 'meta[property="og:image"]',
    latestChapter: '#content > div:nth-child(4) > h3',
    status: 'meta[property="og:novel:status"]',
  },
  toc: {
    url: 'http://www.yeudusk.com/html/0/%s/',
    item: 'ul > li > a',
  },
  chapter: {
    title: '#cont > h1',
    content: '#clickeye_content',
    filterTxt:
      '\\(阅读库\\s?www\\.yeudusk\\.com\\)|阅读库 www.yeudusk.comyeudusk www.yeudusk.com|《.+》阅读库全文字更新,牢记网址:www\\.yeudusk\\.com',
  },
};

/**
 * 顶点小说书源规则
 */
const WXSY_RULE: ScraperRule = {
  id: 'wxsy',
  name: '顶点小说',
  url: 'https://www.wxsy.net/',
  search: {
    url: 'https://www.wxsy.net/search.html',
    method: 'post',
    data: '{s: %s}',
    result: 'body > div.container > div:nth-child(1) > div > ul > li',
    bookName: 'span.s2 > a',
    author: 'span.s3 > a',
    category: 'span.s1',
    latestChapter: 'span.s4 > a',
    lastUpdateTime: 'span.s5',
  },
  book: {
    bookName: 'meta[property="og:novel:book_name"]',
    author: 'meta[property="og:novel:author"]',
    intro: 'meta[name="description"]',
    category: 'meta[property="og:novel:category"]',
    coverUrl: '.imgbox > img',
    latestChapter: 'meta[property="og:novel:latest_chapter_name"]',
    lastUpdateTime: 'meta[property="og:novel:update_time"]',
    status: 'meta[property="og:novel:status"]',
  },
  toc: {
    url: 'https://www.wxsy.net/novel/%s/chapter_1.html',
    item: '.biqunaicc > div:nth-child(2) > div > ul > li > a',
  },
  chapter: {
    title: 'h3',
    content: '.row-detail > div > div',
    filterTxt: '请勿开启浏览器阅读模式，否则将导致章节内容缺失及无法阅读下一章。',
    filterTag: 'h3 div',
  },
};

/**
 * 所有默认书源规则
 */
export const DEFAULT_RULES: ScraperRule[] = [
  XBIQUGU_RULE,
  SHUHAIGE_RULE,
  MCXS_RULE,
  BIRD99XS_RULE,
  BIQU22_RULE,
  XBIQUZW_RULE,
  SHU009_RULE,
  UJXSW_RULE,
  YEUDUSK_RULE,
  WXSY_RULE,
];

/**
 * 获取默认规则
 */
export function getDefaultRules(): ScraperRule[] {
  return DEFAULT_RULES.map((rule) => ({ ...rule }));
}

/**
 * 根据 ID 获取默认规则
 */
export function getDefaultRuleById(id: string): ScraperRule | undefined {
  return DEFAULT_RULES.find((rule) => rule.id === id);
}

/**
 * 检查规则是否为默认规则
 */
export function isDefaultRule(ruleId: string): boolean {
  return DEFAULT_RULES.some((rule) => rule.id === ruleId);
}
