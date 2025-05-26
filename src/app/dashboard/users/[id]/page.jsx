'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import styles from '../../../Global.module.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const PHONE_REGEX = /^\(\d{2}\) \d{4,5}-\d{4}$/;

function maskCPF(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3}\.\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3}\.\d{3}\.\d{3})(\d{1,2})$/, '$1-$2');
}

function maskPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

export default function UserEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [apiError, setApiError] = useState('');

  const [form, setForm] = useState({
    email: '',
    name: '',
    cpf: '',
    phone: '',
    role: 'admin',
  });
  const [errors, setErrors] = useState({});
  const isEdit = true;

  useEffect(() => {
    fetch(`${API_URL}/v1/users/${id}`, { credentials: 'include' })
      .then(res => {
        if (res.status === 404) {
          setNotFound(true);
          throw new Error('Não encontrado');
        }
        if (!res.ok) throw new Error('Erro ao carregar usuário');
        return res.json();
      })
      .then(data => {
        const u = data.user ?? data;
        setUserData(u);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (userData) {
      setForm({
        email: userData.email || '',
        name: userData.name || '',
        cpf: userData.cpf || '',
        phone: userData.phone || '',
        role: userData.role || 'admin',
      });
      setErrors({});
    }
  }, [userData]);

  const handleChange = e => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'cpf') val = maskCPF(val);
    if (name === 'phone') val = maskPhone(val);
    setForm(prev => ({ ...prev, [name]: val }));
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!EMAIL_REGEX.test(form.email)) {
      errs.email = 'Email inválido';
    }
    if (!form.name.trim()) {
      errs.name = 'Nome é obrigatório';
    }
    if (!CPF_REGEX.test(form.cpf)) {
      errs.cpf = 'CPF inválido. Formato: 000.000.000-00';
    }
    if (!PHONE_REGEX.test(form.phone)) {
      errs.phone = 'Telefone inválido. Use (00) 0000-0000 ou (00) 00000-0000';
    }
    return errs;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const payload = { ...form };
    try {
      const res = await fetch(`${API_URL}/v1/users/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: payload }),
      });
      if (!res.ok) throw new Error('Erro ao atualizar usuário');
      router.push('/dashboard');
    } catch (err) {
      setApiError('Erro ao atualizar usuário');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      const res = await fetch(`${API_URL}/v1/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erro ao excluir usuário');
      router.push('/dashboard');
    } catch (err) {
      setApiError('Erro ao excluir usuário');
    }
  };

  if (loading) {
    return <p className={styles.loading}>Carregando usuário…</p>;
  }
  if (notFound || !userData) {
    return <p className={styles.loading}>Usuário não encontrado.</p>;
  }

  return (
    <div className={`${styles.container} ${styles.editUser}`}>
      <p className={styles.title}>Editar usuário: {form.name}.</p>

      {apiError && <p className={styles.error}>{apiError}</p>}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        {errors.email && <p className={styles.error}>{errors.email}</p>}

        <Input
          label="Nome"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
        />
        {errors.name && <p className={styles.error}>{errors.name}</p>}

        <Input
          label="CPF"
          name="cpf"
          type="text"
          value={form.cpf}
          onChange={handleChange}
          required
          maxLength={14}
        />
        {errors.cpf && <p className={styles.error}>{errors.cpf}</p>}

        <Input
          label="Telefone"
          name="phone"
          type="text"
          value={form.phone}
          onChange={handleChange}
          required
          maxLength={15}
        />
        {errors.phone && <p className={styles.error}>{errors.phone}</p>}

        <Input
          label="Role"
          name="role"
          as="select"
          value={form.role}
          onChange={handleChange}
        >
          <option value="admin">admin</option>
          <option value="manager">manager</option>
          <option value="promoter">promoter</option>
        </Input>

        <div>
          <Button type="submit">Salvar Alterações</Button>
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Excluir Usuário
          </Button>
        </div>
      </form>
    </div>
  );
}
