export function removeElements(elements: Element[]) {
    elements.forEach(el => el.remove());
}

export function cleanWenkuContent(container: Element) {
    // 移除广告和推广内容
    const ads = container.querySelectorAll('.ad, .推广, script, style, iframe');
    removeElements(Array.from(ads));

    // 移除特定样式的多余内容
    const badTexts = ['本文来自', '轻小说文库', 'wenku8.net'];
    const nodes = container.querySelectorAll('*');
    nodes.forEach(node => {
        if (badTexts.some(text => node.textContent?.includes(text))) {
            node.remove();
        }
    });
}

export function cleanBiliContent(container: Element) {
    const ads = container.querySelectorAll('.ad, .推广, script, style, iframe, .tp, .bd');
    removeElements(Array.from(ads));
}

export function replaceImageSrc(container: Element) {
    container.querySelectorAll('img').forEach(img => {
        const dataSrc = img.getAttribute('data-src') || img.getAttribute('data-original');
        if (dataSrc) img.setAttribute('src', dataSrc);
    });
}

export function removeElementsByPattern(container: Element, pattern: string, options: { matchId?: boolean } = {}) {
    const regex = new RegExp(pattern);
    container.querySelectorAll('*').forEach(el => {
        if (options.matchId && el.id && regex.test(el.id)) {
            el.remove();
        } else if (el.className && typeof el.className === 'string' && regex.test(el.className)) {
            el.remove();
        }
    });
}

export function cleanHtmlToText(html: string): string {
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();
}
