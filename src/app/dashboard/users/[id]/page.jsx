'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import UserForm from '../../../components/UserForm';
import styles from '../../../Global.module.css';

export default function UserEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // 1) Buscar o usuário ao montar
  useEffect(() => {
    fetch(`${API_URL}/v1/users/${id}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar usuário');
        return res.json();
      })
      .then(data => {
        setUserData(data.user ?? data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // 2) Handler de atualização
  const handleUpdate = async updatedFields => {
    try {
      const res = await fetch(`${API_URL}/v1/users/${id}`, {
        method: 'PUT',    // ou 'PATCH', conforme seu backend
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: updatedFields }),
      });
      if (!res.ok) throw new Error('Erro ao atualizar usuário');
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  // 3) Handler de exclusão
  const handleDelete = async userId => {
    try {
      const res = await fetch(`${API_URL}/v1/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erro ao excluir usuário');
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <p className={styles.loading}>Carregando usuário…</p>;
  }
  if (!userData) {
    return <p className={styles.loading}>Usuário não encontrado.</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Editar Usuário #{id}</h1>
      <UserForm
        initialData={userData}
        onCreate={handleUpdate}
        onDelete={handleDelete}
        isEdit={true}
      />
    </div>
  );
}
