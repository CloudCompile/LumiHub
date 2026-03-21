import { useEffect, useState, useCallback } from 'react';
import { Search, TrendingUp, Clock, Download, Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCharacterStore } from '../store/useCharacterStore';
import CharacterCard from '../components/CharacterCard/CharacterCard';
import CharacterModal from '../components/CharacterModal/CharacterModal';
import SourceToggle from '../components/SourceToggle/SourceToggle';
import CreateCharacterModal from '../components/CreateCharacterModal/CreateCharacterModal';
import type { UnifiedCharacterCard } from '../types/character';
import styles from './Characters.module.css';

/** Browse, search, and create characters from LumiHub or Chub sources. */
const Characters = () => {
  const {
    characters, loading, error, source, search, sort, pagination,
    setSource, setSearch, setSort, setPage, fetchCharacters,
  } = useCharacterStore();

  const [previewCard, setPreviewCard] = useState<UnifiedCharacterCard | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    fetchCharacters();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        setSearch(localSearch);
        fetchCharacters();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setSearch(localSearch);
    fetchCharacters();
  }, [localSearch]);

  const sortOptions = source === 'lumihub'
    ? [
        { key: 'created_at', label: 'Newest',    icon: Clock },
        { key: 'downloads',  label: 'Downloads', icon: Download },
        { key: 'name',       label: 'Name',      icon: Sparkles },
      ]
    : [
        { key: 'default',       label: 'Trending',   icon: TrendingUp },
        { key: 'created_at',    label: 'Newest',     icon: Clock },
        { key: 'download_count', label: 'Downloads', icon: Download },
      ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.toolbar}>
          <div className={styles.toolbarTop}>
            <h1 className={styles.title}>Characters</h1>

            <form onSubmit={handleSearchSubmit} className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by name..."
                className={styles.searchInput}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
            </form>
          </div>

          <div className={styles.filtersRow}>
            <div className={styles.filterGroup}>
              {sortOptions.map((opt) => (
                <button
                  key={opt.key}
                  className={`${styles.filterBtn} ${sort === opt.key ? styles.filterBtnActive : ''}`}
                  onClick={() => setSort(opt.key)}
                >
                  <opt.icon size={16} />
                  {opt.label}
                </button>
              ))}
            </div>

            <div className={styles.rightControls}>
              <SourceToggle value={source} onChange={setSource} />

              <button className={styles.createBtn} onClick={() => setShowCreate(true)}>
                <Plus size={18} />
                Create
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              className={styles.loadingContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className={styles.spinner} />
              <span className={styles.loadingText}>Loading characters...</span>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              className={styles.grid}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {characters.length > 0 ? (
                characters.map((card) => (
                  <CharacterCard
                    key={card.id}
                    card={card}
                    onClick={() => setPreviewCard(card)}
                  />
                ))
              ) : (
                <div className={styles.emptyState}>
                  <Sparkles size={32} className={styles.emptyIcon} />
                  <h3>
                    {source === 'lumihub'
                      ? 'No characters yet'
                      : 'No characters found'}
                  </h3>
                  <p>
                    {source === 'lumihub'
                      ? 'Be the first to upload a character!'
                      : 'Try adjusting your search or filters.'}
                  </p>
                  {source === 'lumihub' && (
                    <button className={styles.emptyCreateBtn} onClick={() => setShowCreate(true)}>
                      <Plus size={18} />
                      Create Character
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              disabled={pagination.page <= 1}
              onClick={() => setPage(pagination.page - 1)}
            >
              Previous
            </button>
            <span className={styles.pageInfo}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              className={styles.pageBtn}
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {previewCard && (
          <CharacterModal card={previewCard} onClose={() => setPreviewCard(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreate && (
          <CreateCharacterModal onClose={() => setShowCreate(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Characters;
