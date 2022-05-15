import {
    trimSpaces,
    numberize,
    crawler
} from '../helpers/index.mjs'
import axios from 'axios'
import config from 'config'
const social_cfg = config.get('socials')
const social_cfg_bools = config.get('socials.options')

const socials_options_default = {
    web: social_cfg_bools.web,
    twitter: social_cfg_bools.twitter,
    instagram: social_cfg_bools.instagram,
    facebook: social_cfg_bools.facebook,
    reddit: social_cfg_bools.reddit,
    vk: social_cfg_bools.vk,
}

export class Coin {
    data

    constructor(baseStruct) {
        this.data = baseStruct;
    }

    formatData() {
        //do socials
        var newData = {
            mentions: {
                positive: 0,
                neutral: 0,
                negative: 0,
            },
            trends: {
                positive: 0,
                neutral: 0,
                negative: 0,
            },
        }
        if (this.data.mentions && this.data.trends && social_cfg.social_searcher_api != '') {
            Object.entries(this.data.mentions).forEach(entry => {
                const [key, value] = entry;

                value.posts.forEach((post) => {
                    if (post.sentiment == 'positive')
                        newData.mentions.positive++;

                    if (post.sentiment == 'neutral')
                        newData.mentions.neutral++;

                    if (post.sentiment == 'negative')
                        newData.mentions.negative++;
                })
            })

            Object.entries(this.data.trends).forEach(entry => {
                const [key, value] = entry;

                value.posts.forEach((post) => {
                    if (post.sentiment == 'positive')
                        newData.trends.positive++;

                    if (post.sentiment == 'neutral')
                        newData.trends.neutral++;

                    if (post.sentiment == 'negative')
                        newData.trends.negative++;
                })
            })
        }

        let final = `
Latest information about **${this.data.name.toUpperCase()}**:
Price: **${parseFloat(this.data.price).toFixed(5)} (${this.data['24hchange'] <= 0 ? '' : '+'} ${this.data['24hchange']}%)**
24h volume: **${this.data['24hVolume'].toLocaleString()}**
Market Cap: **${this.data.marketCap}**
Rank: **${this.data.rank}**

--- Socials ---
Mentions: 
    Positive: ** ${newData.mentions.positive} **
    Neutral: **${newData.mentions.neutral}**
    Negative: **${newData.mentions.negative}**

Trends: 
    Positive: **${newData.trends.positive}**
    Neutral: **${newData.trends.neutral}**
    Negative: **${newData.trends.negative}**
`


        return final;
    }

    //calculate the sentiment value based on mentions on socials
    //also fetch mentions and other good stuff

    async socials(options) {
        return new Promise(async (resolve, reject) => {
            try {
                //based on reverse engineered social-searcher api
                if (!options) options = socials_options_default;
                var results = {}
                let coin_name = this.data.name;
                let coin_abv = this.data.abbrv;
                results['mentions'] = []
                results['trends'] = []

                if (social_cfg.social_searcher_api != '') {
                    if (options.web) {
                        results['mentions']['web'] = (await axios.get(`http://api.social-searcher.com/v2/search?q=${coin_name}&network=web&type=video,photo,status,link&limit=500&key=${social_cfg.social_searcher_api}`)).data
                    }

                    if (options.twitter) {
                        results['mentions']['twitter'] = (await axios.get(`http://api.social-searcher.com/v2/trends?q=${coin_name}&network=twitter&key=${social_cfg.social_searcher_api}`)).data
                        results['trends']['twitter'] = (await axios.get(`http://api.social-searcher.com/v2/trends?q=${coin_name}&network=twitter&key=${social_cfg.social_searcher_api}`)).data
                    }

                    if (options.facebook)
                        results['mentions']['facebook'] = (await axios.get(`http://api.social-searcher.com/v2/search?q=${coin_name}&network=facebook&type=video,photo,status,link&limit=500&key=${social_cfg.social_searcher_api}`)).data

                    if (options.instagram) {
                        results['mentions']['instagram'] = (await axios.get(`http://api.social-searcher.com/v2/search?q=${coin_name}&network=instagram&type=video,photo,status,link&limit=500&key=${social_cfg.social_searcher_api}`)).data
                        results['trends']['instagram'] = (await axios.get(`http://api.social-searcher.com/v2/trends?q=${coin_name}&network=instagram&key=${social_cfg.social_searcher_api}`)).data
                    }
                }

                if (options.vk && social_cfg.vk_access_token != '')
                    results['mentions']['vk'] = (await axios.get(`http://api.vk.com/method/newsfeed.search?extended=1&v=5.1318&q=${coin_name}%20&count=200&&access_token=${social_cfg.vk_access_token}`)).data


                this.addit(results)

                resolve(this)
            } catch (err) {
                reject(err);
            }
        })
    }



    addit(accomply) {
        this.data = Object.assign(this.data, accomply);
    }

    get coinObj() {
        return this.data;
    }
}