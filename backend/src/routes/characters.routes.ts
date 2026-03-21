import { Hono } from 'hono';
import { uploadMiddleware, type UploadEnv } from '../middleware/upload.middleware.ts';
import * as CharacterService from '../services/characters.service.ts';
import type { ListQueryParams } from '../types/api.ts';

/** Character CRUD routes mounted at /api/v1/characters. */
const characters = new Hono<UploadEnv>();

characters.get('/', async (c) => {
  const query: ListQueryParams = {
    page: Number(c.req.query('page'))   || undefined,
    limit: Number(c.req.query('limit')) || undefined,
    sort: c.req.query('sort')           || undefined,
    order: (c.req.query('order') as 'asc' | 'desc') || undefined,
    search: c.req.query('search')       || undefined,
    tags: c.req.query('tags')           || undefined,
    nsfw: c.req.query('nsfw') === 'true' ? true : undefined,
  };

  const result = await CharacterService.listCharacters(query);
  return c.json(result);
});

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

characters.post('/', uploadMiddleware, async (c) => {
  const data = c.get('characterData');
  const imagePath = c.get('imagePath');

  const character = await CharacterService.createCharacter(data, imagePath);

  return c.json(
    { id: character.id, message: 'Character created successfully' },
    201,
  );
});

characters.put('/:id', uploadMiddleware, async (c) => {
  const id = c.req.param('id');
  const data = c.get('characterData');
  const imagePath = c.get('imagePath');

  const updated = await CharacterService.updateCharacter(id, data, imagePath);

  if (!updated) {
    return c.json(
      { error: 'Not Found', message: 'Character not found', statusCode: 404 },
      404,
    );
  }

  return c.json({ data: updated, message: 'Character updated successfully' });
});

characters.delete('/:id', async (c) => {
  const deleted = await CharacterService.deleteCharacter(c.req.param('id'));

  if (!deleted) {
    return c.json(
      { error: 'Not Found', message: 'Character not found', statusCode: 404 },
      404,
    );
  }

  return c.json({ message: 'Character deleted successfully' });
});

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
