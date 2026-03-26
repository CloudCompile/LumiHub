import { z } from 'zod';

export const ProfileAssetSchema = z.object({
  id: z.string(),
  owner_id: z.string(),
  file_path: z.string(),
  type: z.enum(['image', 'video']),
  original_name: z.string(),
  size_bytes: z.number(),
  created_at: z.string(),
});

export type ProfileAsset = z.infer<typeof ProfileAssetSchema>;

export async function fetchProfileAssets(): Promise<ProfileAsset[]> {
  const res = await fetch('/api/v1/profile-assets');
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Failed to fetch assets');
  }
  return res.json();
}

export async function uploadProfileAsset(file: File): Promise<ProfileAsset> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/v1/profile-assets', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Failed to upload asset');
  }
  return res.json();
}

export async function deleteProfileAsset(id: string): Promise<void> {
  const res = await fetch(`/api/v1/profile-assets/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Failed to delete asset');
  }
}
