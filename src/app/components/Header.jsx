// app/src/app/components/Header.jsx
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import styles from '../Global.module.css';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const showBack = Boolean(user) && pathname !== '/dashboard';

  return (
    <header className={styles.header}>
      {showBack ? (
        <button
          type="button"
          className={styles.button}
          onClick={() => router.push('/dashboard')}
        >
          Home
        </button>
      ) : (
        <div />
      )}

      {user && (
        <button
          type="button"
          className={styles.button}
          onClick={logout}
        >
          Logout
        </button>
      )}
    </header>
  );
}
