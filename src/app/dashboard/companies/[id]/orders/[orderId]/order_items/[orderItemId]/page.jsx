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
  const { user, logout } = useAuth();
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const [item, setItem] = useState(null);
  const [form, setForm] = useState({
    code: '',
    product: '',
    price: '',
    quantity: '',
    ean_code: ''
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Fetch order item
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await fetch(
          `${API}/v1/order_items/${orderItemId}`,
          { credentials: 'include' }
        );
        if (!res.ok) throw new Error('Item não encontrado');
        const { order_item } = await res.json();
        setItem(order_item);
        setForm({
          code: order_item.code || '',
          product: order_item.product || '',
          price: order_item.price?.toString() || '',
          quantity: order_item.quantity?.toString() || '',
          ean_code: order_item.ean_code || ''
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, orderItemId]);

  if (loading) return <p>Carregando item…</p>;
  if (!item) return <p>Item não encontrado.</p>;

  // Handlers
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setErrors(err => ({ ...err, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    // product: não vazio
    if (!form.product.trim()) {
      errs.product = 'Produto é obrigatório';
    }
    // price: número entre 10 e 100
    const price = parseFloat(form.price);
    if (form.price === '' || isNaN(price)) {
      errs.price = 'Preço é obrigatório e deve ser numérico';
    } else if (price < 10 || price > 100) {
      errs.price = 'Preço deve estar entre 10.00 e 100.00';
    }
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
      await fetch(
        `${API}/v1/order_items/${orderItemId}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_item: {
            code: form.code.trim(),
            product: form.product.trim(),
            price: parseFloat(form.price),
            quantity: parseInt(form.quantity, 10),
            ean_code: form.ean_code.trim(),
            order_id: Number(orderId)
          } }),
        }
      );
      router.push(`/dashboard/companies/${companyId}/orders/${orderId}`);
    } catch (err) {
      console.error('Erro ao atualizar item', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Deseja excluir este item?')) return;
    try {
      await fetch(
        `${API}/v1/orders/${orderId}/order_items/${orderItemId}`,
        { method: 'DELETE', credentials: 'include' }
      );
      router.push(`/dashboard/companies/${companyId}/orders/${orderId}`);
    } catch (err) {
      console.error('Erro ao excluir item', err);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Editar Item #{item.id}</h1>
      <form onSubmit={handleUpdate} className={styles.form} noValidate>
        <Input label="Código" name="code" value={form.code} onChange={handleChange} />
        {errors.code && <p className={styles.error}>{errors.code}</p>}

        <Input label="Produto" name="product" value={form.product} onChange={handleChange} />
        {errors.product && <p className={styles.error}>{errors.product}</p>}

        <Input label="Preço" name="price" type="number" step="0.01" value={form.price} onChange={handleChange} />
        {errors.price && <p className={styles.error}>{errors.price}</p>}

        <Input label="Quantidade" name="quantity" type="number" value={form.quantity} onChange={handleChange} />
        {errors.quantity && <p className={styles.error}>{errors.quantity}</p>}

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
