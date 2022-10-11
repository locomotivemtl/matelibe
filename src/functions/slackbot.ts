////////////////////
// Imports
////////////////////
import { App, ExpressReceiver, ReceiverEvent } from '@slack/bolt';
import { APIGatewayEvent, Context } from 'aws-lambda';
import * as dotenv from 'dotenv';
import { boire, notFound } from '../actions';
import {
    IHandlerResponse,
    ISlackPrivateReply,
    ISlackReactionReply,
    ISlackReply,
    SlashActions,
    SlashCommands,
} from '../constants';
import {
    generateReceiverEvent,
    isUrlVerificationRequest,
    parseRequestBody,
    replyMessage,
    replyPrivateMessage,
    replyReaction,
} from '../utils';

dotenv.config();

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
// Messages
////////////////////
app.message(async ({ message }) => {
    const reactionPacket: ISlackReactionReply = {
        app: app,
        botToken: process.env.SLACK_BOT_TOKEN,
        channelId: message.channel,
        threadTimestamp: message.ts,
        reaction: 'robot_face',
    };
    await replyReaction(reactionPacket);

    const messagePacket: ISlackReply = {
        app: app,
        botToken: process.env.SLACK_BOT_TOKEN,
        channelId: message.channel,
        threadTimestamp: message.ts,
        message: 'Hello :wave:',
    };
    await replyMessage(messagePacket);
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
        default:
            return notFound(app, body);
    }
});

////////////////////
// Netlify function handler
////////////////////
export async function handler(
    event: APIGatewayEvent,
    context: Context
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
