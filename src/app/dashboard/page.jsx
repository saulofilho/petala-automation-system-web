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
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  useEffect(() => {
    if (!user) return;
    fetch(`${API_URL}/v1/users/${user.id}/companies`, {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => setCompanies(data.companies || data))
      .catch(console.error);
  }, [user]);

  const handleCreate = companyData => {
    fetch(`${API_URL}/v1/users/${user.id}/companies`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company: { ...companyData, user_id: user.id } }),
    })
      .then(res => res.json())
      .then(newCompany => {
        setCompanies(prev => [...prev, newCompany]);
        setShowForm(false);
      })
      .catch(console.error);
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
