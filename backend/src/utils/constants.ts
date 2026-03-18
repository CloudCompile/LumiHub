/**
 * Planned.
 */

export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  CHARACTER_CARD: 10 * 1024 * 1024, // 10MB
  WORLDBOOK: 5 * 1024 * 1024, // 5MB
  THEME: 2 * 1024 * 1024, // 2MB
  PRESET: 1 * 1024 * 1024, // 1MB
  PACK: 10 * 1024 * 1024, // 10MB
} as const;

export const ALLOWED_MIME_TYPES = {
  IMAGE: ['image/png'],
  JSON: ['application/json'],
  CSS: ['text/css'],
} as const;

export const UPLOAD_PATHS = {
  CHARACTERS: 'characters',
  WORLDBOOKS: 'worldbooks',
  THEMES: 'themes',
  PRESETS: 'presets',
} as const;

// Prob changing since no nsfwjs
export const NSFW_CLASSES = {
  DRAWING: 'Drawing',
  HENTAI: 'Hentai',
  NEUTRAL: 'Neutral',
  PORN: 'Porn',
  SEXY: 'Sexy',
} as const;

export const SORT_OPTIONS = {
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
  DOWNLOADS: 'downloads',
  VIEWS: 'views',
  RATING: 'rating',
  NAME: 'name',
} as const;
