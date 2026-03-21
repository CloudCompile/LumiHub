import React from 'react';
import { motion } from 'motion/react';
import { X, Download, Star, Users, Sparkles, ExternalLink } from 'lucide-react';
import type { UnifiedCharacterCard } from '../../types/character';
import type { ChubCharacterCard } from '../../types/chub';
import type { LumiHubCharacter } from '../../types/character';
import { downloadCharacter } from '../../api/characters';
import styles from './CharacterModal.module.css';

interface Props {
  card: UnifiedCharacterCard;
  onClose: () => void;
}

/** Displays full character details with source-specific actions. */
const CharacterModal: React.FC<Props> = ({ card, onClose }) => {
  const isChub = card.source === 'chub';
  const chubData = isChub ? (card.raw as ChubCharacterCard) : null;
  const lumiData = !isChub ? (card.raw as LumiHubCharacter) : null;

  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const description =
    lumiData?.description ||
    chubData?.description ||
    chubData?.tagline ||
    'No description available.';

  const handleDownload = async () => {
    if (!isChub && lumiData) {
      try {
        await downloadCharacter(lumiData.id);
      } catch (err) {
        console.error('Download failed:', err);
      }
    }
  };

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modal}
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>

        <div className={styles.layout}>
          <div className={styles.imageCol}>
            {card.avatarUrl ? (
              <img src={card.avatarUrl} alt={card.name} className={styles.image} />
            ) : (
              <div className={styles.imagePlaceholder}>
                {card.name.charAt(0)}
              </div>
            )}
          </div>

          <div className={styles.infoCol}>
            <h2 className={styles.name}>{card.name}</h2>
            <p className={styles.author}>by {card.creator}</p>

            <div className={styles.statsRow}>
              <div className={styles.stat}>
                <Download size={16} />
                {card.downloads} downloads
              </div>
              {card.rating !== null && (
                <div className={styles.stat}>
                  <Star size={16} />
                  {card.rating.toFixed(1)} rating
                </div>
              )}
              {isChub && chubData?.interactions !== undefined && (
                <div className={styles.stat}>
                  <Users size={16} />
                  {chubData.interactions} chats
                </div>
              )}
            </div>

            {card.tags.length > 0 && (
              <div className={styles.tags}>
                {card.tags.slice(0, 12).map((tag, i) => (
                  <span key={i} className={styles.tag}>{tag}</span>
                ))}
                {card.tags.length > 12 && (
                  <span className={styles.tag}>+{card.tags.length - 12} more</span>
                )}
              </div>
            )}

            <div className={styles.description}>
              <h4>Description</h4>
              <p>{description}</p>

              <div className={styles.detailBox}>
                <h4>
                  <Sparkles size={14} style={{ color: 'var(--lumiverse-primary)' }} />
                  Character Details
                </h4>
                <p>
                  {isChub
                    ? 'Detailed prompts, definitions, and lorebooks are embedded within the character card. Install to view the full configuration.'
                    : 'Full character data including prompts, greetings, and lorebooks are stored on your LumiHub instance.'}
                </p>
              </div>
            </div>

            <div className={styles.actions}>
              {isChub ? (
                <>
                  <button className={styles.primaryBtn}>
                    <Download size={18} />
                    Install to Lumiverse
                  </button>
                  <a
                    href={chubData?.pageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.secondaryBtn}
                  >
                    <ExternalLink size={16} />
                    View on Chub.ai
                  </a>
                </>
              ) : (
                <button className={styles.primaryBtn} onClick={handleDownload}>
                  <Download size={18} />
                  Download Character
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CharacterModal;
