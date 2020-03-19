/*
    server
    Router for Discord Server information and management
    Copyright (C) 2020 The Pulsar Project
*/

import express from 'express';
import fs from 'fs';
import { bot } from '../../index';
import getSession, { errorPage, auth } from '../handlers/web-client';
const router = express.Router();

// Server - Main
router.get('/', async (req, res) => {
    const session = await getSession(req);
    if (session.statusCode !== 200 && session.statusCode !== 2003) {
        // Something went wrong, handle it here
        return errorPage(res, session.statusCode, session.statusMessage);
    }
    if (!session.user) return res.redirect('/servers/?notLoggedIn');
    if (!req.query.id) return errorPage(res, 400, 'Missing Server ID', 'You need to specify the server ID. You can do so by selecting the "Servers" tab on the home page.');
    
    const server = bot.guilds.cache.find(i => i.id === req.query.id);
    if (server) {

        // Render the page
        const member = server.members.cache.find(i => i.id === session.user.id);
        if (!member &&! bot.config.botAdmins.includes(session.user.id)) return errorPage(res, 403, 'Not Allowed', 'You cannot view this server\'s page as you are not a member.');

        res.render('servers/main', { 
            req: req,
            res: res,
            discord: bot,
            auth: auth,
            user: session.user,
            guilds: bot.guilds.cache,
            server: server
        });

    } else {
        return errorPage(res, 404, 'Server not found', 'Pulsar is not a member of this server.');
    }
});

// MARK: Server Configuration
// GET Configuration
router.get('/config', async (req, res) => {
    const session = await getSession(req);
    if (session.statusCode !== 200 && session.statusCode !== 2003) {
        // Something went wrong, handle it here
        return errorPage(res, session.statusCode, session.statusMessage);
    }
    if (!session.user) return res.redirect('/servers/?notLoggedIn');
    if (!req.query.id) return errorPage(res, 400, 'Missing Server ID', 'You need to specify the server ID. You can do so by selecting the "Servers" tab on the home page.');

    const server = bot.guilds.cache.find(i => i.id === req.query.id);
    if(server){
        // Render the page
        const member = server.members.cache.find(i => i.id === session.user.id);
        if (!member &&! bot.config.botAdmins.includes(session.user.id)) return errorPage(res, 403, 'Not Allowed', 'You cannot view this server\'s page as you are not a member.');
        if(!bot.config.botAdmins.includes(session.user.id)){
            if (!member.permissions.has('MANAGE_GUILD')) return errorPage(res, 403, 'Insufficient Permissions', 'You cannot view this server\'s configuration as you do not have the Manage Guild permission.');
        }

        const guildConfig = bot.pulsarGuilds.find(pulsarguild => pulsarguild.id === server.id).config;
        if (!guildConfig) return errorPage(res, 500, 'Could not get User Configuration');

        res.render('servers/config', { 
            req: req,
            res: res,
            discord: bot,
            auth: auth,
            user: session.user,
            guilds: bot.guilds.cache,
            server: server,
            guildConfig: guildConfig
        });

    } else {
        return errorPage(res, 404, 'Server not found', 'Pulsar is not a member of this server.');
    }
});

// POST New Configuration
router.post('/config', async (req, res) => {
    const session = await getSession(req);
    if (session.statusCode !== 200 && session.statusCode !== 2003) {
        // Something went wrong, handle it here
        return errorPage(res, session.statusCode, session.statusMessage);
    }
    if (!session.user) return res.redirect('/servers/?notLoggedIn');
    if (!req.query.id) return errorPage(res, 400, 'Missing Server ID', 'You need to specify the server ID. You can do so by selecting the "Servers" tab on the home page.');

    const server = bot.guilds.cache.find(i => i.id === req.query.id);
    if (server) {
        // Render the page
        const member = server.members.cache.find(i => i.id === session.user.id);
        if (!member &&! bot.config.botAdmins.includes(session.user.id)) {
            return errorPage(res, 403, 'Not Allowed', 'You cannot modify this server as you are not a member.');
        } 
        else if(!member.permissions.has('MANAGE_GUILD')){
            return errorPage(res, 403, 'Insufficient Permissions', 'You cannot modify this server\'s configuration as you do not have the Manage Guild permission.');
        }

        const guildConfig = bot.pulsarGuilds.find(pulsarguild => pulsarguild.id === server.id).config;
        if (!guildConfig) return errorPage(res, 500, 'Could not get User Configuration');

        // Verify new configuration
        if (req.body.botPrefix.includes(' ')) return errorPage(res, 400, 'Illegal Bot Prefix', 'Bot prefix cannot contain spaces.');
        if (req.body.botPrefix.length < 1 || req.body.botPrefix.length > 8) return errorPage(res, 400, 'Illegal Bot Prefix', 'Bot prefix must be between 1 and 8 characters.');
        if (req.body.botActionChannel !== '') { // Verify channel lookup if Action Channel is set
            const channelLookup = server.channels.cache.find(channel => channel.id === req.body.botActionChannel);
            if (!channelLookup) return errorPage(res, 404, 'Action Channel Not Found', 'The channel set for the action channel could not be found within the server. It may have been deleted, or you entered the incorrect ID.');
        }

        // TODO: Update the configuration here

        // Write back changes
        fs.writeFileSync(`./data/guilds/${server.id}/config.json`, JSON.stringify(guildConfig));

        // All done -- now send the page
        res.redirect(`/server/config?id=${server.id}&code=0`);

    } else {
        return errorPage(res, 404, 'Server not found', 'Pulsar is not a member of this server.');
    }
});

export = router;
