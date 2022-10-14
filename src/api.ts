import { SlashCommand } from '@slack/bolt';
import { AirtableBases } from './constants';
import { airtableBase } from './functions/slackbot';

export async function findUser(
    body: SlashCommand,
    recordCallback: (record: any) => void
): Promise<boolean> {
    return new Promise((resolve) => {
        airtableBase(AirtableBases.USERS)
            .select({
                maxRecords: 1,
                view: 'default',
                filterByFormula: `REGEX_MATCH(user_id, '${body.user_id}')`,
            })
            .firstPage((err: any, records: any) => {
                if (err) {
                    resolve(false);
                    return;
                }
                records.forEach((record: any) => {
                    recordCallback?.(record);
                });
                resolve(true);
            });
    });
}

export async function findUsers(
    body: SlashCommand,
    recordCallback: (record: any) => void
): Promise<boolean> {
    return new Promise((resolve) => {
        airtableBase(AirtableBases.USERS)
            .select({
                maxRecords: 50,
                view: 'default',
            })
            .firstPage((err: any, records: any) => {
                if (err) {
                    resolve(false);
                    return;
                }
                records.forEach((record: any) => {
                    recordCallback?.(record);
                });
                resolve(true);
            });
    });
}

export async function createUser(
    body: SlashCommand,
    recordCallback: (record: any) => void
): Promise<boolean> {
    return new Promise((resolve) => {
        airtableBase(AirtableBases.USERS).create(
            {
                user_id: body.user_id,
                count: 1,
                username: body.user_name,
            },
            (err: any, record: any) => {
                if (err) {
                    console.error(err);
                    resolve(false);
                    return;
                }

                recordCallback?.(record);
                resolve(true);
            }
        );
    });
}

export async function updateUserCount(
    body: SlashCommand,
    recordIdToUpdate: string,
    count: number,
    recordCallback: (record: any) => void
): Promise<boolean> {
    return new Promise((resolve) => {
        airtableBase(AirtableBases.USERS).update(
            recordIdToUpdate,
            {
                count: count + 1,
                username: body.user_name,
            },
            (err: any, record: any) => {
                if (err) {
                    console.error(err);
                    resolve(false);
                    return;
                }
                recordCallback?.(record);
                resolve(true);
            }
        );
    });
}

export async function getInventoryQuantity(
    recordCallback: (record: any) => void
): Promise<boolean> {
    return new Promise((resolve) => {
        airtableBase(AirtableBases.INVENTORY)
            .select({
                maxRecords: 1,
                view: 'default',
                filterByFormula: `product_id=1`,
            })
            .firstPage((err: any, records: any) => {
                if (err) {
                    resolve(false);
                    return;
                }
                records.forEach((record: any) => {
                    recordCallback?.(record);
                });
                resolve(true);
            });
    });
}

export async function incrementInventoryQuantity(
    inventoryIdToUpdate: string,
    inventoryQuantity: number,
    recordCallback?: (record: any) => void
): Promise<boolean> {
    return new Promise((resolve) => {
        airtableBase(AirtableBases.INVENTORY).update(
            inventoryIdToUpdate,
            {
                quantity: inventoryQuantity + 1,
            },
            (err: any, record: any) => {
                if (err) {
                    console.error(err);
                    resolve(false);
                    return;
                }
                recordCallback?.(record);
                resolve(true);
            }
        );
    });
}

export async function decrementInventoryQuantity(
    inventoryIdToUpdate: string,
    inventoryQuantity: number,
    recordCallback?: (record: any) => void
): Promise<boolean> {
    return new Promise((resolve) => {
        airtableBase(AirtableBases.INVENTORY).update(
            inventoryIdToUpdate,
            {
                quantity: inventoryQuantity - 1,
            },
            (err: any, record: any) => {
                if (err) {
                    console.error(err);
                    resolve(false);
                    return;
                }
                recordCallback?.(record);
                resolve(true);
            }
        );
    });
}
