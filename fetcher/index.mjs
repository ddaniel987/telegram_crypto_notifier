import { Coin } from "./classes/Coin.mjs";

const get_coin_default = {
    coinranking: true,
    txscan: false,
}

export default { //used to fetch coins/coin info
    
    //# this will try and get every thing possible about a coin from currently supported 3 providers
    get_coin: async function (coin, options) {
        return new Promise(async (resolve, reject) => {
            if (options == undefined) options = get_coin_default
            else
                options = Object.assign(options, get_coin_default);

            var coinObj = new Coin({});

            if (options.coinranking)
                coinObj.addit(await ((await import(`./fetching/coinranking.mjs`)).get_coin_info(coin)))

            if (options.txscan && coinObj.data.blockchain == "Ethereum")
                coinObj.addit(await ((await import(`./fetching/etherscan.mjs`)).get_coin_info(coin)))

            if (options.txscan && coinObj.data.blockchain == "Binance")
                coinObj.addit(await ((await import(`./fetching/bscscan.mjs`)).get_coin_info(coin)))


            resolve(coinObj)
        })
    },

    get_new_coins: async function () {
        return (await import(`./fetching/coinranking.mjs`)).get_new_coins();
    }
}