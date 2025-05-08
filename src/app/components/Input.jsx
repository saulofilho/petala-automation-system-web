// app/src/app/components/Input.jsx
'use client';

import styles from '../Global.module.css';

export default function Input({ label, type = 'text', value, onChange, name }) {
  return (
    <div className={styles.wrapper}>
      <label htmlFor={name} className={styles.label}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={styles.input}
      />
    </div>
  );
}
