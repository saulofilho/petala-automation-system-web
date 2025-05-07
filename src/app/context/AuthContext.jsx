'use client';

import { createContext, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const login = async ({ email, password }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ session: { email, password } }),
    });
    if (res.ok) {
      const { user } = await res.json();
      setUser(user);
      router.push('/dashboard');
    } else {
      const err = await res.text();
      throw new Error(err);
    }
  };

  const logout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/sessions`, {
      method: 'DELETE',
      credentials: 'include',
    });
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
