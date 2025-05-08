'use client';

import { useState } from 'react';
import Input from './Input';
import Button from './Button';
import styles from '../Global.module.css';

const CNPJ_REGEX = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
const CEP_REGEX = /^\d{5}-\d{3}$/;
const STATE_REGEX = /^[A-Z]{2}$/;

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
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    const { name, value, type } = e.target;
    let val = value;

    if (name === 'cnpj') {
      val = maskCNPJ(value);
    }
    if (name === 'cep') {
      val = maskCEP(value);
    }

    if (name === 'number') {
      val = val.replace(/\D/g, '');
    }

    setForm(prev => ({ ...prev, [name]: val }));
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nome é obrigatório';
    if (!CNPJ_REGEX.test(form.cnpj)) errs.cnpj = 'CNPJ inválido. Formato: 12.345.678/0001-90';
    if (!CEP_REGEX.test(form.cep)) errs.cep = 'CEP inválido. Formato: 12345-678';
    if (!form.street.trim()) errs.street = 'Rua é obrigatória';
    if (!form.number.trim() || !/^[0-9]+$/.test(form.number)) errs.number = 'Número deve ser inteiro positivo';
    if (!form.city.trim()) errs.city = 'Cidade é obrigatória';
    if (!STATE_REGEX.test(form.state)) errs.state = 'Estado inválido. Use duas letras maiúsculas';
    return errs;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const payload = { ...form, number: Number(form.number) };
    onCreate(payload);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
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

      <Button type="submit">Salvar Empresa</Button>
    </form>
  );
}
