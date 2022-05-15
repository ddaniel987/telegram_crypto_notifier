import {
    TelegramClient,
    Api
} from 'telegram'
import {
    StringSession
} from 'telegram/sessions'

import {
    LogLevel,
    Logger
} from "telegram/extensions/Logger";
import prompt from 'prompt'
import { _parseMessageText } from "telegram/client/messageParse"

import config from 'config'
const telegramCfg = config.get('telegram')

const apiId = telegramCfg.api_id;
const apiHash = telegramCfg.api_hash;
const BOT_TOKEN = telegramCfg.bot_token;

const mkClientBot = (async (session) => {
    const client = new TelegramClient(
        new StringSession(session),
        apiId,
        apiHash, {
            connectionRetries: 5,
            baseLogger: new Logger('none')
        }
    );

    client.setLogLevel(LogLevel.NONE)
    await client.start({
        botAuthToken: BOT_TOKEN,
    });

    return client;
})

const mkClientUser = (async (session) => {
    const stringSession = new StringSession(session);

    const client = new TelegramClient(stringSession, apiId, apiHash, {baseLogger: new Logger('none'),
        connectionRetries: 5,
    });

    await client.start({
        phoneNumber: async () => (await prompt.get([{name: "phone", message: "Please enter your number"}])).phone,
        password: async () => (await prompt.get([{name: "password", message: "Please enter your password"}])).password,
        phoneCode: async () =>
            (await prompt.get([{name: "code", message: "Please enter the code you received"}])).code,
        onError: (err) => console.log(err),
    });

    return client;
})

export const auth = (async (user, session) => {
    var client = null

    if (user)
        client = await mkClientUser(session);
    else
        client = await mkClientBot();

    return {
        session: client.session.save(),
        me: await client.getMe()
    }
});

export const dm = (async (session, data) => {
    var client = null;

    if(data.bot)
        client = await mkClientBot(session);
    else
        client = await mkClientUser(session);
    
    await client.connect();

    const [text, entities] = await _parseMessageText(client,data.msg,"markdown") 
    const result = await client.invoke(
        new Api.messages.SendMessage({
            peer: data.peer,
            message: text,
            randomId: BigInt(Math.floor(Math.random() % 1 + 97819472)),
            entities: entities
        })
    );

    return result;
})