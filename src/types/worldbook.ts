export interface WorldBookEntry {
  keys: string[];
  content: string;
  name: string;
  enabled: boolean;
  order: number;
  priority: number;
  comment: string;
  secondary_keys: string[];
  selective: boolean;
  constant: boolean;
  position: number;
  extensions: Record<string, any>;
}

export interface LumiWorldBook {
  id: string;
  name: string;
  description: string;
  entries: WorldBookEntry[];
  tags: string[];
  creator: string;
  image_path: string | null;
  downloads: number;
  created_at: string;
  updated_at: string;
}

export interface UnifiedWorldBook {
  id: string;
  name: string;
  description: string;
  entryCount: number;
  tags: string[];
  creator: string;
  avatarUrl: string | null;
  downloads: number;
  createdAt: string | null;
  raw: LumiWorldBook;
}

function normalizeImagePath(path: string | null): string | null {
  if (!path) return null;
  let normalized = path.replace(/\\/g, '/');
  if (!normalized.startsWith('uploads/')) {
    normalized = `uploads/${normalized}`;
  }
  return `/${normalized}`;
}

export function fromLumiHub(wb: LumiWorldBook): UnifiedWorldBook {
  return {
    id: wb.id,
    name: wb.name,
    description: wb.description?.slice(0, 200) || '',
    entryCount: wb.entries?.length ?? 0,
    tags: wb.tags,
    creator: wb.creator || 'Unknown',
    avatarUrl: normalizeImagePath(wb.image_path),
    downloads: wb.downloads,
    createdAt: wb.created_at,
    raw: wb,
  };
}
