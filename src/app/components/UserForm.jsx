'use client';

import { useState } from 'react';
import styles from '../Global.module.css';

export default function UserForm({ onCreate }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    cpf: '',
    phone: '',
    role: 'admin',
  });
  const [errors, setErrors] = useState({});

  const formatCPF = value => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatPhone = value => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
      return digits
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      return digits
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'cpf') v = formatCPF(value);
    if (name === 'phone') v = formatPhone(value);

    setForm(prev => ({ ...prev, [name]: v }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Email inválido';

    if (
      !/(?=.{8,})(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(form.password)
    )
      errs.password =
        'Senha precisa ter ≥8 caracteres, uma maiúscula, uma minúscula e um dígito';

    if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(form.cpf))
      errs.cpf = 'CPF deve estar no formato 000.000.000-00';

    if (!/^\(\d{2}\) \d{4,5}-\d{4}$/.test(form.phone))
      errs.phone = 'Telefone deve ser (00) 0000-0000 ou (00) 00000-0000';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!validate()) return;
    onCreate(form);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label>Email:</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        {errors.email && (
          <span className={styles.errorText}>{errors.email}</span>
        )}
      </div>

      <div className={styles.field}>
        <label>Senha:</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />
        {errors.password && (
          <span className={styles.errorText}>{errors.password}</span>
        )}
      </div>

      <div className={styles.field}>
        <label>Nome:</label>
        <input
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.field}>
        <label>CPF:</label>
        <input
          name="cpf"
          type="text"
          value={form.cpf}
          onChange={handleChange}
          required
          maxLength={14}
        />
        {errors.cpf && (
          <span className={styles.errorText}>{errors.cpf}</span>
        )}
      </div>

      <div className={styles.field}>
        <label>Telefone:</label>
        <input
          name="phone"
          type="text"
          value={form.phone}
          onChange={handleChange}
          required
          maxLength={15}
        />
        {errors.phone && (
          <span className={styles.errorText}>{errors.phone}</span>
        )}
      </div>

      <button type="submit" className={styles.button}>
        Criar Usuário
      </button>
    </form>
  );
}
