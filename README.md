## Crypto notifications in Telegram 

 This is something I made for myself so I can receive notifications for crypto in Telegram.<br><br>
 Except for the social searching, the program doesn't use any APIs and it gets its info from crawling several websites with puppeteer, so it can be used for free and as long as these websites retain their original structure.
 <br><br>If you want to receive info about social mentions/trends you must obtain Social Searcher API Key
<br>You can use it with a BOT in a group, or as USER to user/group, or send them to yourself, or to anybody

## Requisites
Node >= 13.x

## Install
```bash
$ git clone https://github.com/ddaniel987/telegram_crypto_notifier.git
$ cd telegram_crypto_notifier
$ yarn install
$ yarn serve
```

## Usage
You just need to customize the config file as following: 

**config/default.json**:

```javascript
{
    "telegram": {
        "bot_token": "", // If you decide to auth as a Telegram BOT, here goes it's token
        "account_session": "", // Received after login as USER, put it here to avoid logging in again
        "api_hash": "", // Telegram API Hash - get it from here - https://my.telegram.org/
        "api_id": "" // Telegram API ID - get it from here - https://my.telegram.org/,
    },
    
    "socials": {
        "social_searcher_api": "", // Social Search API Key - leave this empty to not receive social information
        "vk_access_token": "", // VK API token - leave this empty to not receive social information

        "options": { // Enable/disable searching the following social networks
            "web": true,
            "twitter": true,
            "instagram": true,
            "facebook": true,
            "reddit": true,
            "vk": true
        }
    },

    "crawler": {
        "name": "dogecoin", // The full name of the cryptocurrency you want to crawl info for
        "abbreviation": "doge" // The abberviation of the cryptocurrency you want to crawl info for
    },

    "notifier": {
        "interval" : 43200, // Interval between notifications (in seconds)
        "my_tg": "" // Where to send the notification (could be phone number, username,
                    // group or any other castable peer for telegram).
    }
}
```

## Result
You will get your notifications in Telegram like this:

```text
Latest information about DOGECOIN:
Price: 0.08886 ( -1.2%)
24h volume: 880796954
Market Cap: 11789307562
Rank: 12

--- Socials ---
Mentions: 
    Positive:  36 
    Neutral: 65
    Negative: 2

Trends: 
    Positive: 4
    Neutral: 7
    Negative: 1
```

For as long as you keep the program running...

## Known Issues
- BOT can only send ONCE to a user (bot limitation probably)
- BOT sometimes doesn't want to send in a group
- Social Search is sometimes down, so you will get 0 in everything below socials

Let me know if you find something else, I haven't really tested this with many cryptocurrencies so it may work and may not work randomly.

## Todo
If I have time or reason to continue on this project, maybe I will start with these things first:

- Watching multiple cryptos in single notification
- Gather more and valuable info about a crypto
- Present more social info about a crypto, such as - show negative posts/trends
- Send critical notifications on significant change in crypto's price
- Utilize more networks to crawl efficiently from

This is just the tip of the iceberg as there is code for fetching latest transactions, holder percentages and way more info from bscscan/etherscan that is not utilized in this project, I can do it on request

## If you feel the need to thank me
**BEP20** - 0x360d4a6d81eb5034d3917a155a0703851b1c5311
**BTC** - 16sQhFgcY5wrL8cmLp5DSpxRL7hmUwtgEK
**DOGE** - DKHa9DvqFBp9azDiAPwZdNqdhAgzyrkfG9
**ETH** - 0x360d4a6d81eb5034d3917a155a0703851b1c5311
