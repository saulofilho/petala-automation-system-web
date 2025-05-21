'use client';

import { useState, useEffect } from 'react';
import Input from './Input';
import Button from './Button';
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

export default function UserForm({
  initialData = {},
  onCreate,
  onDelete,
  isEdit = false
}) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    cpf: '',
    phone: '',
    role: initialData.role || 'admin'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && initialData) {
      setForm({
        email: initialData.email || '',
        password: '',
        name: initialData.name || '',
        cpf: initialData.cpf || '',
        phone: initialData.phone || '',
        role: initialData.role || 'admin'
      });
      setErrors({});
    }
  }, [initialData, isEdit]);

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
    if (!CPF_REGEX.test(form.cpf)) errs.cpf = 'CPF inválido. Formato: 000.000.000-00';
    if (!PHONE_REGEX.test(form.phone)) errs.phone = 'Telefone inválido. Use (00) 0000-0000 ou (00) 00000-0000';
    return errs;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const payload = { ...form };
    if (isEdit) delete payload.password;
    onCreate(payload);
  };

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      onDelete(initialData.id);
    }
  };

  return (
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

      {!isEdit && (
        <>
          <Input
            label="Senha"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          {errors.password && <p className={styles.error}>{errors.password}</p>}
        </>
      )}

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
        {isEdit && (
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Excluir Usuário
          </Button>
        )}
        <Button type="submit">
          {isEdit ? 'Salvar Alterações' : 'Criar Usuário'}
        </Button>
      </div>
    </form>
  );
}