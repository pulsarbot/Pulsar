/*
    servers
    Router for servers interface
    Copyright (C) 2020 The Pulsar Project
*/

import express from 'express';
import { bot } from '../../index';
import getSession, { auth } from '../handlers/web-client';
const router = express.Router();

/* GET servers page. */
router.get('/', async (req, res) => {
    const session = await getSession(req);

    res.render('servers', { 
        req: req,
        res: res,
        discord: bot,
        auth: auth,
        user: session.user,
        guilds: bot.guilds.cache
    });
});

export = router;
