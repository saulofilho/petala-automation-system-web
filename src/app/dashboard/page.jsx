'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CompaniesTable from '../components/CompaniesTable';
import CompanyForm from '../components/CompanyForm';
import UserForm from '../components/UserForm';
import UsersTable from '../components/UsersTable';
import styles from '../Global.module.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [users, setUsers] = useState([]);
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

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetch(`${API_URL}/v1/users`, {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar usuários');
        return res.json();
      })
      .then(data => setUsers(data.users || data))
      .catch(console.error);
  }, [user]);

  const handleCreateCompany = async companyData => {
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
        setUsers(prev => [...prev, created]);
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
      <p className={styles.title}>
        Este é o seu dashboard, onde você acompanha indicadores-chave como número de empresas cadastradas, orçamentos pendentes e status de abastecimento, além de gerenciar empresas e seus históricos, criar, enviar e monitorar orçamentos, manter o catálogo de produtos e registrar e visualizar abastecimentos; para administradores, também é possível controlar usuários e permissões.
      </p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>As suas empresas</h2>

        <CompaniesTable companies={companies} />

        <button
          className={styles.button}
          onClick={() => setShowCompanyForm(prev => !prev)}
        >
          {showCompanyForm ? 'Cancelar' : 'Adicionar Empresa'}
        </button>

        {showCompanyForm && <CompanyForm onCreate={handleCreateCompany} />}
      </section>

      {user.role === 'admin' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Usuários cadastrados no sistema</h2>

          <UsersTable users={users} />

          <button
            className={styles.button}
            onClick={() => setShowUserForm(prev => !prev)}
          >
            {showUserForm ? 'Cancelar' : 'Adicionar Usuário'}
          </button>

          {showUserForm && <UserForm onCreate={handleCreateUser} />}
        </section>
      )}
    </div>
  );
}
