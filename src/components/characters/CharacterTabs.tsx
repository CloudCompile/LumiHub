import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, MessageSquare, Users, BookOpen, User } from 'lucide-react';
import type { UnifiedCharacterCard } from '../../types/character';
import type { ChubCharacterCard } from '../../types/chub';
import type { LumiHubCharacter } from '../../types/character';
import type { WorldBookEntry } from '../../types/worldbook';
import styles from './CharacterTabs.module.css';

type TabId = 'overview' | 'prompts' | 'greetings' | 'lorebook' | 'creator';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'prompts', label: 'Prompts', icon: MessageSquare },
  { id: 'greetings', label: 'Greetings', icon: Users },
  { id: 'lorebook', label: 'Lorebook', icon: BookOpen },
  { id: 'creator', label: 'Creator', icon: User },
];

function TextBlock({ label, content }: { label: string; content?: string | null }) {
  if (!content?.trim()) return null;
  return (
    <div className={styles.textBlock}>
      <h4 className={styles.textBlockLabel}>{label}</h4>
      <pre className={styles.textBlockContent}>{content}</pre>
    </div>
  );
}

interface CharacterTabsProps {
  card: UnifiedCharacterCard;
  /** Optional extra padding class for tab bar (e.g. modal needs horizontal padding) */
  tabBarClassName?: string;
  /** Optional extra padding class for tab content */
  tabContentClassName?: string;
}

const CharacterTabs: React.FC<CharacterTabsProps> = ({ card, tabBarClassName, tabContentClassName }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const isChub = card.source === 'chub';
  const chubData = isChub ? (card.raw as ChubCharacterCard) : null;
  const lumiData = !isChub ? (card.raw as LumiHubCharacter) : null;

  const description = lumiData?.description || chubData?.description || chubData?.tagline || '';
  const characterBook = lumiData?.character_book as { entries?: WorldBookEntry[] } | null | undefined;
  const lorebookEntries: WorldBookEntry[] = characterBook?.entries ?? [];

  return (
    <>
      <div className={`${styles.tabBar} ${tabBarClassName || ''}`}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={14} />
            <span>{tab.label}</span>
            {tab.id === 'lorebook' && lorebookEntries.length > 0 && (
              <span className={styles.tabBadge}>{lorebookEntries.length}</span>
            )}
            {tab.id === 'greetings' && lumiData?.alternate_greetings && lumiData.alternate_greetings.length > 0 && (
              <span className={styles.tabBadge}>{lumiData.alternate_greetings.length + 1}</span>
            )}
          </button>
        ))}
      </div>

      <div className={`${styles.tabContent} ${tabContentClassName || ''}`}>
        {activeTab === 'overview' && (
          <div>
            {description ? (
              <pre className={styles.descriptionText}>{description}</pre>
            ) : (
              <p className={styles.emptyText}>No description provided.</p>
            )}
          </div>
        )}

        {activeTab === 'prompts' && (
          <div className={styles.promptsGrid}>
            {isChub ? (
              <p className={styles.emptyText}>Install this character to view full prompt data.</p>
            ) : (
              <>
                <TextBlock label="Personality" content={lumiData?.personality} />
                <TextBlock label="Scenario" content={lumiData?.scenario} />
                <TextBlock label="System Prompt" content={lumiData?.system_prompt} />
                <TextBlock label="Post-History Instructions" content={lumiData?.post_history_instructions} />
                <TextBlock label="Message Examples" content={lumiData?.mes_example} />
                {!lumiData?.personality && !lumiData?.scenario && !lumiData?.system_prompt && !lumiData?.post_history_instructions && !lumiData?.mes_example && (
                  <p className={styles.emptyText}>No prompt data defined for this character.</p>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'greetings' && (
          <div className={styles.greetingsList}>
            {isChub ? (
              <p className={styles.emptyText}>Install this character to view greetings.</p>
            ) : (
              <>
                {lumiData?.first_mes && (
                  <div className={styles.greetingCard}>
                    <div className={styles.greetingHeader}>
                      <span className={styles.greetingLabel}>First Message</span>
                      <span className={styles.greetingBadge}>Default</span>
                    </div>
                    <pre className={styles.greetingContent}>{lumiData.first_mes}</pre>
                  </div>
                )}
                {lumiData?.alternate_greetings?.map((greeting, i) => (
                  <div key={i} className={styles.greetingCard}>
                    <div className={styles.greetingHeader}>
                      <span className={styles.greetingLabel}>Alternate Greeting {i + 1}</span>
                    </div>
                    <pre className={styles.greetingContent}>{greeting}</pre>
                  </div>
                ))}
                {!lumiData?.first_mes && (!lumiData?.alternate_greetings || lumiData.alternate_greetings.length === 0) && (
                  <p className={styles.emptyText}>No greetings defined for this character.</p>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'lorebook' && (
          <div className={styles.lorebookList}>
            {lorebookEntries.length > 0 ? (
              lorebookEntries.map((entry, i) => (
                <div key={i} className={styles.loreEntry}>
                  <div className={styles.loreEntryHeader}>
                    <span className={styles.loreEntryName}>{entry.name || entry.comment || `Entry ${i + 1}`}</span>
                    <div className={styles.loreEntryMeta}>
                      {!entry.enabled && <span className={styles.loreDisabled}>Disabled</span>}
                      <span className={styles.lorePriority}>P{entry.priority ?? 0}</span>
                    </div>
                  </div>
                  {entry.keys.length > 0 && (
                    <div className={styles.loreKeys}>
                      {entry.keys.map((key, ki) => (
                        <span key={ki} className={styles.loreKey}>{key}</span>
                      ))}
                    </div>
                  )}
                  <pre className={styles.loreContent}>{entry.content}</pre>
                </div>
              ))
            ) : (
              <p className={styles.emptyText}>
                {isChub ? 'Install this character to view embedded lorebook data.' : 'No embedded lorebook for this character.'}
              </p>
            )}
          </div>
        )}

        {activeTab === 'creator' && (
          <div className={styles.creatorTab}>
            <div className={styles.creatorHeader}>
              <div className={styles.creatorAvatar}>
                {lumiData?.owner?.avatar ? (
                  <img src={lumiData.owner.avatar} alt={card.creator} />
                ) : (
                  <User size={32} />
                )}
              </div>
              <div className={styles.creatorMain}>
                <h3 className={styles.creatorName}>{card.creator}</h3>
                <p className={styles.creatorSubtitle}>
                  {lumiData?.owner ? 'Verified Creator' : 'Guest Contributor'}
                </p>
              </div>
              {card.creatorDiscordId && (
                <Link to={`/user/${card.creatorDiscordId}`} className={styles.viewProfileBtn}>
                  View Profile
                </Link>
              )}
            </div>

            <div className={styles.creatorMeta}>
              <TextBlock label="Creator Notes" content={lumiData?.creator_notes || (isChub ? 'Not available from Chub API.' : 'No notes provided.')} />
              {lumiData?.character_version && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Version</span>
                  <span className={styles.metaValue}>{lumiData.character_version}</span>
                </div>
              )}
              {card.createdAt && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Uploaded</span>
                  <span className={styles.metaValue}>{new Date(card.createdAt).toLocaleDateString()}</span>
                </div>
              )}
              {lumiData?.creation_date && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Created</span>
                  <span className={styles.metaValue}>{new Date(lumiData.creation_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CharacterTabs;
