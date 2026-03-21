import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Users, Book, Palette, Sparkles, Plus } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import styles from './Layout.module.css';
import CreateCharacterModal from './CreateCharacterModal/CreateCharacterModal';

const Layout: React.FC = () => {
  const location = useLocation();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logo}>
            <Sparkles className={styles.logoIcon} size={22} strokeWidth={2.5} />
            <span className={styles.logoText}>LumiHub</span>
          </Link>

          <nav className={styles.nav}>
            <Link
              to="/"
              className={clsx(styles.navLink, location.pathname === '/' && styles.active)}
            >
              <Home size={16} strokeWidth={location.pathname === '/' ? 2.5 : 2} />
              <span>Home</span>
            </Link>

            <Link
              to="/characters"
              className={clsx(styles.navLink, location.pathname === '/characters' && styles.active)}
            >
              <Users size={16} strokeWidth={location.pathname === '/characters' ? 2.5 : 2} />
              <span>Characters</span>
            </Link>

            <Link
              to="/worldbooks"
              className={clsx(styles.navLink, location.pathname === '/worldbooks' && styles.active)}
            >
              <Book size={16} strokeWidth={location.pathname === '/worldbooks' ? 2.5 : 2} />
              <span>Worldbooks</span>
            </Link>

            <Link
              to="/themes"
              className={clsx(styles.navLink, location.pathname === '/themes' && styles.active)}
            >
              <Palette size={16} strokeWidth={location.pathname === '/themes' ? 2.5 : 2} />
              <span>Themes</span>
            </Link>
          </nav>

          <div className={styles.headerActions}>
            <button className={styles.uploadBtn} onClick={() => setShowCreate(true)}>
              <Plus size={16} strokeWidth={2.5} />
              <span>Upload</span>
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <p>Built for the Lumiverse community.</p>
      </footer>

      {/* Global create modal — accessible from the header */}
      <AnimatePresence>
        {showCreate && (
          <CreateCharacterModal onClose={() => setShowCreate(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
