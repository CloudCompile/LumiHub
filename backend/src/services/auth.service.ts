import { env } from "../env.ts";
import { sign } from "hono/jwt";
import { randomBytes, createHash } from "crypto";

type DiscordTokenResponse = {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
}

export function getDiscordAuthUrl(state: string) {
    let redirectUrlParams = new URLSearchParams({
        client_id: env.DISCORD_CLIENT_ID,
        redirect_uri: env.DISCORD_REDIRECT_URL,
        response_type: 'code',
        scope: 'identify',
        state: state
    })
    return `${env.DISCORD_AUTH_URL}${redirectUrlParams.toString()}`
}

export async function exchangeCode(code: string) {
    try {
        let formData = {
            client_id: env.DISCORD_CLIENT_ID,
            client_secret: env.DISCORD_SECRET_ID,
            code: code,
            redirect_uri: env.DISCORD_REDIRECT_URL,
            grant_type: 'authorization_code'
        }
        const tokenExchange = await fetch('https://discord.com/api/oauth2/token', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(formData)
        })
        if (!tokenExchange.ok) {
            console.error("Failed to exchange code for token", tokenExchange.statusText);
            return null;
        }

        const tokenData = await tokenExchange.json() as DiscordTokenResponse;

        if (!tokenData.access_token) {
            console.error("No access token returned from Discord")
            return null;
        }

        return tokenData;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function fetchDiscordUser(token: string) {
    try {
        const userExchange = await fetch('https://discord.com/api/users/@me', {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        if (!userExchange.ok) {
            console.error("Failed to fetch user from Discord", userExchange.statusText);
            return null;
        }
        const userData = await userExchange.json();
        return userData;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function createSessionToken(user: any) {
    const payload = {
        id: user.id,
        username: user.username,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
        iss: 'LumiHub'
    };

    return await sign(payload, env.JWT_SECRET, 'HS256');
}

export function createRefreshToken() {
    const generatedToken = randomBytes(32);
    return generatedToken.toString('hex');
}

/** SHA-256 hash a token before storing in the database. */
export function hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}