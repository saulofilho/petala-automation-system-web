'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import styles from './Header.module.css';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <header className={styles.header}>
      {user && (
        <button
          type="button"
          className={styles.btn}
          onClick={() => router.back()}
        >
          ← Voltar
        </button>
      )}

      {user && (
        <button
          type="button"
          className={styles.btn}
          onClick={logout}
        >
          Logout
        </button>
      )}
    </header>
  );
}
