// app/src/app/dashboard/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CompaniesTable from '../components/CompaniesTable';
import CompanyForm from '../components/CompanyForm';
import styles from './page.module.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
      setShowForm(false);
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

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Empresas</h2>

        <CompaniesTable companies={companies} />

        <button
          className={styles.addButton}
          onClick={() => setShowForm(prev => !prev)}
        >
          {showForm ? 'Cancelar' : 'Adicionar Empresa'}
        </button>

        {showForm && <CompanyForm onCreate={handleCreate} />}
      </section>
    </div>
  );
}
