import puppeteer from 'puppeteer'

export class Crawler {
    browser = null;
    page = null;

    browser_options_default = {
        headless: true,
        'defaultViewport': { 'width': 1400, 'height': 1400 }
    };

    constructor(options) {
        if (options)
            browser_options_default = Object.assign(options, this.browser_options_default);
    }

    async init() {
        return new Promise(async (resolve, reject) => {
            this.browser = await puppeteer.launch(this.browser_options_default);
            this.page = await this.browser.newPage();
            await this.page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36");

            resolve(this.page)
        });
    }

    async jump(uri) {
        return new Promise(async (resolve, reject) => {
            await this.page.goto(uri, { waitUntil: 'networkidle2' })

            resolve();
        })
    }

}