import { Hono } from 'hono';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { UPLOAD_PATHS } from '../utils/constants.ts';

const media = new Hono();

const PRESETS = {
  card: { width: 384, height: 512, fit: 'cover' as const, quality: 80 },
} as const;

const UPLOADS_ROOT = path.resolve(UPLOAD_PATHS.ROOT);
const THUMBS_ROOT = path.resolve(UPLOAD_PATHS.ROOT, '.cache', 'thumbs');
const CACHE_CONTROL = 'public, max-age=31536000, immutable';

function normalizeUploadPath(src: string): string | null {
  const trimmed = src.trim();
  if (!trimmed) return null;

  const relative = trimmed.replace(/^\/+/, '');
  if (!relative.startsWith(`${UPLOAD_PATHS.ROOT}/`)) return null;

  const resolved = path.resolve(relative);
  if (!resolved.startsWith(UPLOADS_ROOT)) return null;

  return resolved;
}

media.get('/thumb', async (c) => {
  const src = c.req.query('src');
  const presetName = c.req.query('preset') || 'card';
  const preset = PRESETS[presetName as keyof typeof PRESETS];

  if (!src || !preset) {
    return c.json({ error: 'src and valid preset are required' }, 400);
  }

  const sourcePath = normalizeUploadPath(src);
  if (!sourcePath) {
    return c.json({ error: 'Invalid upload path' }, 400);
  }

  const sourceFile = Bun.file(sourcePath);
  if (!(await sourceFile.exists())) {
    return c.json({ error: 'Source file not found' }, 404);
  }

  const cacheKey = createHash('sha256').update(`${presetName}:${src}`).digest('hex');
  const outputDir = path.join(THUMBS_ROOT, presetName);
  const outputPath = path.join(outputDir, `${cacheKey}.webp`);
  await mkdir(outputDir, { recursive: true });

  const outputFile = Bun.file(outputPath);
  if (!(await outputFile.exists())) {
    const buffer = Buffer.from(await sourceFile.arrayBuffer());
    await sharp(buffer)
      .resize({
        width: preset.width,
        height: preset.height,
        fit: preset.fit,
        withoutEnlargement: true,
      })
      .webp({ quality: preset.quality })
      .toFile(outputPath);
  }

  return new Response(Bun.file(outputPath), {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': CACHE_CONTROL,
    },
  });
});

export { CACHE_CONTROL as uploadCacheControl };
export default media;
