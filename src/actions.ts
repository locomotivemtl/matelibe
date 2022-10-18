import { App, SlashCommand } from '@slack/bolt';
import {
    createUser,
    decrementInventoryQuantity,
    findUser,
    findUsers,
    getInventoryQuantity,
    incrementInventoryQuantity,
    updateUserCount,
} from './api';
import { ISlackPrivateReply, MATELIBRE_ML, Messages, SlashCommands } from './constants';
import { replyMessage, replyPrivateMessage } from './utils';

export async function notFound(app: App, body: SlashCommand) {
    help(app, body);
}

export async function boire(app: App, body: SlashCommand) {
    const currentDate = new Date(Date.now()).toISOString().split('T')[0];
    let recordIdToUpdate: any = null;
    let inventoryIdToUpdate: any = null;
    let inventoryQuantity = 0;
    let count = 0;
    let suspended = false;
    let lastModifiedDate = null;

    await findUser(body, (record: any) => {
        recordIdToUpdate = record.getId();
        count = record.get('count');
        suspended = record.get('suspended');
        lastModifiedDate = record.get('last_modified_date');
    });

    await getInventoryQuantity((record: any) => {
        inventoryIdToUpdate = record.getId();
        inventoryQuantity = record.get('quantity');
    });

    if (suspended) {
        return replyPrivateMessage({
            app: app,
            botToken: process.env.SLACK_BOT_TOKEN,
            channelId: body.channel_id,
            userId: body.user_id,
            message: Messages.USER_SUSPENDED.replace(
                '$user_id',
                `${body.user_id}`
            ),
        });
    }

    if (lastModifiedDate === currentDate) {
        replyMessage({
            app: app,
            botToken: process.env.SLACK_BOT_TOKEN,
            channelId: body.channel_id,
            threadTimestamp: body.ts,
            message: Messages.USER_LIMIT.replace('$user_id', `${body.user_id}`),
        });
    }

    if (recordIdToUpdate === null) {
        await createUser(body, async (record: any) => {
            console.log('----- CREATED ------');
            console.log(record);

            await decrementInventoryQuantity(
                inventoryIdToUpdate,
                inventoryQuantity,
                (record: any) => {
                    const inventoryCount = record.get('quantity');
                    return replyMessage({
                        app: app,
                        botToken: process.env.SLACK_BOT_TOKEN,
                        channelId: body.channel_id,
                        threadTimestamp: body.ts,
                        message: Messages.ACTION_BOIRE.replace(
                            '$user_id',
                            `${body.user_id}`
                        ).replace('$inventory_count', inventoryCount),
                    });
                }
            );
        });
    } else {
        await updateUserCount(
            body,
            recordIdToUpdate,
            count,
            async (record: any) => {
                await decrementInventoryQuantity(
                    inventoryIdToUpdate,
                    inventoryQuantity,
                    (record: any) => {
                        const inventoryCount = record.get('quantity');
                        return replyMessage({
                            app: app,
                            botToken: process.env.SLACK_BOT_TOKEN,
                            channelId: body.channel_id,
                            threadTimestamp: body.ts,
                            message: Messages.ACTION_BOIRE.replace(
                                '$user_id',
                                `${body.user_id}`
                            ).replace('$inventory_count', inventoryCount),
                        });
                    }
                );
            }
        );
    }
}

export async function remettre(app: App, body: SlashCommand) {
    let recordIdToUpdate: any = null;
    let inventoryIdToUpdate: any = null;
    let inventoryQuantity = 0;
    let suspended = false;

    await findUser(body, (record: any) => {
        recordIdToUpdate = record.getId();
        suspended = record.get('suspended');
    });

    await getInventoryQuantity((record: any) => {
        inventoryIdToUpdate = record.getId();
        inventoryQuantity = record.get('quantity');
    });

    if (suspended) {
        return replyPrivateMessage({
            app: app,
            botToken: process.env.SLACK_BOT_TOKEN,
            channelId: body.channel_id,
            userId: body.user_id,
            message: Messages.USER_SUSPENDED.replace(
                '$user_id',
                `${body.user_id}`
            ),
        });
    }

    await incrementInventoryQuantity(
        inventoryIdToUpdate,
        inventoryQuantity,
        (record: any) => {
            const inventoryCount = record.get('quantity');
            return replyMessage({
                app: app,
                botToken: process.env.SLACK_BOT_TOKEN,
                channelId: body.channel_id,
                threadTimestamp: body.ts,
                message: Messages.ACTION_REMETTRE.replace(
                    '$user_id',
                    `${body.user_id}`
                ).replace('$inventory_count', inventoryCount),
            });
        }
    );
}

export async function buveurs(app: App, body: SlashCommand) {
    const userRecords: any[] = [];
    await findUsers(body, (record: any) => {
        userRecords.push({
            userId: record.get('user_id'),
            username: record.get('username'),
            count: record.get('count'),
        });
    });

    userRecords.sort((a, b) => b.count - a.count);

    let message = `${Messages.RANK}`;
    userRecords.map((userRecord, index) => {
        message += `${index + 1}. <@${userRecord.userId}> avec ${
            userRecord.count
        } ${userRecord.count > 1 ? 'canettes' : 'canette'} soit ${
            (userRecord.count * MATELIBRE_ML) / 1000
        }L.\n`;
    });

    return replyPrivateMessage({
        app: app,
        botToken: process.env.SLACK_BOT_TOKEN,
        channelId: body.channel_id,
        userId: body.user_id,
        message,
    });
}

export async function help(app: App, body: SlashCommand) {
    let message = `${Messages.HELP}`;

    const commandHints = [
        {
            value: '`/matelibe boire`',
            hint: 'Boire un Mate Libre'
        },
        {
            value: '`/matelibe remettre`',
            hint: 'Remettre son Mate Libre non bu dans le frigo'
        },
        {
            value: '`/matelibe buveurs`',
            hint: 'Lister les plus grands buveurs de Mate Libre'
        }
    ]
    
    commandHints.forEach((command) => {
        message += `${command.value} - ${command.hint}.\n`;
    });

    return replyPrivateMessage({
        app: app,
        botToken: process.env.SLACK_BOT_TOKEN,
        channelId: body.channel_id,
        userId: body.user_id,
        message,
    });
}
