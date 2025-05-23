'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, DoorOpen as ExitIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import BackButton from './BackButton';
import styles from '../Global.module.css';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isRoot = pathname === '/';
  const isDashboard = pathname === '/dashboard';
  const isProfile = pathname === '/profile';

  const showHomeButton = !isRoot && !isDashboard;
  const showGreeting = isDashboard && !!user;

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateString = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const timeString = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const hour = now.getHours();
  const greeting = hour < 12
    ? 'Bom dia'
    : hour < 18
      ? 'Boa tarde'
      : 'Boa noite';

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        {showHomeButton && (
          <button
            type="button"
            className={styles.buttonHome}
            onClick={() => router.push('/dashboard')}
          >
            Dashboard
          </button>
        )}
        {showGreeting && (
          <div>
            <h1>{greeting}, {user.name}!</h1>
            <p className={styles.dateTime}>
              {dateString} • {timeString}
            </p>
          </div>
        )}
      </div>

      <BackButton />

      <div className={styles.headerRight}>
        {user && !isProfile && (
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => router.push('/profile')}
            aria-label="Perfil"
          >
            <UserIcon size={30} />
          </button>
        )}

        {user && isProfile && (
          <button
            type="button"
            className={styles.iconButton}
            onClick={logout}
            aria-label="Logout"
          >
            <ExitIcon size={30} />
          </button>
        )}
      </div>
    </header>
  );
}
