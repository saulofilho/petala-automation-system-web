// app/src/app/components/Header.jsx
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import styles from '../Global.module.css';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const showBack = pathname !== '/dashboard';

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
        <div>
          <h1 className={styles.title}>Olá, {user.name}!</h1>
        </div>
      )}
    </header>
  );
}
