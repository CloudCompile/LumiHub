import { ILike } from 'typeorm';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { AppDataSource } from '../db/connection.ts';
import { Character } from '../entities/Character.entity.ts';
import { logger } from '../utils/logger.ts';
import type { ValidatedCharacterData } from '../middleware/upload.middleware.ts';
import type { ListQueryParams } from '../types/api.ts';

const repo = () => AppDataSource.getRepository(Character);

/** Returns a paginated, filterable, and sortable list of characters. */
export async function listCharacters(params: ListQueryParams) {
  const page = Math.max(params.page ?? 1, 1);
  const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
  const skip = (page - 1) * limit;
  const ALLOWED_SORT_FIELDS = ['created_at', 'updated_at', 'downloads', 'views', 'rating', 'name'];
  const sortField = ALLOWED_SORT_FIELDS.includes(params.sort ?? '') ? params.sort! : 'created_at';
  const sortOrder = (params.order === 'asc' ? 'ASC' : 'DESC') as 'ASC' | 'DESC';

  const where: Record<string, any> = {};

  if (params.search) {
    where.name = ILike(`%${params.search}%`);
  }

  if (params.ownerId) {
    where.owner_id = params.ownerId;
  }

  const [characters, total] = await repo().findAndCount({
    where,
    order: { [sortField]: sortOrder },
    skip,
    take: limit,
    relations: ['owner'],
  });

  return {
    data: characters,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/** Finds a single character by its UUID. */
export async function getCharacterById(id: string) {
  return repo().findOneBy({ id });
}

/** Creates and persists a new character entity. */
export async function createCharacter(
  data: ValidatedCharacterData,
  imagePath: string | undefined,
  ownerId?: string | null,
) {
  const character = repo().create({
    ...data,
    image_path: imagePath ?? null,
    owner_id: ownerId ?? null,
    nickname: data.nickname ?? null,
    creator_notes_multilingual: data.creator_notes_multilingual ?? null,
    source: data.source ?? null,
    character_book: data.character_book ?? null,
    creation_date: data.creation_date ?? null,
    modification_date: data.modification_date ?? null,
  });

  return repo().save(character);
}

/** Updates an existing character, replacing the image if a new one is provided. */
export async function updateCharacter(
  id: string,
  data: Partial<ValidatedCharacterData>,
  imagePath: string | undefined,
) {
  const existing = await repo().findOneBy({ id });

  if (!existing) return null;

  if (imagePath && existing.image_path) {
    await deleteImageFile(existing.image_path);
  }

  repo().merge(existing, {
    ...data,
    ...(imagePath ? { image_path: imagePath } : {}),
    modification_date: Math.floor(Date.now() / 1000),
  });

  return repo().save(existing);
}

/** Deletes a character and removes its image file from disk. */
export async function deleteCharacter(id: string) {
  const existing = await repo().findOneBy({ id });

  if (!existing) return false;

  if (existing.image_path) {
    await deleteImageFile(existing.image_path);
  }

  await repo().remove(existing);
  return true;
}

/** Atomically increments the download counter for a character. */
export async function incrementDownloads(id: string) {
  const result = await repo()
    .createQueryBuilder()
    .update(Character)
    .set({ downloads: () => 'downloads + 1' })
    .where('id = :id', { id })
    .returning('downloads')
    .execute();

  if (result.affected === 0) return null;

  return { downloads: result.raw[0]?.downloads as number };
}

/** Removes an image file from the filesystem. */
async function deleteImageFile(relativePath: string) {
  try {
    const absolute = path.resolve(relativePath);
    await unlink(absolute);
    logger.info(`Deleted image file: ${absolute}`);
  } catch (err) {
    logger.warn(`Could not delete image file: ${relativePath}`, err);
  }
}
