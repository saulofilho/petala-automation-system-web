'use client';

import { useRouter, usePathname } from 'next/navigation';
import styles from '../Global.module.css';

export default function BackButton() {
  const router = useRouter();
  const path = usePathname();

  if (path === '/' || path === '/dashboard') {
    return null;
  }

  return (
    <button
      onClick={() => router.back()}
      className={styles.button}
    >
      ← Voltar
    </button>
  );
}
