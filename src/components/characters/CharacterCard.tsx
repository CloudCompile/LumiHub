import type { UnifiedCharacterCard } from '../../types/character';
import { Star, Download, Eye } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './CharacterCard.module.css';

interface Props {
  card: UnifiedCharacterCard;
  blurNsfw?: boolean;
  onClick?: () => void;
}

/** Renders a single character tile in the browse grid. */
const CharacterCard: React.FC<Props> = ({ card, blurNsfw = true, onClick }) => {
  const [revealed, setRevealed] = useState(false);
  const shouldBlur = card.nsfw && blurNsfw && !revealed;

  const handleReveal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealed((r) => !r);
  };

  const formattedDownloads =
    card.downloads > 1000
      ? `${(card.downloads / 1000).toFixed(1)}k`
      : String(card.downloads);

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.imageArea}>
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

        {/* NSFW reveal overlay */}
        {shouldBlur && (
          <div className={styles.revealOverlay} onClick={handleReveal}>
            <Eye size={16} />
            <span>Reveal</span>
          </div>
        )}

        {/* Source badge */}
        <div className={`${styles.sourceBadge} ${card.source === 'chub' ? styles.sourceBadgeChub : ''}`}>
          {card.source === 'lumihub' ? 'LumiHub' : 'Chub'}
        </div>

        {/* Rating badge */}
        {card.rating !== null && card.rating > 4.5 && (
          <div className={styles.ratingBadge}>
            <Star size={10} />
            {card.rating.toFixed(1)}
          </div>
        )}

        {/* Gradient with overlaid text */}
        <div className={styles.scrim}>
          <h3 className={styles.name}>{card.name}</h3>
          <div className={styles.meta}>
            <span className={styles.creator}>
              by {card.creatorDiscordId ? (
                <Link
                  to={`/user/${card.creatorDiscordId}`}
                  className={styles.creatorLink}
                  onClick={(e) => e.stopPropagation()}
                >
                  {card.creator}
                </Link>
              ) : (
                card.creator
              )}
            </span>
            <span className={styles.downloads}>
              <Download size={11} />
              {formattedDownloads}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;
