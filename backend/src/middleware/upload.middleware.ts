import { z } from 'zod';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import type { MiddlewareHandler } from 'hono';
import { FILE_SIZE_LIMITS, ALLOWED_MIME_TYPES, UPLOAD_PATHS } from '../utils/constants.ts';
import { logger } from '../utils/logger.ts';

export type UploadEnv = {
  Variables: {
    characterData: ValidatedCharacterData;
    imagePath: string | undefined;
  };
};

const characterAssetSchema = z.object({
  type: z.string(),
  uri: z.string(),
  name: z.string(),
  ext: z.string(),
});

// Lorebook schemas are intentionally permissive — CCSv3 cards use numeric
// positions, optional use_regex, and many extra fields across different
// card generators. Since this is stored as JSONB, we validate the outer
// shape but pass through entry fields freely.
const lorebookEntrySchema = z.object({
  keys: z.array(z.string()).default([]),
  content: z.string().default(''),
  enabled: z.boolean().default(true),
  insertion_order: z.number().default(100),
}).passthrough();

const lorebookSchema = z.object({
  entries: z.array(lorebookEntrySchema),
}).passthrough();

/** Zod schema for validating the `character_data` JSON payload (CCv3 spec). */
export const characterDataSchema = z.object({
  name: z.string().min(1, 'Character name is required'),
  nickname: z.string().optional(),
  description: z.string().default(''),
  personality: z.string().default(''),
  scenario: z.string().default(''),
  first_mes: z.string().default(''),
  alternate_greetings: z.array(z.string()).default([]),
  group_only_greetings: z.array(z.string()).default([]),
  mes_example: z.string().default(''),
  creator: z.string().default(''),
  creator_notes: z.string().default(''),
  creator_notes_multilingual: z.record(z.string()).optional(),
  tags: z.array(z.string()).default([]),
  character_version: z.string().default('1.0'),
  system_prompt: z.string().default(''),
  post_history_instructions: z.string().default(''),
  source: z.array(z.string()).optional(),
  assets: z.array(characterAssetSchema).default([]),
  character_book: lorebookSchema.optional(),
  extensions: z.record(z.any()).default({}),
  creation_date: z.number().optional(),
  modification_date: z.number().optional(),
});

export type ValidatedCharacterData = z.infer<typeof characterDataSchema>;

/**
 * Parses multipart form-data, validates character_data JSON and an optional
 * PNG image, then sets both on the Hono context for downstream handlers.
 */
export const uploadMiddleware: MiddlewareHandler<UploadEnv> = async (c, next) => {
  const formData = await c.req.formData().catch(() => null);

  if (!formData) {
    return c.json({ error: 'Bad Request', message: 'Expected multipart/form-data', statusCode: 400 }, 400);
  }

  const rawJson = formData.get('character_data');

  if (!rawJson || typeof rawJson !== 'string') {
    return c.json(
      { error: 'Bad Request', message: '"character_data" field is required and must be a JSON string', statusCode: 400 },
      400,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return c.json({ error: 'Bad Request', message: '"character_data" is not valid JSON', statusCode: 400 }, 400);
  }

  const result = characterDataSchema.safeParse(parsed);

  if (!result.success) {
    return c.json(
      {
        error: 'Validation Error',
        message: 'character_data failed validation',
        details: result.error.flatten().fieldErrors,
        statusCode: 400,
      },
      400,
    );
  }

  c.set('characterData', result.data);

  const imageFile = formData.get('image');

  if (imageFile && imageFile instanceof File) {
    if (imageFile.size > FILE_SIZE_LIMITS.IMAGE) {
      const limitMB = (FILE_SIZE_LIMITS.IMAGE / 1024 / 1024).toFixed(0);
      return c.json(
        { error: 'Bad Request', message: `Image exceeds ${limitMB} MB limit`, statusCode: 400 },
        400,
      );
    }

    const buffer = Buffer.from(await imageFile.arrayBuffer());

    // check if png
    const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    if (buffer.length < 8 || !PNG_MAGIC.every((b, i) => buffer[i] === b)) {
      return c.json(
        { error: 'Bad Request', message: 'Image must be a valid PNG file', statusCode: 400 },
        400,
      );
    }

    const filename = `${crypto.randomUUID()}.png`;
    const dir = path.resolve(UPLOAD_PATHS.CHARACTERS);
    await mkdir(dir, { recursive: true });

    const filePath = path.join(dir, filename);
    await Bun.write(filePath, buffer);

    const relativePath = `${UPLOAD_PATHS.CHARACTERS}/${filename}`;
    c.set('imagePath', relativePath);
    logger.info(`Saved character image → ${filePath}`);
  }

  await next();
};
