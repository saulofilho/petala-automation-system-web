'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import styles from '../Global.module.css';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const isRoot = pathname === '/';
  const isDashboard = pathname === '/dashboard';

  const showHomeButton = !isRoot && !isDashboard;
  const showGreeting = isDashboard && !!user;

  return (
    <header className={styles.header}>
      {showHomeButton && (
        <button
          type="button"
          className={styles.button}
          onClick={() => router.push('/dashboard')}
        >
          Home
        </button>
      )}
      {showGreeting && (
        <div>
          <h1 className={styles.title}>Olá, {user.name}!</h1>
        </div>
      )}
    </header>
  );
}
