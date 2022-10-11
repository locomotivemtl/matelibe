import { APIGatewayEvent, Context } from 'aws-lambda';
import { App, ExpressReceiver, ReceiverEvent } from '@slack/bolt';

import * as dotenv from 'dotenv';
import { parseRequestBody } from './utils';
dotenv.config();

const expressReceiver = new ExpressReceiver({
    signingSecret: `${process.env.SLACK_SIGNING_SECRET}`,
    processBeforeResponse: true,
});

const app = new App({
    signingSecret: `${process.env.SLACK_SIGNING_SECRET}`,
    token: `${process.env.SLACK_BOT_TOKEN}`,
    receiver: expressReceiver,
});

function test(stringBody: string | null) {
    try {
        return JSON.parse(stringBody ?? '');
    } catch {
        return undefined;
    }
}

app.command('/greet', async({body, ack}) => {
    ack();
    await app.client.chat.postEphemeral({
      token: process.env.SLACK_BOT_TOKEN,
      channel: body.channel_id,
      text: "Greetings, user!" ,
      user: body.user_id
    });
});

export async function handler(event: APIGatewayEvent, context: Context) {
    const payload = parseRequestBody(event.body, event.headers['content-type']);
    // const payload = test(event.body);

    if (payload && payload.type && payload.type === 'url_verification') {
        return {
            statusCode: 200,
            body: payload.challenge,
        };
    }

    const slackEvent: ReceiverEvent = {
        body: payload,
        ack: async (response) => {
            return new Promise<void>((resolve, reject) => {
                resolve();
                return {
                    statusCode: 200,
                    body: response ?? '',
                };
            });
        },
    };

    await app.processEvent(slackEvent);

    return {
        statusCode: 200,
        body: '',
    };
}
