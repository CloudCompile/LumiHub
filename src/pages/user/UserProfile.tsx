import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Calendar, Shield, LayoutGrid, Users, Settings, Palette } from 'lucide-react';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useCharacters } from '../../hooks/useCharacters';
import CharacterCard from '../../components/characters/CharacterCard';
import styles from './UserProfile.module.css';

type FilterTab = 'characters' | 'worldbooks' | 'presets' | 'themes';

const TABS: { id: FilterTab; label: string; icon: React.ElementType }[] = [
  { id: 'characters', label: 'Characters', icon: Users },
  { id: 'worldbooks', label: 'Worldbooks', icon: LayoutGrid },
  { id: 'themes', label: 'Themes', icon: Palette },
  { id: 'presets', label: 'Presets', icon: Settings },
];

const UserProfile = () => {
  const { discordId } = useParams<{ discordId: string }>();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading, error: profileError } = useUserProfile(discordId || '');
  const [activeTab, setActiveTab] = useState<FilterTab>('characters');

  const { characters, loading: charactersLoading } = useCharacters({
    ownerId: profile?.id,
    ignoreStore: true,
    enabled: !!profile?.id,
  });

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

  const totalDownloads = characters.reduce((sum, c) => sum + c.downloads, 0);
  const formatCount = (n: number) => n > 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  return (
    <div className={styles.pageWrapper}>
      {/* banner */}
      <div className={styles.banner}>
        {profile.banner ? (
          <img src={profile.banner} alt="" className={styles.bannerImage} />
        ) : (
          <div className={styles.bannerFallback} />
        )}
        <div className={styles.bannerOverlay} />
      </div>

      {/* header */}
      <div className={styles.profileHeader}>
        <div className={styles.avatarWrapper}>
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.displayName || profile.username} className={styles.avatar} />
          ) : (
            <div className={styles.avatarFallback}>
              {(profile.displayName || profile.username).charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className={styles.identity}>
          <div className={styles.nameRow}>
            <h1 className={styles.displayName}>{profile.displayName || profile.username}</h1>
            {profile.role && profile.role !== 'user' && (
              <div className={styles.roleBadge}>
                <Shield size={11} />
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </div>
            )}
          </div>
          <p className={styles.meta}>
            @{profile.username}
            <span className={styles.metaDot}>&middot;</span>
            {formatCount(characters.length)} uploads
            <span className={styles.metaDot}>&middot;</span>
            {formatCount(totalDownloads)} downloads
            <span className={styles.metaDot}>&middot;</span>
            <Calendar size={12} />
            Joined {new Date(profile.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* tab bar */}
      <div className={styles.tabBarWrapper}>
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
      <div className={styles.content}>
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
            <p>Generation presets will appear here.</p>
          </div>
        )}
        {activeTab === 'themes' && (
          <div className={styles.emptyState}>
            <Palette size={40} opacity={0.4} />
            <h3>No Themes Yet</h3>
            <p>UI themes and color palettes will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
