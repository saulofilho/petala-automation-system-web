'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from '../Global.module.css';

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

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const [form, setForm] = useState({
    email: '',
    name: '',
    cpf: '',
    phone: '',
    role: user?.role || 'admin',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return router.push('/');
    fetch(`${API_URL}/v1/users/${user.id}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar perfil');
        return res.json();
      })
      .then(data => {
        const u = data.user ?? data;
        setForm({
          email: u.email || '',
          name: u.name || '',
          cpf: u.cpf || '',
          phone: u.phone || '',
          role: u.role || user.role,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, router]);

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
    if (!EMAIL_REGEX.test(form.email)) errs.email = 'Email inválido';
    if (!form.name.trim()) errs.name = 'Nome é obrigatório';
    if (form.cpf && !CPF_REGEX.test(form.cpf)) errs.cpf = 'CPF inválido. Formato: 000.000.000-00';
    if (form.phone && !PHONE_REGEX.test(form.phone))
      errs.phone = 'Telefone inválido. Use (00) 0000-0000 ou (00) 00000-0000';
    return errs;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/v1/users/${user.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: form }),
      });
      if (!res.ok) throw new Error('Erro ao atualizar perfil');
      await res.json();
      alert('Perfil atualizado com sucesso');
    } catch (err) {
      console.error(err);
      alert('Falha ao atualizar perfil');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Deseja excluir sua conta?')) return;
    try {
      const res = await fetch(`${API_URL}/v1/users/${user.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erro ao excluir conta');
      logout();
      router.push('/');
    } catch (err) {
      console.error(err);
      alert('Falha ao excluir conta');
    }
  };

  if (loading) return <p className={styles.loading}>Carregando perfil…</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Meu Perfil</h1>
      <form onSubmit={handleSubmit} className={styles.userForm} noValidate>
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
          maxLength={14}
        />
        {errors.cpf && <p className={styles.error}>{errors.cpf}</p>}

        <Input
          label="Telefone"
          name="phone"
          type="text"
          value={form.phone}
          onChange={handleChange}
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
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
        </Input>

        <div>
          <Button variant="destructive" type="button" onClick={handleDelete}>
            Excluir Conta
          </Button>
          <Button type="submit">Salvar Alterações</Button>
        </div>
      </form>
    </div>
  );
}
