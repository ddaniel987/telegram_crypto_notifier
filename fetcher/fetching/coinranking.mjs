import rp from 'request-promise';
import $ from 'cheerio'
import puppeteer from 'puppeteer'

import { trimSpaces, numberize, crawler } from '../helpers/index.mjs'

const url = 'http://coinranking.com';

export async function get_new_coins() {
    return new Promise((resolve, reject) => {
        rp({
            uri: url + "/coins/new",
            strictSSL: false
        })
            .then(function (html) {
                const coins = []

                for (let i = 1; i < 52; i++) {
                    var coin = {};
                    try {
                        const coinBody = $('.coins-new tr', html)[i];
                        const coinIdentity = $(coinBody).find('span.profile__name')[0];
                        const coinImg = $(coinBody).find('img.profile__logo')[0];
                        const coinPrice = $(coinBody).find('div.valuta')[0];
                        const coinVolume = $(coinBody).find('div.valuta')[1];
                        const coinAdded = $(coinBody).find('td').last().children()
                        if (coinIdentity == undefined) continue //ad

                        coin.img = trimSpaces(coinImg.attribs.src).split('?')[0] + "?size=48x48";
                        coin.added = trimSpaces(coinAdded[0].children[0].data.split('\n')[1])
                        coin.volume = numberize(trimSpaces(coinVolume.children[0].data.split('\n')[3]))
                        coin.price = trimSpaces(coinPrice.children[0].data.split('\n')[3])
                        coin.abbrv = trimSpaces(coinIdentity.children[2].children[0].data.split('\n')[1])
                        coin.name = trimSpaces(coinIdentity.children[0].children[0].data.split('\n')[1])
                        coin.href = trimSpaces(coinIdentity.children[0].attribs.href)

                        coins.push(coin)
                    } catch (exr) {
                        //coin could not be structured
                    }
                }

                resolve(coins);
            })
    })
}


