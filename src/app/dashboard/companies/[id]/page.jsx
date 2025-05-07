'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import styles from './page.module.css';

const CNPJ_REGEX = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
const CEP_REGEX = /^\d{5}-\d{3}$/;
const STATE_REGEX = /^[A-Z]{2}$/;

export default function CompanyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Extrai o id da URL
  const pathname = usePathname();            // ex: /dashboard/companies/42
  const companyId = pathname.split('/').pop();

  // Busca detalhes da empresa
  useEffect(() => {
    if (!user) return;
    fetch(`${API_URL}/v1/users/${user.id}/companies/${companyId}`, {
      credentials: 'include',
    })
      .then(r => r.json())
      .then(data => setForm(data.company || data))
      .catch(console.error);
  }, [user, companyId]);

  if (!form) return <p>Carregando dados da empresa…</p>;

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nome é obrigatório';
    if (!CNPJ_REGEX.test(form.cnpj)) errs.cnpj = 'CNPJ inválido';
    if (!CEP_REGEX.test(form.cep)) errs.cep = 'CEP inválido';
    if (!form.street.trim()) errs.street = 'Rua é obrigatória';
    if (!form.number || !Number.isInteger(form.number)) errs.number = 'Número deve ser inteiro';
    if (!form.city.trim()) errs.city = 'Cidade é obrigatória';
    if (!STATE_REGEX.test(form.state)) errs.state = 'Estado inválido';
    return errs;
  };

  const handleChange = e => {
    const { name, value, type } = e.target;
    let val = value;
    if (name === 'number') val = value.replace(/\D/g, '');
    setForm(f => ({ ...f, [name]: name === 'number' ? Number(val) : val }));
    setErrors(e => ({ ...e, [name]: null }));
  };

  const handleUpdate = async e => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    await fetch(`${API_URL}/v1/users/${user.id}/companies/${companyId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company: form }),
    });
    // Após salvar, recarrega a página ou navega de volta
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm('Deseja realmente excluir esta empresa?')) return;
    await fetch(`${API_URL}/v1/users/${user.id}/companies/${companyId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    router.push('/dashboard');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Editar Empresa</h1>
      <form className={styles.form} onSubmit={handleUpdate} noValidate>
        <Input label="Nome" name="name" value={form.name} onChange={handleChange} />
        {errors.name && <p className={styles.error}>{errors.name}</p>}

        <Input label="CNPJ" name="cnpj" value={form.cnpj} onChange={handleChange} />
        {errors.cnpj && <p className={styles.error}>{errors.cnpj}</p>}

        <Input label="CEP" name="cep" value={form.cep} onChange={handleChange} />
        {errors.cep && <p className={styles.error}>{errors.cep}</p>}

        <Input label="Rua" name="street" value={form.street} onChange={handleChange} />
        {errors.street && <p className={styles.error}>{errors.street}</p>}

        <Input label="Número" name="number" type="text" value={form.number} onChange={handleChange} />
        {errors.number && <p className={styles.error}>{errors.number}</p>}

        <Input label="Cidade" name="city" value={form.city} onChange={handleChange} />
        {errors.city && <p className={styles.error}>{errors.city}</p>}

        <Input label="Estado" name="state" value={form.state} onChange={handleChange} maxLength={2} />
        {errors.state && <p className={styles.error}>{errors.state}</p>}

        <div className={styles.buttons}>
          <Button type="submit">Salvar Alterações</Button>
          <Button type="button" onClick={handleDelete}>Excluir Empresa</Button>
        </div>
      </form>
    </div>
  );
}
