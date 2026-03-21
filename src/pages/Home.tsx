import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Book, Palette, Sparkles, ArrowRight, Download, Plug, Plus } from 'lucide-react';
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
  const navigate = useNavigate();
  const [lumiaLoaded, setLumiaLoaded] = useState(false);

  return (
    <div className={styles.container}>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            The <span className={styles.highlight}>Lumiverse</span> Hub
          </h1>
          <p className={styles.subtitle}>
            Browse, share, and upload characters, worldbooks, and themes.
            Build your library directly from the community.
          </p>
          <div className={styles.heroActions}>
            <Link to="/characters" className={styles.primaryAction}>
              Browse Characters
            </Link>
            <button className={styles.secondaryAction} onClick={() => navigate('/characters')}>
              <Plus size={16} />
              Upload a Character
            </button>
          </div>
        </div>
        <div className={styles.heroImageWrapper}>
          <img
            src={randomLumia}
            alt="Lumia"
            className={`${styles.heroImage} ${lumiaLoaded ? styles.heroImageVisible : ''}`}
            onLoad={() => setLumiaLoaded(true)}
            draggable={false}
          />
        </div>
      </section>

      {/* Categories */}
      <section className={styles.categories}>
        <Link to="/characters" className={styles.categoryCard}>
          <div className={styles.categoryIcon}>
            <Users size={20} />
          </div>
          <div className={styles.categoryInfo}>
            <h3 className={styles.categoryTitle}>Characters</h3>
            <p className={styles.categoryDesc}>Cards shared by the community</p>
          </div>
          <ArrowRight className={styles.categoryArrow} size={18} />
        </Link>

        <Link to="/worldbooks" className={styles.categoryCard}>
          <div className={styles.categoryIcon}>
            <Book size={20} />
          </div>
          <div className={styles.categoryInfo}>
            <h3 className={styles.categoryTitle}>Worldbooks</h3>
            <p className={styles.categoryDesc}>Lore and world-building entries</p>
          </div>
          <ArrowRight className={styles.categoryArrow} size={18} />
        </Link>

        <Link to="/themes" className={styles.categoryCard}>
          <div className={styles.categoryIcon}>
            <Palette size={20} />
          </div>
          <div className={styles.categoryInfo}>
            <h3 className={styles.categoryTitle}>Themes</h3>
            <p className={styles.categoryDesc}>Custom looks for your instance</p>
          </div>
          <ArrowRight className={styles.categoryArrow} size={18} />
        </Link>

        <div className={styles.categoryCard} aria-disabled="true">
          <div className={styles.categoryIcon}>
            <Sparkles size={20} />
          </div>
          <div className={styles.categoryInfo}>
            <h3 className={styles.categoryTitle}>Presets</h3>
            <p className={styles.categoryDesc}>Coming soon</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>How it works</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepHeader}>
              <div className={styles.stepIcon}>
                <Plug size={20} />
              </div>
              <span className={styles.stepNumber}>Step 1</span>
            </div>
            <div className={styles.stepBody}>
              <h3 className={styles.stepTitle}>Install Hub Connector</h3>
              <p className={styles.stepDesc}>
                Add the Hub Connector Spindle extension to your local Lumiverse instance.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepHeader}>
              <div className={styles.stepIcon}>
                <Users size={20} />
              </div>
              <span className={styles.stepNumber}>Step 2</span>
            </div>
            <div className={styles.stepBody}>
              <h3 className={styles.stepTitle}>Find something you like</h3>
              <p className={styles.stepDesc}>
                Browse characters, worldbooks, and themes uploaded by the community.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepHeader}>
              <div className={styles.stepIcon}>
                <Download size={20} />
              </div>
              <span className={styles.stepNumber}>Step 3</span>
            </div>
            <div className={styles.stepBody}>
              <h3 className={styles.stepTitle}>Click Install</h3>
              <p className={styles.stepDesc}>
                The asset is fetched and saved into your local database. No file management needed.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
