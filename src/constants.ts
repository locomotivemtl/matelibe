import { App } from '@slack/bolt';

export const MATELIBRE_ML = 250;

export enum Messages {
    USER_SUSPENDED = "Oups! Il semblerait que vous n'êtes pas autorisé.e à boire ce Mate Libre. Veuillez le remettre là où vous l'avez trouvé. Vous pouvez contacter l'ABML au besoin.",
    ACTION_BOIRE = "<@$user_id> boit un Mate Libre! Il n'en reste plus que *$inventory_count*.",
    ACTION_REMETTRE = "<@$user_id> a finalement cédé et a remis son Maté Libre dans le frigo. Il en reste maintenant *$inventory_count*.",
    NOT_FOUND = "Cette commande n'existe pas. Vous pouvez contacter l'ABML au besoin.",
    USER_LIMIT = '⚠️ Attention! <@$user_id> a dépassé la limite journalière permise de Mate Libre. Rappelons-lui que c’est *mal vu* en lui jetant un regard. L’événement est noté dans notre système et sera examiné.',
    RANK="*Voici le classement des buveurs:*\n",
    HELP="*Voici la liste des commandes:*\n"
}

export enum SlashCommands {
    MATELIBE = '/matelibe',
}

export enum SlashActions {
    BOIRE = 'boire',
    REMETTRE = 'remettre',
    BUVEURS = 'buveurs',
}

export enum DefaultBotSettings {
    REACTION = ':robot_face:',
    MESSAGE = 'Hello!',
}

export enum AirtableBases {
    USERS = 'users',
    INVENTORY = 'inventory',
}
interface IBaseSlackReply {
    app: App;
    botToken: string | undefined;
    channelId: string;
    threadTimestamp: string;
}

export interface ISlackReactionReply extends IBaseSlackReply {
    reaction: string;
}

export interface ISlackReply extends IBaseSlackReply {
    message: string;
}

export interface ISlackPrivateReply
    extends Omit<ISlackReply, 'threadTimestamp'> {
    userId: string;
}

export interface IHandlerResponse {
    statusCode: number;
    body: string;
}