export async function get_coin_info(coin) {
    return new Promise(async (resolve, reject) => {
        // const browser = await puppeteer.launch({
        //     headless: true,
        //     'defaultViewport': { 'width': 900, 'height': 900 }
        // });
        // const page = await browser.newPage();
        const browser = crawler.browser;
        const page = crawler.page;

        await page.setBypassCSP(true);

        await page.goto(url + coin.href, { waitUntil: 'networkidle0', devtools: true });


        //prepare the page
        const [btnAgree] = await page.$x("//button[contains(., 'AGREE')]"); //agree on cookies && preferences
        btnAgree.click();

        const [btnPerformanceMenu] = await page.$x('//*[@class="coin-price-performance-section"]//button'); //open time interval menu
        btnPerformanceMenu.click();

        let timeout = setTimeout(() => {
            btnPerformanceMenu.click();
        }, 1000)

        await page.waitForSelector(".coin-price-performance-section ul.select-list-with-slot__options", { visible: true });
        clearTimeout(timeout)

        const [li] = await page.$x("//*[@class='coin-price-performance-section']//li[contains(., 'Hourly')]"); //select hourly
        await li.click();

        //end prepare

        //get internal state obj of the coin

        var fetchedObj = {}
        var done = false

        page.on('console', (out) => {
            if (out._text == 'DONE') {
                done = true
                return
            }

            if (out._text.includes("|")) { //handling nested arrays/objects
                var rtw = out._text.split('|');
                var array_name = rtw[0]
                var array_pos = parseInt(rtw[1])
                var obj_prop = rtw[2]
                var obj_val = rtw[3]

                if (fetchedObj[array_name] == undefined)
                    fetchedObj[array_name] = []

                if (fetchedObj[array_name][array_pos] == undefined)
                    fetchedObj[array_name][array_pos] = {}


                fetchedObj[array_name][array_pos][obj_prop] = obj_val;

                return
            }

            var raw = out._text.split(' '); //handling else properties
            var prop = raw[0]
            var val = raw[1]

            fetchedObj[prop] = val;
        })

        await page.evaluate(() => {
            //POLLYFILLING FOR OLD CHROMIUM
            //DONT TOUCH THIS CODE

            //polyfilling typeof
            const totype = function (obj) {
                return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
            }

            //polyfilling object keys
            const okeys = (function () {
                'use strict';
                var hasOwnProperty = Object.prototype.hasOwnProperty,
                    hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
                    dontEnums = [
                        'toString',
                        'toLocaleString',
                        'valueOf',
                        'hasOwnProperty',
                        'isPrototypeOf',
                        'propertyIsEnumerable',
                        'constructor'
                    ],
                    dontEnumsLength = dontEnums.length;

                return function (obj) {
                    if (totype(obj) !== 'object' && (totype(obj) !== 'function' || obj === null)) {
                        throw new TypeError('Object.keys called on non-object');
                    }

                    var result = [], prop, i;

                    for (prop in obj) {
                        if (hasOwnProperty.call(obj, prop)) {
                            result.push(prop);
                        }
                    }

                    if (hasDontEnumBug) {
                        for (i = 0; i < dontEnumsLength; i++) {
                            if (hasOwnProperty.call(obj, dontEnums[i])) {
                                result.push(dontEnums[i]);
                            }
                        }
                    }
                    return result;
                };
            }());

            //polyfilling object entries
            const oj = function (obj) {
                var ownProps = okeys(obj),
                    i = ownProps.length,
                    resArray = new Array(i);
                while (i--)
                    resArray[i] = [ownProps[i], obj[ownProps[i]]];

                return resArray;
            };

            //END OF POLYFILLING

            console.log("24hchange", window.__NUXT__.data[0].coin['change'])
            console.log("24hVolume", window.__NUXT__.data[0].coin['24hVolume'])
            console.log("IconURL", window.__NUXT__.data[0].coin['iconUrl'])
            console.log("marketCap", window.__NUXT__.data[0].coin['marketCap'])
            console.log("numberOfExchanges", window.__NUXT__.data[0].coin['numberOfExchanges'])
            console.log("numberOfMarkets", window.__NUXT__.data[0].coin['numberOfMarkets'])
            console.log("price", window.__NUXT__.data[0].coin['price'])
            console.log("rank", window.__NUXT__.data[0].coin['rank'])
            console.log("supply_circulating", window.__NUXT__.data[0].coin['supply'].circulating)
            console.log("supply_confirmed", window.__NUXT__.data[0].coin['supply'].confirmed)
            console.log("supply_total", window.__NUXT__.data[0].coin['supply'].total)
            console.log("supply_circulating_synced", window.__NUXT__.data[1].supply.circulatingSyncedAt)
            console.log("supply_total_synced", window.__NUXT__.data[1].supply.totalSyncedAt)
            console.log("tier", window.__NUXT__.data[0].coin['tier'])

            if (window.__NUXT__.data[1].issuanceBlockchains.length > 0) {
                console.log("blockchain", window.__NUXT__.data[1].issuanceBlockchains[0].name)
                console.log("block_ref", window.__NUXT__.data[1].issuanceBlockchains[0].reference)
                console.log("block_refName", window.__NUXT__.data[1].issuanceBlockchains[0].referenceName)
                console.log("block_explorer_url", window.__NUXT__.data[1].issuanceBlockchains[0].blockExplorerUrl)
            } else {
                console.log("blockchain", "Unknown")
            }

            window.__NUXT__.data[1].topExchanges.forEach((e, i) => oj(e).forEach(d => console.log('top_exchanges|' + i + "|" + d.join('|'))))
            //window.__NUXT__.data[1].topMarkets.forEach((e, i) => oj(e).forEach(d => console.log('top_markets|' + i + "|" + d.join('|'))))

            console.log("DONE")
        });

        var timeLeft = setTimeout(() => {
            reject(fetchedObj)

        }, 1500); //max time for fetch

        var waitDone = setInterval(() => {
            if (done) {
                clearTimeout(timeLeft);

                fetchedObj = Object.assign(coin, fetchedObj)
                fetchedObj['supply_burned_locked'] = fetchedObj["supply_total"] - fetchedObj["supply_circulating"];

                resolve(fetchedObj)

                clearInterval(waitDone)
            }
        }, 10)
    })
}