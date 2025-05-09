'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon } from 'lucide-react';
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
      <div className={styles.headerLeft}>
        {showHomeButton && (
          <button
            type="button"
            className={styles.buttonHome}
            onClick={() => router.push('/dashboard')}
          >
            Home
          </button>
        )}
        {showGreeting && (
          <h1 className={styles.title}>Olá, {user.name}!</h1>
        )}
      </div>
      <div className={styles.headerRight}>
        {user && (
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => router.push('/profile')}
          >
            <UserIcon size={24} />
          </button>
        )}
      </div>
    </header>
  );
}
