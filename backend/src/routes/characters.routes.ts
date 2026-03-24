import { Hono } from 'hono';
import { uploadMiddleware, type UploadEnv } from '../middleware/upload.middleware.ts';
import { requireAuth, type AuthEnv } from '../middleware/requireAuth.middleware.ts';
import * as CharacterService from '../services/characters.service.ts';
import type { ListQueryParams } from '../types/api.ts';

type CharacterEnv = {
  Variables: UploadEnv['Variables'] & AuthEnv['Variables'];
};

const characters = new Hono<CharacterEnv>();

/** List public characters with pagination and filters */
characters.get('/', async (c) => {
  const query: ListQueryParams = {
    page: Number(c.req.query('page')) || undefined,
    limit: Number(c.req.query('limit')) || undefined,
    sort: c.req.query('sort') || undefined,
    order: (c.req.query('order') as 'asc' | 'desc') || undefined,
    search: c.req.query('search') || undefined,
    tags: c.req.query('tags') || undefined,
    nsfw: c.req.query('nsfw') === 'true' ? true : undefined,
    ownerId: c.req.query('ownerId') || undefined,
  };

  const result = await CharacterService.listCharacters(query);
  return c.json(result);
});

/** Get full character details */
characters.get('/:id', async (c) => {
  const character = await CharacterService.getCharacterById(c.req.param('id'));

  if (!character) {
    return c.json(
      { error: 'Not Found', message: 'Character not found', statusCode: 404 },
      404,
    );
  }

  return c.json({ data: character });
});

/** Create character (requires login) */
characters.post('/', requireAuth, uploadMiddleware, async (c) => {
  const data = c.get('characterData');
  const imagePath = c.get('imagePath');
  const ownerId = c.get('userId');

  const character = await CharacterService.createCharacter(data, imagePath, ownerId);

  return c.json(
    { id: character.id, message: 'Character created successfully' },
    201,
  );
});

/** Update character */
characters.put('/:id', requireAuth, uploadMiddleware, async (c) => {
  const id = c.req.param('id');
  const userId = c.get('userId');

  const existing = await CharacterService.getCharacterById(id);
  if (!existing) {
    return c.json({ error: 'Not Found', message: 'Character not found', statusCode: 404 }, 404);
  }
  if (existing.owner_id !== userId) {
    return c.json({ error: 'Forbidden', message: 'You do not own this character', statusCode: 403 }, 403);
  }

  const data = c.get('characterData');
  const imagePath = c.get('imagePath');
  const updated = await CharacterService.updateCharacter(id, data, imagePath);

  return c.json({ data: updated, message: 'Character updated successfully' });
});

/** Delete character */
characters.delete('/:id', requireAuth, async (c) => {
  const id = c.req.param('id');
  const userId = c.get('userId');

  const existing = await CharacterService.getCharacterById(id);
  if (!existing) {
    return c.json({ error: 'Not Found', message: 'Character not found', statusCode: 404 }, 404);
  }
  if (existing.owner_id !== userId) {
    return c.json({ error: 'Forbidden', message: 'You do not own this character', statusCode: 403 }, 403);
  }

  await CharacterService.deleteCharacter(id);
  return c.json({ message: 'Character deleted successfully' });
});

/** Increment download counter */
characters.post('/:id/download', async (c) => {
  const result = await CharacterService.incrementDownloads(c.req.param('id'));

  if (!result) {
    return c.json(
      { error: 'Not Found', message: 'Character not found', statusCode: 404 },
      404,
    );
  }

  return c.json(result);
});

export default characters;
