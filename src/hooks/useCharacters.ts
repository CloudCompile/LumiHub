import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useCharacterStore } from '../store/useCharacterStore';
import { listCharacters } from '../api/characters';
import { searchChubCharacters, transformChubCharacter } from '../api/chub';
import { fromLumiHub, fromChub } from '../types/character';

export function useCharacters(params: { ownerId?: string, ignoreStore?: boolean, enabled?: boolean } = {}) {
  const store = useCharacterStore();
  const source = params.ignoreStore ? 'lumihub' : store.source;
  const search = params.ignoreStore ? '' : store.search;
  const sort = params.ignoreStore ? 'created_at' : store.sort;
  const page = params.ignoreStore ? 1 : store.page;
  const limit = 24;

  const query = useQuery({
    queryKey: ['characters', source, search, sort, page, params.ownerId],
    queryFn: async () => {
      if (source === 'lumihub') {
        const res = await listCharacters({
          page,
          limit,
          sort,
          order: 'desc',
          search: search || undefined,
          ownerId: params.ownerId,
        });
        return {
          characters: res.data.map(fromLumiHub),
          pagination: res.pagination,
        };
      } else {
        const res = await searchChubCharacters({
          search: search || undefined,
          sort: sort as any,
          limit,
          page,
          nsfw: false,
        });
        return {
          characters: res.nodes.map(transformChubCharacter).map(fromChub),
          pagination: {
            page: res.page,
            limit,
            total: res.count,
            totalPages: res.pages,
          },
        };
      }
    },
    enabled: params.enabled !== false,
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });

  return {
    characters: query.data?.characters ?? [],
    pagination: query.data?.pagination ?? { page: 1, limit, total: 0, totalPages: 0 },
    loading: query.isLoading || query.isFetching,
    error: query.error ? query.error.message : null,
  };
}
