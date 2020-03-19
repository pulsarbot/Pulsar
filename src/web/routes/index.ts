/*
    index
    Router for primary root-level interface
    Copyright (C) 2020 The Pulsar Project
*/

import express from 'express';
import { bot } from '../../index';
import getSession, { auth } from '../handlers/web-client';
const router = express.Router();

/* GET index page. */
router.get('/', async (req, res) => {
    res.render('index', { 
        req: req,
        res: res,
        discord: bot
    });
});

//Manages the login procedure via Discord (this only pertains to the servers page, but it must be here to stop 404 errors because Express is doi stoop)
router.get('/login/', async (req, res) => {
    const code = req.query.code;

    if (code == undefined) {
        res.send('Sorry, something went wrong while trying to log in.');
    } else {
        const userkey = await auth.getAccess(code).catch(console.error);
        req.cookies.set('PulsarDiscord', userkey, {
            maxAge: 604800000
        });

        res.redirect('/servers');
    }
});

router.get('/logout/', async (req, res) => {
    req.cookies.set('PulsarDiscord');
    res.redirect('/servers/?justLoggedOut');
});

export = router;
