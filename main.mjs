import {
    auth,
    dm
} from './telegram'

import chalk from 'chalk'
import prompt from "prompt"
import config from 'config'

import fetcher from './fetcher'
import {
    Coin
} from './fetcher/classes/Coin.mjs'

import {
    initCrawler,
    destroyCrawler,
    stod
} from './fetcher/helpers/index.mjs'

const verbose = true;
const crawler = config.get('crawler')
const notifier = config.get('notifier')
const telegram = config.get('telegram')

const coinCrawl = new Coin({
    name: crawler.name,
    abbrv: crawler.abbreviation,
    href: '/coin/' + crawler.name + '-' + crawler.abbreviation
})

prompt.message = chalk.white('[?]');
console.clear()

console.log(chalk.bgBlue(chalk.bold("CryptoTGNotifier v0.0.1")));
console.log('--\n')

const log = (text, error) => {
    let date = new Date();
    date = date.toLocaleString().split(' ').join('');

    if (error) {
        console.log(chalk.redBright(`[${date}][-] ` + text));
        return;
    }

    console.log(chalk.gray(`[${date}][+] `) + chalk.whiteBright(text));
}

const main = (async () => {
    try {
        var {
            type
        } = await prompt.get([{
            name: 'type',
            message: 'Authenticate as bot or user? (bot/user)'
        }])
        var botObject = null;

        log('Trying to authenticate...');

        if (type == 'user') {
            if (telegram.account_session != '')
                botObject = await auth(true, telegram.account_session);
            else
                botObject = await auth(true);
        } else {
            botObject = await auth();
        }

        if (telegram.account_session == '') {
            log("Here is your session key: " + chalk.gray(botObject.session));
            log("Put it in config/default.json next to 'account_session' to avoid logging in again.")
            log(chalk.redBright("DON'T SHARE IT WITH ANYONE."))
        }

        log("Logged in as: " + chalk.bgGreen(botObject.me.firstName));

        log('Initializing Crawler...')

        const crawlFn = (async () => {
            var retries = 3;
            var current = 0;

            while (current < retries) {
                try {
                    await initCrawler();
                    log('Crawling info for: ' + chalk.bgGreen(" " + coinCrawl.data.name.toUpperCase() + " "));
                    var crawledCoin = await fetcher.get_coin(coinCrawl.data);

                    log('Crawling for social mentions...');
                    await crawledCoin.socials();

                    let data_tosend = crawledCoin.formatData();
                    await destroyCrawler();

                    log('Sending the crawled data to ' + chalk.bgGreen(" " + notifier.my_tg + " "))


                    await dm(botObject.session, {
                        bot: telegram.account_session != '',
                        peer: notifier.my_tg,
                        msg: data_tosend
                    })

                    log(chalk.bgGreen('Crawled data sent successfully to ' + notifier.my_tg));

                    log("Will crawl again after: " + chalk.gray(stod(notifier.interval)))

                    break;
                } catch (err) {
                    log('Failed to send the crawled data to @' + notifier.my_tg);
                    log('Trying again...');
                    await destroyCrawler();
                    current++
                }
            }
        })


        crawlFn();
        setInterval(async () => {
            crawlFn();
        }, notifier.interval * 1000);


    } catch (err) {
        log("Unexpected error", true)
        if (verbose) console.log(err)
    }
})()