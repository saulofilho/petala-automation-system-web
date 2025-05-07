'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import styles from './page.module.css';

const CNPJ_REGEX = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
const CEP_REGEX = /^\d{5}-\d{3}$/;
const STATE_REGEX = /^[A-Z]{2}$/;

// Máscaras de input
function maskCNPJ(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2}\.\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{2}\.\d{3}\.\d{3})(\d)/, '$1/$2')
    .replace(/^(\d{2}\.\d{3}\.\d{3}\/\d{4})(\d)/, '$1-$2');
}

function maskCEP(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/^(\d{5})(\d)/, '$1-$2');
}

export default function CompanyPage() {
  const router = useRouter();
  const { id: companyId } = useParams();
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '',
    cnpj: '',
    cep: '',
    street: '',
    number: '',
    city: '',
    state: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    if (!user || !companyId) return;
    (async () => {
      try {
        const res = await fetch(
          `${API_URL}/v1/companies/${companyId}`,
          { credentials: 'include' }
        );
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        const company = data.company || data;
        setForm({
          name: company.name || '',
          cnpj: company.cnpj || '',
          cep: company.cep || '',
          street: company.street || '',
          number: company.number?.toString() || '',
          city: company.city || '',
          state: company.state || '',
        });
      } catch (err) {
        console.error('Erro ao buscar empresa', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, companyId]);

  if (loading) return <p>Carregando dados da empresa…</p>;
  if (notFound) return <p>Empresa não encontrada.</p>;

  const handleChange = e => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'cnpj') val = maskCNPJ(value);
    if (name === 'cep') val = maskCEP(value);
    if (name === 'number') val = value.replace(/\D/g, '');
    if (name === 'state') val = value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);

    setForm(f => ({ ...f, [name]: val }));
    setErrors(e => ({ ...e, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nome é obrigatório';
    if (!CNPJ_REGEX.test(form.cnpj)) errs.cnpj = 'CNPJ inválido';
    if (!CEP_REGEX.test(form.cep)) errs.cep = 'CEP inválido';
    if (!form.street.trim()) errs.street = 'Rua é obrigatória';
    if (!form.number || !Number.isInteger(Number(form.number))) errs.number = 'Número deve ser inteiro';
    if (!form.city.trim()) errs.city = 'Cidade é obrigatória';
    if (!STATE_REGEX.test(form.state)) errs.state = 'Estado inválido';
    return errs;
  };

  const handleUpdate = async e => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    try {
      const res = await fetch(
        `${API_URL}/v1/companies/${companyId}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company: { ...form, number: Number(form.number), user_id: user.id },
          }),
        }
      );
      if (!res.ok) throw new Error('Erro ao atualizar empresa');
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Deseja realmente excluir esta empresa?')) return;
    try {
      const res = await fetch(
        `${API_URL}/v1/users/${user.id}/companies/${companyId}`,
        { method: 'DELETE', credentials: 'include' }
      );
      if (!res.ok) throw new Error('Erro ao excluir empresa');
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Editar Empresa</h1>
      <form className={styles.form} onSubmit={handleUpdate} noValidate>
        <Input label="Nome" name="name" value={form.name} onChange={handleChange} />
        {errors.name && <p className={styles.error}>{errors.name}</p>}

        <Input label="CNPJ" name="cnpj" value={form.cnpj} onChange={handleChange} maxLength={18} />
        {errors.cnpj && <p className={styles.error}>{errors.cnpj}</p>}

        <Input label="CEP" name="cep" value={form.cep} onChange={handleChange} maxLength={9} />
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