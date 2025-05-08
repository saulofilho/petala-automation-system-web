'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import styles from '../../../Global.module.css';

// Regex e máscaras
const CNPJ_REGEX = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
const CEP_REGEX = /^\d{5}-\d{3}$/;
const STATE_REGEX = /^[A-Z]{2}$/;
function maskCNPJ(v){return v.replace(/\D/g,'').slice(0,14).replace(/^(\d{2})(\d)/,'$1.$2').replace(/^(\d{2}\.\d{3})(\d)/,'$1.$2').replace(/^(\d{2}\.\d{3}\.\d{3})(\d)/,'$1/$2').replace(/^(\d{2}\.\d{3}\.\d{3}\/\d{4})(\d)/,'$1-$2');}
function maskCEP(v){return v.replace(/\D/g,'').slice(0,8).replace(/^(\d{5})(\d)/,'$1-$2');}
function maskState(v){return v.replace(/[^a-zA-Z]/g,'').toUpperCase().slice(0,2);}
function maskNumber(v){return v.replace(/\D/g,'');}

export default function CompanyPage() {
  const router = useRouter();
  const { id: companyId } = useParams();
  const { user, logout } = useAuth();

  // Company form state
  const [form, setForm] = useState({ name:'', cnpj:'', cep:'', street:'', number:'', city:'', state:'' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderForm, setOrderForm] = useState({ description: '', status:'pending', admin_feedback:'' });
  const [orderErrors, setOrderErrors] = useState({});

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Fetch company details
  useEffect(()=>{
    if(!user||!companyId) return;
    (async ()=>{
      try{
        const res=await fetch(`${API}/v1/companies/${companyId}`,{credentials:'include'});
        if(!res.ok){setNotFound(true);return;}
        const { company } = await res.json();
        setForm({
          name:company.name||'', cnpj:company.cnpj||'', cep:company.cep||'', street:company.street||'',
          number:company.number?.toString()||'', city:company.city||'', state:company.state||''
        });
      }catch{setNotFound(true);}finally{setLoading(false);}      
    })();
  },[user,companyId]);

  // Fetch orders once company loaded
  useEffect(()=>{
    if(loading||notFound) return;
    (async ()=>{
      try{
        const res=await fetch(`${API}/v1/companies/${companyId}/orders`,{credentials:'include'});
        if(!res.ok) return;
        const { orders } = await res.json();
        setOrders(orders);
      }catch(e){console.error(e);}      
    })();
  },[loading,notFound]);

  // Company validation & handlers
  const validateCompany=()=>{
    const e={};
    if(!form.name.trim()) e.name='Nome é obrigatório';
    if(!CNPJ_REGEX.test(form.cnpj)) e.cnpj='CNPJ inválido';
    if(!CEP_REGEX.test(form.cep)) e.cep='CEP inválido';
    if(!form.street.trim()) e.street='Rua é obrigatória';
    if(!form.number||!Number.isInteger(Number(form.number))) e.number='Número inválido';
    if(!form.city.trim()) e.city='Cidade é obrigatória';
    if(!STATE_REGEX.test(form.state)) e.state='Estado inválido';
    return e;
  };
  const handleChange=(e)=>{
    let v=e.target.value;
    if(e.target.name==='cnpj') v=maskCNPJ(v);
    if(e.target.name==='cep') v=maskCEP(v);
    if(e.target.name==='state') v=maskState(v);
    if(e.target.name==='number') v=maskNumber(v);
    setForm(f=>({...f,[e.target.name]:v}));
    setErrors(err=>({...err,[e.target.name]:null}));
  };
  const handleUpdate=async(e)=>{
    e.preventDefault();const ev=validateCompany();if(Object.keys(ev).length){setErrors(ev);return;}    
    await fetch(`${API}/v1/companies/${companyId}`,{
      method:'PATCH',credentials:'include',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({company:{...form,number:Number(form.number),user_id:user.id}})
    });
    router.push('/dashboard');
  };
  const handleDelete=async()=>{if(!confirm('Confirma exclusão?'))return;await fetch(`${API}/v1/companies/${companyId}`,{method:'DELETE',credentials:'include'});router.push('/dashboard');};

  // Order validation & handlers
  const validateOrder=()=>{
    const e={};
    if(!orderForm.status.trim()) e.status='Status é obrigatório';
    return e;
  };
  const handleOrderChange=e=>{
    setOrderForm(o=>({...o,[e.target.name]:e.target.value}));
    setOrderErrors(err=>({...err,[e.target.name]:null}));
  };
  const handleOrderCreate=async(e)=>{
    e.preventDefault();const ev=validateOrder();if(Object.keys(ev).length){setOrderErrors(ev);return;}    
    const res=await fetch(`${API}/v1/companies/${companyId}/orders`,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({order:{...orderForm,company_id:Number(companyId)}})});
    const { order } = await res.json();
    setOrders(o=>[...o,order]);
    setShowOrderForm(false);
    setOrderForm({description: '', status:'pending', admin_feedback:''});
  };

  if(loading) return <p>Carregando empresa…</p>;
  if(notFound) return <p>Empresa não encontrada.</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Editar Empresa</h1>
      <form className={styles.form} onSubmit={handleUpdate} noValidate>
        <Input label="Nome" name="name" value={form.name} onChange={handleChange}/> {errors.name&&<p className={styles.error}>{errors.name}</p>}
        <Input label="CNPJ" name="cnpj" value={form.cnpj} onChange={handleChange}/> {errors.cnpj&&<p className={styles.error}>{errors.cnpj}</p>}
        <Input label="CEP" name="cep" value={form.cep} onChange={handleChange}/> {errors.cep&&<p className={styles.error}>{errors.cep}</p>}
        <Input label="Rua" name="street" value={form.street} onChange={handleChange}/> {errors.street&&<p className={styles.error}>{errors.street}</p>}
        <Input label="Número" name="number" type="text" value={form.number} onChange={handleChange}/> {errors.number&&<p className={styles.error}>{errors.number}</p>}
        <Input label="Cidade" name="city" value={form.city} onChange={handleChange}/> {errors.city&&<p className={styles.error}>{errors.city}</p>}
        <Input label="Estado" name="state" value={form.state} onChange={handleChange} maxLength={2}/> {errors.state&&<p className={styles.error}>{errors.state}</p>}
        <div className={styles.buttons}><Button type="submit">Salvar</Button><Button type="button" onClick={handleDelete}>Excluir</Button></div>
      </form>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Orders</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Description</th>
              <th>Status</th>
              <th>Feedback</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr key="no-orders">
                <td colSpan={3} className={styles.noData}>
                  Nenhum pedido.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr
                  key={o.id}
                  className={styles.row}
                  onClick={() =>
                    router.push(
                      `/dashboard/companies/${companyId}/orders/${o.id}`
                    )
                  }
                >
                  <td>{o.id}</td>
                  <td>{o.description}</td>
                  <td>{o.status}</td>
                  <td>{o.admin_feedback || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <Button onClick={()=>setShowOrderForm(s=>!s)}>{showOrderForm?'Cancelar':'Adicionar Order'}</Button>

        {showOrderForm&&(
          <form className={styles.form} onSubmit={handleOrderCreate} noValidate>
            <Input label="Description" name="description" value={orderForm.description} onChange={handleOrderChange}/> {orderErrors.description&&<p className={styles.error}>{orderErrors.description}</p>}
            <Input label="Status" name="status" value={orderForm.status} onChange={handleOrderChange}/> {orderErrors.status&&<p className={styles.error}>{orderErrors.status}</p>}
            <Input label="Feedback" name="admin_feedback" value={orderForm.admin_feedback} onChange={handleOrderChange}/>
            <Button type="submit">Salvar Order</Button>
          </form>
        )}

      </section>
    </div>
  );
}
