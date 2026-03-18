import { Hono } from 'hono';
import { logger } from '../utils/logger.ts';

const characters = new Hono();

characters.get('/', async (c) => {
    return;
});

characters.get('/:id', async (c) => {
    return;
});

characters.post('/', async (c) => {
    return;
});

characters.put('/:id', async (c) => {
    return;
});

characters.delete('/:id', async (c) => {
    return;
});

characters.post('/:id/download', async (c) => {
    return;
});

export default characters;
