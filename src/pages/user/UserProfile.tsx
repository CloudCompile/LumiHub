import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Shield, LayoutGrid, Users, Settings, Palette, Edit3 } from 'lucide-react';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useCharacters } from '../../hooks/useCharacters';
import { useAuth } from '../../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import CharacterCard from '../../components/characters/CharacterCard';
import LazyImage from '../../components/shared/LazyImage';
import CSSProfileEditor from './CSSProfileEditor';
import styles from './UserProfile.module.css';

type FilterTab = 'characters' | 'worldbooks' | 'presets' | 'themes';

const TABS: { id: FilterTab; label: string; icon: React.ElementType }[] = [
  { id: 'characters', label: 'Characters', icon: Users },
  { id: 'worldbooks', label: 'Worldbooks', icon: LayoutGrid },
  { id: 'themes', label: 'Themes', icon: Palette },
  { id: 'presets', label: 'Presets', icon: Settings },
];

interface UserProfileProps {
  previewMode?: boolean;
  previewDiscordId?: string;
}

const UserProfile = ({ previewMode = false, previewDiscordId }: UserProfileProps) => {
  const { discordId: routeDiscordId } = useParams<{ discordId: string }>();
  const discordId = previewMode ? previewDiscordId : routeDiscordId;
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: profile, isLoading: profileLoading, error: profileError } = useUserProfile(discordId || '');
  const [activeTab, setActiveTab] = useState<FilterTab>('characters');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeCss, setActiveCss] = useState<string>('');

  const { characters, loading: charactersLoading } = useCharacters({
    ownerId: profile?.id,
    ignoreStore: true,
    enabled: !!profile?.id,
  });

  useEffect(() => {
    if (isEditorOpen && profile) {
      setActiveCss(profile.customCss || '');
    }
  }, [isEditorOpen, profile]);

  const scopedCss = useMemo(() => {
    const rawCss = isEditorOpen ? activeCss : (profile?.customCss || '');
    if (!rawCss) return '';
    
    let safe = rawCss;
    safe = safe.replace(/expression\s*\(/gi, '');
    safe = safe.replace(/url\s*\(\s*['"]?javascript:/gi, 'url(');
    safe = safe.replace(/behavior\s*:/gi, 'blocked:');
    safe = safe.replace(/-moz-binding\s*:/gi, 'blocked:');
    
    const rules = safe.split('}').filter(r => r.trim().length > 0);
    const scopedRules = rules.map(rule => {
        const trimmed = rule.trim();
        if (trimmed.startsWith('@')) return rule + '}';
        const parts = rule.split('{');
        if (parts.length !== 2) return rule + '}'; // Malformed
        const selectors = parts[0].split(',').map(s => {
            const trimmedSel = s.trim();
            if (!trimmedSel) return '';
            if (trimmedSel === ':root' || trimmedSel === 'body' || trimmedSel === 'html') {
                return '#lumihub-user-profile';
            }
            if (trimmedSel.startsWith('#lumihub-user-profile')) return trimmedSel;
            return `#lumihub-user-profile ${trimmedSel}`;
        });
        return `${selectors.filter(Boolean).join(', ')} {${parts[1]}}`;
    });

    return scopedRules.join('\n');
  }, [profile?.customCss, activeCss, isEditorOpen]);

  if (profileLoading) {
    return <div className={styles.loadingState}>Loading profile...</div>;
  }

  if (profileError || !profile) {
    return (
      <div className={styles.notFoundState}>
        <User size={64} opacity={0.5} />
        <h1>User Not Found</h1>
        <p>This profile does not exist or has been removed.</p>
      </div>
    );
  }

  const isOwner = user?.discordId === profile.discordId;
  const totalDownloads = characters.reduce((sum, c) => sum + c.downloads, 0);
  const formatCount = (n: number) => n > 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  return (
    <div 
      id="lumihub-user-profile" 
      className={clsx(styles.pageWrapper, isEditorOpen && styles.editorOpen)}
    >
      {scopedCss && <style>{scopedCss}</style>}

      <div className={styles.profileContainer}>
        {/* banner */}
        <div className={`${styles.banner} profile-banner`}>
          {profile.banner ? (
            <LazyImage src={profile.banner} alt="" className={styles.bannerImage} />
          ) : (
            <div className={styles.bannerFallback} />
          )}
          <div className={styles.bannerOverlay} />
        </div>

        {/* header */}
        <div className={`${styles.profileHeader} profile-header`}>
          <div className={`${styles.avatarWrapper} profile-avatar`}>
            {profile.avatar ? (
              <LazyImage src={profile.avatar} alt={profile.displayName || profile.username} className={styles.avatar} />
            ) : (
              <div className={styles.avatarFallback}>
                {(profile.displayName || profile.username).charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className={`${styles.identity} profile-identity`}>
            <div className={`${styles.nameRow} profile-name-row`}>
              <h1 className={`${styles.displayName} profile-name`}>{profile.displayName || profile.username}</h1>
              {profile.role && profile.role !== 'user' && (
                <div className={`${styles.roleBadge} profile-role`}>
                  <Shield size={11} />
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </div>
              )}
            </div>
            <p className={`${styles.handle} profile-handle`}>@{profile.username}</p>
          </div>

          {isOwner && !previewMode && !isEditorOpen && (
            <div className={`${styles.ownerActions} profile-actions`}>
              <button className={styles.editThemeBtn} onClick={() => setIsEditorOpen(true)}>
                <Edit3 size={16} /> Edit Theme
              </button>
            </div>
          )}
        </div>

        {/* stats */}
        <div className={`${styles.statsRow} profile-stats`}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{formatCount(characters.length)}</span>
            <span className={styles.statLabel}>Uploads</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>{formatCount(totalDownloads)}</span>
            <span className={styles.statLabel}>Downloads</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className={styles.statLabel}>Joined</span>
          </div>
        </div>

        {/* tab bar */}
        <div className={`${styles.tabBarWrapper} profile-tabs`}>
          <div className={styles.tabBar}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className={`${styles.content} profile-content`}>
          {activeTab === 'characters' && (
            <>
              {charactersLoading ? (
                <div className={styles.gridLoading}>Loading characters...</div>
              ) : characters.length > 0 ? (
                <div className={styles.assetGrid}>
                  {characters.map((card) => (
                    <CharacterCard
                      key={card.id}
                      card={card}
                      onClick={() => navigate(`/characters/${encodeURIComponent(card.id)}`, { state: { card } })}
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <Users size={40} opacity={0.4} />
                  <h3>No Characters Yet</h3>
                  <p>This user hasn't uploaded any public characters.</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'worldbooks' && (
            <div className={styles.emptyState}>
              <LayoutGrid size={40} opacity={0.4} />
              <h3>No Worldbooks Yet</h3>
              <p>This user hasn't published any worldbooks.</p>
            </div>
          )}
          {activeTab === 'presets' && (
            <div className={styles.emptyState}>
              <Settings size={40} opacity={0.4} />
              <h3>No Presets Yet</h3>
              <p>When preset sharing launches, this creator's published generation settings will appear here.</p>
            </div>
          )}
          {activeTab === 'themes' && (
            <div className={styles.emptyState}>
              <Palette size={40} opacity={0.4} />
              <h3>No Themes Yet</h3>
              <p>When theme support launches, this creator's custom color palettes and UI themes will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {isEditorOpen && (
        <CSSProfileEditor 
          currentCss={activeCss} 
          onChange={setActiveCss}
          onClose={(saved) => {
            setIsEditorOpen(false);
            if (saved) {
               queryClient.invalidateQueries({ queryKey: ['user-profile', discordId] });
            }
          }} 
        />
      )}
    </div>
  );
};

export default UserProfile;
