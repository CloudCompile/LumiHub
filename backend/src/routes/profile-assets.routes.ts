import { Hono } from 'hono';
import { AppDataSource } from '../db/connection.ts';
import { User } from '../entities/User.entity.ts';
import { ProfileAsset } from '../entities/ProfileAsset.entity.ts';
import { processProfileImage, processProfileVideo, deleteAssetFile } from '../services/profile-assets.service.ts';
import { FILE_SIZE_LIMITS, ALLOWED_MIME_TYPES } from '../utils/constants.ts';
import { logger } from '../utils/logger.ts';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { requireAuth, type AuthEnv } from '../middleware/requireAuth.middleware.ts';

const assetsRoutes = new Hono<AuthEnv>();

assetsRoutes.use('*', requireAuth);

/** List all assets for current user */
assetsRoutes.get('/', async (c) => {
    const assetRepository = AppDataSource.getRepository(ProfileAsset);

    const assets = await assetRepository.find({
        where: { owner_id: c.get('userId') },
        order: { created_at: 'DESC' }
    });

    return c.json(assets);
});

/** Upload a new asset */
assetsRoutes.post('/', async (c) => {
    const userRepository = AppDataSource.getRepository(User);
    const assetRepository = AppDataSource.getRepository(ProfileAsset);

    const user = await userRepository.findOneBy({ id: c.get('userId') });
    if (!user) return c.json({ error: 'User not found' }, 404);

    const formData = await c.req.formData().catch(() => null);
    if (!formData) return c.json({ error: 'Expected multipart/form-data' }, 400);

    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
        return c.json({ error: 'Missing or invalid file' }, 400);
    }

    const isImage = ALLOWED_MIME_TYPES.IMAGE.includes(file.type as (typeof ALLOWED_MIME_TYPES.IMAGE)[number]);
    const isVideo = ALLOWED_MIME_TYPES.VIDEO.includes(file.type as (typeof ALLOWED_MIME_TYPES.VIDEO)[number]);

    if (!isImage && !isVideo) {
        return c.json({ error: `Unsupported file type: ${file.type}` }, 400);
    }

    if (isImage && file.size > FILE_SIZE_LIMITS.PROFILE_ASSET_IMAGE) {
        return c.json({ error: `Image too large (max ${FILE_SIZE_LIMITS.PROFILE_ASSET_IMAGE / 1024 / 1024}MB)` }, 400);
    }
    if (isVideo && file.size > FILE_SIZE_LIMITS.PROFILE_ASSET_VIDEO) {
        return c.json({ error: `Video too large (max ${FILE_SIZE_LIMITS.PROFILE_ASSET_VIDEO / 1024 / 1024}MB)` }, 400);
    }

    let resultFilePath = '';
    let resultSize = 0;
    const type = isImage ? 'image' : 'video';

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        
        if (isImage) {
            const result = await processProfileImage(buffer);
            resultFilePath = result.filePath;
            resultSize = result.size;
        } else if (isVideo) {
            const tempDir = path.resolve('.temp');
            await mkdir(tempDir, { recursive: true });
            const tempPath = path.join(tempDir, `${crypto.randomUUID()}-${file.name}`);
            await Bun.write(tempPath, buffer);
            
            const result = await processProfileVideo(tempPath);
            resultFilePath = result.filePath;
            resultSize = result.size;
        }

        const newAsset = assetRepository.create({
            owner_id: user.id,
            file_path: resultFilePath,
            type,
            original_name: file.name,
            size_bytes: resultSize
        });

        await assetRepository.save(newAsset);
        logger.info(`User ${user.id} uploaded profile asset: ${resultFilePath}`);

        return c.json(newAsset, 201);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown processing error';
        logger.error(`Error processing profile asset for user ${user.id}:`, e);
        return c.json({ error: 'Processing failed', message }, 500);
    }
});

/** Delete an asset */
assetsRoutes.delete('/:id', async (c) => {
    const assetId = c.req.param('id');
    const assetRepository = AppDataSource.getRepository(ProfileAsset);

    const asset = await assetRepository.findOneBy({ id: assetId, owner_id: c.get('userId') });
    if (!asset) return c.json({ error: 'Asset not found or not owned by you' }, 404);

    await deleteAssetFile(asset.file_path);
    await assetRepository.remove(asset);

    logger.info(`User ${c.get('userId')} deleted profile asset: ${asset.file_path}`);
    return c.json({ message: 'Asset deleted' });
});

export default assetsRoutes;
