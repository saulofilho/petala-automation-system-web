'use client';

import styles from '../Global.module.css';

export default function Input({
  label,
  as: Tag = 'input',
  type = 'text',
  name,
  value,
  onChange,
  children
}) {
  return (
    <div className={styles.wrapper}>
      <label htmlFor={name} className={styles.label}>
        {label}
      </label>

      {Tag === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={styles.input}
        >
          {children}
        </select>
      ) : (
        <input
          as={Tag}
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className={styles.input}
        />
      )}
    </div>
  );
}
