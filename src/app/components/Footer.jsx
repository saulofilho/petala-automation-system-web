'use client';

import { useAuth } from '../context/AuthContext';
import styles from '../Global.module.css';

export default function Footer() {
  const { user, logout } = useAuth();

  return (
    <footer className={styles.footer}>
      <div>
        <p>
          Copyright © 2025 Pétala Representações Comerciais, LTDA.
          <br />
          All rights reserved.
        </p>
      </div>
    </footer>
  );
}
