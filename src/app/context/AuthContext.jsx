'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../Global.module.css';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetch(`${API}/v1/users/me`, {
      credentials: 'include',
    })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Não autenticado');
      })
      .then(data => {
        setUser(data.user);
      })
      .catch(() => {
        setUser(null);
        router.replace('/');
      });
  }, [API, router]);

  useEffect(() => {
    if (user === null) {
      router.replace('/');
    }
  }, [user, router]);

  const login = async ({ email, password }) => {
    const res = await fetch(`${API}/v1/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ session: { email, password } }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    const data = await res.json();
    setUser(data.user);
    router.push('/dashboard');
  };

  const logout = async () => {
    await fetch(`${API}/v1/sessions`, {
      method: 'DELETE',
      credentials: 'include',
    });
    setUser(null);
    router.replace('/');
  };

  if (user === undefined) {
    return <p className={styles.loading}>Carregando usuário…</p>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
