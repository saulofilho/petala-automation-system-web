'use client';

import { useState } from 'react';
import Input from './Input';
import Button from './Button';
import { useAuth } from '../context/AuthContext';
import styles from '../Global.module.css';

export default function LoginForm() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(form);
    } catch {
      setError('Credenciais inválidas');
      setLoading(false);
    }
  };

  return (
    <section className={styles.loginForm}>
      <h1 className={styles.title}>
        Sistema de Automação 
        <br />
        Pétala Comercia
      </h1>
      <p>
        Bem-vindo. Entre na sua conta usando e-mail e senha.
      </p>
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <p className={styles.error}>{error}</p>}
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
        />
        <Input
          label="Senha"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </section>
  );
}
