import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import type { UnifiedCharacterCard } from '../types/character';
import type { UnifiedWorldBook } from '../types/worldbook';

export interface ManifestEntry {
  slug: string;
  type: 'character' | 'worldbook';
  name: string;
  creator: string;
  source: string;
  installed_at: number | null;
}

interface ManifestResponse {
  entries: ManifestEntry[];
  instance_id: string | null;
}

/** Slugify a string: lowercase, replace non-alphanumeric with hyphens, collapse. */
function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Build a `creator/name` slug from a character card. */
export function getCardSlug(card: UnifiedCharacterCard): string {
  if (card.source === 'chub') {
    // Chub cards already use creator/slug format as their ID
    return card.id.toLowerCase();
  }
  const creator = slugify(card.creator || 'unknown');
  const name = slugify(card.name || 'unnamed');
  return `${creator}/${name}`;
}

/** Build a `creator/name` slug from a world book. */
export function getWorldBookSlug(book: UnifiedWorldBook): string {
  if (book.source === 'chub') {
    return book.id.toLowerCase();
  }
  const creator = slugify(book.creator || 'unknown');
  const name = slugify(book.name || 'unnamed');
  return `${creator}/${name}`;
}

// ── Dismissed guess tracking ──────────────────────────────────────────

const DISMISSED_KEY = 'lumihub:dismissed-install-guesses';

function getDismissedGuesses(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

/** Persist a dismissed guess so the user won't see it again. */
export function dismissInstallGuess(slug: string): void {
  const set = getDismissedGuesses();
  set.add(slug);
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...set]));
}

// ── Fetching ──────────────────────────────────────────────────────────

async function fetchManifest(): Promise<ManifestResponse> {
  const res = await fetch('/api/v1/link/manifest', { credentials: 'include' });
  if (!res.ok) return { entries: [], instance_id: null };
  return res.json();
}

/** Fetch the full install manifest for the user's linked instance. */
export function useInstallManifest() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['link', 'manifest'],
    queryFn: fetchManifest,
    enabled: isAuthenticated,
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60,
  });
}

/** Check if a specific character card is installed on the user's Lumiverse instance. */
export function useIsInstalled(card?: UnifiedCharacterCard): { isInstalled: boolean; isGuess: boolean; entry: ManifestEntry | null } {
  const { data } = useInstallManifest();
  if (!card || !data?.entries.length) return { isInstalled: false, isGuess: false, entry: null };

  const slug = getCardSlug(card);
  const entry = data.entries.find((e) => e.slug === slug && e.type === 'character') ?? null;
  if (entry) return { isInstalled: true, isGuess: false, entry };

  // Fallback: older Lumiverse installs may have a derived slug instead of the Chub fullPath
  if (card.source === 'chub') {
    const derived = `${slugify(card.creator || 'unknown')}/${slugify(card.name || 'unnamed')}`;
    if (derived !== slug) {
      const guessEntry = data.entries.find((e) => e.slug === derived && e.type === 'character') ?? null;
      if (guessEntry && !getDismissedGuesses().has(slug)) {
        return { isInstalled: true, isGuess: true, entry: guessEntry };
      }
    }
  }

  return { isInstalled: false, isGuess: false, entry: null };
}

/** Check if a specific world book is installed on the user's Lumiverse instance. */
export function useIsWorldBookInstalled(book?: UnifiedWorldBook): { isInstalled: boolean; isGuess: boolean; entry: ManifestEntry | null } {
  const { data } = useInstallManifest();
  if (!book || !data?.entries.length) return { isInstalled: false, isGuess: false, entry: null };

  const slug = getWorldBookSlug(book);
  const entry = data.entries.find((e) => e.slug === slug && e.type === 'worldbook') ?? null;
  if (entry) return { isInstalled: true, isGuess: false, entry };

  // Fallback: older Lumiverse installs may have a derived slug instead of the Chub fullPath
  if (book.source === 'chub') {
    const derived = `${slugify(book.creator || 'unknown')}/${slugify(book.name || 'unnamed')}`;
    if (derived !== slug) {
      const guessEntry = data.entries.find((e) => e.slug === derived && e.type === 'worldbook') ?? null;
      if (guessEntry && !getDismissedGuesses().has(slug)) {
        return { isInstalled: true, isGuess: true, entry: guessEntry };
      }
    }
  }

  return { isInstalled: false, isGuess: false, entry: null };
}
