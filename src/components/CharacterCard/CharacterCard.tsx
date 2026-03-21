import type { UnifiedCharacterCard } from '../../types/character';
import { Star, Download, Eye } from 'lucide-react';
import { useState } from 'react';
import styles from './CharacterCard.module.css';

interface Props {
  card: UnifiedCharacterCard;
  blurNsfw?: boolean;
  onClick?: () => void;
}

/** Renders a single character card in the browse grid. */
const CharacterCard: React.FC<Props> = ({ card, blurNsfw = true, onClick }) => {
  const [revealed, setRevealed] = useState(false);
  const shouldBlur = card.nsfw && blurNsfw && !revealed;

  const handleReveal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealed((r) => !r);
  };

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.imageWrapper}>
        {card.avatarUrl ? (
          <img
            src={card.avatarUrl}
            alt={card.name}
            className={`${styles.image} ${shouldBlur ? styles.imageBlurred : ''}`}
            loading="lazy"
          />
        ) : (
          <div className={styles.placeholder}>{card.name.charAt(0)}</div>
        )}

        {shouldBlur && (
          <div className={styles.revealOverlay} onClick={handleReveal}>
            <Eye size={16} style={{ marginRight: '6px' }} />
            Click to Reveal
          </div>
        )}

        {card.rating && card.rating > 4.7 && (
          <div className={styles.badge}>Masterpiece</div>
        )}

        <div className={`${styles.sourceBadge} ${card.source === 'chub' ? styles.sourceBadgeChub : ''}`}>
          {card.source === 'lumihub' ? 'LumiHub' : 'Chub'}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.name} title={card.name}>{card.name}</h3>
          <p className={styles.author}>by {card.creator}</p>
        </div>

        <p className={styles.tagline}>{card.tagline || 'No description provided.'}</p>

        <div className={styles.footer}>
          <div className={styles.stats}>
            <div className={styles.stat} title="Downloads">
              <Download size={14} className={styles.statIcon} />
              {card.downloads > 1000 ? `${(card.downloads / 1000).toFixed(1)}k` : card.downloads}
            </div>
            {card.rating !== null && (
              <div className={styles.stat} title="Rating">
                <Star size={14} className={styles.statIcon} />
                {card.rating.toFixed(1)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;
