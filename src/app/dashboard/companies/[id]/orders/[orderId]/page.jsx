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
    ean_code: ''
  });
  const [itemErrors, setItemErrors] = useState({});

  const [showImportForm, setShowImportForm] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importErrors, setImportErrors] = useState(null);
  const [showOrderEditForm, setShowOrderEditForm] = useState(false);

  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const formatToBRL = (value) => {
    let num = value.replace(/\D/g, '');
    if (num.length === 0) return '';
    num = (parseInt(num, 10) / 100).toFixed(2);
    return num.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const parseFromBRL = (value) => {
    return value.replace(/\./g, '').replace(',', '.');
  };

  const handleDownloadPdf = async () => {
    if (!order) return;
    try {
      const res = await fetch(`${API}/v1/orders/${orderId}/pdf`, { credentials: 'include' });
      if (!res.ok) throw new Error('Falha ao gerar PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orçamento_${order.id}.pdf`;
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
      try {
        setLoading(true);
        const res = await fetch(`${API}/v1/orders/${orderId}/order_items`, { credentials: 'include' });
        if (!res.ok) throw new Error('Itens do orçamento não encontrados');
        const { order_items } = await res.json();
        setItems(order_items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [order, orderId]);

  if (loading) return <p className={styles.loading}>Carregando orçamento…</p>;
  if (!order) return <p className={styles.titleError}>Orçamento não encontrado.</p>;

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
    if (!confirm('Confirma exclusão deste orçamento?')) return;
    await fetch(`${API}/v1/orders/${orderId}`, { method: 'DELETE', credentials: 'include' });
    router.push(`/dashboard/companies/${companyId}`);
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;

    setItemForm(prev => {
      const updated = { ...prev, [name]: value };

      const rawPrice = parseFloat(parseFromBRL(updated.price || '0'));
      const rawQuantity = parseInt(updated.quantity || '0', 10);

      if (!isNaN(rawPrice) && !isNaN(rawQuantity)) {
        const newTotal = (rawPrice * rawQuantity).toFixed(2);
        updated.total = newTotal;
      }

      if (name === 'price') {
        updated.price = formatToBRL(value);
      }

      return updated;
    });
  };

  const handleItemSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...itemForm,
        price: parseFromBRL(itemForm.price),
        order_id: orderId
      };
      const res = await fetch(
        `${API}/v1/orders/${orderId}/order_items`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_item: payload }),
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        setItemErrors(errorData.errors || {});
        return;
      }
      const { order_item: newItem } = await res.json();
      setItems(prev => [...prev, newItem]);
      setItemForm({ code: '', product: '', price: '', quantity: '', total: '', ean_code: '' });
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
        <h2 className={styles.sectionTitlePages}>Itens do Orçamento: {orderId}.</h2>
        <div className="table-responsive">
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Código</th>
                <th>Produto</th>
                <th>Preço</th>
                <th>Quant.</th>
                <th>Total</th>
                <th>EAN</th>
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
                    <td>{it.ean_code}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className={styles.buttons}>
          <Button onClick={() => setShowItemForm(f => !f)}>
            {showItemForm ? 'Cancelar' : 'Adicionar item manualmente'}
          </Button>
          <Button onClick={() => setShowImportForm(f => !f)}>
            {showImportForm ? 'Cancelar Import' : 'Importar tabela xlsx com vários itens'}
          </Button>
        </div>

        {showItemForm && (
          <form className={styles.form} onSubmit={handleItemSave} noValidate>
            <Input label="Código" name="code" value={itemForm.code} onChange={handleItemChange} />
            <Input label="Produto" name="product" value={itemForm.product} onChange={handleItemChange} />
            <Input label="Preço" name="price" value={itemForm.price} onChange={handleItemChange} />
            <Input label="Quantidade" name="quantity" type="number" value={itemForm.quantity} onChange={handleItemChange} />
            {/* <Input label="Total" name="total" type="number" value={itemForm.total} onChange={handleItemChange} /> */}
            <p>Total: R$ {formatToBRL(itemForm.total.toString())}</p>
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

      <div className={styles.buttonEdit}>
        <Button onClick={() => setShowOrderEditForm(s => !s)}>
          {showOrderEditForm ? 'Cancelar Edição' : `Editar Orçamento: ${order.id}`}
        </Button>
        <Button onClick={handleDownloadPdf}>Baixar PDF do Orçamento {order.id} com todos os itens</Button>
      </div>

      {showOrderEditForm && (
        <>
          <p className={styles.title}>Editar Orçamento: {order.id}</p>
          <form className={styles.form} onSubmit={handleOrderUpdate} noValidate>
            <Input label="Status" name="status" value={orderForm.status} onChange={handleOrderChange} />
            <Input label="Feedback do Admin" name="admin_feedback" value={orderForm.admin_feedback} onChange={handleOrderChange} />
            <div className={styles.buttons}>
              <Button type="submit">Salvar Orçamento</Button>
              <Button type="button" onClick={handleOrderDelete}>Excluir Orçamento</Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
