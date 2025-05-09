'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import Input from '../../../../../components/Input';
import Button from '../../../../../components/Button';
import styles from '../../../../../Global.module.css';

export default function OrderPage() {
  const router = useRouter();
  const { companyId, orderId } = useParams();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [orderForm, setOrderForm] = useState({ status: '', admin_feedback: '' });
  const [items, setItems] = useState([]);

  // controla a visibilidade do form de itens (já existente)
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemForm, setItemForm] = useState({ code: '', product: '', price: '', quantity: '', ean_code: '' });
  const [itemErrors, setItemErrors] = useState({});

  // novo estado para mostrar/ocultar o form de edição do pedido
  const [showOrderEditForm, setShowOrderEditForm] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // carrega o pedido e preenche o form
  useEffect(() => {
    if (!user) return;
    (async () => {
      const res = await fetch(`${API}/v1/orders/${orderId}`, { credentials: 'include' });
      if (!res.ok) return;
      const { order: ord } = await res.json();
      setOrder(ord);
      setOrderForm({ status: ord.status, admin_feedback: ord.admin_feedback || '' });
    })();
  }, [user, orderId]);

  // carrega os itens do pedido
  useEffect(() => {
    if (!order) return;
    (async () => {
      const res = await fetch(`${API}/v1/orders/${orderId}/order_items`, { credentials: 'include' });
      if (!res.ok) return;
      const { order_items } = await res.json();
      setItems(order_items);
    })();
  }, [order, orderId]);

  if (!order) return <p>Carregando pedido…</p>;

  // handlers do form de pedido
  const handleOrderChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(f => ({ ...f, [name]: value }));
  };

  const handleOrderUpdate = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/v1/orders/${orderId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: orderForm }),
    });
    if (res.ok) {
      const { order: updated } = await res.json();
      setOrder(updated);
      router.push(`/dashboard/companies/${companyId}`);
    }
  };

  const handleOrderDelete = async () => {
    if (!confirm('Confirma exclusão deste pedido?')) return;
    await fetch(`${API}/v1/orders/${orderId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    router.push(`/dashboard/companies/${companyId}`);
  };

  // handlers do form de item (não mostrado aqui)
  const handleItemSave = async (e) => {
    e.preventDefault();
    // validações e POST para criar item...
  };

  return (
    <div className={styles.container}>
      {/* === SEÇÃO DE ITENS DO PEDIDO === */}
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

        <Button onClick={() => setShowItemForm(f => !f)}>
          {showItemForm ? 'Cancelar' : 'Adicionar Item'}
        </Button>

        {showItemForm && (
          <form className={styles.form} onSubmit={handleItemSave} noValidate>
            {/* seu form de itemForm… */}
          </form>
        )}
      </section>

      {/* Botão para mostrar/ocultar o form de edição do pedido */}
      <div className={styles.buttons} style={{ marginTop: '2rem' }}>
        <Button onClick={() => setShowOrderEditForm(s => !s)}>
          {showOrderEditForm ? 'Cancelar Edição' : `Editar Pedido #${order.id}`}
        </Button>
      </div>

      {/* Form de edição do pedido (condicional) */}
      {showOrderEditForm && (
        <>
          <h1 className={styles.title}>Editar Pedido #{order.id}</h1>
          <form className={styles.form} onSubmit={handleOrderUpdate} noValidate>
            <Input
              label="Status"
              name="status"
              value={orderForm.status}
              onChange={handleOrderChange}
            />
            <Input
              label="Feedback do Admin"
              name="admin_feedback"
              value={orderForm.admin_feedback}
              onChange={handleOrderChange}
            />

            <div className={styles.buttons}>
              <Button type="submit">Salvar Pedido</Button>
              <Button type="button" onClick={handleOrderDelete}>
                Excluir Pedido
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
