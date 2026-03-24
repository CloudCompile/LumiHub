import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import { env } from '../env.ts';
import { AppDataSource } from '../db/connection.ts';
import { User } from '../entities/User.entity.ts';

const users = new Hono();

/** Get public user profile by Discord ID */
users.get('/profile/:discordId', async (c) => {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ discord_id: c.req.param('discordId') });

    if (!user) {
        return c.json({ error: "User not found" }, 404);
    }

    return c.json({
        id: user.id,
        discordId: user.discord_id,
        username: user.username,
        displayName: user.display_name,
        avatar: user.avatar,
        banner: user.banner,
        customCss: user.custom_css,
        role: user.role,
        createdAt: user.created_at
    });
});

/** Protect all user routes with JWT */
users.use('*', jwt({
    secret: env.JWT_SECRET,
    cookie: 'lumihub_session',
    alg: 'HS256'
}));

/** Get current user profile */
users.get('/@me', async (c) => {
    const payload = c.get('jwtPayload') as { id: string, username: string, exp: number, iss: string };
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: payload.id });

    if (!user) {
        return c.json({ error: "User not found" }, 404);
    }

    return c.json({
        id: user.id,
        discordId: user.discord_id,
        username: user.username,
        displayName: user.display_name,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.created_at
    });
});

export default users;
