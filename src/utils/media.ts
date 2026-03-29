function normalizeUploadPath(filePath: string | null): string | null {
  if (!filePath) return null;

  let normalized = filePath.replace(/\\/g, '/');
  if (!normalized.startsWith('uploads/')) {
    normalized = `uploads/${normalized}`;
  }

  return `/${normalized}`;
}

export function toUploadUrl(filePath: string | null): string | null {
  return normalizeUploadPath(filePath);
}

export function toThumbnailUrl(filePath: string | null, preset = 'card'): string | null {
  const uploadUrl = normalizeUploadPath(filePath);
  if (!uploadUrl) return null;
  return `/api/v1/media/thumb?src=${encodeURIComponent(uploadUrl)}&preset=${encodeURIComponent(preset)}`;
}
