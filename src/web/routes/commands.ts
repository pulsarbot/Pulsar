import express from 'express';
import {bot} from '../../index';
import {commandConverter} from '../../modules/cmdConverter';
import * as Discord from 'discord.js';

let commandsList = new commandConverter();
const router = express.Router();

router.get(`/`, async (req, res) => {

let cmdObject = await commandsList.convertCmds();

	res.render(`commands.ejs`, { 
		"req": req,
		"res": res,
		"bot": bot,
		"commands": cmdObject,
		"discordjsperms": Discord.Permissions.FLAGS
	});

})

export = router;