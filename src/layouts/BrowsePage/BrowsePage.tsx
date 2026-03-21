import React from 'react';
import { Search, X, SlidersHorizontal, ChevronDown, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import styles from './BrowsePage.module.css';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
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
        {/* Title + Search row */}
        <div className={styles.topBar}>
          <h1 className={styles.pageTitle}>{title}</h1>

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

        {error && (
          <div className={styles.errorBanner}>{error}</div>
        )}

        {/* Result info */}
        {!loading && itemsCount > 0 && (
          <div className={styles.resultInfo}>
            Showing {itemsCount} of {pagination.total} results
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

        {/* Load More */}
        {!loading && pagination.totalPages > 1 && pagination.page < pagination.totalPages && (
          <div className={styles.loadMoreWrap}>
            <button
              className={styles.loadMoreBtn}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              Load More
              <ChevronDown size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
