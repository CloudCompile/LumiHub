import { useEffect, useState, useCallback } from 'react';
import { useCharacterStore } from '../store/useCharacterStore';
import CharacterCard from '../components/CharacterCard/CharacterCard';
import CharacterModal from '../components/CharacterModal/CharacterModal';
import CreateCharacterModal from '../components/CreateCharacterModal/CreateCharacterModal';
import { Sparkles, Globe, Calendar, Download, CaseSensitive, Flame, Plus } from 'lucide-react';
import type { UnifiedCharacterCard, CharacterSource } from '../types/character';
import BrowsePage from '../layouts/BrowsePage/BrowsePage';
import { 
  FilterSidebar, 
  FilterSection, 
  FilterRadioGroup, 
  FilterRadioOption,
  FilterSortList,
  FilterSortOption,
  FilterPlaceholder,
  FilterCheckbox
} from '../layouts/BrowsePage/FilterSidebar';
import styles from './Characters.module.css';

const SORT_OPTIONS_LUMIHUB = [
  { key: 'created_at', label: 'Newest', icon: <Calendar size={14} /> },
  { key: 'downloads', label: 'Most Downloaded', icon: <Download size={14} /> },
  { key: 'name', label: 'Alphabetical', icon: <CaseSensitive size={14} /> },
];

const SORT_OPTIONS_CHUB = [
  { key: 'default', label: 'Trending', icon: <Flame size={14} /> },
  { key: 'created_at', label: 'Newest', icon: <Calendar size={14} /> },
  { key: 'download_count', label: 'Most Downloaded', icon: <Download size={14} /> },
];

function SkeletonGrid() {
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className={styles.skeleton}>
          <div className={styles.skeletonShimmer} />
        </div>
      ))}
    </>
  );
}

const Characters = () => {
  const {
    characters, loading, error, source, search, sort, pagination,
    setSource, setSearch, setSort, setPage, fetchCharacters,
  } = useCharacterStore();

  const [previewCard, setPreviewCard] = useState<UnifiedCharacterCard | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(search);
  const [mobileFilters, setMobileFilters] = useState(false);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        setSearch(localSearch);
        fetchCharacters();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, search, setSearch, fetchCharacters]);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setSearch(localSearch);
    fetchCharacters();
  }, [localSearch, setSearch, fetchCharacters]);

  const sortOptions = source === 'lumihub' ? SORT_OPTIONS_LUMIHUB : SORT_OPTIONS_CHUB;

  return (
    <>
      <BrowsePage
        title="Characters"
        searchPlaceholder="Search characters..."
        headerActions={
          <button 
            className={styles.createBtn}
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus size={16} />
            Create
          </button>
        }
        emptyStateTitle={source === 'lumihub' ? 'No characters yet' : 'No characters found'}
        emptyStateDesc={source === 'lumihub' ? 'Be the first to upload a character!' : 'Try adjusting your search or filters.'}
        search={localSearch}
        onSearchChange={setLocalSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={() => {
          setLocalSearch('');
          setSearch('');
          fetchCharacters();
        }}
        loading={loading}
        error={error}
        itemsCount={characters.length}
        pagination={{
          page: pagination.page,
          total: pagination.total,
          totalPages: pagination.totalPages,
          onPageChange: setPage,
        }}
        mobileFiltersOpen={mobileFilters}
        onToggleMobileFilters={() => setMobileFilters(!mobileFilters)}
        SkeletonGrid={SkeletonGrid}
        sidebar={
          <FilterSidebar>
            <FilterSection label="Source">
              <FilterRadioGroup>
                <FilterRadioOption
                  name="source"
                  value="lumihub"
                  label="LumiHub"
                  icon={<Sparkles size={14} />}
                  checked={source === 'lumihub'}
                  onChange={(val) => setSource(val as CharacterSource)}
                />
                <FilterRadioOption
                  name="source"
                  value="chub"
                  label="Chub.ai"
                  icon={<Globe size={14} />}
                  checked={source === 'chub'}
                  onChange={(val) => setSource(val as CharacterSource)}
                />
              </FilterRadioGroup>
            </FilterSection>

            <FilterSection label="Sort By">
              <FilterSortList>
                {sortOptions.map((opt) => (
                  <FilterSortOption
                    key={opt.key}
                    label={opt.label}
                    icon={opt.icon}
                    active={sort === opt.key}
                    onClick={() => setSort(opt.key)}
                  />
                ))}
              </FilterSortList>
            </FilterSection>

            <FilterSection label="Tags">
              <FilterPlaceholder text="Tag filtering coming soon" />
            </FilterSection>

            <FilterSection label="Content">
              <FilterCheckbox label="Show NSFW" disabled={true} />
            </FilterSection>
          </FilterSidebar>
        }
      >
        {characters.map((card) => (
          <CharacterCard
            key={card.id}
            card={card}
            onClick={() => setPreviewCard(card)}
          />
        ))}
      </BrowsePage>

      {/* Detail Panel */}
      {previewCard && (
        <CharacterModal card={previewCard} onClose={() => setPreviewCard(null)} />
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <CreateCharacterModal onClose={() => setIsCreateOpen(false)} />
      )}
    </>
  );
};

export default Characters;
