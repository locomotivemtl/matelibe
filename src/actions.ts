import { App, SlashCommand } from '@slack/bolt';
import { AirtableBases, ISlackPrivateReply, ISlackReply } from './constants';
import {
    getFirstDayOfCurrentMonth,
    replyMessage,
    replyPrivateMessage,
} from './utils';

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

export async function boire(app: App, body: SlashCommand, airtableBase: any) {
    const currentDate = getFirstDayOfCurrentMonth().toISOString().split('T')[0];

    let idToUpdate = null;
    let count = 0;

    console.log(currentDate);

    await airtableBase(AirtableBases.RECORDS)
        .select({
            maxRecords: 3,
            view: 'default',
            filterByFormula: `AND(IS_SAME(month, '2022-10-01', 'month'), REGEX_MATCH(user_id, 'U045T69R6Q6'))   `,
        })
        .firstPage(function (err: any, records: any) {
            console.log('-------------');
            console.log(records, body.user_id.toUpperCase());

            if (err) {
                console.error(err);
                return;
            }
            records.forEach((record: any) => {
                console.log('Retrieved', record.getId(), record.get('count'));
                console.log('-------------');
            });
        });

    // if (idToUpdate === null) {
    //     await airtableBase(AirtableBases.RECORDS).create(
    //         {
    //             month: currentDate,
    //             user_id: body.user_id,
    //             count: 1,
    //         },
    //         function (err: any, record: any) {
    //             if (err) {
    //                 console.error(err);
    //                 return;
    //             }
    //             console.log('create', record.getId());
    //         }
    //     );
    // } else {
    //     await airtableBase(AirtableBases.RECORDS).update(
    //         idToUpdate,
    //         {
    //             count: count++,
    //         },
    //         function (err: any, record: any) {
    //             if (err) {
    //                 console.error(err);
    //                 return;
    //             }
    //             console.log(record.get('user_id'));
    //         }
    //     );
    // }

    const messagePacket: ISlackReply = {
        app: app,
        botToken: process.env.SLACK_BOT_TOKEN,
        channelId: body.channel_id,
        threadTimestamp: body.ts,
        message: 'Bravo buveur!',
    };
    await replyMessage(messagePacket);
}

// filterByFormula: `AND(IS_SAME(month, '${currentDate}', 'month'), REGEX_MATCH(user_id, '${body.user_id}'))`,
// filterByFormula: `AND(IS_SAME(month, '${currentDate}', 'month'), REGEX_MATCH(user_id, ${body.user_id}))`,
