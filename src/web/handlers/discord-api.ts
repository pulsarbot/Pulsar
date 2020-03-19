/*
    discord-api
    Communication with the Discord API.
    Copyright (C) 2020 The Pulsar Project

    ***

    Based on TheDrone7's disco-oauth
    Licensed under the MIT License

    Copyright (c) 2019 The Drone

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/ 

import jwt from 'jsonwebtoken';
import phin from 'phin';
import { bot } from '../../index';
import {User, Guild} from 'discord.js';

// The OAuth2 Client
export class Client {
    _id: string;
    _secret: string;
    _baseUrl: string;
    scopes: Scope[];
    redirectURI: string;

    constructor (id: string, secret: string) {
        this._id = id;
        this._secret = secret;
        this._baseUrl = 'https://discordapp.com/api';
        this.scopes = [];
        this.redirectURI = process.env.REDIRECT_URI || ' ';
    }

    // Define the application scopes
    setScopes(...scopes: Scope[]): Client {
        if (scopes.length < 1) throw new Error('No scopes provided');
        else {
            for (const i of scopes) {
                if(scopes.includes(i) && !this.scopes.includes(i)) {
                    this.scopes.push(i);
                } else throw new Error(i + ' is not a valid Discord scope');
            }
            return this;
        }
    }

    // Set the Redirect URI
    setRedirect(redirectURI: string): Client {
        if(!redirectURI) return this;
        if (redirectURI.startsWith('http://') || redirectURI.startsWith('https://')) this.redirectURI = redirectURI;
        else throw new Error('Redirect URI is invalid');
        return this;
    }

    getAuthCodeLink(): string {
        // Give auth code link if configured properly
        if (this.scopes.length > 0 && this.redirectURI !== '') return `https://discordapp.com/oauth2/authorize?response_type=code&client_id=${this._id}&scope=${this.scopes.join('%20')}&redirect_uri=${this.redirectURI}`;
        else if (this.scopes.length < 1) throw new Error('Cannot get auth code link as the client\'s scopes were not defined.');
        else throw new Error('Cannot get auth code link as Redirect URI hasn\'t been defined.');
    }

    async getAccess(code: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            // Make sure code is of correct format
            if (typeof code !== 'string' && code === '') reject(new Error('Authorization code was not provided'));
            try {
                // Send request for Token to Discord
                const response = await phin({
                    method: 'POST',
                    url: `${this._baseUrl}/oauth2/token`,
                    parse: 'json',
                    form: {
                        client_id: this._id,
                        client_secret: this._secret,
                        grant_type: 'authorization_code',
                        code: code,
                        redirect_uri: this.redirectURI,
                        scope: this.scopes.join(' ')
                    }
                });
                if (response.statusCode === 200) {
                    // Everything is OK
                    const token = response.body as Buffer;
                    token['expireTimestamp'] = Date.now() + token['expires_in'] * 1000 - 10000;
                    resolve(jwt.sign(token, this._secret, { expiresIn: token['expires_in'] }));
                } else reject(new APIError(response.statusCode));
            } catch (error) {
                reject(error);
            }
        });
    }

    async refreshToken(key: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            // First, verify the key is correct
            let access: string | object;
            try {
                access = jwt.verify(key, this._secret);
            } catch (error) {
                reject(new Error('Key provided is invalid. ' + error));
            }
            const refresh = access['refresh_token'];
            // Send request to Discord
            try {
                const response = await phin({
                    url: `${this._baseUrl}/oauth2/token`,
                    method: 'POST',
                    parse: 'json',
                    form: {
                      client_id: this._id,
                      client_secret: this._secret,
                      grant_type: 'refresh_token',
                      refresh_token: refresh,
                      redirect_uri: this.redirectURI,
                      scope: this.scopes.join(' ')
                    }
                });
                if (response.statusCode === 200) {
                    const token = response.body as Buffer;
                    token['expireTimestamp'] = Date.now() + token['expires_in'] * 1000 - 10000;
                    resolve(jwt.sign(token, this._secret, { expiresIn: token['expires_in'] }));
                } else reject(new APIError(response.statusCode));
            } catch (error) {
                reject(error);
            }
        });
    }

    // Get the logged in user
    async getUser(key: string): Promise<User | APIError> {
        return new Promise(async (resolve, reject) => {
            let access: string | object;

            try { access = jwt.verify(key, this._secret); } 
            catch (error) { reject( new APIError(2002)); } // Token invalid

            const token = access['access_token'];
            const tokenType = access['token_type'];

            // Contact Discord for user info
            try {
                const response = await phin({
                    url: `${this._baseUrl}/users/@me`,
                    method: 'GET',
                    headers: { Authorization: `${tokenType} ${token}` },
                    parse: 'json'
                });
                if (response.statusCode === 200) resolve(new User(bot, response.body as object));
                else reject(new APIError(response.statusCode));
            } catch (error) {
                reject(new APIError(4001)); // Generic Discord link error
            }
        });
    }

    // Get all Guilds the user is in
    async getGuilds(key: string): Promise<Array<Guild> | APIError> {
        return new Promise(async (resolve, reject) => {
            let access: string | object;
            try {
                access = jwt.verify(key, this._secret);
            } catch (error) {
                reject(new APIError(2002)); // Token invalid
            }
            const token = access['access_token'];
            const tokenType = access['token_type'];
            try {
                const response = await phin({
                    url: `${this._baseUrl}/users/@me/guilds`,
                    method: 'GET',
                    headers: { Authorization: `${tokenType} ${token}` },
                    parse: 'json'
                });
                if (response.statusCode === 200) {
                    resolve(response.body as Guild[]);
                } else reject(new APIError(response.statusCode));
            } catch (error) {
                reject(new APIError(4001)); // Generic Discord link error
            }
        });
    }
    
    // Custom API Requests
    async request(key: string, api: string, method: string): Promise<any | APIError> {
        return new Promise(async (resolve, reject) => {
            let access: string | object;
            try {
                access = jwt.verify(key, this._secret);
            } catch (error) {
                reject(new APIError(2002)); // Token invalid
            }
            const token = access['access_token'];
            const tokenType = access['token_type'];
            try {
                const response = await phin({
                    url: `${this._baseUrl}${api}`,
                    method: method,
                    headers: { Authorization: `${tokenType} ${token}` },
                    parse: 'json'
                });
                if (response.statusCode === 200) resolve(response.body);
                else reject(new APIError(response.statusCode));
            } catch (error) {
                reject(new APIError(4001)); // Generic Discord link error
            }
        });
    }

}

// Types of scopes available to use
type Scope = 'bot'|'connections'|'email'|'identify'|'guilds'|'guilds.join'|'gdm.join'|'messages.read'|'rpc'|'rpc.api'|'rpc.notifications.read'|'webhook.incoming';

export class APIError extends Error {
    statusCode: number;
    message: string;

    errors = new Map([
        [400, 'Invalid request made'],
        [401, 'Invalid access token'],
        [403, 'Not enough permissions'],
        [404, 'Resource not found'],
        [405, 'Method not allowed'],
        [429, 'You are being rate limited'],
        [502, 'Server busy, retry after a while'],
        [2000, 'Client Error'],
        [2001, 'Invalid code provided'],
        [2002, 'Invalid token provided'],
        [3000, 'Pulsar Service Error'],
        [4000, 'Discord Service Error'],
        [4001, 'Discord Link Fault']
    ]);

    constructor(code: number, ...params: string[]) {
        super(...params);
        this.statusCode = code;
        this.message = this.errors.get(code) || 'An error occurred';
    }
}