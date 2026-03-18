export interface ChubCharacter {
  id: string;
  fullPath: string;
  name: string;
  tagline?: string;
  description?: string;
  topics?: string[];
  nsfw?: boolean;
  nsfw_image?: boolean;
  n_tokens?: number;
  rating?: number;
  n_interactions?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ChubSearchResult {
  nodes: ChubCharacter[];
  count: number;
  page: number;
  pages: number;
}

export type ChubSortOption = 'default' | 'rating' | 'trending' | 'created_at' | 'download_count' | 'n_tokens';

export interface ChubSearchOptions {
  search?: string;
  page?: number;
  limit?: number;
  sort?: ChubSortOption;
  nsfw?: boolean;
  tags?: string;
  excludeTags?: string;
}

export interface ChubCharacterCard {
  id: string;
  name: string;
  creator: string;
  tagline?: string;
  description?: string;
  tags: string[];
  nsfw: boolean;
  isNsfwImage?: boolean;
  avatarUrl: string;
  highResUrl?: string;
  pageUrl: string;
  downloadUrl: string;
  tokenCount?: number;
  rating?: number;
  interactions?: number;
  createdAt?: string;
  updatedAt?: string;
}
