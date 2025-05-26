'use client';

import styles from '../Global.module.css';

export default function Input({
  label,
  as: Tag = 'input',
  type = 'text',
  name,
  value,
  onChange,
  readOnly = false,
  disabled = false,
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
          disabled={disabled}
          readOnly={readOnly}
        >
          {children}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className={styles.input}
          readOnly={readOnly}
          disabled={disabled}
        />
      )}
    </div>
  );
}
