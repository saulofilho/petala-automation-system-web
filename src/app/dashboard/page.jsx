'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CompaniesTable from '../components/CompaniesTable';
import CompanyForm from '../components/CompanyForm';
import UserForm from '../components/UserForm';
import styles from '../Global.module.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [createdUsers, setCreatedUsers] = useState([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (!user) return;
    fetch(`${API_URL}/v1/users/${user.id}/companies`, {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar empresas');
        return res.json();
      })
      .then(data => setCompanies(data.companies || data))
      .catch(console.error);
  }, [user]);

  const handleCreate = async companyData => {
    try {
      const res = await fetch(
        `${API_URL}/v1/users/${user.id}/companies`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company: { ...companyData, user_id: user.id } }),
        }
      );
      if (!res.ok) throw new Error('Erro ao criar empresa');
      const data = await res.json();
      const created = data.company || data;
      setCompanies(prev => [...prev, created]);
      setShowCompanyForm(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateUser = async userData => {
      try {
        const res = await fetch(`${API_URL}/v1/users`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: userData }),
        });
        if (!res.ok) throw new Error('Erro ao criar usuário');
        const data = await res.json();
        const created = data.user || data;
        setCreatedUsers(prev => [...prev, created]);
        setShowUserForm(false);
      } catch (error) {
        console.error(error);
      }
    };

  if (!user) {
    return <p className={styles.loading}>Carregando usuário…</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard</h1>
      <h1 className={styles.title}>Olá, {user.name}!</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Empresas</h2>

        <CompaniesTable companies={companies} />

        <button
          className={styles.button}
          onClick={() => setShowCompanyForm(prev => !prev)}
        >
          {showCompanyForm ? 'Cancelar' : 'Adicionar Empresa'}
        </button>

        {showCompanyForm && <CompanyForm onCreate={handleCreate} />}
      </section>

      {user.role === 'admin' && (
        <section className={styles.section} style={{ marginTop: '2rem' }}>
          <h2 className={styles.sectionTitle}>Usuários</h2>
          <button
            className={styles.button}
            onClick={() => setShowUserForm(prev => !prev)}
          >
            {showUserForm ? 'Cancelar' : 'Adicionar Usuário'}
          </button>
          {showUserForm && <UserForm onCreate={handleCreateUser} />}
          {createdUsers.length > 0 && (
            <ul style={{ marginTop: '1rem' }}>
              {createdUsers.map(u => (
                <li key={u.id}>
                  {u.id}: {u.email} — {u.role}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
