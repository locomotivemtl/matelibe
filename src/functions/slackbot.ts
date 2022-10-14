////////////////////
// Imports
////////////////////
import { App, ExpressReceiver, ReceiverEvent } from '@slack/bolt';
import { APIGatewayEvent } from 'aws-lambda';
import * as dotenv from 'dotenv';
import { boire, buveurs, notFound, remettre } from '../actions';
import { IHandlerResponse, SlashActions, SlashCommands } from '../constants';
import {
    generateReceiverEvent,
    isUrlVerificationRequest,
    parseRequestBody,
} from '../utils';
const Airtable = require('airtable');

////////////////////
// Dot env
////////////////////
dotenv.config();

////////////////////
// Airtable
////////////////////
Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: `${process.env.AIRTABLE_API_KEY}`,
});
export const airtableBase = Airtable.base(`${process.env.AIRTABLE_BASE}`);

////////////////////
// @slack/bolt settings
////////////////////
const expressReceiver: ExpressReceiver = new ExpressReceiver({
    signingSecret: `${process.env.SLACK_SIGNING_SECRET}`,
    processBeforeResponse: true,
});

const app: App = new App({
    signingSecret: `${process.env.SLACK_SIGNING_SECRET}`,
    token: `${process.env.SLACK_BOT_TOKEN}`,
    receiver: expressReceiver,
});

////////////////////
// Commands
////////////////////
app.command(SlashCommands.MATELIBE, async ({ body, ack }) => {
    ack();

    // Select current action
    const actionStr = body.text.trim().toLowerCase();
    switch (actionStr) {
        case SlashActions.BOIRE:
            return boire(app, body);
        case SlashActions.REMETTRE:
            return remettre(app, body);
        case SlashActions.BUVEURS:
            return buveurs(app, body);
        default:
            return notFound(app, body);
    }
});

////////////////////
// Netlify function handler
////////////////////
export async function handler(
    event: APIGatewayEvent
): Promise<IHandlerResponse> {
    const payload: any = parseRequestBody(
        event.body,
        event.headers['content-type']
    );

    if (isUrlVerificationRequest(payload)) {
        return {
            statusCode: 200,
            body: payload?.challenge,
        };
    }

    const slackEvent: ReceiverEvent = generateReceiverEvent(payload);
    await app.processEvent(slackEvent);

    return {
        statusCode: 200,
        body: '',
    };
}
