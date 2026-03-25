import React, { useRef, useEffect } from 'react';
import { Search, X, SlidersHorizontal, Sparkles, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import styles from './BrowsePage.module.css';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange?: (page: number) => void;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  loadingMore?: boolean;
}

interface BrowsePageProps {
  title: string;
  sidebar: React.ReactNode;
  headerActions?: React.ReactNode;
  search: string;
  onSearchChange: (search: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onClearSearch: () => void;
  searchPlaceholder?: string;
  children: React.ReactNode;
  loading: boolean;
  error: string | null;
  itemsCount: number;
  pagination: PaginationProps;
  emptyStateTitle?: string;
  emptyStateDesc?: string;
  mobileFiltersOpen: boolean;
  onToggleMobileFilters: () => void;
  SkeletonGrid: React.ComponentType;
}

const BrowsePage: React.FC<BrowsePageProps> = ({
  title,
  sidebar,
  headerActions,
  search,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  searchPlaceholder = 'Search...',
  children,
  loading,
  error,
  itemsCount,
  pagination,
  emptyStateTitle = 'No results found',
  emptyStateDesc = 'Try adjusting your search or filters.',
  mobileFiltersOpen,
  onToggleMobileFilters,
  SkeletonGrid,
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    if (!pagination.hasNextPage || pagination.loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          pagination.fetchNextPage?.();
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pagination.hasNextPage, pagination.loadingMore, pagination.fetchNextPage]);

  return (
    <div className={styles.page}>
      {/* Mobile Backdrop */}
      {mobileFiltersOpen && (
        <div className={styles.sidebarBackdrop} onClick={onToggleMobileFilters} />
      )}

      {/* Sidebar */}
      <aside className={clsx(styles.sidebar, mobileFiltersOpen && styles.sidebarOpen)}>
        <div className={styles.mobileSidebarHeader}>
          <h3>Filters</h3>
          <button onClick={onToggleMobileFilters} className={styles.mobileCloseBtn}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.sidebarContent}>
          {sidebar}
        </div>
      </aside>

      {/* Content Area */}
      <div className={styles.content}>
        {/* Search + Title row */}
        <div className={styles.topBar}>
          <form onSubmit={onSearchSubmit} className={styles.searchForm}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className={styles.searchInput}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {search && (
              <button type="button" className={styles.searchClear} onClick={onClearSearch}>
                <X size={14} />
              </button>
            )}
          </form>

          <div className={styles.topBarRow}>
            <h1 className={styles.pageTitle}>{title}</h1>

            {headerActions && (
              <div className={styles.headerActions}>
                {headerActions}
              </div>
            )}

            <button className={styles.mobileFilterBtn} onClick={onToggleMobileFilters}>
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>
        </div>

        {error && (
          <div className={styles.errorBanner}>{error}</div>
        )}

        {/* Result info */}
        {!loading && itemsCount > 0 && (
          <div className={styles.resultInfo}>
            {pagination.total > 0
              ? `Showing ${itemsCount} of ${pagination.total} results`
              : `Showing ${itemsCount} results`}
          </div>
        )}

        {/* Grid */}
        <div className={styles.grid}>
          {loading && itemsCount === 0 ? (
            <SkeletonGrid />
          ) : itemsCount > 0 ? (
            children
          ) : (
            <div className={styles.emptyState}>
              <Sparkles size={28} />
              <h3>{emptyStateTitle}</h3>
              <p>{emptyStateDesc}</p>
            </div>
          )}
        </div>

        {/* Infinite scroll sentinel */}
        {!loading && pagination.hasNextPage && (
          <div ref={sentinelRef} className={styles.sentinelWrap}>
            {pagination.loadingMore && (
              <Loader2 size={24} className={styles.spinner} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
