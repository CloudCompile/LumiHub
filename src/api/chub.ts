import type { ChubCharacter, ChubSearchResult, ChubSearchOptions, ChubCharacterCard } from '../types/chub';

const CHUB_GATEWAY_BASE = (typeof import.meta.env !== 'undefined' && import.meta.env.DEV)
  ? '/api/chub'
  : 'https://gateway.chub.ai';

/** Searches for characters on Chub.ai with the given filter options. */
export async function searchChubCharacters(options: ChubSearchOptions = {}): Promise<ChubSearchResult> {
  const params = new URLSearchParams({
    search: options.search || '',
    page: String(options.page || 1),
    first: String(options.limit || 24),
    sort: options.sort || 'default',
    nsfw: String(options.nsfw ?? false),
    asc: 'false',
  });

  if (options.tags) {
    params.append('topics', options.tags);
  }

  if (options.excludeTags) {
    params.append('excludetopics', options.excludeTags);
  }

  const url = `${CHUB_GATEWAY_BASE}/search?${params}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: '{}',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`Chub API error: ${response.status}`);
    }

    const data = await response.json();
    const actualData = data.data || data;

    return {
      nodes: actualData.nodes || [],
      count: actualData.count || 0,
      page: options.page || 1,
      pages: Math.ceil((actualData.count || 0) / (options.limit || 24)),
    };
  } catch (error) {
    console.error('[LumiHub] Chub API error:', error);
    throw error;
  }
}

/** Transforms a raw Chub API node into the app's ChubCharacterCard format. */
export function transformChubCharacter(node: ChubCharacter): ChubCharacterCard {
  const fullPath = node.fullPath || node.name;
  const creator = fullPath.includes('/') ? fullPath.split('/')[0] : 'Unknown';

  const hasNsfwTag = (node.topics || []).some(t => t.toLowerCase() === 'nsfw');
  const isNsfw = node.nsfw_image || node.nsfw || hasNsfwTag;

  return {
    id: fullPath,
    name: node.name || 'Unnamed',
    creator,
    tagline: node.tagline,
    description: node.description,
    tags: node.topics || [],
    nsfw: isNsfw,
    isNsfwImage: node.nsfw_image || false,
    avatarUrl: `https://avatars.charhub.io/avatars/${fullPath}/avatar.webp`,
    highResUrl: `https://avatars.charhub.io/avatars/${fullPath}/chara_card_v2.png`,
    pageUrl: `https://chub.ai/characters/${fullPath}`,
    downloadUrl: `https://avatars.charhub.io/avatars/${fullPath}/chara_card_v2.png`,
    tokenCount: node.n_tokens,
    rating: node.rating,
    interactions: node.n_interactions,
    createdAt: node.created_at,
    updatedAt: node.updated_at,
  };
}

/** Fetches trending characters from Chub.ai. */
export async function getTrendingCharacters(limit = 24): Promise<ChubCharacterCard[]> {
  const result = await searchChubCharacters({
    sort: 'trending',
    limit,
    page: 1,
    nsfw: false,
  });

  return result.nodes.map(transformChubCharacter);
}

/** Fetches top-rated characters from Chub.ai. */
export async function getFeaturedCharacters(limit = 24): Promise<ChubCharacterCard[]> {
  const result = await searchChubCharacters({
    sort: 'rating',
    limit,
    page: 1,
    nsfw: false,
  });

  return result.nodes.map(transformChubCharacter);
}
