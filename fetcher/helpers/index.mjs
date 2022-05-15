import {
    Crawler
} from '../classes/Crawler.mjs'

export var crawler;
export var page;
export async function initCrawler() {
    crawler = new Crawler();
    page = await crawler.init();
}

export async function destroyCrawler() {
    await page.close();
}

export function trimSpaces(str) {
    return str.replace(/\s/g, '');
}

export function numberize(str) {
    str = trimSpaces(str)
    str = str.replace('million', 'm')
        .replace('billion', 'b')
        .replace('trillion', 't')

    str = str.replaceAll(',', '')
    return str
}

export async function waitpls(duration) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, duration)
    })
}


export function stod(s) {
    const d = Math.floor(s / (3600 * 24));
    s -= d * 3600 * 24;
    const h = Math.floor(s / 3600);
    s -= h * 3600;
    const m = Math.floor(s / 60);
    s -= m * 60;
    const tmp = [];
    (d) && tmp.push(d + 'd');
    (d || h) && tmp.push(h + 'h');
    (d || h || m) && tmp.push(m + 'm');
    tmp.push(s + 's');
    return tmp.join(' ');
}