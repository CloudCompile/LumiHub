import { create } from 'zustand';
import type { UnifiedCharacterCard, CharacterSource } from '../types/character';
import { fromLumiHub, fromChub } from '../types/character';
import { listCharacters } from '../api/characters';
import { searchChubCharacters, transformChubCharacter } from '../api/chub';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface CharacterState {
  characters: UnifiedCharacterCard[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;

  source: CharacterSource;
  search: string;
  sort: string;

  setSource: (source: CharacterSource) => void;
  setSearch: (search: string) => void;
  setSort: (sort: string) => void;
  setPage: (page: number) => void;
  fetchCharacters: () => Promise<void>;
  refresh: () => Promise<void>;
}

/** Central Zustand store for the Characters page. */
export const useCharacterStore = create<CharacterState>((set, get) => ({
  characters: [],
  loading: false,
  error: null,
  pagination: { page: 1, limit: 24, total: 0, totalPages: 0 },

  source: 'lumihub',
  search: '',
  sort: 'created_at',

  setSource: (source) => {
    const defaultSort = source === 'lumihub' ? 'created_at' : 'default';
    set({ source, sort: defaultSort, pagination: { ...get().pagination, page: 1 } });
    get().fetchCharacters();
  },

  setSearch: (search) => {
    set({ search, pagination: { ...get().pagination, page: 1 } });
  },

  setSort: (sort) => {
    set({ sort, pagination: { ...get().pagination, page: 1 } });
    get().fetchCharacters();
  },

  setPage: (page) => {
    set({ pagination: { ...get().pagination, page } });
    get().fetchCharacters();
  },

  fetchCharacters: async () => {
    const { source, search, sort, pagination } = get();
    set({ loading: true, error: null });

    try {
      if (source === 'lumihub') {
        const res = await listCharacters({
          page: pagination.page,
          limit: pagination.limit,
          sort,
          order: 'desc',
          search: search || undefined,
        });
        set({
          characters: res.data.map(fromLumiHub),
          pagination: res.pagination,
        });
      } else {
        const res = await searchChubCharacters({
          search: search || undefined,
          sort: sort as any,
          limit: pagination.limit,
          page: pagination.page,
          nsfw: false,
        });
        set({
          characters: res.nodes.map(transformChubCharacter).map(fromChub),
          pagination: {
            page: res.page,
            limit: pagination.limit,
            total: res.count,
            totalPages: res.pages,
          },
        });
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to load characters' });
    } finally {
      set({ loading: false });
    }
  },

  refresh: async () => {
    await get().fetchCharacters();
  },
}));
