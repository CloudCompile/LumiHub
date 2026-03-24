import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Users, Book, Palette, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import UserMenu from './UserMenu';
import styles from './Layout.module.css';

const Layout = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.brand}>
            <Sparkles className={styles.brandIcon} size={22} strokeWidth={2.5} />
            <span className={styles.brandText}>LumiHub</span>
          </Link>

          <nav className={styles.nav}>
            <Link
              to="/"
              className={clsx(styles.navItem, isActive('/') && styles.navItemActive)}
            >
              <Home size={18} strokeWidth={isActive('/') ? 2.5 : 2} />
              <span>Discover</span>
            </Link>

            <Link
              to="/characters"
              className={clsx(styles.navItem, isActive('/characters') && styles.navItemActive)}
            >
              <Users size={18} strokeWidth={isActive('/characters') ? 2.5 : 2} />
              <span>Characters</span>
            </Link>

            <Link
              to="/worldbooks"
              className={clsx(styles.navItem, isActive('/worldbooks') && styles.navItemActive)}
            >
              <Book size={18} strokeWidth={isActive('/worldbooks') ? 2.5 : 2} />
              <span>Worldbooks</span>
            </Link>

            <Link
              to="/themes"
              className={clsx(styles.navItem, isActive('/themes') && styles.navItemActive)}
            >
              <Palette size={18} strokeWidth={isActive('/themes') ? 2.5 : 2} />
              <span>Themes</span>
            </Link>

            <Link
              to="/presets"
              className={clsx(styles.navItem, isActive('/presets') && styles.navItemActive)}
            >
              <Sparkles size={18} strokeWidth={isActive('/presets') ? 2.5 : 2} />
              <span>Presets</span>
            </Link>
          </nav>

          <div className={styles.headerRight}>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
