import { useState, useEffect } from 'react';
import { Search, Sparkles, TrendingUp, Star, MessageSquare, Users, Clock, Download, Filter, X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { searchChubCharacters, transformChubCharacter } from '../api/chub';
import type { ChubCharacterCard, ChubSortOption } from '../types/chub';
import styles from './Characters.module.css';

const Characters = () => {
  const [characters, setCharacters] = useState<ChubCharacterCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSort, setActiveSort] = useState<ChubSortOption>('default');
  const [includeTags, setIncludeTags] = useState('');
  const [excludeTags, setExcludeTags] = useState('');
  const [nsfw, setNsfw] = useState(false);
  const [blurNsfw, setBlurNsfw] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewChar, setPreviewChar] = useState<ChubCharacterCard | null>(null);
  
  // Track cards
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCharacters();
  }, [activeSort, nsfw]);

  const loadCharacters = async () => {
    setLoading(true);
    try {
      const result = await searchChubCharacters({
        search: searchQuery,
        sort: activeSort,
        limit: 24,
        page: 1,
        tags: includeTags,
        excludeTags: excludeTags,
        nsfw,
      });
      setCharacters(result.nodes.map(transformChubCharacter));
    } catch (error) {
      console.error('Failed to load characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    loadCharacters();
  };

  const toggleReveal = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newRevealed = new Set(revealedCards);
    if (newRevealed.has(id)) {
      newRevealed.delete(id);
    } else {
      newRevealed.add(id);
    }
    setRevealedCards(newRevealed);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarTop}>
            <h1 className={styles.title}>Characters</h1>
            
            <form onSubmit={handleSearch} className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by name, tags, or creator..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <div className={styles.filtersRow}>
            <div className={styles.filterGroup}>
              <button
                className={`${styles.filterBtn} ${activeSort === 'default' ? styles.filterBtnActive : ''}`}
                onClick={() => setActiveSort('default')}
              >
                <TrendingUp size={16} />
                Trending
              </button>
              <button
                className={`${styles.filterBtn} ${activeSort === 'rating' ? styles.filterBtnActive : ''}`}
                onClick={() => setActiveSort('rating')}
              >
                <Star size={16} />
                Top Rated
              </button>
              <button
                className={`${styles.filterBtn} ${activeSort === 'created_at' ? styles.filterBtnActive : ''}`}
                onClick={() => setActiveSort('created_at')}
              >
                <Clock size={16} />
                Newest
              </button>
              <button
                className={`${styles.filterBtn} ${activeSort === 'download_count' ? styles.filterBtnActive : ''}`}
                onClick={() => setActiveSort('download_count')}
              >
                <Download size={16} />
                Downloads
              </button>
            </div>

            <div className={styles.rightControls}>
              <label className={styles.toggleLabel} title="Show NSFW characters in results">
                <input 
                  type="checkbox" 
                  checked={nsfw} 
                  onChange={(e) => setNsfw(e.target.checked)} 
                  className={styles.toggleInput}
                />
                <span className={styles.toggleText}>NSFW</span>
              </label>

              {nsfw && (
                <label className={styles.toggleLabel} title="Blur NSFW images by default">
                  <input 
                    type="checkbox" 
                    checked={blurNsfw} 
                    onChange={(e) => setBlurNsfw(e.target.checked)} 
                    className={styles.toggleInput}
                  />
                  <span className={styles.toggleText}>Blur</span>
                </label>
              )}

              <button 
                className={`${styles.advancedBtn} ${showAdvanced ? styles.advancedBtnActive : ''}`}
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Filter size={16} />
                Tags
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div 
                className={styles.advancedFilters}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <div className={styles.advancedGrid}>
                  <div className={styles.inputGroup}>
                    <label>Include Tags (comma separated)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. fantasy, romance" 
                      value={includeTags}
                      onChange={(e) => setIncludeTags(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadCharacters()}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Exclude Tags (comma separated)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. scifi, mecha" 
                      value={excludeTags}
                      onChange={(e) => setExcludeTags(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadCharacters()}
                    />
                  </div>
                  <button className={styles.applyBtn} onClick={loadCharacters}>
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content Section */}
        <AnimatePresence mode='wait'>
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
                characters.map((char) => {
                  const shouldBlur = char.nsfw && blurNsfw && !revealedCards.has(char.id);
                  
                  return (
                    <div key={char.id} className={styles.card} onClick={() => setPreviewChar(char)}>
                      <div className={styles.cardImageWrapper}>
                        <img 
                          src={char.avatarUrl} 
                          alt={char.name} 
                          className={`${styles.cardImage} ${shouldBlur ? styles.cardImageBlurred : ''}`} 
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://chub.ai/favicon.ico';
                          }}
                        />
                        {shouldBlur && (
                          <div className={styles.revealOverlay} onClick={(e) => toggleReveal(e, char.id)}>
                            <Eye size={16} style={{ marginRight: '6px' }} />
                            Click to Reveal
                          </div>
                        )}
                        {char.rating && char.rating > 4.7 && (
                          <div className={styles.badge}>Masterpiece</div>
                        )}
                      </div>

                    <div className={styles.cardContent}>
                      <div className={styles.cardHeader}>
                        <h3 className={styles.cardName} title={char.name}>{char.name}</h3>
                        <p className={styles.cardAuthor}>by {char.creator}</p>
                      </div>
                      
                      <p className={styles.cardTagline}>{char.tagline || char.description || 'No description provided.'}</p>
                      
                      <div className={styles.cardFooter}>
                        <div className={styles.stats}>
                          <div className={styles.stat} title="Interactions">
                            <Users size={14} className={styles.statIcon} />
                            {char.interactions ? (char.interactions > 1000 ? `${(char.interactions / 1000).toFixed(1)}k` : char.interactions) : 0}
                          </div>
                          <div className={styles.stat} title="Rating">
                            <Star size={14} className={styles.statIcon} />
                            {char.rating?.toFixed(1) || '0.0'}
                          </div>
                          {char.tokenCount && (
                            <div className={styles.stat} title="Tokens">
                              <MessageSquare size={14} className={styles.statIcon} />
                              {Math.round(char.tokenCount / 1000)}k
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
              ) : (
                <div className={styles.emptyState}>
                  <Sparkles size={32} className={styles.emptyIcon} />
                  <h3>No characters found</h3>
                  <p>Try adjusting your search or filters.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview */}
      <AnimatePresence>
        {previewChar && (
          <motion.div 
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewChar(null)}
          >
            <motion.div 
              className={styles.modalContent}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className={styles.closeBtn} onClick={() => setPreviewChar(null)}>
                <X size={20} />
              </button>
              
              <div className={styles.modalLayout}>
                <div className={styles.modalImageCol}>
                  <img src={previewChar.highResUrl || previewChar.avatarUrl} alt={previewChar.name} className={styles.modalImage} />
                </div>
                <div className={styles.modalInfoCol}>
                  <h2 className={styles.modalName}>{previewChar.name}</h2>
                  <p className={styles.modalAuthor}>by {previewChar.creator}</p>
                  
                  <div className={styles.modalStats}>
                    <div className={styles.stat}><Users size={16} /> {previewChar.interactions || 0} chats</div>
                    <div className={styles.stat}><Star size={16} /> {previewChar.rating?.toFixed(1) || 'N/A'} rating</div>
                    <div className={styles.stat}><MessageSquare size={16} /> {previewChar.tokenCount ? `${Math.round(previewChar.tokenCount / 1000)}k tokens` : 'N/A'}</div>
                  </div>

                  <div className={styles.modalTags}>
                    {previewChar.tags.slice(0, 10).map((tag, i) => (
                      <span key={i} className={styles.modalTag}>{tag}</span>
                    ))}
                    {previewChar.tags.length > 10 && <span className={styles.modalTag}>+{previewChar.tags.length - 10} more</span>}
                  </div>

                  <div className={styles.modalDesc}>
                    <h4>Description</h4>
                    <p>{previewChar.description || previewChar.tagline || 'No description available.'}</p>
                    
                    <div style={{ marginTop: '24px', padding: '16px', background: 'var(--hub-bg)', borderRadius: '8px', border: '1px solid var(--hub-border)' }}>
                      <h4 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={14} style={{ color: 'var(--lumiverse-primary)' }}/>
                        Character Details
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--lumiverse-text-muted)', margin: 0 }}>
                        Detailed prompts, definitions, and lorebooks are securely embedded within the high-resolution character card. Install the character to view the full configuration in your Lumiverse instance.
                      </p>
                    </div>
                  </div>

                  <div className={styles.modalActions}>
                    <button className={styles.installBtn}>
                      <Download size={18} />
                      Install to Lumiverse
                    </button>
                    <a href={previewChar.pageUrl} target="_blank" rel="noreferrer" className={styles.viewSourceBtn}>
                      View on Chub.ai
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Characters;
