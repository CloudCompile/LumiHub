import type { CharacterSource } from '../../types/character';
import styles from './SourceToggle.module.css';

interface Props {
  value: CharacterSource;
  onChange: (source: CharacterSource) => void;
}

/** Segmented control for switching between LumiHub and other sources. */
const SourceToggle: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className={styles.container}>
      <button
        className={`${styles.option} ${value === 'lumihub' ? styles.active : ''}`}
        onClick={() => onChange('lumihub')}
      >
        LumiHub
      </button>
      <button
        className={`${styles.option} ${value === 'chub' ? styles.active : ''}`}
        onClick={() => onChange('chub')}
      >
        Chub
      </button>
    </div>
  );
};

export default SourceToggle;
