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
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemForm, setItemForm] = useState({
    code: '',
    product: '',
    price: '',
    quantity: '',
    total: '',
    ean_code: '',
    order_id: '',
  });
  const [itemErrors, setItemErrors] = useState({});

  const [showImportForm, setShowImportForm] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importErrors, setImportErrors] = useState(null);
  const [showOrderEditForm, setShowOrderEditForm] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const handleDownloadPdf = async () => {
    if (!order) return;
    try {
      const res = await fetch(`${API}/v1/orders/${orderId}/pdf`, { credentials: 'include' });
      if (!res.ok) throw new Error('Falha ao gerar PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pedido_${order.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  };

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
    await fetch(`${API}/v1/orders/${orderId}`, { method: 'DELETE', credentials: 'include' });
    router.push(`/dashboard/companies/${companyId}`);
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setItemForm(f => ({ ...f, [name]: value }));
  };

  const handleItemSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${API}/v1/orders/${orderId}/order_items`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_item: { ...itemForm, order_id: orderId } }),
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        setItemErrors(errorData.errors || {});
        return;
      }
      const { order_item: newItem } = await res.json();
      setItems(prev => [...prev, newItem]);
      setItemForm({ code: '', product: '', price: '', quantity: '', total: '', ean_code: '', order_id: '' });
      setItemErrors({});
      setShowItemForm(false);
    } catch (err) {
      alert('Erro ao salvar item: ' + err.message);
    }
  };

  const handleImportChange = (e) => {
    setImportFile(e.target.files[0]);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) {
      setImportErrors('Selecione um arquivo .xlsx');
      return;
    }
    const formData = new FormData();
    formData.append('file', importFile);
    try {
      const res = await fetch(
        `${API}/v1/orders/${orderId}/order_items/import`,
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        }
      );
      if (!res.ok) {
        const data = await res.json();
        setImportErrors(data.message || 'Erro no import');
        return;
      }
      const listRes = await fetch(
        `${API}/v1/orders/${orderId}/order_items`,
        { credentials: 'include' }
      );
      if (listRes.ok) {
        const { order_items } = await listRes.json();
        setItems(order_items);
      }
      setImportFile(null);
      setImportErrors(null);
      setShowImportForm(false);
    } catch (err) {
      setImportErrors(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Itens do Pedido</h2>
        <div className="table-responsive">
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Código</th>
                <th>Produto</th>
                <th>Preço</th>
                <th>Quantidade</th>
                <th>Total</th>
                <th>EAN</th>
                <th>Order ID</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.noData}>Nenhum item.</td>
                </tr>
              ) : (
                items.map(it => (
                  <tr key={it.id} className={styles.row} onClick={() => router.push(
                    `/dashboard/companies/${companyId}/orders/${orderId}/order_items/${it.id}`
                  )}>
                    <td>{it.id}</td><td>{it.code}</td><td>{it.product}</td>
                    <td>{it.price}</td><td>{it.quantity}</td><td>{it.total}</td>
                    <td>{it.ean_code}</td><td>{it.order_id}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className={styles.buttons}>
          <Button onClick={() => setShowItemForm(f => !f)}>
            {showItemForm ? 'Cancelar' : 'Adicionar Item'}
          </Button>
          <Button onClick={() => setShowImportForm(f => !f)}>
            {showImportForm ? 'Cancelar Import' : 'Importar Itens'}
          </Button>
        </div>

        {showItemForm && (
          <form className={styles.form} onSubmit={handleItemSave} noValidate>
            <Input label="Código" name="code" value={itemForm.code} onChange={handleItemChange} />
            <Input label="Produto" name="product" value={itemForm.product} onChange={handleItemChange} />
            <Input label="Preço" name="price" type="number" value={itemForm.price} onChange={handleItemChange} />
            <Input label="Quantidade" name="quantity" type="number" value={itemForm.quantity} onChange={handleItemChange} />
            <Input label="Total" name="total" type="number" value={itemForm.total} onChange={handleItemChange} /> {/* Novo campo */}
            <Input label="EAN" name="ean_code" value={itemForm.ean_code} onChange={handleItemChange} />

            {Object.keys(itemErrors).length > 0 && (
              <ul className={styles.errorList}>
                {Object.entries(itemErrors).map(([field, msgs]) => (
                  <li key={field}>{field}: {msgs.join(', ')}</li>
                ))}
              </ul>
            )}

            <div className={styles.buttons}>
              <Button type="submit">Salvar Item</Button>
              <Button type="button" onClick={() => setShowItemForm(false)}>Cancelar</Button>
            </div>
          </form>
        )}

        {showImportForm && (
          <form className={styles.form} onSubmit={handleImportSubmit} encType="multipart/form-data">
            <input type="file" accept=".xlsx" name="file" onChange={handleImportChange} />
            {importErrors && <p className={styles.error}>{importErrors}</p>}
            <div className={styles.buttons}>
              <Button type="submit">Enviar Arquivo</Button>
              <Button type="button" onClick={() => { setShowImportForm(false); setImportErrors(null); }}>
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </section>

      <div className={styles.buttons}>
        <Button onClick={() => setShowOrderEditForm(s => !s)}>
          {showOrderEditForm ? 'Cancelar Edição' : `Editar Pedido #${order.id}`}
        </Button>
        <Button onClick={handleDownloadPdf}>Baixar PDF</Button>
      </div>

      {showOrderEditForm && (
        <>
          <h1 className={styles.title}>Editar Pedido #{order.id}</h1>
          <form className={styles.form} onSubmit={handleOrderUpdate} noValidate>
            <Input label="Status" name="status" value={orderForm.status} onChange={handleOrderChange} />
            <Input label="Feedback do Admin" name="admin_feedback" value={orderForm.admin_feedback} onChange={handleOrderChange} />
            <div className={styles.buttons}>
              <Button type="submit">Salvar Pedido</Button>
              <Button type="button" onClick={handleOrderDelete}>Excluir Pedido</Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
