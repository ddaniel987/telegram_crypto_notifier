import rp from 'request-promise';
import $ from 'cheerio'
import puppeteer from 'puppeteer'

import { trimSpaces, numberize, crawler } from '../helpers/index.mjs'

const url = 'http://etherscan.io/token/';

export async function get_coin_info(coin) {
    return new Promise(async (resolve, reject) => {
        const browser = crawler.browser;
        const page = crawler.page;

        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36");
        console.log(coin)
        await page.goto(url + coin.block_ref, { waitUntil: 'networkidle2' })

        var attrObj = {}

        const iframeURL = await page.evaluate(() => document.querySelector('#tokentxnsiframe').src)
        const iframeSID = iframeURL.split("&sid=")[1].split("&")[0]
        
        attrObj.txcount = numberize(trimSpaces(await page.evaluate(() => document.querySelector('#totaltxns').innerHTML)))
        attrObj.holders_count = numberize(trimSpaces(await page.evaluate(() => document.querySelector("#sparkholderscontainer").previousElementSibling.innerText)))

        //assemble the holders page and goto
        const holders_uri = `http://etherscan.io/token/generic-tokenholders2?m=normal&a=${coin.block_ref}&sid=${iframeSID}&p=1`
        await page.goto(holders_uri, { waitUntil: 'networkidle2' })

        const holdersHTML = await page.content();
        var holders = []

        for (var row = 1; row < 51; row++) {
            let holder = {}

            const tableBody = $('table tr', holdersHTML)[row]
            const profileBody = $(tableBody).find('a')[0]

            holder.href = profileBody.attribs.href
            holder.address = profileBody.children[0].data
            holder.quantity = numberize($(tableBody).find("td")[2].children[0].data)
            holder.percent_of_supply = parseFloat((holder.quantity / coin.supply_circulating) * 100).toFixed(2);
        
            holders.push(holder)
        }

        attrObj.holders = holders


        // //assemble dex trades page and goto
        // const dex_uri = `http://etherscan.io/dextracker_frame?m=normal&q=${coin.block_ref}&s=USD&a=`
        // await page.goto(dex_uri, { waitUntil: 'networkidle2' })

        // const dexHTML = await page.content();
        // var dex_trades = []

        // for (var row = 1; row < 2; row++) {
        //     let trade = {}

        //     const tableBody = $('tbody tr', dexHTML)[row]
        //     const profileBody = $(tableBody).find('a')[0]

        //     //trade.txn_href = profileBody.attribs.href
        //     //trade.address = $(tableBody).find("td")[1].children[0].data
        //     console.log($(tableBody).find('td')[3].children[0].attribs.title)
        //     trade.when = $(tableBody).find('td')[3].children[0].attribs.title
        //     trade.direction = $(tableBody).find('td')[4].children[0].data
        //     trade.amount_out = $(tableBody).find("td")[5].children[0].data
        //     trade.amount_in = $(tableBody).find("td")[6].children[0].data
        //     trade.swapped_rate = $(tableBody).find("td")[7].children[0].data
        //     trade.txn_value = $(tableBody).find("td")[8].children[0].data
        //     trade.dex_href = $(tableBody).find("td")[9].children[0].attreibs.href

        //     dex_trades.push(trade)
        // }

        //attrObj.dex_trades = dex_trades;

        resolve(attrObj)
    })
}