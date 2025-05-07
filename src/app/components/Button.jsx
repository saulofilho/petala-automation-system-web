// app/src/app/components/Button.jsx
'use client';

import styles from './Button.module.css';

export default function Button({ children, onClick, type = 'button', disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={styles.button}
    >
      {children}
    </button>
  );
}
