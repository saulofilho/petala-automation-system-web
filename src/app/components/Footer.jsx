'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import styles from '../Global.module.css';

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <footer className={styles.footer}>
      {user && (
        <button
          type="button"
          className={styles.button}
          onClick={logout}
        >
          Logout
        </button>
      )}
    </footer>
  );
}
