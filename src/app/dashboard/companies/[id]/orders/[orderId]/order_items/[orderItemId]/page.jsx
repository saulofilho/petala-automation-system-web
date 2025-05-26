'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../../../../../context/AuthContext';
import Input from '../../../../../../../components/Input';
import Button from '../../../../../../../components/Button';
import styles from '../../../../../../../Global.module.css';

export default function OrderItemPage() {
  const router = useRouter();
  const { id: companyId, orderId, orderItemId } = useParams();
  const { user } = useAuth();
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const [item, setItem] = useState(null);
  const [form, setForm] = useState({
    code: '',
    product: '',
    price: '',
    quantity: '',
    total: '',
    ean_code: ''
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const formatToBRL = (value) => {
    let num = value.replace(/\D/g, '');
    if (!num) return '';
    num = (parseInt(num, 10) / 100).toFixed(2);
    return num.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const parseFromBRL = (value) => {
    return value.replace(/\./g, '').replace(',', '.');
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await fetch(`${API}/v1/order_items/${orderItemId}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Item não encontrado');
        const { order_item } = await res.json();
        const priceStr = order_item.price ? formatToBRL(order_item.price.toString()) : '';
        const quantityStr = order_item.quantity?.toString() || '';
        const totalVal = (order_item.price * order_item.quantity).toFixed(2).replace('.', ',');
        setItem(order_item);
        setForm({
          code: order_item.code || '',
          product: order_item.product || '',
          price: priceStr,
          quantity: quantityStr,
          total: totalVal,
          ean_code: order_item.ean_code || ''
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, orderItemId]);

  const updateTotal = (priceStr, quantityStr) => {
    const price = parseFloat(parseFromBRL(priceStr || '0'));
    const quantity = parseInt(quantityStr || '0', 10);
    if (isNaN(price) || isNaN(quantity)) return '';
    const total = (price * quantity).toFixed(2).replace('.', ',');
    return total;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };

    if (name === 'price') {
      updatedForm.price = formatToBRL(value);
    }

    if (name === 'price' || name === 'quantity') {
      const price = name === 'price' ? updatedForm.price : form.price;
      const quantity = name === 'quantity' ? value : form.quantity;
      updatedForm.total = updateTotal(price, quantity);
    }

    setForm(updatedForm);
    setErrors(err => ({ ...err, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.product.trim()) errs.product = 'Produto é obrigatório';
    const price = parseFloat(parseFromBRL(form.price));
    if (form.price === '' || isNaN(price)) errs.price = 'Preço é obrigatório e deve ser numérico';
    return errs;
  };

  const handleUpdate = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    try {
      await fetch(`${API}/v1/order_items/${orderItemId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_item: {
            code: form.code.trim(),
            product: form.product.trim(),
            price: parseFloat(parseFromBRL(form.price)),
            quantity: parseInt(form.quantity, 10),
            total: parseFloat(parseFromBRL(form.total)),
            ean_code: form.ean_code.trim(),
            order_id: Number(orderId)
          }
        }),
      });
      router.push(`/dashboard/companies/${companyId}/orders/${orderId}`);
    } catch (err) {
      console.error('Erro ao atualizar item', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Deseja excluir este item?')) return;
    try {
      await fetch(`${API}/v1/order_items/${orderItemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      router.push(`/dashboard/companies/${companyId}/orders/${orderId}`);
    } catch (err) {
      console.error('Erro ao excluir item', err);
    }
  };

  if (loading) return <p className={styles.loading}>Carregando item…</p>;
  if (!item) return <p className={styles.titleError}>Item não encontrado.</p>;

  return (
    <div className={styles.container}>
      <p className={styles.title}>
        Editar Item: {item.id}.<br />
        Nome: {item.product}
      </p>
      <form onSubmit={handleUpdate} className={styles.form} noValidate>
        <Input label="Código" name="code" value={form.code} onChange={handleChange} />
        {errors.code && <p className={styles.error}>{errors.code}</p>}

        <Input label="Produto" name="product" value={form.product} onChange={handleChange} />
        {errors.product && <p className={styles.error}>{errors.product}</p>}

        <Input label="Preço" name="price" value={form.price} onChange={handleChange} />
        {errors.price && <p className={styles.error}>{errors.price}</p>}

        <Input label="Quantidade" name="quantity" type="number" value={form.quantity} onChange={handleChange} />
        {errors.quantity && <p className={styles.error}>{errors.quantity}</p>}

        <Input label="Total" name="total" value={form.total} readOnly />
        <Input label="EAN" name="ean_code" value={form.ean_code} onChange={handleChange} />
        {errors.ean_code && <p className={styles.error}>{errors.ean_code}</p>}

        <div className={styles.buttons}>
          <Button type="submit">Salvar Item</Button>
          <Button type="button" onClick={handleDelete}>Excluir Item</Button>
        </div>
      </form>
    </div>
  );
}
