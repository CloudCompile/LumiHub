import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { AppDataSource } from '../db/connection.ts';
import app from '../app.ts';

/**
 * Integration Tests for Character Endpoints
 * Tests Hono routing, TypeORM database interaction, and validation.
 */
describe('Character API Endpoints', () => {
  let testCharacterId: string;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  afterAll(async () => {
    if (testCharacterId) {
      await app.request(`/api/v1/characters/${testCharacterId}`, {
        method: 'DELETE',
      });
    }
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('GET /api/v1/characters - Should return a paginated list of characters', async () => {
    const res = await app.request('/api/v1/characters');
    expect(res.status).toBe(200);
    
    const json: any = await res.json();
    expect(json).toHaveProperty('data');
    expect(json).toHaveProperty('pagination');
    expect(Array.isArray(json.data)).toBe(true);
  });

  it('POST /api/v1/characters - Should validation-fail on missing required fields', async () => {
    const formData = new FormData();
    formData.append('character_data', JSON.stringify({ description: 'No name provided' }));
    
    const res = await app.request('/api/v1/characters', {
      method: 'POST',
      body: formData,
    });
    
    expect(res.status).toBe(400);
  });

  it('POST /api/v1/characters - Should successfully create a character', async () => {
    const characterData = {
      name: 'Test Character Integration',
      description: 'Used for automated testing',
      personality: 'Helpful and robust',
      creator: 'Test Suite',
      tags: ['test', 'automation']
    };

    const formData = new FormData();
    formData.append('character_data', JSON.stringify(characterData));

    const res = await app.request('/api/v1/characters', {
      method: 'POST',
      body: formData,
    });

    if (res.status !== 201) {
      const err = await res.text();
      console.error('Failed to create character:', err);
    }

    expect(res.status).toBe(201);
    const json: any = await res.json();
    expect(json).toHaveProperty('id');
    expect(json.message).toBe('Character created successfully');
    
    testCharacterId = json.id;
  });

  it('GET /api/v1/characters/:id - Should retrieve the created character', async () => {
    expect(testCharacterId).toBeDefined();

    const res = await app.request(`/api/v1/characters/${testCharacterId}`);
    expect(res.status).toBe(200);

    const json: any = await res.json();
    expect(json.data.id).toBe(testCharacterId);
    expect(json.data.name).toBe('Test Character Integration');
    expect(json.data.creator).toBe('Test Suite');
  });

  it('DELETE /api/v1/characters/:id - Should delete the character', async () => {
    expect(testCharacterId).toBeDefined();

    const res = await app.request(`/api/v1/characters/${testCharacterId}`, {
      method: 'DELETE',
    });
    expect(res.status).toBe(200);

    const checkRes = await app.request(`/api/v1/characters/${testCharacterId}`);
    expect(checkRes.status).toBe(404);
    
    testCharacterId = '';
  });
});
