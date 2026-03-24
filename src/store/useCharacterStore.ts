import { create } from 'zustand';
import type { CharacterSource } from '../types/character';

interface CharacterFilterState {
  source: CharacterSource;
  search: string;
  sort: string;
  page: number;

  setSource: (source: CharacterSource) => void;
  setSearch: (search: string) => void;
  setSort: (sort: string) => void;
  setPage: (page: number) => void;
}

/** Stores filter UI state for characters, delegating actual fetching to React Query */
export const useCharacterStore = create<CharacterFilterState>((set) => ({
  source: 'lumihub',
  search: '',
  sort: 'created_at',
  page: 1,

  setSource: (source) => {
    const defaultSort = source === 'lumihub' ? 'created_at' : 'default';
    set({ source, sort: defaultSort, page: 1 });
  },

  setSearch: (search) => {
    set({ search, page: 1 });
  },

  setSort: (sort) => {
    set({ sort, page: 1 });
  },

  setPage: (page) => {
    set({ page });
  },
}));
