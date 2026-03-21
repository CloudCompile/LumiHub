import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Book, Palette, Sparkles, ArrowRight, Plug, Zap, Shield } from 'lucide-react';
import styles from './Home.module.css';

const LUMIA_IMAGES = [
  '/lumias/row-1-column-1.png',
  '/lumias/row-1-column-2.png',
  '/lumias/row-1-column-3.png',
  '/lumias/row-2-column-1.png',
  '/lumias/row-2-column-2.png',
  '/lumias/row-2-column-3.png',
  '/lumias/row-3-column-1.png',
  '/lumias/row-3-column-2.png',
  '/lumias/row-3-column-3.png',
];

const randomLumia = LUMIA_IMAGES[Math.floor(Math.random() * LUMIA_IMAGES.length)];

const Home = () => {
  const [lumiaLoaded, setLumiaLoaded] = useState(false);

  return (
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>
            Community hub for{' '}
            <span className={styles.heroAccent}>Lumiverse</span>
          </h1>
          <p className={styles.heroSub}>
            Discover and install characters, worldbooks, themes, and presets
            shared by the community — directly into your local Lumiverse instance.
          </p>
          <div className={styles.heroCtas}>
            <Link to="/characters" className={styles.ctaPrimary}>
              Browse Characters
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div className={styles.heroArt}>
          <img
            src={randomLumia}
            alt="Lumia mascot"
            className={`${styles.heroImg} ${lumiaLoaded ? styles.heroImgVisible : ''}`}
            onLoad={() => setLumiaLoaded(true)}
            draggable={false}
          />
        </div>
      </section>

      <hr className={styles.sectionDivider} />

      {/* Asset Categories */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Browse by type</h2>
        <div className={styles.categoryGrid}>
          <Link to="/characters" className={styles.categoryCard}>
            <div className={styles.categoryIconWrap}>
              <Users size={22} />
            </div>
            <div className={styles.categoryBody}>
              <h3>Characters</h3>
              <p>Character cards shared by the community.</p>
            </div>
            <ArrowRight size={16} className={styles.categoryArrow} />
          </Link>

          <Link to="/worldbooks" className={styles.categoryCard}>
            <div className={styles.categoryIconWrap}>
              <Book size={22} />
            </div>
            <div className={styles.categoryBody}>
              <h3>Worldbooks</h3>
              <p>Lore and world-building entries that enrich your conversations with contextual knowledge.</p>
            </div>
            <ArrowRight size={16} className={styles.categoryArrow} />
          </Link>

          <Link to="/themes" className={styles.categoryCard}>
            <div className={styles.categoryIconWrap}>
              <Palette size={22} />
            </div>
            <div className={styles.categoryBody}>
              <h3>Themes</h3>
              <p>Custom color schemes and visual styles for your Lumiverse instance.</p>
            </div>
            <ArrowRight size={16} className={styles.categoryArrow} />
          </Link>

          <div className={`${styles.categoryCard} ${styles.categoryDisabled}`}>
            <div className={styles.categoryIconWrap}>
              <Sparkles size={22} />
            </div>
            <div className={styles.categoryBody}>
              <h3>Presets</h3>
              <p>Curated prompt presets and generation configurations. Coming soon.</p>
            </div>
          </div>
        </div>
      </section>

      <hr className={styles.sectionDivider} />

      {/* Hub Connector Feature Section */}
      <section className={styles.section}>
        <div className={styles.connectorBlock}>
          <div className={styles.connectorHeader}>
            <div className={styles.connectorBadge}>
              <Plug size={14} />
              Hub Connector
            </div>
            <h2 className={styles.connectorTitle}>One-click install</h2>
            <p className={styles.connectorDesc}>
              With the Hub Connector extension installed in your Lumiverse instance, 
              you can install any asset from LumiHub directly. 
              No downloading files, no moving folders — just browse, click install, done.
            </p>
          </div>

          <div className={styles.connectorFeatures}>
            <div className={styles.connectorFeature}>
              <div className={styles.connectorFeatureIcon}>
                <Zap size={18} />
              </div>
              <div>
                <h4>Instant delivery</h4>
                <p>Assets are fetched from LumiHub's servers and saved directly into your local database via a secure WebSocket connection.</p>
              </div>
            </div>
            <div className={styles.connectorFeature}>
              <div className={styles.connectorFeatureIcon}>
                <Shield size={18} />
              </div>
              <div>
                <h4>Secure by design</h4>
                <p>The extension runs inside Lumiverse's Spindle permission system — it can only write to approved locations and endpoints.</p>
              </div>
            </div>
            <div className={styles.connectorFeature}>
              <div className={styles.connectorFeatureIcon}>
                <Plug size={18} />
              </div>
              <div>
                <h4>Easy setup</h4>
                <p>Install the Hub Connector extension from Lumiverse's extension manager. That's it — LumiHub will detect the connection automatically.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
