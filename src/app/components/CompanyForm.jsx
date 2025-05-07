'use client';

import { useState } from 'react';
import Input from './Input';
import Button from './Button';
import styles from './CompanyForm.module.css';

export default function CompanyForm({ onCreate }) {
  const [form, setForm] = useState({
    name: '',
    cnpj: '',
    cep: '',
    street: '',
    number: '',
    city: '',
    state: '',
  });

  const handleChange = e => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onCreate(form);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input label="Nome" name="name" value={form.name} onChange={handleChange} />
      <Input label="CNPJ" name="cnpj" value={form.cnpj} onChange={handleChange} />
      <Input label="CEP" name="cep" value={form.cep} onChange={handleChange} />
      <Input label="Rua" name="street" value={form.street} onChange={handleChange} />
      <Input label="Número" name="number" type="number" value={form.number} onChange={handleChange} />
      <Input label="Cidade" name="city" value={form.city} onChange={handleChange} />
      <Input label="Estado" name="state" value={form.state} onChange={handleChange} />
      <Button type="submit">Salvar Empresa</Button>
    </form>
  );
}
