import { APIGatewayEvent, Context } from 'aws-lambda';
import { App, ExpressReceiver } from '@slack/bolt';

import * as dotenv from 'dotenv';
import { parseRequestBody } from '../utils';
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

export async function handler(event: APIGatewayEvent, context: Context) {
    const payload = parseRequestBody(event.body, event.headers["content-type"]);

    if(payload && payload.type && payload.type === 'url_verification') {
        return {
          statusCode: 200,
          body: payload.challenge
        };
      }
}
