import { useInfiniteQuery } from '@tanstack/react-query';
import { useCharacterStore } from '../store/useCharacterStore';
import { listCharacters } from '../api/characters';
import { searchChubCharacters, transformChubCharacter } from '../api/chub';
import { fromLumiHub, fromChub } from '../types/character';
import { useMemo } from 'react';

const PAGE_SIZE = 48;

export function useCharacters(params: { ownerId?: string, ignoreStore?: boolean, enabled?: boolean } = {}) {
  const store = useCharacterStore();
  const source = params.ignoreStore ? 'lumihub' : store.source;
  const search = params.ignoreStore ? '' : store.search;
  const sort = params.ignoreStore ? 'created_at' : store.sort;
  const tags = store.tags;
  const excludeTags = store.excludeTags;
  const minTokens = store.minTokens;
  const showNsfw = store.showNsfw;
  const showNsfl = store.showNsfl;
  const requireImages = store.requireImages;

  const tagsKey = tags.join(',');
  const excludeTagsKey = excludeTags.join(',');

  const query = useInfiniteQuery({
    queryKey: ['characters', source, search, sort, tagsKey, excludeTagsKey, minTokens, showNsfw, showNsfl, requireImages, params.ownerId],
    queryFn: async ({ pageParam = 1 }) => {
      if (source === 'lumihub') {
        const res = await listCharacters({
          page: pageParam,
          limit: PAGE_SIZE,
          sort,
          order: 'desc',
          search: search || undefined,
          tags: tagsKey || undefined,
          ownerId: params.ownerId,
        });
        return {
          characters: res.data.map(fromLumiHub),
          page: pageParam,
          hasMore: pageParam < res.pagination.totalPages,
          total: res.pagination.total,
        };
      } else {
        const res = await searchChubCharacters({
          search: search || undefined,
          sort: sort as any,
          limit: PAGE_SIZE,
          page: pageParam,
          nsfw: showNsfw,
          nsfl: showNsfl,
          minTokens,
          requireImages,
          tags: tagsKey || undefined,
          excludeTags: excludeTagsKey || undefined,
        });
        return {
          characters: res.nodes.map(transformChubCharacter).map(fromChub),
          page: res.page,
          hasMore: res.hasMore,
          total: 0,
        };
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: params.enabled !== false,
    staleTime: 1000 * 60 * 5,
  });

  const allCharacters = useMemo(
    () => query.data?.pages.flatMap((p) => p.characters) ?? [],
    [query.data],
  );

  const lastPage = query.data?.pages[query.data.pages.length - 1];

  return {
    characters: allCharacters,
    pagination: {
      page: lastPage?.page ?? 1,
      limit: PAGE_SIZE,
      total: lastPage?.total ?? 0,
      totalPages: 0,
      hasNextPage: query.hasNextPage ?? false,
      fetchNextPage: query.fetchNextPage,
      loadingMore: query.isFetchingNextPage,
    },
    loading: query.isLoading,
    loadingMore: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage ?? false,
    fetchNextPage: query.fetchNextPage,
    error: query.error ? query.error.message : null,
  };
}
