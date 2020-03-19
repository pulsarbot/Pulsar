/*
    web-client
    Responsible for Discord API Request Preparation and Handling Errors
    Copyright (C) 2020 The Pulsar Project
*/

import express from 'express';
import { bot } from '../../index';
import { Client, APIError } from './discord-api'; // No type declaration file exists for disco-auth
import { User, Guild } from 'discord.js';

// Configuration
export const auth = new Client(
    process.env.CLIENT_ID, // Client ID
    process.env.CLIENT_SECRET // Client Secret [Keep Private]
);

auth.setScopes('identify', 'guilds');
auth.setRedirect(process.env.REDIRECT_URI);

// Session -- receive information from Discord API
export default async function getSession(req: express.Request): Promise<Session> {
    return new Promise(async (resolve, reject) => {
        const key = await req.cookies.get('PulsarDiscord');
        let guilds: Guild[] | APIError;
        let user: User | APIError;

        if (key) {
            // Discord session is set - try to retreive
            user = await auth.getUser(key).catch(error => user = error);
            if (user instanceof APIError) {
                resolve({
                    statusCode: user.statusCode, 
                    statusMessage: user.message,
                    auth: auth,
                    user: undefined, 
                    guilds: undefined
                });
            } else if (user instanceof User) {
                guilds =  await auth.getGuilds(key).catch(error => guilds = error);
                if (guilds instanceof APIError) {
                    resolve({
                        statusCode: guilds.statusCode,
                        statusMessage: guilds.message,
                        auth: auth,
                        user: undefined, 
                        guilds: undefined
                    });
                } else if (guilds instanceof Array) {
                    const session: Session = {
                        statusCode: 200,
                        statusMessage: 'OK',
                        auth: auth,
                        user: user,
                        guilds: guilds
                    };
                    // All is good
                    resolve(session);
                }
            } else reject(new Error('An unexpected error occurred whilst obtaining the session.')); // Something went wrong -- void
        } else {
            const session: Session = {
                statusCode: 2003,
                statusMessage: 'Not Logged In',
                auth: auth,
                user: undefined,
                guilds: undefined
            };
            resolve(session);
        }
    });
}

// Information Interface
interface Session {
    statusCode: number;
    statusMessage: string;
    auth: Client;
    user?: User;
    guilds?: Guild[];
}

export function errorPage(res: express.Response, code: number, shortMessage: string, longMessage?: string) {
    res.statusCode = code;

    // Define Long Message if not already set
    if (!longMessage) {
        if (code === 429) longMessage = 'You are sending too many requests at a time. Please slow down, then refresh the page.';
        else longMessage = 'An unexpected error occurred. If you believe this is in error, please contact SeverePain#0001 on Discord.';
    }

    const sysError = {
        status: code.toString(),
        stack: longMessage
    };
    res.render('error', {
        message: shortMessage,
        error: sysError
    });
}