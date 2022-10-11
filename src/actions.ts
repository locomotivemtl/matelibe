import { App, SlashCommand } from '@slack/bolt';
import { ISlackPrivateReply } from './constants';
import { replyPrivateMessage } from './utils';

export async function notFound(app: App, body: SlashCommand) {
    const messagePacket: ISlackPrivateReply = {
        app: app,
        botToken: process.env.SLACK_BOT_TOKEN,
        channelId: body.channel_id,
        userId: body.user_id,
        message: 'Action not found!',
    };
    await replyPrivateMessage(messagePacket);
}

export async function boire(app: App, body: SlashCommand) {
    const messagePacket: ISlackPrivateReply = {
        app: app,
        botToken: process.env.SLACK_BOT_TOKEN,
        channelId: body.channel_id,
        userId: body.user_id,
        message: 'Bravo buveur!',
    };
    await replyPrivateMessage(messagePacket);
}
