'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import Input from '../../../../../components/Input';
import Button from '../../../../../components/Button';
import styles from './page.module.css';

// Regex para validações
const ASIN_REGEX = /^[A-Z0-9]{10}$/;
const EAN_REGEX = /^\d{13}$/;

export default function OrderPage() {
  const router = useRouter();
  const { id: companyId, orderId, orderItemId } = useParams();
  const { user, logout } = useAuth();

  const [order, setOrder] = useState(null);
  const [orderForm, setOrderForm] = useState({ status: '', admin_feedback: '' });
  const [items, setItems] = useState([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemForm, setItemForm] = useState({ code: '', product: '', price: '', quantity: '', ean_code: '' });
  const [itemErrors, setItemErrors] = useState({});

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Carrega pedido e itens
  useEffect(() => {
    if (!user) return;
    (async () => {
      const resOrder = await fetch(`${API}/v1/orders/${orderId}`, { credentials: 'include' });
      const { order: ord } = await resOrder.json();
      setOrder(ord);
      setOrderForm({ status: ord.status, admin_feedback: ord.admin_feedback || '' });

      const resItems = await fetch(`${API}/v1/orders/${orderId}/order_items`, { credentials: 'include' });
      const { order_items } = await resItems.json();
      setItems(order_items);
    })();
  }, [user, orderId]);

  if (!order) return <p>Carregando pedido…</p>;

  // Validação OrderItem
  const validateItem = () => {
    const errs = {};
    if (!ASIN_REGEX.test(itemForm.code)) errs.code = 'Código inválido. Deve ser ASIN (10 caracteres alfanuméricos).';
    if (!itemForm.product.trim()) errs.product = 'Produto é obrigatório.';
    const price = parseFloat(itemForm.price);
    if (isNaN(price) || price < 10 || price > 100) errs.price = 'Preço deve estar entre 10.0 e 100.0.';
    const qty = parseInt(itemForm.quantity, 10);
    if (isNaN(qty) || qty < 1 || qty > 10) errs.quantity = 'Quantidade deve ser entre 1 e 10.';
    if (!EAN_REGEX.test(itemForm.ean_code)) errs.ean_code = 'EAN inválido. Deve conter 13 dígitos.';
    return errs;
  };

  const handleItemSave = async (e) => {
    e.preventDefault();
    const errs = validateItem();
    if (Object.keys(errs).length) {
      setItemErrors(errs);
      return;
    }
    const payload = { order_item: { ...itemForm, order_id: Number(orderId) } };
    const res = await fetch(`${API}/v1/orders/${orderId}/order_items`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const { order_item } = await res.json();
    setItems((prev) => [...prev, order_item]);
    setShowItemForm(false);
    setItemForm({ code: '', product: '', price: '', quantity: '', ean_code: '' });
    setItemErrors({});
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Editar Pedido #{order.id}</h1>
      {/* ... seção de edição de pedido permanece ... */}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Itens do Pedido</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Código</th>
              <th>Produto</th>
              <th>Preço</th>
              <th>Quantidade</th>
              <th>EAN</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr key="no-items">
                <td colSpan={6} className={styles.noData}>
                  Nenhum item.
                </td>
              </tr>
            ) : (
              items.map((it) => (
                <tr
                  key={it.id}
                  className={styles.row}
                  onClick={() =>
                    router.push(
                      `/dashboard/companies/${companyId}/orders/${orderId}/order_items/${it.id}`
                    )
                  }
                >
                  <td>{it.id}</td>
                  <td>{it.code}</td>
                  <td>{it.product}</td>
                  <td>{it.price}</td>
                  <td>{it.quantity}</td>
                  <td>{it.ean_code}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <Button onClick={() => setShowItemForm((f) => !f)}>
          {showItemForm ? 'Cancelar' : 'Adicionar Item'}
        </Button>

        {showItemForm && (
          <form className={styles.form} onSubmit={handleItemSave} noValidate>
            <Input label="Código" name="code" value={itemForm.code} onChange={(e) => setItemForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} />
            {itemErrors.code && <p className={styles.error}>{itemErrors.code}</p>}

            <Input label="Produto" name="product" value={itemForm.product} onChange={(e) => setItemForm((f) => ({ ...f, product: e.target.value }))} />
            {itemErrors.product && <p className={styles.error}>{itemErrors.product}</p>}

            <Input label="Preço" name="price" type="number" step="0.01" value={itemForm.price} onChange={(e) => setItemForm((f) => ({ ...f, price: e.target.value }))} />
            {itemErrors.price && <p className={styles.error}>{itemErrors.price}</p>}

            <Input label="Quantidade" name="quantity" type="number" value={itemForm.quantity} onChange={(e) => setItemForm((f) => ({ ...f, quantity: e.target.value }))} />
            {itemErrors.quantity && <p className={styles.error}>{itemErrors.quantity}</p>}

            <Input label="EAN" name="ean_code" value={itemForm.ean_code} onChange={(e) => setItemForm((f) => ({ ...f, ean_code: e.target.value }))} />
            {itemErrors.ean_code && <p className={styles.error}>{itemErrors.ean_code}</p>}

            <Button type="submit">Salvar Item</Button>
          </form>
        )}
      </section>
    </div>
  );
}
