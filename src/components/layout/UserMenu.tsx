import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import styles from './UserMenu.module.css';

const UserMenu: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = () => {
    window.location.href = '/api/v1/auth/discord';
  };

  if (!isAuthenticated || !user) {
    return (
      <button className={styles.loginButton} onClick={handleLogin}>
        <LogIn size={16} />
        <span>Login</span>
      </button>
    );
  }

  return (
    <div className={styles.wrapper} ref={menuRef}>
      <button className={styles.trigger} onClick={() => setOpen(!open)}>
        {user.avatar ? (
          <img src={user.avatar} alt={user.displayName} className={styles.avatar} />
        ) : (
          <div className={styles.avatarFallback}>
            {user.displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className={styles.username}>{user.displayName}</span>
        <ChevronDown size={14} className={open ? styles.chevronOpen : styles.chevron} />
      </button>

      {open && (
        <div className={styles.dropdown}>
          <Link
            to={`/user/${user.discordId}`}
            className={styles.dropdownItem}
            onClick={() => setOpen(false)}
          >
            <User size={16} />
            <span>My Profile</span>
          </Link>
          <button
            className={styles.dropdownItem}
            onClick={() => {
              logout();
              setOpen(false);
            }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
